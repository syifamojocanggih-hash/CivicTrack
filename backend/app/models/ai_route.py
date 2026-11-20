import enum
from sqlalchemy import Column, BigInteger, String, Numeric, Integer, Boolean, DateTime, Enum, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base, PK_BIGINT

class PrioritasRute(str, enum.Enum):
    utama = "utama"
    kedua = "kedua"
    tambahan = "tambahan"

class ModaTransportasi(str, enum.Enum):
    mobil = "mobil"
    motor = "motor"
    pejalan_kaki = "pejalan_kaki"

    @classmethod
    def _missing_(cls, value):
        val = str(value).lower().strip()
        if val in ("car", "driving", "roda_empat", "mobil"):
            return cls.mobil
        if val in ("motorcycle", "motor", "roda_dua", "sepeda_motor"):
            return cls.motor
        if val in ("walking", "pejalan_kaki", "jalan_kaki", "walk"):
            return cls.pejalan_kaki
        return cls.mobil

class RekomendasiRute(Base):
    __tablename__ = "rekomendasi_rute"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    proyek_id = Column(BigInteger, ForeignKey("proyek.id", ondelete="CASCADE"), nullable=False, index=True)
    nama_rute = Column(String(200), nullable=False)
    prioritas = Column(Enum(PrioritasRute), nullable=False)
    estimasi_jarak_km = Column(Numeric(6, 2), nullable=True)
    estimasi_waktu_menit = Column(Integer, nullable=True)
    alasan_rekomendasi = Column(Text, nullable=True)
    raw_response_ai = Column(JSON, nullable=True)
    is_valid = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    proyek = relationship("Proyek", back_populates="rute_alternatif")

    @property
    def geografis_terverifikasi(self) -> bool:
        """Menyajikan status verifikasi data jalan terhadap OpenStreetMap dari raw_response_ai."""
        if self.raw_response_ai and isinstance(self.raw_response_ai, dict):
            return bool(self.raw_response_ai.get("geografis_terverifikasi", False))
        return False

    @property
    def koordinat_rute(self) -> list:
        """Menyajikan koordinat garis rute [lat, lon] dari raw_response_ai."""
        if self.raw_response_ai and isinstance(self.raw_response_ai, dict):
            return self.raw_response_ai.get("koordinat_rute", [])
        return []

class SavedRoute(Base):
    __tablename__ = "saved_routes"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    nama_rute = Column(String(200), nullable=False)
    koordinat_asal = Column(JSON, nullable=True)
    koordinat_tujuan = Column(JSON, nullable=True)
    polyline_data = Column(JSON, nullable=False)
    moda_transportasi = Column(Enum(ModaTransportasi), nullable=False, default=ModaTransportasi.mobil)
    jarak_km = Column(Numeric(6, 2), nullable=True)
    estimasi_menit = Column(Integer, nullable=True)
    catatan = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", backref="saved_routes")


