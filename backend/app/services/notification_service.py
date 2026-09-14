from typing import List
from sqlalchemy.orm import Session
from app.models.notification import SubscriptionNotifikasi, Notifikasi
from app.models.project import Proyek

def notify_project_subscribers(db: Session, proyek: Proyek, pesan: str) -> int:
    """
    Mengirim notifikasi otomatis ke semua warga yang berlangganan proyek ini.
    Mengembalikan jumlah notifikasi yang dibuat.
    """
    subscribers = db.query(SubscriptionNotifikasi).filter(
        SubscriptionNotifikasi.proyek_id == proyek.id
    ).all()

    if not subscribers:
        return 0

    notifikasi_records = []
    for sub in subscribers:
        notif = Notifikasi(
            user_id=sub.user_id,
            proyek_id=proyek.id,
            pesan=pesan,
            is_read=False
        )
        notifikasi_records.append(notif)

    db.add_all(notifikasi_records)
    db.commit()
    return len(notifikasi_records)
