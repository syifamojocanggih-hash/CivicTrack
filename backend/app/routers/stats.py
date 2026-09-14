from decimal import Decimal
from typing import Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.user import WilayahAdministratif
from app.models.project import Proyek, ProyekStatus
from app.models.report import LaporanMasyarakat, LaporanStatus
from app.models.evaluation import EvaluasiPembangunan, EvaluasiStatus
from app.schemas.stats import DashboardStatsResponse, StatusCount, WilayahStat

router = APIRouter(prefix="/stats", tags=["Statistik & Agregat (Fitur 8)"])

@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """
    Fitur 8 PRD: Menyajikan ringkasan metrik statistik agregat untuk dashboard publik
    dan pimpinan instansi (total proyek per status, serapan anggaran, rekap per wilayah & kategori).
    """
    total_proyek = db.query(Proyek).count()

    berjalan = db.query(Proyek).filter(Proyek.status == ProyekStatus.berjalan).count()
    selesai = db.query(Proyek).filter(Proyek.status == ProyekStatus.selesai).count()
    tertunda = db.query(Proyek).filter(Proyek.status == ProyekStatus.tertunda).count()
    tinjau = db.query(Proyek).filter(Proyek.status == ProyekStatus.dalam_peninjauan_ulang).count()

    total_anggaran_raw = db.query(func.sum(Proyek.anggaran)).scalar()
    total_anggaran = Decimal(str(total_anggaran_raw)) if total_anggaran_raw else Decimal("0")

    avg_progres_raw = db.query(func.avg(Proyek.progres_persen)).scalar()
    avg_progres = float(avg_progres_raw) if avg_progres_raw else 0.0

    total_laporan = db.query(LaporanMasyarakat).count()
    laporan_baru = db.query(LaporanMasyarakat).filter(LaporanMasyarakat.status_tindak_lanjut == LaporanStatus.baru).count()

    total_eval = db.query(EvaluasiPembangunan).count()
    eval_menunggu = db.query(EvaluasiPembangunan).filter(EvaluasiPembangunan.status == EvaluasiStatus.menunggu_verifikasi).count()

    # Breakdown per kategori
    kategori_counts = db.query(Proyek.kategori, func.count(Proyek.id)).group_by(Proyek.kategori).all()
    per_kategori = {k.value: count for k, count in kategori_counts}

    # Breakdown per wilayah
    wilayah_stats = db.query(
        WilayahAdministratif.id,
        WilayahAdministratif.nama_wilayah,
        func.count(Proyek.id),
        func.coalesce(func.sum(Proyek.anggaran), 0)
    ).outerjoin(Proyek, Proyek.wilayah_id == WilayahAdministratif.id)\
     .group_by(WilayahAdministratif.id, WilayahAdministratif.nama_wilayah).all()

    per_wilayah_list = [
        WilayahStat(
            wilayah_id=w[0],
            nama_wilayah=w[1],
            total_proyek=w[2],
            total_anggaran=Decimal(str(w[3]))
        )
        for w in wilayah_stats
    ]

    return DashboardStatsResponse(
        total_proyek=total_proyek,
        status_proyek=StatusCount(
            berjalan=berjalan,
            selesai=selesai,
            tertunda=tertunda,
            dalam_peninjauan_ulang=tinjau
        ),
        total_anggaran=total_anggaran,
        rata_rata_progres=round(avg_progres, 2),
        total_laporan=total_laporan,
        laporan_baru=laporan_baru,
        total_evaluasi=total_eval,
        evaluasi_menunggu=eval_menunggu,
        per_kategori=per_kategori,
        per_wilayah=per_wilayah_list
    )
