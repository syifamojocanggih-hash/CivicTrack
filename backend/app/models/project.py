import enum
from sqlalchemy import (
    Column, BigInteger, String, Integer, SmallInteger, Numeric,
    Date, DateTime, Enum, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base, PK_BIGINT

class ProyekKategori(str, enum.Enum):
    jalan = "jalan"
    taman = "taman"
    drainase = "drainase"
    jembatan = "jembatan"
    gedung_publik = "gedung_publik"
    lainnya = "lainnya"

class ProyekStatus(str, enum.Enum):
    berjalan = "berjalan"
    selesai = "selesai"
    tertunda = "tertunda"
    dalam_peninjauan_ulang = "dalam_peninjauan_ulang"

class MediaType(str, enum.Enum):
    foto = "foto"
    video = "video"

class Proyek(Base):
    __tablename__ = "proyek"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    nama_proyek = Column(String(200), nullable=False, index=True)
    kategori = Column(Enum(ProyekKategori), nullable=False, index=True)
    deskripsi = Column(Text, nullable=True)
    latitude = Column(Numeric(9, 6), nullable=False)
    longitude = Column(Numeric(9, 6), nullable=False)
    wilayah_id = Column(BigInteger, ForeignKey("wilayah_administratif.id", ondelete="RESTRICT"), nullable=False, index=True)
    dinas_id = Column(BigInteger, ForeignKey("dinas.id", ondelete="RESTRICT"), nullable=False, index=True)
    anggaran = Column(Numeric(18, 2), nullable=True)
    status = Column(Enum(ProyekStatus), nullable=False, default=ProyekStatus.berjalan, index=True)
    progres_persen = Column(SmallInteger, nullable=False, default=0)
    tanggal_mulai = Column(Date, nullable=False)
    estimasi_selesai = Column(Date, nullable=False)
    dibuat_oleh = Column(BigInteger, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    wilayah = relationship("WilayahAdministratif", back_populates="proyek_list")
    dinas = relationship("Dinas", back_populates="proyek_list")
    creator = relationship("User", foreign_keys=[dibuat_oleh])
    tahapan_list = relationship("TahapanProgres", back_populates="proyek", cascade="all, delete-orphan", order_by="TahapanProgres.tanggal_pencatatan.asc()")
    dokumentasi_list = relationship("DokumentasiProyek", back_populates="proyek", cascade="all, delete-orphan", order_by="DokumentasiProyek.created_at.desc()")
    laporan_list = relationship("LaporanMasyarakat", back_populates="proyek", cascade="all, delete-orphan")
    subscription_list = relationship("SubscriptionNotifikasi", back_populates="proyek", cascade="all, delete-orphan")
    ratings = relationship("RatingKepuasan", back_populates="proyek", cascade="all, delete-orphan")
    rute_alternatif = relationship("RekomendasiRute", back_populates="proyek", cascade="all, delete-orphan")
    evaluasi_list = relationship("EvaluasiPembangunan", back_populates="proyek", cascade="all, delete-orphan")

class TahapanProgres(Base):
    __tablename__ = "tahapan_progres"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    proyek_id = Column(BigInteger, ForeignKey("proyek.id", ondelete="CASCADE"), nullable=False, index=True)
    nama_tahap = Column(String(150), nullable=False)
    progres_persen = Column(SmallInteger, nullable=False)
    catatan = Column(Text, nullable=True)
    dicatat_oleh = Column(BigInteger, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    tanggal_pencatatan = Column(DateTime, server_default=func.now(), nullable=False)

    proyek = relationship("Proyek", back_populates="tahapan_list")
    pencatat = relationship("User", foreign_keys=[dicatat_oleh])
    dokumentasi_list = relationship("DokumentasiProyek", back_populates="tahapan")

class DokumentasiProyek(Base):
    __tablename__ = "dokumentasi_proyek"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    proyek_id = Column(BigInteger, ForeignKey("proyek.id", ondelete="CASCADE"), nullable=False, index=True)
    tahapan_id = Column(BigInteger, ForeignKey("tahapan_progres.id", ondelete="SET NULL"), nullable=True)
    tipe_media = Column(Enum(MediaType), nullable=False)
    url_file = Column(String(500), nullable=False)
    ukuran_file = Column(Integer, nullable=True)
    diunggah_oleh = Column(BigInteger, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    proyek = relationship("Proyek", back_populates="dokumentasi_list")
    tahapan = relationship("TahapanProgres", back_populates="dokumentasi_list")
    pengunggah = relationship("User", foreign_keys=[diunggah_oleh])
