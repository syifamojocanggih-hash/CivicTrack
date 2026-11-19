import pytest
from datetime import date, timedelta
from app.models.project import Proyek, ProyekStatus, ProyekKategori, TahapanProgres
from app.models.user import User, UserRole, WilayahAdministratif, WilayahLevel, Dinas
from app.models.notification import Notifikasi, SubscriptionNotifikasi, NotificationLog
from app.services.notification_dispatcher import NotificationDispatcher, run_daily_project_lifecycle_scheduler


@pytest.fixture
def base_setup(db_session):
    wilayah = WilayahAdministratif(
        id=9901,
        kode_wilayah="35.24.99",
        nama_wilayah="Kecamatan Uji Coba",
        level=WilayahLevel.kecamatan
    )
    db_session.add(wilayah)

    dinas = Dinas(id=9901, nama_dinas="Dinas PU Uji")
    db_session.add(dinas)

    admin_user = User(
        id=9900,
        nama="Admin Penguji",
        email="admin.uji@test.com",
        password_hash="hash",
        role=UserRole.admin_dinas,
        dinas_id=9901,
        is_active=True
    )
    db_session.add(admin_user)
    db_session.commit()

    return {"wilayah": wilayah, "dinas": dinas, "admin": admin_user}


def test_notification_dispatcher_radius_and_subscription(db_session, base_setup):
    """
    Menguji get_notification_targets:
    - User dalam radius dampak terdeteksi via Haversine
    - User di luar radius diabaikan
    - User subscriber langsung tetap terdeteksi
    """
    # User A (dekat, jarak ~200 meter dari proyek -7.1197, 112.4154)
    user_a = User(
        id=9901,
        nama="Warga Dekat",
        email="warga.dekat@test.com",
        password_hash="hash",
        role=UserRole.warga,
        latitude=-7.1190,
        longitude=112.4150,
        wilayah_id=9901,
        is_active=True
    )
    # User B (jauh, jarak > 10 km dari proyek)
    user_b = User(
        id=9902,
        nama="Warga Jauh",
        email="warga.jauh@test.com",
        password_hash="hash",
        role=UserRole.warga,
        latitude=-6.9000,
        longitude=112.4150,
        wilayah_id=9901,
        is_active=True
    )
    # User C (jauh, tetapi berlangganan proyek)
    user_c = User(
        id=9903,
        nama="Warga Subscriber",
        email="warga.sub@test.com",
        password_hash="hash",
        role=UserRole.warga,
        latitude=-6.8000,
        longitude=112.3000,
        is_active=True
    )
    db_session.add_all([user_a, user_b, user_c])
    db_session.commit()

    # Proyek di koordinat (-7.1197, 112.4154) dengan radius 1500m
    proyek = Proyek(
        id=9901,
        nama_proyek="Jembatan Karanglangit Uji",
        kategori=ProyekKategori.jembatan,
        deskripsi="Uji coba sistem early warning dispatcher",
        latitude=-7.1197,
        longitude=112.4154,
        wilayah_id=9901,
        dinas_id=9901,
        dibuat_oleh=9900,
        anggaran=2500000000,
        status=ProyekStatus.planned,
        progres_persen=0,
        tanggal_mulai=date.today() + timedelta(days=14),
        estimasi_selesai=date.today() + timedelta(days=180),
        tanggal_mulai_rencana=date.today() + timedelta(days=14),
        radius_dampak_meter=1500
    )
    db_session.add(proyek)

    # User C berlangganan proyek ini
    sub_c = SubscriptionNotifikasi(user_id=9903, proyek_id=9901)
    db_session.add(sub_c)
    db_session.commit()

    # Eksekusi get_notification_targets
    targets = NotificationDispatcher.get_notification_targets(proyek, db_session)
    target_user_ids = [t["user_id"] for t in targets]

    assert 9901 in target_user_ids, "User A (dalam radius) harus menjadi target."
    assert 9903 in target_user_ids, "User C (subscriber langsung) harus menjadi target."
    assert 9902 not in target_user_ids, "User B (jauh dan bukan subscriber) tidak boleh menjadi target."


def test_notification_dispatcher_templates_and_logs(db_session, base_setup):
    """
    Menguji template notifikasi H-14, H-1, H-0, status change, dan milestone,
    serta memastikan tersimpan di notification_logs.
    """
    proyek = Proyek(
        id=9902,
        nama_proyek="Pelebaran Jalan Babat",
        kategori=ProyekKategori.jalan,
        deskripsi="Uji template",
        latitude=-7.1100,
        longitude=112.4100,
        wilayah_id=9901,
        dinas_id=9901,
        dibuat_oleh=9900,
        anggaran=1000000000,
        status=ProyekStatus.planned,
        progres_persen=0,
        tanggal_mulai=date.today() + timedelta(days=14),
        tanggal_mulai_rencana=date.today() + timedelta(days=14),
        estimasi_selesai=date.today() + timedelta(days=180),
        radius_dampak_meter=1200
    )
    db_session.add(proyek)
    db_session.commit()

    # 1. H-14
    logs_h14 = NotificationDispatcher.dispatch_scheduled_h14(proyek, 14, db_session)
    assert len(logs_h14) > 0
    assert "14 hari lagi" in logs_h14[0].pesan
    assert "Siapkan rute alternatif" in logs_h14[0].pesan
    assert logs_h14[0].trigger_type == "scheduled_h14"

    # 2. H-1
    logs_h1 = NotificationDispatcher.dispatch_h1_alert(proyek, db_session)
    assert len(logs_h1) > 0
    assert "Besok dimulai" in logs_h1[0].pesan
    assert "Estimasi penutupan" in logs_h1[0].pesan
    assert logs_h1[0].trigger_type == "h1_alert"

    # 3. H-0
    logs_h0 = NotificationDispatcher.dispatch_h0_started(proyek, db_session)
    assert len(logs_h0) > 0
    assert "Hari ini dimulai" in logs_h0[0].pesan
    assert "AI Route" in logs_h0[0].pesan
    assert logs_h0[0].trigger_type == "h0_started"

    # 4. Milestone 50% & 100%
    logs_m50 = NotificationDispatcher.dispatch_milestone(proyek, 50, db_session)
    assert len(logs_m50) > 0
    assert "50%" in logs_m50[0].pesan

    logs_m100 = NotificationDispatcher.dispatch_milestone(proyek, 100, db_session)
    assert len(logs_m100) > 0
    assert "100%" in logs_m100[0].pesan

    # Verifikasi query notification_logs di DB
    total_logs = db_session.query(NotificationLog).filter(NotificationLog.proyek_id == 9902).count()
    assert total_logs >= 5


def test_cron_lifecycle_scheduler_real_status_transition(db_session, base_setup):
    """
    Menguji bahwa scheduler harian benar-benar meng-update kolom 'status'
    di database dari 'planned' menjadi 'scheduled' saat H-14 s/d H-0.
    """
    proyek = Proyek(
        id=9903,
        nama_proyek="Pembangunan Gedung Rawat Inap Sukodadi",
        kategori=ProyekKategori.gedung_publik,
        deskripsi="Uji scheduler lifecycle",
        latitude=-7.1200,
        longitude=112.4200,
        wilayah_id=9901,
        dinas_id=9901,
        dibuat_oleh=9900,
        anggaran=3000000000,
        status=ProyekStatus.planned,
        progres_persen=0,
        tanggal_mulai=date.today() + timedelta(days=7),
        estimasi_selesai=date.today() + timedelta(days=180),
        tanggal_mulai_rencana=date.today() + timedelta(days=7), # Masuk jendela H-7
        radius_dampak_meter=1500
    )
    db_session.add(proyek)
    db_session.commit()

    # Sebelum scheduler: status masih 'planned'
    db_session.refresh(proyek)
    assert proyek.status == ProyekStatus.planned

    # Jalankan cron harian
    res = run_daily_project_lifecycle_scheduler(db_session, target_date=date.today())

    # Setelah scheduler: status di DB BERUBAH SECARA NYATA menjadi 'scheduled'
    db_session.refresh(proyek)
    assert proyek.status == ProyekStatus.scheduled
    assert 9903 in res["transitioned_to_scheduled"]

    # Pastikan tercatat di TahapanProgres
    tahap = db_session.query(TahapanProgres).filter(
        TahapanProgres.proyek_id == 9903,
        TahapanProgres.nama_tahap.like("%H-14%")
    ).first()
    assert tahap is not None
    assert "H-7" in tahap.catatan


def test_api_endpoints_cron_and_logs(client, db_session, base_setup):
    """
    Menguji endpoint API:
    - POST /api/v1/proyek/cron/lifecycle-scheduler
    - GET /api/v1/notifikasi/logs
    """
    proyek = Proyek(
        id=9904,
        nama_proyek="Pelebaran Jalan Pantura",
        kategori=ProyekKategori.jalan,
        deskripsi="Uji endpoint cron",
        latitude=-7.1150,
        longitude=112.4150,
        wilayah_id=9901,
        dinas_id=9901,
        dibuat_oleh=9900,
        anggaran=5000000000,
        status=ProyekStatus.planned,
        progres_persen=0,
        tanggal_mulai=date.today() + timedelta(days=5),
        estimasi_selesai=date.today() + timedelta(days=180),
        tanggal_mulai_rencana=date.today() + timedelta(days=5),
        radius_dampak_meter=1500
    )
    db_session.add(proyek)
    db_session.commit()

    # Panggil cron API
    res = client.post("/api/v1/proyek/cron/lifecycle-scheduler")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert 9904 in data["transitioned_to_scheduled"]

    # Panggil notification logs API
    logs_res = client.get("/api/v1/notifikasi/logs?proyek_id=9904")
    assert logs_res.status_code == 200
    logs_data = logs_res.json()
    assert len(logs_data) > 0
    assert logs_data[0]["trigger_type"] == "scheduled_h14"
    assert "Pelebaran Jalan Pantura" in logs_data[0]["pesan"]

