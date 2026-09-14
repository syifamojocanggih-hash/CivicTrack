from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.evaluation import EvaluasiStatus
from app.models.project import MediaType
from app.schemas.auth import UserBrief

class EvaluasiCreate(BaseModel):
    kategori_masalah: str = Field(..., min_length=3, max_length=100, description="Kategori kerusakan/cacat proyek")
    deskripsi: str = Field(..., min_length=10, max_length=2000, description="Deskripsi detail masalah fisik yang ditemukan")

class EvaluasiVerifikasiRequest(BaseModel):
    status: EvaluasiStatus
    catatan: Optional[str] = Field(None, max_length=1000, description="Catatan verifikasi dinas")

class DokumentasiEvaluasiResponse(BaseModel):
    id: int
    evaluasi_id: int
    tipe_media: MediaType
    url_file: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EvaluasiStatusLogResponse(BaseModel):
    id: int
    evaluasi_id: int
    status_sebelumnya: Optional[str] = None
    status_baru: str
    diubah_oleh: int
    catatan: Optional[str] = None
    created_at: datetime
    nama_pengubah: str = ""

    model_config = ConfigDict(from_attributes=True)

class EvaluasiResponse(BaseModel):
    id: int
    proyek_id: int
    nama_proyek: str = ""
    user_id: int
    kategori_masalah: str
    deskripsi: str
    skor_urgensi_ai: Optional[int] = None
    ringkasan_analisis_ai: Optional[str] = None
    status: EvaluasiStatus
    ditinjau_oleh: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    pelapor: Optional[UserBrief] = None
    peninjau: Optional[UserBrief] = None
    dokumentasi_list: List[DokumentasiEvaluasiResponse] = []
    status_logs: List[EvaluasiStatusLogResponse] = []

    model_config = ConfigDict(from_attributes=True)
