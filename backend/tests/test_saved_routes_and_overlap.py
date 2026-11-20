import pytest
import json
from datetime import date, timedelta
from app.models.project import Proyek, ProyekKategori, ProyekStatus
from app.models.user import User, UserRole, WilayahAdministratif, Dinas
from app.models.ai_route import SavedRoute
from app.models.notification import NotificationLog
from app.services.notification_dispatcher import NotificationDispatcher
from app.core.security import create_access_token

@pytest.fixture
def base_test_data(db_session):
    wilayah = WilayahAdministratif(
        kode_wilayah="35.24.23",
        nama_wilayah="Kecamatan Lamongan (Kota)",
        level="kecamatan"
    )
    db_session.add(wilayah)
    db_session.flush()

    dinas = Dinas(
        nama_dinas="Dinas PU Bina Marga",
        wilayah_id=wilayah.id
    )
    db_session.add(dinas)
    db_session.flush()

    user_commuter = User(
        nama="Warga Komuter",
        email="komuter@lamongankab.go.id",
        password_hash="hashed_pw",
        role=UserRole.warga,
        is_active=True,
        wilayah_id=wilayah.id
    )
    db_session.add(user_commuter)

    user_admin = User(
        nama="Admin PU",
        email="admin.pu@lamongankab.go.id",
        password_hash="hashed_pw",
        role=UserRole.admin_dinas,
        is_active=True,
        wilayah_id=wilayah.id,
        dinas_id=dinas.id
    )
    db_session.add(user_admin)
    db_session.commit()
    return {
        "wilayah": wilayah,
        "dinas": dinas,
        "user_commuter": user_commuter,
        "user_admin": user_admin
    }

def test_saved_routes_crud_and_max_limit(client, db_session, base_test_data):
    user = base_test_data["user_commuter"]
    token = create_access_token({"sub": str(user.id), "type": "access"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Simpan rute ke-1
    res1 = client.post("/api/v1/routes/saved", json={
        "nama_rute": "Rute Rumah ke Kantor",
        "polyline_data": [[-7.1197, 112.4150], [-7.1210, 112.4160], [-7.1230, 112.4180]],
        "jarak_km": 3.5,
        "estimasi_menit": 10,
        "catatan": "Lewat Jalan Basuki Rahmat"
    }, headers=headers)
    assert res1.status_code == 201
    route1_id = res1.json()["id"]
    assert res1.json()["nama_rute"] == "Rute Rumah ke Kantor"

    # 2. Simpan rute ke-2
    res2 = client.post("/api/v1/routes/saved", json={
        "nama_rute": "Rute Antar Anak Sekolah",
        "polyline_data": [[-7.1190, 112.4140], [-7.1180, 112.4130]],
        "jarak_km": 1.8,
        "estimasi_menit": 5
    }, headers=headers)
    assert res2.status_code == 201

    # 3. Simpan rute ke-3
    res3 = client.post("/api/v1/routes/saved", json={
        "nama_rute": "Rute Pasar Sidoarjo",
        "polyline_data": [[-7.1150, 112.4100], [-7.1140, 112.4090]],
        "jarak_km": 2.2,
        "estimasi_menit": 7
    }, headers=headers)
    assert res3.status_code == 201

    # 4. Coba simpan rute ke-4 (harus ditolak dengan HTTP 400 Bad Request karena batas max 3)
    res4 = client.post("/api/v1/routes/saved", json={
        "nama_rute": "Rute Tambahan Keempat",
        "polyline_data": [[-7.1100, 112.4000], [-7.1090, 112.3990]]
    }, headers=headers)
    assert res4.status_code == 400
    assert "Batas maksimal 3 rute" in res4.json()["detail"]

    # 5. GET rute tersimpan via endpoint primer /api/v1/rute-tersimpan
    get_res = client.get("/api/v1/rute-tersimpan", headers=headers)
    assert get_res.status_code == 200
    routes = get_res.json()
    assert len(routes) == 3
    assert routes[0]["moda_transportasi"] in ["mobil", "motor", "pejalan_kaki"]

    # 6. DELETE salah satu rute via endpoint primer
    del_res = client.delete(f"/api/v1/rute-tersimpan/{route1_id}", headers=headers)
    assert del_res.status_code == 200

    # 7. Verifikasi jumlah berkurang jadi 2 dan rute baru bisa disimpan lagi dengan moda motor
    get_res_after = client.get("/api/v1/rute-tersimpan", headers=headers)
    assert len(get_res_after.json()) == 2

    res_new = client.post("/api/v1/rute-tersimpan", json={
        "nama_rute": "Rute Pengganti Sepeda Motor",
        "polyline_data": [[-7.1200, 112.4200], [-7.1210, 112.4210]],
        "moda_transportasi": "motor"
    }, headers=headers)
    assert res_new.status_code == 201
    assert res_new.json()["moda_transportasi"] == "motor"

def test_route_overlap_notification_targeting(db_session, base_test_data):
    user_commuter = base_test_data["user_commuter"]
    wilayah = base_test_data["wilayah"]
    dinas = base_test_data["dinas"]
    admin = base_test_data["user_admin"]

    # Simpan rute komuter yang melewati titik (-7.1197, 112.4150)
    commuter_route = SavedRoute(
        user_id=user_commuter.id,
        nama_rute="Jalur Utama Basuki Rahmat",
        polyline_data=[
            [-7.1190, 112.4140],
            [-7.1197, 112.4150],  # Titik yang sangat dekat dengan proyek (< 50 meter)
            [-7.1210, 112.4160]
        ],
        jarak_km=2.5,
        estimasi_menit=8
    )
    db_session.add(commuter_route)
    db_session.commit()

    # Buat proyek yang beririsan dengan jalur rute komuter (< 100 meter)
    proyek_overlap = Proyek(
        nama_proyek="Rekonstruksi Jalan Basuki Rahmat",
        kategori=ProyekKategori.jalan,
        status=ProyekStatus.scheduled,
        latitude=-7.11975,
        longitude=112.41505, # Jarak ~7 meter dari koordinat lintasan rute komuter
        wilayah_id=wilayah.id,
        dinas_id=dinas.id,
        dibuat_oleh=admin.id,
        anggaran=2500000000,
        tanggal_mulai=date.today() + timedelta(days=7),
        estimasi_selesai=date.today() + timedelta(days=90),
        tanggal_mulai_rencana=date.today() + timedelta(days=7),
        radius_dampak_meter=1000,
        jalur_terdampak=json.dumps([[-7.1197, 112.4150], [-7.1198, 112.4151]]),
        is_published=True
    )
    db_session.add(proyek_overlap)
    db_session.commit()

    # Panggil get_notification_targets
    targets = NotificationDispatcher.get_notification_targets(proyek_overlap, db_session)
    commuter_target = next((t for t in targets if t["user_id"] == user_commuter.id), None)

    assert commuter_target is not None
    assert commuter_target["target_type"] == "route_overlap"
    assert commuter_target["distance_meters"] <= 100.0

    # Jalankan send_and_log dan verifikasi log notifikasi tersimpan dengan label PRIORITAS TINGGI
    logs = NotificationDispatcher.send_and_log(
        proyek=proyek_overlap,
        trigger_type="status_change",
        judul="Proyek Terjadwal",
        pesan="Pekerjaan segera dimulai.",
        db=db_session
    )

    user_log = db_session.query(NotificationLog).filter(
        NotificationLog.proyek_id == proyek_overlap.id,
        NotificationLog.user_id == user_commuter.id
    ).first()

    assert user_log is not None
    assert user_log.target_type == "route_overlap"
    assert "PRIORITAS TINGGI" in user_log.judul
    assert "Rute harian Anda" in user_log.pesan

def test_distant_route_does_not_overlap(db_session, base_test_data):
    user_commuter = base_test_data["user_commuter"]
    wilayah = base_test_data["wilayah"]
    dinas = base_test_data["dinas"]
    admin = base_test_data["user_admin"]

    # Simpan rute yang lokasinya sangat jauh (misal di Paciran, jarak > 30 km dari kota)
    far_route = SavedRoute(
        user_id=user_commuter.id,
        nama_rute="Rute Pantai Paciran",
        polyline_data=[[-6.8700, 112.3500], [-6.8710, 112.3510]],
        jarak_km=5.0
    )
    db_session.add(far_route)
    db_session.commit()

    # Proyek di kota Lamongan
    proyek_kota = Proyek(
        nama_proyek="Drainase Alun-alun Lamongan",
        kategori=ProyekKategori.drainase,
        status=ProyekStatus.scheduled,
        latitude=-7.1197,
        longitude=112.4150,
        wilayah_id=wilayah.id,
        dinas_id=dinas.id,
        dibuat_oleh=admin.id,
        tanggal_mulai=date.today() + timedelta(days=5),
        estimasi_selesai=date.today() + timedelta(days=60),
        tanggal_mulai_rencana=date.today() + timedelta(days=5),
        is_published=True
    )
    db_session.add(proyek_kota)
    db_session.commit()

    overlap_users = NotificationDispatcher.get_users_with_overlapping_route(proyek_kota, db_session, threshold_meters=100.0)
    assert len(overlap_users) == 0

def test_saved_route_authorization_security(client, db_session, base_test_data):
    """Memastikan user tidak dapat menghapus rute tersimpan milik user lain (Authorization Check)."""
    user_commuter = base_test_data["user_commuter"]
    user_admin = base_test_data["user_admin"]

    # Simpan rute milik user commuter
    route = SavedRoute(
        user_id=user_commuter.id,
        nama_rute="Rute Rahasia Komuter",
        polyline_data=[[-7.1200, 112.4100], [-7.1210, 112.4110]],
    )
    db_session.add(route)
    db_session.commit()

    # User admin mencoba menghapus rute milik user commuter
    admin_token = create_access_token({"sub": str(user_admin.id), "type": "access"})
    del_res = client.delete(f"/api/v1/rute-tersimpan/{route.id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert del_res.status_code == 404

    # Pastikan rute masih ada di database
    still_exists = db_session.query(SavedRoute).filter(SavedRoute.id == route.id).first()
    assert still_exists is not None

def test_overlap_threshold_edge_cases(db_session, base_test_data):
    """
    Uji edge case jarak batas threshold:
    - Jarak ~80m (< 100m) harus terdeteksi overlap
    - Jarak ~150m (> 100m) TIDAK boleh terdeteksi overlap
    """
    user = base_test_data["user_commuter"]
    admin = base_test_data["user_admin"]
    wilayah = base_test_data["wilayah"]
    dinas = base_test_data["dinas"]

    # Rute user di titik referensi
    sr = SavedRoute(
        user_id=user.id,
        nama_rute="Rute Ambang Batas",
        polyline_data=[[-7.119700, 112.415000], [-7.120000, 112.416000]]
    )
    db_session.add(sr)
    db_session.commit()

    # Proyek A: Berjarak ~75 meter dari rute (0.0007 derajat lintang di equator ~77 meter)
    proyek_dekat = Proyek(
        nama_proyek="Proyek Jarak 75 Meter",
        kategori=ProyekKategori.jalan,
        status=ProyekStatus.scheduled,
        latitude=-7.120400,
        longitude=112.415000,
        wilayah_id=wilayah.id,
        dinas_id=dinas.id,
        dibuat_oleh=admin.id,
        tanggal_mulai=date.today() + timedelta(days=5),
        estimasi_selesai=date.today() + timedelta(days=60),
        tanggal_mulai_rencana=date.today() + timedelta(days=5),
        jalur_terdampak=json.dumps([[-7.120400, 112.415000]]),
        is_published=True
    )
    db_session.add(proyek_dekat)
    db_session.commit()

    res_dekat = NotificationDispatcher.get_users_with_overlapping_route(proyek_dekat, db_session, threshold_meters=100.0)
    assert len(res_dekat) == 1
    assert res_dekat[0]["user_id"] == user.id

    # Proyek B: Berjarak ~160 meter dari rute (0.0015 derajat lintang ~166 meter)
    proyek_jauh = Proyek(
        nama_proyek="Proyek Jarak 160 Meter",
        kategori=ProyekKategori.jalan,
        status=ProyekStatus.scheduled,
        latitude=-7.121500,
        longitude=112.415000,
        wilayah_id=wilayah.id,
        dinas_id=dinas.id,
        dibuat_oleh=admin.id,
        tanggal_mulai=date.today() + timedelta(days=5),
        estimasi_selesai=date.today() + timedelta(days=60),
        tanggal_mulai_rencana=date.today() + timedelta(days=5),
        jalur_terdampak=json.dumps([[-7.121500, 112.415000]]),
        is_published=True
    )
    db_session.add(proyek_jauh)
    db_session.commit()

    res_jauh = NotificationDispatcher.get_users_with_overlapping_route(proyek_jauh, db_session, threshold_meters=100.0)
    assert len(res_jauh) == 0
