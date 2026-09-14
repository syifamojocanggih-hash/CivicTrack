from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.report import LaporanStatus
from app.schemas.auth import UserBrief

class LaporanCreate(BaseModel):
    isi_laporan: str = Field(..., min_length=10, max_length=2000, description="Isi laporan/keluhan masyarakat")

class LaporanTanggapi(BaseModel):
    status_tindak_lanjut: LaporanStatus
    tanggapan_dinas: str = Field(..., min_length=5, max_length=2000, description="Tanggapan resmi dari dinas")

class LaporanResponse(BaseModel):
    id: int
    proyek_id: int
    user_id: int
    isi_laporan: str
    status_tindak_lanjut: LaporanStatus
    tanggapan_dinas: Optional[str] = None
    ditanggapi_oleh: Optional[int] = None
    created_at: datetime
    pelapor: Optional[UserBrief] = None
    penanggap: Optional[UserBrief] = None

    model_config = ConfigDict(from_attributes=True)
