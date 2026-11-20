from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.project import Proyek
from app.models.notification import SubscriptionNotifikasi, Notifikasi, NotificationLog, PushSubscription

class PushKeys(BaseModel):
    p256dh: str
    auth: str

class PushSubscriptionRequest(BaseModel):
    endpoint: str
    keys: PushKeys
from app.schemas.notification import NotifikasiResponse, SubscriptionStatusResponse

router = APIRouter(tags=["Notifikasi & Ikuti Proyek"])

@router.post("/proyek/{id}/subscribe", response_model=SubscriptionStatusResponse)
def subscribe_project(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Warga mengikuti (subscribe) notifikasi otomatis untuk proyek tertentu
    agar menerima pemberitahuan setiap ada pembaruan data atau progres linimasa.
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
    """Berhenti mengikuti (unsubscribe) pembaruan suatu proyek."""
    sub = db.query(SubscriptionNotifikasi).filter(
        SubscriptionNotifikasi.user_id == current_user.id,
        SubscriptionNotifikasi.proyek_id == id
    ).first()

    if sub:
        db.delete(sub)
        db.commit()

    return SubscriptionStatusResponse(proyek_id=id, is_subscribed=False)

@router.get("/proyek/{id}/subscribe/status", response_model=SubscriptionStatusResponse)
@router.get("/proyek/{id}/subscription-status", response_model=SubscriptionStatusResponse)
def check_subscription_status(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mengecek apakah pengguna saat ini sedang mengikuti proyek ini."""
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
    ).order_by(Notifikasi.created_at.desc(), Notifikasi.id.desc()).limit(50).all()

    result = []
    for n in notifications:
        item = NotifikasiResponse.model_validate(n)
        item.nama_proyek = n.proyek.nama_proyek if n.proyek else ""
        if "PRIORITAS TINGGI" in n.pesan or "Rute Harian" in n.pesan:
            item.target_type = "route_overlap"
            item.is_high_priority = True
        else:
            item.target_type = "radius"
            item.is_high_priority = False
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
    if "PRIORITAS TINGGI" in notif.pesan or "Rute Harian" in notif.pesan:
        item.target_type = "route_overlap"
        item.is_high_priority = True
    else:
        item.target_type = "radius"
        item.is_high_priority = False
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

@router.get("/notifikasi/logs")
def get_notification_logs(
    proyek_id: Optional[int] = Query(None),
    trigger_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Mengambil riwayat log notifikasi (tabel notification_logs) untuk audit dan metrik pimpinan.
    """
    query = db.query(NotificationLog)
    if proyek_id is not None:
        query = query.filter(NotificationLog.proyek_id == proyek_id)
    if trigger_type is not None:
        query = query.filter(NotificationLog.trigger_type == trigger_type)
    logs = query.order_by(NotificationLog.created_at.desc(), NotificationLog.id.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "proyek_id": l.proyek_id,
            "nama_proyek": l.proyek.nama_proyek if l.proyek else None,
            "user_id": l.user_id,
            "trigger_type": l.trigger_type,
            "channel": l.channel,
            "judul": l.judul,
            "pesan": l.pesan,
            "target_type": l.target_type,
            "priority": getattr(l.priority, 'value', str(l.priority)) if l.priority else "normal",
            "radius_meter": l.radius_meter,
            "distance_meters": l.distance_meters,
            "is_delivered": l.is_delivered,
            "is_read": l.is_read,
            "created_at": str(l.created_at)
        }
        for l in logs
    ]

@router.post("/wilayah/{wilayah_id}/subscribe")
def subscribe_wilayah(
    wilayah_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Berlangganan notifikasi proyek untuk seluruh kecamatan/desa."""
    existing = db.query(SubscriptionNotifikasi).filter(
        SubscriptionNotifikasi.user_id == current_user.id,
        SubscriptionNotifikasi.wilayah_id == wilayah_id
    ).first()
    if not existing:
        sub = SubscriptionNotifikasi(user_id=current_user.id, wilayah_id=wilayah_id)
        db.add(sub)
        db.commit()
    return {"wilayah_id": wilayah_id, "is_subscribed": True}

@router.get("/notifikasi/vapid-public-key")
def get_vapid_public_key():
    """Mengembalikan VAPID public key untuk subscription Web Push browser."""
    return {"public_key": settings.VAPID_PUBLIC_KEY}

@router.post("/notifikasi/push-subscription")
def register_push_subscription(
    req: PushSubscriptionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Menyimpan PushSubscription browser pengguna untuk Web Push notification."""
    existing = db.query(PushSubscription).filter(PushSubscription.endpoint == req.endpoint).first()
    if existing:
        existing.user_id = current_user.id
        existing.p256dh = req.keys.p256dh
        existing.auth = req.keys.auth
        db.commit()
        return {"status": "updated", "id": existing.id}
    else:
        new_sub = PushSubscription(
            user_id=current_user.id,
            endpoint=req.endpoint,
            p256dh=req.keys.p256dh,
            auth=req.keys.auth
        )
        db.add(new_sub)
        db.commit()
        db.refresh(new_sub)
        return {"status": "created", "id": new_sub.id}

@router.delete("/notifikasi/push-subscription")
def unregister_push_subscription(
    endpoint: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Menghapus PushSubscription pengguna saat notifikasi dinonaktifkan."""
    sub = db.query(PushSubscription).filter(
        PushSubscription.endpoint == endpoint,
        PushSubscription.user_id == current_user.id
    ).first()
    if sub:
        db.delete(sub)
        db.commit()
    return {"status": "unregistered"}


