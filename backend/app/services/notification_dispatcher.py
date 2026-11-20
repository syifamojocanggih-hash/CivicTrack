import logging
import json
from datetime import date, datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.project import Proyek, ProyekStatus, TahapanProgres
from app.models.user import User, WilayahAdministratif
from app.models.notification import Notifikasi, SubscriptionNotifikasi, NotificationLog, PushSubscription, NotificationPriority
from app.models.ai_route import SavedRoute
from app.core.spatial import haversine_distance_meters, parse_coords_list, min_distance_points_to_polyline_meters

try:
    from pywebpush import webpush, WebPushException
    HAS_PYWEBPUSH = True
except ImportError:
    HAS_PYWEBPUSH = False

logger = logging.getLogger(__name__)

def send_real_web_push(subscription: PushSubscription, payload: dict) -> bool:
    """Mengirim push notification nyata via pywebpush dengan VAPID."""
    if not HAS_PYWEBPUSH:
        return False
    sub_data = {
        "endpoint": subscription.endpoint,
        "keys": {
            "p256dh": subscription.p256dh,
            "auth": subscription.auth
        }
    }
    try:
        webpush(
            subscription_info=sub_data,
            data=json.dumps(payload),
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={"sub": settings.VAPID_CLAIM_EMAIL}
        )
        return True
    except Exception as ex:
        logger.warning(f"Gagal kirim web push ke {subscription.endpoint[:35]}...: {ex}")
        return False

def sample_polyline_points(points: List[tuple], sample_interval_meters: float = 40.0) -> List[tuple]:
    """
    Mengambil sampel titik di sepanjang polyline dengan jarak minimal sample_interval_meters.
    Mencegah perulangan berlebih O(n*m) pada polyline OSM yang sangat rapat.
    """
    if not points or len(points) <= 2:
        return points

    sampled = [points[0]]
    last_pt = points[0]
    for pt in points[1:-1]:
        d = haversine_distance_meters(last_pt[0], last_pt[1], pt[0], pt[1])
        if d >= sample_interval_meters:
            sampled.append(pt)
            last_pt = pt

    if points[-1] not in sampled:
        sampled.append(points[-1])
    return sampled

def getUsersWithOverlappingRoute(
    jalur_terdampak: Any,
    db: Session,
    threshold_meters: float = 100.0
) -> List[Dict[str, Any]]:
    """
    Memeriksa overlap rute harian warga dengan koridor jalur terdampak proyek (jarak < threshold_meters).
    Menggunakan sampling titik cerdas & bounding box filter untuk efisiensi tinggi (menghindari O(n*m) penuh).
    """
    impact_points = parse_coords_list(jalur_terdampak)
    if not impact_points:
        return []

    # Sampling titik jalur proyek agar komputasi sangat ringan
    sampled_impact = sample_polyline_points(impact_points, sample_interval_meters=40.0)

    saved_routes = db.query(SavedRoute).join(User, SavedRoute.user_id == User.id).filter(
        User.is_active == True
    ).all()

    overlapping_results: List[Dict[str, Any]] = []
    best_dist_by_user: Dict[int, float] = {}
    best_route_by_user: Dict[int, SavedRoute] = {}

    for sr in saved_routes:
        poly_points = parse_coords_list(sr.polyline_data)
        if not poly_points:
            continue

        sampled_user_poly = sample_polyline_points(poly_points, sample_interval_meters=40.0)
        dist_m = min_distance_points_to_polyline_meters(sampled_impact, sampled_user_poly)

        if dist_m <= threshold_meters:
            u_id = sr.user_id
            if u_id not in best_dist_by_user or dist_m < best_dist_by_user[u_id]:
                best_dist_by_user[u_id] = dist_m
                best_route_by_user[u_id] = sr

    for u_id, dist_m in best_dist_by_user.items():
        sr = best_route_by_user[u_id]
        moda_str = sr.moda_transportasi.value if hasattr(sr.moda_transportasi, 'value') else str(sr.moda_transportasi or 'mobil')
        overlapping_results.append({
            "user_id": u_id,
            "user": sr.user,
            "target_type": "route_overlap",
            "distance_meters": round(dist_m, 1),
            "route_id": sr.id,
            "nama_rute": sr.nama_rute,
            "moda_transportasi": moda_str,
            "channel": "all" if (sr.user and sr.user.push_token) else "in_app"
        })

    return overlapping_results

class NotificationDispatcher:
    """
    Service terpusat untuk mendispatch notifikasi berbasis radius (Haversine),
    langganan wilayah/desa/proyek, deteksi overlap rute harian warga,
    dan mencatat log lengkap ke notification_logs.
    """

    @classmethod
    def get_users_with_overlapping_route(
        cls,
        proyek: Proyek,
        db: Session,
        threshold_meters: float = 100.0
    ) -> List[Dict[str, Any]]:
        impact_coords = parse_coords_list(proyek.jalur_terdampak)
        if not impact_coords and proyek.latitude is not None and proyek.longitude is not None:
            impact_coords = [(float(proyek.latitude), float(proyek.longitude))]
        return getUsersWithOverlappingRoute(impact_coords, db, threshold_meters=threshold_meters)

    @classmethod
    def get_notification_targets(cls, proyek: Proyek, db: Session) -> List[Dict[str, Any]]:
        """
        Mengumpulkan target user penerima notifikasi secara komprehensif:
        1. target_type='route_overlap' (Overlap rute harian <= 100m - PRIORITAS TINGGI)
        2. target_type='radius' (Berada dalam radius_dampak_meter Haversine)
        3. target_type='subscription' (Langganan proyek langsung / wilayah / desa)
        Deduplikasi berdasarkan user_id, namun menyimpan seluruh alasan target_types per user.
        """
        targets_by_user_id: Dict[int, Dict[str, Any]] = {}
        proyek_lat = float(proyek.latitude) if proyek.latitude is not None else -7.1197
        proyek_lon = float(proyek.longitude) if proyek.longitude is not None else 112.4150
        radius_m = float(proyek.radius_dampak_meter) if proyek.radius_dampak_meter else 1500.0

        # 1. Target berbasis Rute Harian Tersimpan (Overlap <= 100m) - Prioritas Tertinggi
        impact_coords = parse_coords_list(proyek.jalur_terdampak)
        if not impact_coords and proyek.latitude is not None and proyek.longitude is not None:
            impact_coords = [(float(proyek.latitude), float(proyek.longitude))]

        route_overlaps = getUsersWithOverlappingRoute(impact_coords, db, threshold_meters=100.0)
        for ro in route_overlaps:
            u_id = ro["user_id"]
            targets_by_user_id[u_id] = {
                **ro,
                "target_types": ["route_overlap"],
            }

        # 2. Target berbasis Radius Haversine (User dengan koordinat)
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
                    if u.id in targets_by_user_id:
                        if "radius" not in targets_by_user_id[u.id].get("target_types", []):
                            targets_by_user_id[u.id]["target_types"].append("radius")
                    else:
                        targets_by_user_id[u.id] = {
                            "user_id": u.id,
                            "user": u,
                            "target_type": "radius",
                            "target_types": ["radius"],
                            "distance_meters": round(dist_m, 1),
                            "channel": "all" if u.push_token else "in_app"
                        }
            except Exception as e:
                logger.warning(f"Gagal hitung jarak haversine user #{u.id}: {e}")

        # 3. Target berbasis Langganan Proyek langsung (SubscriptionNotifikasi proyek_id)
        project_subs = db.query(SubscriptionNotifikasi).filter(
            SubscriptionNotifikasi.proyek_id == proyek.id
        ).all()
        for sub in project_subs:
            u_id = sub.user_id
            if u_id in targets_by_user_id:
                if "subscription" not in targets_by_user_id[u_id].get("target_types", []):
                    targets_by_user_id[u_id]["target_types"].append("subscription")
            else:
                u = sub.user or db.query(User).filter(User.id == u_id).first()
                if u and u.is_active:
                    targets_by_user_id[u_id] = {
                        "user_id": u_id,
                        "user": u,
                        "target_type": "subscription",
                        "target_types": ["subscription"],
                        "distance_meters": None,
                        "channel": "all" if u.push_token else "in_app"
                    }

        # 4. Target berbasis Langganan Wilayah/Desa (SubscriptionNotifikasi wilayah_id / desa_id)
        if proyek.wilayah_id or proyek.desa_id:
            wilayah_filters = []
            if proyek.wilayah_id:
                wilayah_filters.append(SubscriptionNotifikasi.wilayah_id == proyek.wilayah_id)
            if proyek.desa_id:
                wilayah_filters.append(SubscriptionNotifikasi.desa_id == proyek.desa_id)

            from sqlalchemy import or_
            area_subs = db.query(SubscriptionNotifikasi).filter(or_(*wilayah_filters)).all()
            for sub in area_subs:
                u_id = sub.user_id
                if u_id in targets_by_user_id:
                    if "subscription" not in targets_by_user_id[u_id].get("target_types", []):
                        targets_by_user_id[u_id]["target_types"].append("subscription")
                else:
                    u = sub.user or db.query(User).filter(User.id == u_id).first()
                    if u and u.is_active:
                        targets_by_user_id[u_id] = {
                            "user_id": u_id,
                            "user": u,
                            "target_type": "subscription",
                            "target_types": ["subscription"],
                            "distance_meters": None,
                            "channel": "all" if u.push_token else "in_app"
                        }

        # 5. Fallback Warga Wilayah: jika belum ada target khusus, sertakan warga di kecamatan/desa yang sama
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
                    "target_types": ["radius"],
                    "distance_meters": None,
                    "channel": "in_app"
                }

        # 6. Jaminan Fallback Minimal
        if not targets_by_user_id:
            fallback_warga = db.query(User).filter(User.role == "warga", User.is_active == True).first()
            if fallback_warga:
                targets_by_user_id[fallback_warga.id] = {
                    "user_id": fallback_warga.id,
                    "user": fallback_warga,
                    "target_type": "radius",
                    "target_types": ["radius"],
                    "distance_meters": 500.0,
                    "channel": "in_app"
                }

        return list(targets_by_user_id.values())

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
                priority=NotificationPriority.normal,
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

                # Format pesan khusus prioritas tinggi jika user rute overlap
                if t_type == "route_overlap":
                    nama_r = t.get("nama_rute") or "Rute Harian Anda"
                    dist_str = f" ({round(dist, 0)}m dari lintasan)" if dist is not None else ""
                    judul_to_send = f"🚨 PRIORITAS TINGGI: Rute Harian Terdampak — {proyek.nama_proyek}"
                    pesan_to_send = f"PRIORITAS TINGGI: Rute harian Anda ('{nama_r}') terdampak oleh proyek {proyek.nama_proyek}{dist_str}. Buka peta untuk mengecek rekomendasi jalur alternatif AI."
                    prio = NotificationPriority.tinggi
                else:
                    judul_to_send = judul
                    pesan_to_send = pesan
                    prio = NotificationPriority.normal

                # Simpan ke notifikasi in-app jika create_in_app bernilai True
                if create_in_app:
                    in_app_notif = Notifikasi(
                        user_id=u_id,
                        proyek_id=proyek.id,
                        pesan=pesan_to_send,
                        is_read=False
                    )
                    db.add(in_app_notif)

                # Kirim Web Push nyata jika user memiliki subscription
                pushed_any = False
                try:
                    user_push_subs = db.query(PushSubscription).filter(PushSubscription.user_id == u_id).all()
                    for ps in user_push_subs:
                        p_ok = send_real_web_push(ps, {
                            "title": judul_to_send,
                            "body": pesan_to_send,
                            "proyek_id": proyek.id,
                            "trigger_type": trigger_type
                        })
                        if p_ok:
                            pushed_any = True
                except Exception as e:
                    logger.debug(f"Pengecekan push subscription user #{u_id}: {e}")

                final_channel = "web_push" if pushed_any else ch

                # Simpan ke notification_logs selalu
                log_entry = NotificationLog(
                    proyek_id=proyek.id,
                    user_id=u_id,
                    trigger_type=trigger_type,
                    channel=final_channel,
                    judul=judul_to_send,
                    pesan=pesan_to_send,
                    target_type=t_type,
                    priority=prio,
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
