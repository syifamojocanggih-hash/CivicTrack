import enum
from sqlalchemy import Column, BigInteger, String, Numeric, Integer, Boolean, DateTime, Enum, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base, PK_BIGINT

class PrioritasRute(str, enum.Enum):
    utama = "utama"
    kedua = "kedua"
    tambahan = "tambahan"

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
