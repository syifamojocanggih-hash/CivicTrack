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

from app.core.file_security import validate_and_process_media_upload

router = APIRouter(prefix="/proyek", tags=["Dokumentasi Proyek"])

@router.post("/{id}/dokumentasi", response_model=DokumentasiResponse, status_code=status.HTTP_201_CREATED)
def upload_project_media(
    id: int,
    tahapan_id: Optional[int] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin_dinas, UserRole.pimpinan_instansi]))
):
    """
    Pengunggahan foto dan video perkembangan fisik proyek secara kronologis
    pada setiap tahapan linimasa.
    Dilengkapi validasi keamanan biner (magic bytes) dan integritas media (Pillow verify).
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

    # Validasi keamanan mendalam (ekstensi, MIME warning, magic bytes, Pillow verify, ukuran spesifik)
    tipe_media, content, ext, size_kb = validate_and_process_media_upload(file)

    # Simpan file ke direktori uploads
    upload_dir = os.path.join(os.getcwd(), settings.UPLOAD_DIR)
    os.makedirs(upload_dir, exist_ok=True)

    unique_name = f"proyek_{id}_{uuid.uuid4().hex[:10]}.{ext}"
    target_path = os.path.join(upload_dir, unique_name)

    try:
        with open(target_path, "wb") as buffer:
            buffer.write(content)
    except Exception as e:
        if os.path.exists(target_path):
            os.remove(target_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menyimpan berkas ke media storage: {str(e)}"
        )

    file_url = f"/uploads/{unique_name}"

    try:
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
    except Exception:
        db.rollback()
        if os.path.exists(target_path):
            os.remove(target_path)
        raise

    return dok

@router.get("/{id}/dokumentasi", response_model=List[DokumentasiResponse])
def get_project_documentation(id: int, db: Session = Depends(get_db)):
    """Mengambil seluruh dokumentasi galeri foto dan video proyek."""
    return db.query(DokumentasiProyek).filter(
        DokumentasiProyek.proyek_id == id
    ).order_by(DokumentasiProyek.created_at.desc()).all()
