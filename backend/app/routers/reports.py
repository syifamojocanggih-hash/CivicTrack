from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.profanity import contains_profanity, sanitize_profanity
from app.core.limiter import limiter
from app.models.user import User, UserRole
from app.models.project import Proyek
from app.models.report import LaporanMasyarakat, LaporanStatus
from app.schemas.report import LaporanCreate, LaporanTanggapi, LaporanResponse

router = APIRouter(tags=["Laporan Masyarakat"])

@router.post("/proyek/{id}/laporan", response_model=LaporanResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/10minute")
def submit_report(
    request: Request,
    id: int,
    req: LaporanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Formulir interaktif bagi warga untuk mengirim keluhan/masukan proyek.
    Memvalidasi panjang teks (10-2000 karakter non-spasi), menyaring kata kasar,
    serta menerapkan rate limiting (maksimal 5 laporan per 10 menit per user/IP).
    """
    proyek = db.query(Proyek).filter(Proyek.id == id).first()
    if not proyek:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyek tidak ditemukan.")

    # Aturan: 1 proyek hanya boleh 1 pengaduan per warga
    existing_laporan = db.query(LaporanMasyarakat).filter(
        LaporanMasyarakat.proyek_id == id,
        LaporanMasyarakat.user_id == current_user.id
    ).first()
    if existing_laporan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Anda sudah memiliki pengaduan untuk proyek ini. Silakan gunakan fitur edit pengaduan sebelum ditanggapi oleh dinas."
        )

    # Sensor / filter kata kasar
    cleaned_content = sanitize_profanity(req.isi_laporan.strip())

    laporan = LaporanMasyarakat(
        proyek_id=id,
        user_id=current_user.id,
        isi_laporan=cleaned_content,
        status_tindak_lanjut=LaporanStatus.baru
    )
    db.add(laporan)
    db.commit()
    db.refresh(laporan)

    return laporan

@router.get("/laporan", response_model=List[LaporanResponse])
def get_all_reports(
    proyek_id: Optional[int] = None,
    status_tindak_lanjut: Optional[LaporanStatus] = None,
    db: Session = Depends(get_db),
):
    """
    Mengambil semua laporan/aduan masyarakat lintas proyek untuk dashboard dinas,
    diurutkan dari yang terbaru (created_at DESC).
    """
    query = db.query(LaporanMasyarakat).options(
        joinedload(LaporanMasyarakat.proyek),
        joinedload(LaporanMasyarakat.pelapor),
        joinedload(LaporanMasyarakat.penanggap),
    )
    if proyek_id:
        query = query.filter(LaporanMasyarakat.proyek_id == proyek_id)
    if status_tindak_lanjut:
        query = query.filter(LaporanMasyarakat.status_tindak_lanjut == status_tindak_lanjut)
    return query.order_by(LaporanMasyarakat.created_at.desc()).all()

@router.get("/proyek/{id}/laporan", response_model=List[LaporanResponse])
def get_project_reports(id: int, db: Session = Depends(get_db)):
    """Mengambil daftar laporan masyarakat pada proyek tertentu."""
    return db.query(LaporanMasyarakat).options(
        joinedload(LaporanMasyarakat.proyek),
        joinedload(LaporanMasyarakat.pelapor),
        joinedload(LaporanMasyarakat.penanggap),
    ).filter(
        LaporanMasyarakat.proyek_id == id
    ).order_by(LaporanMasyarakat.created_at.desc()).all()

@router.get("/laporan/{report_id}", response_model=LaporanResponse)
def get_report_detail(report_id: int, db: Session = Depends(get_db)):
    """Mengambil detail satu laporan/aduan masyarakat beserta respons dinas."""
    laporan = db.query(LaporanMasyarakat).options(
        joinedload(LaporanMasyarakat.proyek),
        joinedload(LaporanMasyarakat.pelapor),
        joinedload(LaporanMasyarakat.penanggap),
    ).filter(LaporanMasyarakat.id == report_id).first()
    if not laporan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laporan tidak ditemukan.")
    return laporan

@router.put("/laporan/{report_id}", response_model=LaporanResponse)
def update_report(
    report_id: int,
    req: LaporanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Warga mengedit isi pengaduan miliknya SEBELUM ditanggapi oleh dinas.
    Jika dinas sudah memberikan tanggapan atau status bukan 'baru', pengaduan terkunci.
    """
    laporan = db.query(LaporanMasyarakat).options(
        joinedload(LaporanMasyarakat.proyek),
        joinedload(LaporanMasyarakat.pelapor),
        joinedload(LaporanMasyarakat.penanggap),
    ).filter(LaporanMasyarakat.id == report_id).first()

    if not laporan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laporan tidak ditemukan.")

    if laporan.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki izin untuk mengedit pengaduan ini."
        )

    if laporan.tanggapan_dinas is not None or laporan.status_tindak_lanjut != LaporanStatus.baru:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pengaduan tidak dapat diedit karena sudah ditanggapi atau sedang diproses oleh dinas teknis."
        )

    cleaned_content = sanitize_profanity(req.isi_laporan.strip())
    laporan.isi_laporan = cleaned_content

    db.commit()
    db.refresh(laporan)
    return laporan

@router.put("/laporan/{report_id}/tanggapi", response_model=LaporanResponse)
def reply_report(
    report_id: int,
    req: LaporanTanggapi,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin_dinas, UserRole.pimpinan_instansi]))
):
    """
    Admin dinas menanggapi secara resmi aduan warga
    dan memperbarui status tindak lanjut ('baru', 'diproses', 'ditanggapi', 'ditolak').
    """
    laporan = db.query(LaporanMasyarakat).options(
        joinedload(LaporanMasyarakat.proyek),
        joinedload(LaporanMasyarakat.pelapor),
        joinedload(LaporanMasyarakat.penanggap),
    ).filter(LaporanMasyarakat.id == report_id).first()
    if not laporan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laporan tidak ditemukan.")

    laporan.status_tindak_lanjut = req.status_tindak_lanjut
    laporan.tanggapan_dinas = req.tanggapan_dinas.strip()
    laporan.ditanggapi_oleh = current_user.id

    db.commit()
    db.refresh(laporan)

    return laporan

