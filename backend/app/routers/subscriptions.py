from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.project import Proyek
from app.models.notification import SubscriptionNotifikasi, Notifikasi
from app.schemas.notification import NotifikasiResponse, SubscriptionStatusResponse

router = APIRouter(tags=["Notifikasi & Langganan"])

@router.post("/proyek/{id}/subscribe", response_model=SubscriptionStatusResponse)
def subscribe_project(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Warga berlangganan notifikasi otomatis untuk proyek tertentu
    agar menerima pemberitahuan setiap ada pembaruan data atau progres.
    """
    proyek = db.query(Proyek).filter(Proyek.id == id).first()
    if not proyek:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyek tidak ditemukan.")

    existing = db.query(SubscriptionNotifikasi).filter(
        SubscriptionNotifikasi.user_id == current_user.id,
        SubscriptionNotifikasi.proyek_id == id
    ).first()

    if not existing:
        sub = SubscriptionNotifikasi(user_id=current_user.id, proyek_id=id)
        db.add(sub)
        db.commit()

    return SubscriptionStatusResponse(proyek_id=id, is_subscribed=True)

@router.delete("/proyek/{id}/subscribe", response_model=SubscriptionStatusResponse)
def unsubscribe_project(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Berhenti berlangganan pembaruan suatu proyek."""
    sub = db.query(SubscriptionNotifikasi).filter(
        SubscriptionNotifikasi.user_id == current_user.id,
        SubscriptionNotifikasi.proyek_id == id
    ).first()

    if sub:
        db.delete(sub)
        db.commit()

    return SubscriptionStatusResponse(proyek_id=id, is_subscribed=False)

@router.get("/proyek/{id}/subscription-status", response_model=SubscriptionStatusResponse)
def check_subscription_status(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mengecek apakah pengguna saat ini berlangganan proyek ini."""
    sub = db.query(SubscriptionNotifikasi).filter(
        SubscriptionNotifikasi.user_id == current_user.id,
        SubscriptionNotifikasi.proyek_id == id
    ).first()

    return SubscriptionStatusResponse(proyek_id=id, is_subscribed=sub is not None)

@router.get("/notifikasi", response_model=List[NotifikasiResponse])
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mengambil riwayat notifikasi pengguna yang sedang login."""
    notifications = db.query(Notifikasi).filter(
        Notifikasi.user_id == current_user.id
    ).order_by(Notifikasi.created_at.desc()).limit(50).all()

    result = []
    for n in notifications:
        item = NotifikasiResponse.model_validate(n)
        item.nama_proyek = n.proyek.nama_proyek if n.proyek else ""
        result.append(item)
    return result

@router.patch("/notifikasi/{notif_id}/read", response_model=NotifikasiResponse)
def mark_notification_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Menandai satu notifikasi sebagai telah dibaca."""
    notif = db.query(Notifikasi).filter(
        Notifikasi.id == notif_id,
        Notifikasi.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notifikasi tidak ditemukan.")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    item = NotifikasiResponse.model_validate(notif)
    item.nama_proyek = notif.proyek.nama_proyek if notif.proyek else ""
    return item

@router.patch("/notifikasi/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Menandai seluruh notifikasi user sebagai telah dibaca."""
    db.query(Notifikasi).filter(
        Notifikasi.user_id == current_user.id,
        Notifikasi.is_read == False
    ).update({Notifikasi.is_read: True})
    db.commit()
    return {"message": "Semua notifikasi telah ditandai sudah dibaca."}
