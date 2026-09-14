import enum
from sqlalchemy import Column, BigInteger, String, Text, SmallInteger, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base, PK_BIGINT
from app.models.project import MediaType

class EvaluasiStatus(str, enum.Enum):
    menunggu_verifikasi = "menunggu_verifikasi"
    dalam_peninjauan_ulang = "dalam_peninjauan_ulang"
    terverifikasi_perlu_tindak_lanjut = "terverifikasi_perlu_tindak_lanjut"
    selesai_ditindaklanjuti = "selesai_ditindaklanjuti"
    ditolak_tidak_terbukti = "ditolak_tidak_terbukti"

class EvaluasiPembangunan(Base):
    __tablename__ = "evaluasi_pembangunan"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    proyek_id = Column(BigInteger, ForeignKey("proyek.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    kategori_masalah = Column(String(100), nullable=False)
    deskripsi = Column(Text, nullable=False)
    skor_urgensi_ai = Column(SmallInteger, nullable=True) # 1 - 5
    ringkasan_analisis_ai = Column(Text, nullable=True)
    status = Column(Enum(EvaluasiStatus), nullable=False, default=EvaluasiStatus.menunggu_verifikasi, index=True)
    ditinjau_oleh = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    proyek = relationship("Proyek", back_populates="evaluasi_list")
    pelapor = relationship("User", foreign_keys=[user_id])
    peninjau = relationship("User", foreign_keys=[ditinjau_oleh])
    dokumentasi_list = relationship("DokumentasiEvaluasi", back_populates="evaluasi", cascade="all, delete-orphan")
    status_logs = relationship("EvaluasiStatusLog", back_populates="evaluasi", cascade="all, delete-orphan", order_by="EvaluasiStatusLog.created_at.asc()")

class DokumentasiEvaluasi(Base):
    __tablename__ = "dokumentasi_evaluasi"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    evaluasi_id = Column(BigInteger, ForeignKey("evaluasi_pembangunan.id", ondelete="CASCADE"), nullable=False, index=True)
    tipe_media = Column(Enum(MediaType), nullable=False)
    url_file = Column(String(500), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    evaluasi = relationship("EvaluasiPembangunan", back_populates="dokumentasi_list")

class EvaluasiStatusLog(Base):
    __tablename__ = "evaluasi_status_log"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    evaluasi_id = Column(BigInteger, ForeignKey("evaluasi_pembangunan.id", ondelete="CASCADE"), nullable=False, index=True)
    status_sebelumnya = Column(String(50), nullable=True)
    status_baru = Column(String(50), nullable=False)
    diubah_oleh = Column(BigInteger, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    catatan = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    evaluasi = relationship("EvaluasiPembangunan", back_populates="status_logs")
    pengubah = relationship("User", foreign_keys=[diubah_oleh])
