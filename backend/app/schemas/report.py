from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict
from app.models.report import LaporanStatus
from app.schemas.auth import UserBrief

class LaporanCreate(BaseModel):
    isi_laporan: str = Field(..., max_length=2000, description="Isi laporan/keluhan masyarakat")

    @field_validator("isi_laporan")
    @classmethod
    def validate_isi_laporan(cls, v: str) -> str:
        if v is None:
            raise ValueError("Isi laporan wajib diisi dan tidak boleh null.")
        clean_text = v.strip()
        if len(clean_text) < 10:
            raise ValueError("Isi laporan tidak boleh kosong dan minimal harus terdiri dari 10 karakter non-spasi.")
        if len(clean_text) > 2000:
            raise ValueError("Isi laporan tidak boleh melebihi batas maksimum 2000 karakter.")
        return clean_text

class LaporanTanggapi(BaseModel):
    status_tindak_lanjut: LaporanStatus
    tanggapan_dinas: str = Field(..., max_length=2000, description="Tanggapan resmi dari dinas")

    @field_validator("tanggapan_dinas")
    @classmethod
    def validate_tanggapan_dinas(cls, v: str) -> str:
        if v is None:
            raise ValueError("Tanggapan dinas wajib diisi dan tidak boleh null.")
        clean_text = v.strip()
        if len(clean_text) < 5:
            raise ValueError("Tanggapan dinas minimal harus terdiri dari 5 karakter non-spasi.")
        if len(clean_text) > 2000:
            raise ValueError("Tanggapan dinas tidak boleh melebihi batas maksimum 2000 karakter.")
        return clean_text

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
