import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.models.project import Proyek, TahapanProgres, DokumentasiProyek, MediaType
from app.schemas.project import DokumentasiResponse

router = APIRouter(prefix="/proyek", tags=["Dokumentasi Proyek (Fitur 4)"])

@router.post("/{id}/dokumentasi", response_model=DokumentasiResponse, status_code=status.HTTP_201_CREATED)
def upload_project_media(
    id: int,
    tahapan_id: Optional[int] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin_dinas, UserRole.pimpinan_instansi]))
):
    """
    Fitur 4 PRD: Pengunggahan foto dan video perkembangan fisik proyek secara kronologis
    pada setiap tahapan linimasa.
    Validasi format dan ukuran file sesuai PRD Bagian 10.1.
    """
    proyek = db.query(Proyek).filter(Proyek.id == id).first()
    if not proyek:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyek tidak ditemukan.")

    if tahapan_id:
        tahap = db.query(TahapanProgres).filter(
            TahapanProgres.id == tahapan_id,
            TahapanProgres.proyek_id == id
        ).first()
        if not tahap:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tahapan progres tidak cocok dengan proyek ini.")

    # Validasi ekstensi file
    original_filename = file.filename or ""
    ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else ""
    if ext not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Format file tidak didukung. Ekstensi yang diizinkan: {settings.ALLOWED_EXTENSIONS}"
        )

    # Tentukan tipe media
    video_exts = ["mp4", "mov", "avi", "webm"]
    tipe_media = MediaType.video if ext in video_exts else MediaType.foto

    # Simpan file ke direktori uploads
    upload_dir = os.path.join(os.getcwd(), settings.UPLOAD_DIR)
    os.makedirs(upload_dir, exist_ok=True)

    unique_name = f"proyek_{id}_{uuid.uuid4().hex[:10]}.{ext}"
    target_path = os.path.join(upload_dir, unique_name)

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    # Validasi ukuran maksimum
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ukuran file melebihi batas maksimum ({settings.MAX_FILE_SIZE_MB}MB)."
        )

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_url = f"/uploads/{unique_name}"
    size_kb = int(file_size / 1024)

    dok = DokumentasiProyek(
        proyek_id=id,
        tahapan_id=tahapan_id,
        tipe_media=tipe_media,
        url_file=file_url,
        ukuran_file=size_kb,
        diunggah_oleh=current_user.id
    )
    db.add(dok)
    db.commit()
    db.refresh(dok)

    return dok

@router.get("/{id}/dokumentasi", response_model=List[DokumentasiResponse])
def get_project_documentation(id: int, db: Session = Depends(get_db)):
    """Mengambil seluruh dokumentasi galeri foto dan video proyek."""
    return db.query(DokumentasiProyek).filter(
        DokumentasiProyek.proyek_id == id
    ).order_by(DokumentasiProyek.created_at.desc()).all()
