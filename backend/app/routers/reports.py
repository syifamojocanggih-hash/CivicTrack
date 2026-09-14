from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.profanity import contains_profanity, sanitize_profanity
from app.models.user import User, UserRole
from app.models.project import Proyek
from app.models.report import LaporanMasyarakat, LaporanStatus
from app.schemas.report import LaporanCreate, LaporanTanggapi, LaporanResponse

router = APIRouter(tags=["Laporan Masyarakat (Fitur 5)"])

@router.post("/proyek/{id}/laporan", response_model=LaporanResponse, status_code=status.HTTP_201_CREATED)
def submit_report(
    id: int,
    req: LaporanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fitur 5 PRD: Formulir interaktif bagi warga untuk mengirim keluhan/masukan proyek.
    Memvalidasi panjang teks dan menyaring kata-kata tidak pantas sesuai PRD 10.2.
    """
    proyek = db.query(Proyek).filter(Proyek.id == id).first()
    if not proyek:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyek tidak ditemukan.")

    # Sensor / filter kata kasar sesuai PRD 10.2
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

@router.get("/proyek/{id}/laporan", response_model=List[LaporanResponse])
def get_project_reports(id: int, db: Session = Depends(get_db)):
    """Mengambil daftar laporan masyarakat pada proyek tertentu."""
    return db.query(LaporanMasyarakat).filter(
        LaporanMasyarakat.proyek_id == id
    ).order_by(LaporanMasyarakat.created_at.desc()).all()

@router.put("/laporan/{report_id}/tanggapi", response_model=LaporanResponse)
def reply_report(
    report_id: int,
    req: LaporanTanggapi,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin_dinas, UserRole.pimpinan_instansi]))
):
    """
    Fitur 5 PRD: Admin dinas menanggapi secara resmi aduan warga
    dan memperbarui status tindak lanjut ('baru', 'diproses', 'ditanggapi', 'ditolak').
    """
    laporan = db.query(LaporanMasyarakat).filter(LaporanMasyarakat.id == report_id).first()
    if not laporan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laporan tidak ditemukan.")

    laporan.status_tindak_lanjut = req.status_tindak_lanjut
    laporan.tanggapan_dinas = req.tanggapan_dinas.strip()
    laporan.ditanggapi_oleh = current_user.id

    db.commit()
    db.refresh(laporan)

    return laporan
