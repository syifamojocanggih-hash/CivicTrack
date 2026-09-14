from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base, PK_BIGINT

class SubscriptionNotifikasi(Base):
    __tablename__ = "subscription_notifikasi"
    __table_args__ = (
        UniqueConstraint("user_id", "proyek_id", name="uk_user_proyek_sub"),
    )

    id = Column(PK_BIGINT, primary_key=True, autoincrement=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    proyek_id = Column(BigInteger, ForeignKey("proyek.id", ondelete="CASCADE"), nullable=False, index=True)
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
