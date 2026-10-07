from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, get_db
from app.models.notification import SubscriptionNotifikasi, Notifikasi
from app.models.project import Proyek


def get_notification_db_session() -> Session:
    """
    Mengambil session database yang tepat untuk background task:
    jika di test environment (get_db di-override), gunakan test generator.
    Jika di production/development, buat session baru dari SessionLocal.
    """
    try:
        from app.main import app
        if get_db in app.dependency_overrides:
            gen = app.dependency_overrides[get_db]()
            return next(gen)
    except Exception:
        pass
    return SessionLocal()


def send_project_update_notifications(
    proyek_id: int,
    pesan: str,
    exclude_user_id: Optional[int] = None
) -> int:
    """
    Fungsi background task (non-blocking) untuk membuat notifikasi massal
    bagi seluruh subscriber proyek saat terjadi pembaruan progres/status.
    Mengecualikan user_id pembuat perubahan agar tidak menerima notifikasi miliknya sendiri.
    """
    db = get_notification_db_session()
    try:
        query = db.query(SubscriptionNotifikasi).filter(
            SubscriptionNotifikasi.proyek_id == proyek_id
        )
        if exclude_user_id is not None:
            query = query.filter(SubscriptionNotifikasi.user_id != exclude_user_id)

        subscribers = query.all()
        if not subscribers:
            return 0

        notifikasi_records = [
            Notifikasi(
                user_id=sub.user_id,
                proyek_id=proyek_id,
                pesan=pesan,
                is_read=False
            )
            for sub in subscribers
        ]
        db.add_all(notifikasi_records)
        db.commit()
        return len(notifikasi_records)
    except Exception as e:
        db.rollback()
        return 0
    finally:
        db.close()


def notify_project_subscribers(
    db: Session,
    proyek: Proyek,
    pesan: str,
    exclude_user_id: Optional[int] = None
) -> int:
    """
    Helper sinkron untuk kompatibilitas fungsi lama jika diperlukan.
    """
    query = db.query(SubscriptionNotifikasi).filter(
        SubscriptionNotifikasi.proyek_id == proyek.id
    )
    if exclude_user_id is not None:
        query = query.filter(SubscriptionNotifikasi.user_id != exclude_user_id)

    subscribers = query.all()
    if not subscribers:
        return 0

    notifikasi_records = [
        Notifikasi(
            user_id=sub.user_id,
            proyek_id=proyek.id,
            pesan=pesan,
            is_read=False
        )
        for sub in subscribers
    ]
    db.add_all(notifikasi_records)
    db.commit()
    return len(notifikasi_records)

