import enum
from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
from app.core.database import Base, PK_BIGINT

class UserRole(str, enum.Enum):
    warga = "warga"
    admin_dinas = "admin_dinas"
    pimpinan_instansi = "pimpinan_instansi"
    media_peneliti = "media_peneliti"

class WilayahLevel(str, enum.Enum):
    desa = "desa"
    kecamatan = "kecamatan"
    kabupaten = "kabupaten"

class WilayahAdministratif(Base):
    __tablename__ = "wilayah_administratif"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    kode_wilayah = Column(String(20), unique=True, nullable=False, index=True)
    nama_wilayah = Column(String(150), nullable=False)
    level = Column(Enum(WilayahLevel), nullable=False)
    parent_id = Column(BigInteger, ForeignKey("wilayah_administratif.id", ondelete="SET NULL"), nullable=True)
    geom_boundary = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relasi hierarki
    parent = relationship("WilayahAdministratif", remote_side=[id], backref=backref("sub_wilayah", lazy="selectin"))
    dinas_list = relationship("Dinas", back_populates="wilayah")
    proyek_list = relationship("Proyek", back_populates="wilayah")

class Dinas(Base):
    __tablename__ = "dinas"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    nama_dinas = Column(String(150), nullable=False)
    wilayah_id = Column(BigInteger, ForeignKey("wilayah_administratif.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    wilayah = relationship("WilayahAdministratif", back_populates="dinas_list")
    users = relationship("User", back_populates="dinas")
    proyek_list = relationship("Proyek", back_populates="dinas")

class User(Base):
    __tablename__ = "users"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    nama = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.warga)
    dinas_id = Column(BigInteger, ForeignKey("dinas.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    dinas = relationship("Dinas", back_populates="users")
