import enum
from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, ForeignKey, UniqueConstraint, Integer, Float, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base, PK_BIGINT

class NotificationPriority(str, enum.Enum):
    normal = "normal"
    tinggi = "tinggi"

class SubscriptionNotifikasi(Base):
    __tablename__ = "subscription_notifikasi"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    proyek_id = Column(BigInteger, ForeignKey("proyek.id", ondelete="CASCADE"), nullable=True, index=True)
    wilayah_id = Column(BigInteger, ForeignKey("wilayah_administratif.id", ondelete="CASCADE"), nullable=True, index=True)
    desa_id = Column(BigInteger, ForeignKey("wilayah_administratif.id", ondelete="CASCADE"), nullable=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    user = relationship("User", foreign_keys=[user_id])
    proyek = relationship("Proyek", back_populates="subscription_list")

class Notifikasi(Base):
    __tablename__ = "notifikasi"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    proyek_id = Column(BigInteger, ForeignKey("proyek.id", ondelete="CASCADE"), nullable=False, index=True)
    pesan = Column(String(255), nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    user = relationship("User", foreign_keys=[user_id])
    proyek = relationship("Proyek")

class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    proyek_id = Column(BigInteger, ForeignKey("proyek.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    trigger_type = Column(String(50), nullable=False, index=True)
    channel = Column(String(30), nullable=False, default="all")  # 'web_push', 'in_app', 'all'
    judul = Column(String(200), nullable=False)
    pesan = Column(Text, nullable=False)
    target_type = Column(String(50), nullable=False, default="radius")  # 'radius', 'subscription', 'route_overlap'
    priority = Column(SQLEnum(NotificationPriority, native_enum=False), default=NotificationPriority.normal, nullable=False, index=True)
    radius_meter = Column(Integer, nullable=True)
    distance_meters = Column(Float, nullable=True)
    is_delivered = Column(Boolean, default=True, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    user = relationship("User", foreign_keys=[user_id])
    proyek = relationship("Proyek", foreign_keys=[proyek_id])

class PushSubscription(Base):
    __tablename__ = "push_subscriptions"

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    endpoint = Column(Text, nullable=False)
    p256dh = Column(String(255), nullable=False)
    auth = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    user = relationship("User", foreign_keys=[user_id])


