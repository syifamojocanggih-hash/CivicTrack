import enum
from sqlalchemy import Column, BigInteger, Text, SmallInteger, DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base, PK_BIGINT

class LaporanStatus(str, enum.Enum):
    baru = "baru"
    diproses = "diproses"
    ditanggapi = "ditanggapi"
    ditolak = "ditolak"

class LaporanMasyarakat(Base):
    __tablename__ = "laporan_masyarakat"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    proyek_id = Column(BigInteger, ForeignKey("proyek.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    isi_laporan = Column(Text, nullable=False)
    status_tindak_lanjut = Column(Enum(LaporanStatus), nullable=False, default=LaporanStatus.baru)
    tanggapan_dinas = Column(Text, nullable=True)
    ditanggapi_oleh = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    proyek = relationship("Proyek", back_populates="laporan_list")
    pelapor = relationship("User", foreign_keys=[user_id])
    penanggap = relationship("User", foreign_keys=[ditanggapi_oleh])

class RatingKepuasan(Base):
    __tablename__ = "rating_kepuasan"
    __table_args__ = (
        UniqueConstraint("user_id", "proyek_id", name="uk_user_proyek_rating"),
    )

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    proyek_id = Column(BigInteger, ForeignKey("proyek.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skor = Column(SmallInteger, nullable=False) # 1 - 5
    komentar = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    proyek = relationship("Proyek", back_populates="ratings")
    user = relationship("User", foreign_keys=[user_id])
