from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict
from app.models.ai_route import PrioritasRute

class RekomendasiRuteResponse(BaseModel):
    id: int
    proyek_id: int
    nama_rute: str
    prioritas: PrioritasRute
    estimasi_jarak_km: Optional[Decimal] = None
    estimasi_waktu_menit: Optional[int] = None
    alasan_rekomendasi: Optional[str] = None
    geografis_terverifikasi: bool = False
    koordinat_rute: Optional[list] = None
    raw_response_ai: Optional[dict] = None
    is_valid: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GenerateRuteRequest(BaseModel):
    catatan_penutupan: Optional[str] = None
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    dest_lat: Optional[float] = None
    dest_lng: Optional[float] = None
    origin_name: Optional[str] = None
    dest_name: Optional[str] = None
