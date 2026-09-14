from typing import Dict, List, Any
from decimal import Decimal
from pydantic import BaseModel

class StatusCount(BaseModel):
    berjalan: int = 0
    selesai: int = 0
    tertunda: int = 0
    dalam_peninjauan_ulang: int = 0

class WilayahStat(BaseModel):
    wilayah_id: int
    nama_wilayah: str
    total_proyek: int
    total_anggaran: Decimal = Decimal("0")

class DashboardStatsResponse(BaseModel):
    total_proyek: int
    status_proyek: StatusCount
    total_anggaran: Decimal
    rata_rata_progres: float
    total_laporan: int
    laporan_baru: int
    total_evaluasi: int
    evaluasi_menunggu: int
    per_kategori: Dict[str, int]
    per_wilayah: List[WilayahStat]
