from typing import Dict, List, Any, Optional
from decimal import Decimal
from pydantic import BaseModel

class StatusCount(BaseModel):
    berjalan: int = 0
    selesai: int = 0
    ditangguhkan: int = 0
    tertunda: int = 0
    dalam_peninjauan_ulang: int = 0
    planned: int = 0
    scheduled: int = 0

class WilayahStat(BaseModel):
    wilayah_id: int
    nama_wilayah: str
    total_proyek: int
    total_anggaran: Decimal = Decimal("0")

class WilayahStatDetail(BaseModel):
    wilayah_id: int
    kode_wilayah: Optional[str] = None
    nama_wilayah: str
    jumlah_berjalan: int = 0
    jumlah_selesai: int = 0
    jumlah_tertunda: int = 0
    jumlah_dalam_peninjauan_ulang: int = 0
    status_proyek: StatusCount
    total_proyek: int = 0
    total_anggaran: Decimal = Decimal("0")
    estimasi_penyerapan_anggaran: Decimal = Decimal("0")
    rata_rata_progres: float = 0.0

class RingkasanKabupatenResponse(BaseModel):
    total_proyek: int = 0
    status_proyek: StatusCount
    total_anggaran: Decimal = Decimal("0")
    estimasi_penyerapan_anggaran: Decimal = Decimal("0")
    rasio_penyerapan_persen: float = 0.0
    rata_rata_progres: float = 0.0

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

class ProjectWargaReach(BaseModel):
    proyek_id: int
    nama_proyek: str
    unique_warga: int

class LeadTimeTrendMonth(BaseModel):
    bulan: str
    avg_lead_time_hari: float
    jumlah_proyek: int

class NotificationTargetBreakdown(BaseModel):
    radius: int = 0
    subscription: int = 0
    route_overlap: int = 0

class NotificationPriorityBreakdown(BaseModel):
    normal: int = 0
    tinggi: int = 0

class LeadTimeAdvantageResponse(BaseModel):
    avg_lead_time_hari: float
    label_hari_peringatan_dini: str
    total_unique_warga_terjangkau: int
    warga_terjangkau_per_proyek: List[ProjectWargaReach]
    tingkat_akurasi_jadwal_hari: float
    akurasi_status: str
    breakdown_target_type: NotificationTargetBreakdown
    breakdown_priority: NotificationPriorityBreakdown
    total_notifikasi_terkirim: int
    tren_lead_time_per_bulan: List[LeadTimeTrendMonth]
