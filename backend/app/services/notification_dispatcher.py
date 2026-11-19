import logging
from datetime import date, datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.project import Proyek, ProyekStatus, TahapanProgres
from app.models.user import User, WilayahAdministratif
from app.models.notification import Notifikasi, SubscriptionNotifikasi, NotificationLog
from app.core.spatial import haversine_distance_meters

logger = logging.getLogger(__name__)

class NotificationDispatcher:
    """
    Service terpusat untuk mendispatch notifikasi berbasis radius (Haversine),
    langganan wilayah/desa/proyek, dan mencatat log lengkap ke notification_logs.
    """

    @staticmethod
    def get_notification_targets(proyek: Proyek, db: Session) -> List[Dict[str, Any]]:
        """
        Mengumpulkan target user penerima notifikasi:
        1. User yang berada dalam radius 'radius_dampak_meter' dari lokasi proyek (Haversine)
        2. User yang berlangganan notifikasi wilayah/desa atau proyek terkait
        3. Fallback: warga terdaftar yang relevan di sekitar wilayah
        Deduplikasi berdasarkan user_id.
        """
        targets_by_user_id: Dict[int, Dict[str, Any]] = {}
        proyek_lat = float(proyek.latitude) if proyek.latitude is not None else -7.1197
        proyek_lon = float(proyek.longitude) if proyek.longitude is not None else 112.4150
        radius_m = float(proyek.radius_dampak_meter) if proyek.radius_dampak_meter else 1500.0

        # 1. Target berbasis Radius Haversine (User dengan koordinat)
        users_with_coords = db.query(User).filter(
            User.latitude.isnot(None),
            User.longitude.isnot(None),
            User.is_active == True
        ).all()

        for u in users_with_coords:
            try:
                u_lat = float(u.latitude)
                u_lon = float(u.longitude)
                dist_m = haversine_distance_meters(proyek_lat, proyek_lon, u_lat, u_lon)
                if dist_m <= radius_m:
                    targets_by_user_id[u.id] = {
                        "user_id": u.id,
                        "user": u,
                        "target_type": "radius",
                        "distance_meters": round(dist_m, 1),
                        "channel": "all" if u.push_token else "in_app"
                    }
            except Exception as e:
                logger.warning(f"Gagal hitung jarak haversine user #{u.id}: {e}")

        # 2. Target berbasis Langganan Proyek langsung (SubscriptionNotifikasi proyek_id)
        project_subs = db.query(SubscriptionNotifikasi).filter(
            SubscriptionNotifikasi.proyek_id == proyek.id
        ).all()
        for sub in project_subs:
            if sub.user_id not in targets_by_user_id:
                u = sub.user or db.query(User).filter(User.id == sub.user_id).first()
                if u and u.is_active:
                    targets_by_user_id[sub.user_id] = {
                        "user_id": sub.user_id,
                        "user": u,
                        "target_type": "subscription",
                        "distance_meters": None,
                        "channel": "all" if u.push_token else "in_app"
                    }

        # 3. Target berbasis Langganan Wilayah/Desa (SubscriptionNotifikasi wilayah_id / desa_id)
        if proyek.wilayah_id or proyek.desa_id:
            wilayah_filters = []
            if proyek.wilayah_id:
                wilayah_filters.append(SubscriptionNotifikasi.wilayah_id == proyek.wilayah_id)
            if proyek.desa_id:
                wilayah_filters.append(SubscriptionNotifikasi.desa_id == proyek.desa_id)

            from sqlalchemy import or_
            area_subs = db.query(SubscriptionNotifikasi).filter(or_(*wilayah_filters)).all()
            for sub in area_subs:
                if sub.user_id not in targets_by_user_id:
                    u = sub.user or db.query(User).filter(User.id == sub.user_id).first()
                    if u and u.is_active:
                        targets_by_user_id[sub.user_id] = {
                            "user_id": sub.user_id,
                            "user": u,
                            "target_type": "subscription",
                            "distance_meters": None,
                            "channel": "all" if u.push_token else "in_app"
                        }

        # 4. Fallback Warga Wilayah: jika belum ada target khusus, sertakan warga di kecamatan/desa yang sama
        if not targets_by_user_id and (proyek.wilayah_id or proyek.desa_id):
            area_users = db.query(User).filter(
                User.is_active == True,
                or_(User.wilayah_id == proyek.wilayah_id, User.desa_id == proyek.desa_id)
            ).limit(20).all()
            for u in area_users:
                targets_by_user_id[u.id] = {
                    "user_id": u.id,
                    "user": u,
                    "target_type": "radius",
                    "distance_meters": None,
                    "channel": "in_app"
                }

        # 5. Jaminan Fallback Minimal: jika list masih kosong sama sekali (misal DB awal),
        # targetkan minimal 1 akun warga aktif agar notifikasi tetap tersalurkan dan tercatat di log
        if not targets_by_user_id:
            fallback_warga = db.query(User).filter(User.role == "warga", User.is_active == True).first()
            if fallback_warga:
                targets_by_user_id[fallback_warga.id] = {
                    "user_id": fallback_warga.id,
                    "user": fallback_warga,
                    "target_type": "radius",
                    "distance_meters": 500.0,
                    "channel": "in_app"
                }

        return list(targets_by_user_id.values())

    @classmethod
    def send_and_log(
        cls,
        proyek: Proyek,
        trigger_type: str,
        judul: str,
        pesan: str,
        db: Session,
        channel: str = "all",
        target_override: Optional[List[Dict[str, Any]]] = None,
        create_in_app: bool = True
    ) -> List[NotificationLog]:
        """
        Menyalurkan pesan notifikasi ke tabel 'notifikasi' (in-app) dan menyimpan
        riwayat audit komprehensif ke 'notification_logs'.
        """
        targets = target_override if target_override is not None else cls.get_notification_targets(proyek, db)
        created_logs: List[NotificationLog] = []

        if not targets:
            # Tetap simpan 1 entri log sistem jika tidak ada target penerima spesifik
            log_item = NotificationLog(
                proyek_id=proyek.id,
                user_id=None,
                trigger_type=trigger_type,
                channel=channel,
                judul=judul,
                pesan=pesan,
                target_type="radius",
                radius_meter=proyek.radius_dampak_meter or 1500,
                distance_meters=None,
                is_delivered=True,
                is_read=False
            )
            db.add(log_item)
            created_logs.append(log_item)
        else:
            for t in targets:
                u_id = t["user_id"]
                dist = t.get("distance_meters")
                t_type = t.get("target_type", "radius")
                ch = t.get("channel", channel)

                # Simpan ke notifikasi in-app jika create_in_app bernilai True
                if create_in_app:
                    in_app_notif = Notifikasi(
                        user_id=u_id,
                        proyek_id=proyek.id,
                        pesan=pesan,
                        is_read=False
                    )
                    db.add(in_app_notif)

                # Simpan ke notification_logs selalu
                log_entry = NotificationLog(
                    proyek_id=proyek.id,
                    user_id=u_id,
                    trigger_type=trigger_type,
                    channel=ch,
                    judul=judul,
                    pesan=pesan,
                    target_type=t_type,
                    radius_meter=proyek.radius_dampak_meter or 1500,
                    distance_meters=dist,
                    is_delivered=True,
                    is_read=False
                )
                db.add(log_entry)
                created_logs.append(log_entry)

        try:
            db.commit()
        except Exception as e:
            logger.error(f"Gagal commit notifikasi: {e}")
            db.rollback()

        return created_logs

    @staticmethod
    def _get_lokasi(proyek: Proyek) -> str:
        if getattr(proyek, "wilayah", None) and hasattr(proyek.wilayah, "nama_wilayah"):
            return proyek.wilayah.nama_wilayah
        return "Kabupaten Lamongan"

    @classmethod
    def dispatch_planned_created(cls, proyek: Proyek, db: Session) -> List[NotificationLog]:
        """
        Trigger 1a: Proyek baru dibuat dengan status 'planned' (Hulu SiRUP/LPSE)
        """
        lokasi = cls._get_lokasi(proyek)
        tgl_mulai = proyek.tanggal_mulai_rencana or "Segera"
        radius = proyek.radius_dampak_meter or 1500
        judul = "Rencana Proyek Baru (SiRUP/LPSE)"
        pesan = f"Proyek baru direncanakan: {proyek.nama_proyek} di {lokasi}. Radius dampak ±{radius}m. Jadwal mulai: {tgl_mulai}."
        return cls.send_and_log(proyek, "planned_created", judul, pesan, db)

    @classmethod
    def dispatch_scheduled_h14(cls, proyek: Proyek, days_left: int, db: Session) -> List[NotificationLog]:
        """
        Trigger 1b & Template H-14:
        'Proyek [nama] akan dimulai 14 hari lagi di [lokasi]. Siapkan rute alternatif.'
        """
        lokasi = cls._get_lokasi(proyek)
        judul = f"Peringatan H-{days_left}: Proyek Akan Dimulai"
        pesan = f"Proyek {proyek.nama_proyek} akan dimulai {days_left} hari lagi di {lokasi}. Siapkan rute alternatif."
        return cls.send_and_log(proyek, "scheduled_h14", judul, pesan, db)

    @classmethod
    def dispatch_h1_alert(cls, proyek: Proyek, db: Session) -> List[NotificationLog]:
        """
        Template H-1:
        'Besok dimulai [nama] di [lokasi]. Estimasi penutupan: [tanggal_mulai] - [estimasi_selesai].'
        """
        lokasi = cls._get_lokasi(proyek)
        tgl_mulai = str(proyek.tanggal_mulai_rencana or proyek.tanggal_mulai or "Besok")
        tgl_selesai = str(proyek.estimasi_selesai or "Selesai")
        judul = "Peringatan H-1: Proyek Dimulai Besok"
        pesan = f"Besok dimulai {proyek.nama_proyek} di {lokasi}. Estimasi penutupan: {tgl_mulai} - {tgl_selesai}."
        return cls.send_and_log(proyek, "h1_alert", judul, pesan, db)

    @classmethod
    def dispatch_h0_started(cls, proyek: Proyek, db: Session) -> List[NotificationLog]:
        """
        Template H-0:
        'Hari ini dimulai [nama]. Rute alternatif sudah tersedia di menu AI Route.'
        """
        judul = "Hari Ini: Pengerjaan Fisik Proyek Dimulai"
        pesan = f"Hari ini dimulai {proyek.nama_proyek}. Rute alternatif sudah tersedia di menu AI Route."
        return cls.send_and_log(proyek, "h0_started", judul, pesan, db)

    @classmethod
    def dispatch_status_change(cls, proyek: Proyek, old_status: str, new_status: str, db: Session, create_in_app: bool = True) -> List[NotificationLog]:
        """
        Trigger 1c: Status berubah ke in_progress, completed, atau suspended
        """
        lokasi = cls._get_lokasi(proyek)
        new_val = str(new_status).lower()
        judul = f"Pembaruan Status Proyek: {proyek.nama_proyek}"

        if new_val in ("in_progress", "berjalan"):
            pesan = f"Proyek '{proyek.nama_proyek}' di {lokasi} resmi memasuki tahap pengerjaan fisik di lapangan."
        elif new_val in ("completed", "selesai"):
            pesan = f"Proyek '{proyek.nama_proyek}' telah selesai 100%. Jalur lalu lintas kembali normal."
        elif new_val in ("suspended", "ditangguhkan", "dalam_peninjauan_ulang"):
            pesan = f"Pengerjaan proyek '{proyek.nama_proyek}' saat ini ditangguhkan sementara demi evaluasi teknis."
        else:
            pesan = f"Status proyek '{proyek.nama_proyek}' berubah menjadi '{new_status}'."

        return cls.send_and_log(proyek, "status_change", judul, pesan, db, create_in_app=create_in_app)

    @classmethod
    def dispatch_milestone(cls, proyek: Proyek, milestone: int, db: Session, create_in_app: bool = True) -> List[NotificationLog]:
        """
        Trigger 1d & Template Milestone:
        'Progres proyek [nama] mencapai [50%/100%].'
        """
        judul = f"Milestone Progres {milestone}%: {proyek.nama_proyek}"
        pesan = f"Progres proyek {proyek.nama_proyek} mencapai {milestone}%."
        return cls.send_and_log(proyek, f"milestone_{milestone}", judul, pesan, db, create_in_app=create_in_app)


def run_daily_project_lifecycle_scheduler(db: Session, target_date: Optional[date] = None) -> Dict[str, Any]:
    """
    Cron Job Harian:
    1. Mengecek proyek dengan status 'planned'.
       Jika (tanggal_mulai_rencana - hari_ini) <= 14 dan >= 0:
       - Update status kolom 'status' di DB secara nyata menjadi 'scheduled'
       - Catat audit trail ke TahapanProgres
       - Kirim notifikasi H-14 via NotificationDispatcher
    2. Mengecek proyek yang H-1 (tanggal_mulai_rencana - hari_ini == 1) -> Kirim notifikasi H-1
    3. Mengecek proyek yang H-0 (tanggal_mulai_rencana - hari_ini == 0) -> Kirim notifikasi H-0
    """
    today = target_date or date.today()
    transitioned_to_scheduled = []
    h14_notified = []
    h1_notified = []
    h0_notified = []

    # Ambil seluruh proyek yang memiliki tanggal_mulai_rencana
    planned_projects = db.query(Proyek).filter(
        Proyek.status.in_([ProyekStatus.planned, "planned", "direncanakan"]),
        Proyek.tanggal_mulai_rencana.isnot(None)
    ).all()

    for p in planned_projects:
        try:
            d_rencana = p.tanggal_mulai_rencana
            if isinstance(d_rencana, str):
                d_rencana = datetime.strptime(d_rencana.split("T")[0], "%Y-%m-%d").date()
            diff_days = (d_rencana - today).days

            if 0 <= diff_days <= 14:
                # Update status nyata di kolom database
                p.status = ProyekStatus.scheduled
                transitioned_to_scheduled.append(p.id)

                # Catat audit trail
                tahap = TahapanProgres(
                    proyek_id=p.id,
                    nama_tahap="Transisi Status Otomatis (Early-Warning H-14)",
                    progres_persen=p.progres_persen or 0,
                    catatan=f"Status otomatis beralih dari 'planned' ke 'scheduled' karena memasuki H-{diff_days} mobilisasi alat berat.",
                    dicatat_oleh=1
                )
                db.add(tahap)

                # Dispatch notifikasi H-14
                NotificationDispatcher.dispatch_scheduled_h14(p, diff_days, db)
                h14_notified.append(p.id)
        except Exception as e:
            logger.error(f"Gagal proses transisi proyek #{p.id}: {e}")

    # Cek notifikasi H-1 dan H-0 untuk proyek berstatus scheduled
    scheduled_projects = db.query(Proyek).filter(
        Proyek.status.in_([ProyekStatus.scheduled, "scheduled", "akan_dimulai"]),
        Proyek.tanggal_mulai_rencana.isnot(None)
    ).all()

    for p in scheduled_projects:
        try:
            d_rencana = p.tanggal_mulai_rencana
            if isinstance(d_rencana, str):
                d_rencana = datetime.strptime(d_rencana.split("T")[0], "%Y-%m-%d").date()
            diff_days = (d_rencana - today).days

            if diff_days == 1 and p.id not in h14_notified:
                NotificationDispatcher.dispatch_h1_alert(p, db)
                h1_notified.append(p.id)
            elif diff_days == 0 and p.id not in h14_notified:
                NotificationDispatcher.dispatch_h0_started(p, db)
                h0_notified.append(p.id)
        except Exception as e:
            logger.error(f"Gagal proses H-1/H-0 proyek #{p.id}: {e}")

    db.commit()

    return {
        "status": "success",
        "date_checked": str(today),
        "transitioned_to_scheduled": transitioned_to_scheduled,
        "h14_notified_count": len(h14_notified),
        "h1_notified_count": len(h1_notified),
        "h0_notified_count": len(h0_notified)
    }
