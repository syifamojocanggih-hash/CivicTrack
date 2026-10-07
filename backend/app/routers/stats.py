from decimal import Decimal
from typing import Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.core.database import get_db
from app.models.user import WilayahAdministratif, WilayahLevel
from app.models.project import Proyek, ProyekStatus
from app.models.report import LaporanMasyarakat, LaporanStatus
from app.models.evaluation import EvaluasiPembangunan, EvaluasiStatus
from app.schemas.stats import (
    DashboardStatsResponse,
    StatusCount,
    WilayahStat,
    WilayahStatDetail,
    RingkasanKabupatenResponse,
)

router = APIRouter(prefix="/stats", tags=["Statistik & Agregat"])

@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """
    Menyajikan ringkasan metrik statistik agregat untuk dashboard publik
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

    # Breakdown per wilayah (difilter hanya tingkat kecamatan, id 1 kabupaten tidak diikutsertakan)
    wilayah_stats = db.query(
        WilayahAdministratif.id,
        WilayahAdministratif.nama_wilayah,
        func.count(Proyek.id),
        func.coalesce(func.sum(Proyek.anggaran), 0)
    ).outerjoin(Proyek, Proyek.wilayah_id == WilayahAdministratif.id)\
     .filter(WilayahAdministratif.level == WilayahLevel.kecamatan)\
     .group_by(WilayahAdministratif.id, WilayahAdministratif.nama_wilayah)\
     .order_by(WilayahAdministratif.id.asc()).all()

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

@router.get("/wilayah", response_model=List[WilayahStatDetail])
def get_wilayah_statistics(db: Session = Depends(get_db)):
    """
    Menyajikan rekapitulasi statistik proyek per kecamatan di Kabupaten Lamongan.
    Mengembalikan per kecamatan:
    - nama kecamatan, wilayah_id, dan kode_wilayah
    - jumlah proyek berjalan, selesai, tertunda, dalam_peninjauan_ulang
    - total proyek
    - total anggaran (pagu) dan estimasi penyerapan anggaran (anggaran * progres / 100)
    - rata-rata progres fisik
    Dijalankan secara efisien dengan query SQL agregasi (GROUP BY wilayah_id) di database.
    """
    wilayah_query = db.query(
        WilayahAdministratif.id,
        WilayahAdministratif.kode_wilayah,
        WilayahAdministratif.nama_wilayah,
        func.count(Proyek.id).label("total_proyek"),
        func.coalesce(func.sum(case((Proyek.status == ProyekStatus.berjalan, 1), else_=0)), 0).label("berjalan"),
        func.coalesce(func.sum(case((Proyek.status == ProyekStatus.selesai, 1), else_=0)), 0).label("selesai"),
        func.coalesce(func.sum(case((Proyek.status == ProyekStatus.tertunda, 1), else_=0)), 0).label("tertunda"),
        func.coalesce(func.sum(case((Proyek.status == ProyekStatus.dalam_peninjauan_ulang, 1), else_=0)), 0).label("dalam_peninjauan_ulang"),
        func.coalesce(func.sum(Proyek.anggaran), 0).label("total_anggaran"),
        func.coalesce(func.sum(Proyek.anggaran * Proyek.progres_persen / 100), 0).label("estimasi_penyerapan"),
        func.coalesce(func.avg(Proyek.progres_persen), 0).label("rata_rata_progres"),
    ).outerjoin(Proyek, Proyek.wilayah_id == WilayahAdministratif.id)\
     .filter(WilayahAdministratif.level == WilayahLevel.kecamatan)\
     .group_by(WilayahAdministratif.id, WilayahAdministratif.kode_wilayah, WilayahAdministratif.nama_wilayah)\
     .order_by(WilayahAdministratif.id.asc()).all()

    results = []
    for row in wilayah_query:
        total_anggaran = Decimal(str(row.total_anggaran)) if row.total_anggaran else Decimal("0")
        estimasi_penyerapan = Decimal(str(row.estimasi_penyerapan)) if row.estimasi_penyerapan else Decimal("0")
        results.append(
            WilayahStatDetail(
                wilayah_id=row.id,
                kode_wilayah=row.kode_wilayah,
                nama_wilayah=row.nama_wilayah,
                jumlah_berjalan=int(row.berjalan),
                jumlah_selesai=int(row.selesai),
                jumlah_tertunda=int(row.tertunda),
                jumlah_dalam_peninjauan_ulang=int(row.dalam_peninjauan_ulang),
                status_proyek=StatusCount(
                    berjalan=int(row.berjalan),
                    selesai=int(row.selesai),
                    tertunda=int(row.tertunda),
                    dalam_peninjauan_ulang=int(row.dalam_peninjauan_ulang),
                ),
                total_proyek=int(row.total_proyek),
                total_anggaran=total_anggaran,
                estimasi_penyerapan_anggaran=estimasi_penyerapan,
                rata_rata_progres=round(float(row.rata_rata_progres), 2),
            )
        )
    return results

@router.get("/ringkasan", response_model=RingkasanKabupatenResponse)
def get_ringkasan_kabupaten(db: Session = Depends(get_db)):
    """
    Menyajikan ringkasan eksekutif kabupaten (se-Kabupaten Lamongan):
    Total proyek per status, total anggaran (pagu), estimasi penyerapan anggaran,
    rasio penyerapan persen, dan rata-rata progres fisik keseluruhan.
    """
    total_proyek = db.query(Proyek).count()
    berjalan = db.query(Proyek).filter(Proyek.status == ProyekStatus.berjalan).count()
    selesai = db.query(Proyek).filter(Proyek.status == ProyekStatus.selesai).count()
    tertunda = db.query(Proyek).filter(Proyek.status == ProyekStatus.tertunda).count()
    tinjau = db.query(Proyek).filter(Proyek.status == ProyekStatus.dalam_peninjauan_ulang).count()

    total_anggaran_raw = db.query(func.sum(Proyek.anggaran)).scalar()
    total_anggaran = Decimal(str(total_anggaran_raw)) if total_anggaran_raw else Decimal("0")

    estimasi_penyerapan_raw = db.query(func.sum(Proyek.anggaran * Proyek.progres_persen / 100)).scalar()
    estimasi_penyerapan = Decimal(str(estimasi_penyerapan_raw)) if estimasi_penyerapan_raw else Decimal("0")

    if total_anggaran > 0:
        rasio_penyerapan = round(float((estimasi_penyerapan / total_anggaran) * 100), 2)
    else:
        rasio_penyerapan = 0.0

    avg_progres_raw = db.query(func.avg(Proyek.progres_persen)).scalar()
    avg_progres = round(float(avg_progres_raw), 2) if avg_progres_raw else 0.0

    return RingkasanKabupatenResponse(
        total_proyek=total_proyek,
        status_proyek=StatusCount(
            berjalan=berjalan,
            selesai=selesai,
            tertunda=tertunda,
            dalam_peninjauan_ulang=tinjau,
        ),
        total_anggaran=total_anggaran,
        estimasi_penyerapan_anggaran=estimasi_penyerapan,
        rasio_penyerapan_persen=rasio_penyerapan,
        rata_rata_progres=avg_progres,
    )
