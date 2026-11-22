import logging
from app.core.database import SessionLocal
from app.services.notification_dispatcher import run_daily_project_lifecycle_scheduler

logger = logging.getLogger(__name__)

try:
    from apscheduler.schedulers.background import BackgroundScheduler
    from apscheduler.triggers.cron import CronTrigger
    scheduler = BackgroundScheduler()
    HAS_APSCHEDULER = True
except ImportError:
    scheduler = None
    HAS_APSCHEDULER = False
    logger.warning("[APScheduler] apscheduler belum terpasang. Scheduler background dinonaktifkan.")

def scheduled_lifecycle_job():
    """Tugas harian otomatis: memindahkan proyek H-14 planned -> scheduled dan kirim notifikasi."""
    logger.info("[APScheduler] Menjalankan pengecekan transisi lifecycle proyek H-14 harian...")
    db = SessionLocal()
    try:
        res = run_daily_project_lifecycle_scheduler(db)
        logger.info(f"[APScheduler] Hasil eksekusi scheduler: {res}")
    except Exception as e:
        logger.error(f"[APScheduler] Gagal menjalankan lifecycle scheduler: {e}")
    finally:
        db.close()

def start_scheduler():
    """Memulai scheduler otomatis di latar belakang saat aplikasi boot."""
    if not HAS_APSCHEDULER or not scheduler:
        return
    if not scheduler.get_job("daily_project_lifecycle_job"):
        scheduler.add_job(
            scheduled_lifecycle_job,
            CronTrigger(hour=0, minute=1),
            id="daily_project_lifecycle_job",
            name="Daily Project Early-Warning Lifecycle Check",
            replace_existing=True
        )
    if not scheduler.running:
        scheduler.start()
        logger.info("[APScheduler] Background Scheduler aktif (Jadwal otomatis harian 00:01 WIB).")

def stop_scheduler():
    """Mematikan scheduler secara aman saat aplikasi shutdown."""
    if not HAS_APSCHEDULER or not scheduler:
        return
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("[APScheduler] Background Scheduler dinonaktifkan.")
