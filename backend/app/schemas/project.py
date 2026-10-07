from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator, ConfigDict
from app.models.project import ProyekKategori, ProyekStatus, MediaType
from app.schemas.wilayah import WilayahBrief
from app.schemas.dinas import DinasResponse

class TahapanBase(BaseModel):
    nama_tahap: str = Field(..., min_length=3, max_length=150)
    progres_persen: int = Field(..., ge=0, le=100)
    catatan: Optional[str] = None

class TahapanCreate(TahapanBase):
    pass

class TahapanResponse(TahapanBase):
    id: int
    proyek_id: int
    dicatat_oleh: int
    tanggal_pencatatan: datetime

    model_config = ConfigDict(from_attributes=True)

class DokumentasiResponse(BaseModel):
    id: int
    proyek_id: int
    tahapan_id: Optional[int] = None
    tipe_media: MediaType
    url_file: str
    ukuran_file: Optional[int] = None
    diunggah_oleh: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProyekBase(BaseModel):
    nama_proyek: str = Field(..., min_length=5, max_length=200)
    kategori: ProyekKategori
    deskripsi: Optional[str] = None
    latitude: Decimal = Field(..., ge=-90.0, le=90.0)
    longitude: Decimal = Field(..., ge=-180.0, le=180.0)
    wilayah_id: int = Field(..., gt=0)
    desa_id: Optional[int] = Field(None, gt=0)
    dinas_id: int = Field(..., gt=0)
    anggaran: Optional[Decimal] = Field(None, ge=0)
    status: ProyekStatus = ProyekStatus.berjalan
    progres_persen: int = Field(0, ge=0, le=100)
    tanggal_mulai: date
    estimasi_selesai: date

    @field_validator("nama_proyek")
    @classmethod
    def validate_nama_proyek(cls, v: str) -> str:
        if v is None:
            raise ValueError("nama_proyek wajib diisi dan tidak boleh null")
        clean_name = v.strip()
        if len(clean_name) < 5:
            raise ValueError("nama_proyek minimal harus terdiri dari 5 karakter non-spasi")
        return clean_name

    @field_validator("kategori")
    @classmethod
    def validate_kategori(cls, v: ProyekKategori) -> ProyekKategori:
        if v is None:
            raise ValueError("kategori wajib dipilih dan tidak boleh kosong")
        return v

    @field_validator("wilayah_id")
    @classmethod
    def validate_wilayah_id(cls, v: int) -> int:
        if v is None or v <= 0:
            raise ValueError("wilayah_id wajib diisi dengan ID wilayah yang valid (> 0)")
        return v

    @field_validator("dinas_id")
    @classmethod
    def validate_dinas_id(cls, v: int) -> int:
        if v is None or v <= 0:
            raise ValueError("dinas_id wajib diisi dengan ID dinas yang valid (> 0)")
        return v

    @field_validator("tanggal_mulai")
    @classmethod
    def validate_tanggal_mulai(cls, v: date) -> date:
        if v is None:
            raise ValueError("tanggal_mulai wajib diisi dan tidak boleh kosong")
        return v

    @field_validator("estimasi_selesai")
    @classmethod
    def validate_dates(cls, v: date, info):
        if v is None:
            raise ValueError("estimasi_selesai wajib diisi dan tidak boleh kosong")
        if "tanggal_mulai" in info.data and info.data["tanggal_mulai"] is not None:
            if v < info.data["tanggal_mulai"]:
                raise ValueError("estimasi_selesai tidak boleh lebih awal dari tanggal_mulai")
        return v

class ProyekCreate(ProyekBase):
    pass

class ProyekUpdate(BaseModel):
    nama_proyek: Optional[str] = Field(None, max_length=200)
    kategori: Optional[ProyekKategori] = None
    deskripsi: Optional[str] = None
    latitude: Optional[Decimal] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[Decimal] = Field(None, ge=-180.0, le=180.0)
    wilayah_id: Optional[int] = Field(None, gt=0)
    desa_id: Optional[int] = Field(None, gt=0)
    dinas_id: Optional[int] = Field(None, gt=0)
    anggaran: Optional[Decimal] = Field(None, ge=0)
    status: Optional[ProyekStatus] = None
    progres_persen: Optional[int] = Field(None, ge=0, le=100)
    tanggal_mulai: Optional[date] = None
    estimasi_selesai: Optional[date] = None
    catatan_perubahan: Optional[str] = None

    @field_validator("nama_proyek")
    @classmethod
    def validate_update_nama_proyek(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            raise ValueError("nama_proyek tidak boleh dikosongkan (null)")
        clean_name = v.strip()
        if len(clean_name) < 5:
            raise ValueError("nama_proyek minimal harus terdiri dari 5 karakter non-spasi dan tidak boleh kosong")
        return clean_name

    @field_validator("kategori")
    @classmethod
    def validate_update_kategori(cls, v: Optional[ProyekKategori]) -> Optional[ProyekKategori]:
        if v is None:
            raise ValueError("kategori tidak boleh dikosongkan (null)")
        return v

    @field_validator("wilayah_id")
    @classmethod
    def validate_update_wilayah_id(cls, v: Optional[int]) -> Optional[int]:
        if v is None or v <= 0:
            raise ValueError("wilayah_id tidak boleh dikosongkan (null) dan harus > 0")
        return v

    @field_validator("dinas_id")
    @classmethod
    def validate_update_dinas_id(cls, v: Optional[int]) -> Optional[int]:
        if v is None or v <= 0:
            raise ValueError("dinas_id tidak boleh dikosongkan (null) dan harus > 0")
        return v

    @field_validator("tanggal_mulai")
    @classmethod
    def validate_update_tanggal_mulai(cls, v: Optional[date]) -> Optional[date]:
        if v is None:
            raise ValueError("tanggal_mulai tidak boleh dikosongkan (null)")
        return v

    @field_validator("estimasi_selesai")
    @classmethod
    def validate_update_dates(cls, v: Optional[date], info) -> Optional[date]:
        if v is None:
            raise ValueError("estimasi_selesai tidak boleh dikosongkan (null)")
        if "tanggal_mulai" in info.data and info.data["tanggal_mulai"] is not None:
            if v < info.data["tanggal_mulai"]:
                raise ValueError("estimasi_selesai tidak boleh lebih awal dari tanggal_mulai")
        return v

class ProyekResponse(ProyekBase):
    id: int
    dibuat_oleh: int
    created_at: datetime
    updated_at: datetime
    wilayah: Optional[WilayahBrief] = None
    desa: Optional[WilayahBrief] = None
    dinas: Optional[DinasResponse] = None
    tahapan_list: List[TahapanResponse] = []
    dokumentasi_list: List[DokumentasiResponse] = []
    rata_rata_rating: Optional[float] = None
    jumlah_rating: int = 0

    model_config = ConfigDict(from_attributes=True)

class ProyekListItem(BaseModel):
    id: int
    nama_proyek: str
    kategori: ProyekKategori
    deskripsi: Optional[str] = None
    latitude: Decimal
    longitude: Decimal
    wilayah_id: int
    desa_id: Optional[int] = None
    dinas_id: int
    anggaran: Optional[Decimal] = None
    status: ProyekStatus
    progres_persen: int
    tanggal_mulai: date
    estimasi_selesai: date
    created_at: datetime
    updated_at: datetime
    nama_wilayah: Optional[str] = None
    nama_desa: Optional[str] = None
    nama_dinas: Optional[str] = None
    rata_rata_rating: Optional[float] = None
    jumlah_rating: int = 0

    model_config = ConfigDict(from_attributes=True)

class PaginatedProyekResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[ProyekListItem]
