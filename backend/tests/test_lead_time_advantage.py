import pytest
import json
from datetime import date, datetime, timedelta
from app.models.project import Proyek, ProyekKategori, ProyekStatus
from app.models.user import User, UserRole, WilayahAdministratif, Dinas
from app.models.notification import NotificationLog, NotificationPriority

@pytest.fixture
def lead_time_test_data(db_session):
    wilayah = WilayahAdministratif(
        kode_wilayah="35.24.01",
        nama_wilayah="Kecamatan Sukorame",
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

    user1 = User(
        nama="Warga 1",
        email="warga1@lamongan.go.id",
        password_hash="hash1",
        role=UserRole.warga,
        is_active=True,
        wilayah_id=wilayah.id
    )
    user2 = User(
        nama="Warga 2",
        email="warga2@lamongan.go.id",
        password_hash="hash2",
        role=UserRole.warga,
        is_active=True,
        wilayah_id=wilayah.id
    )
    db_session.add_all([user1, user2])
    db_session.flush()

    today = date.today()
    proyek1 = Proyek(
        nama_proyek="Jembatan Sukorame Baru",
        kategori=ProyekKategori.jembatan,
        status=ProyekStatus.scheduled,
        latitude=-7.2500,
        longitude=112.1500,
        wilayah_id=wilayah.id,
        dinas_id=dinas.id,
        dibuat_oleh=user1.id,
        anggaran=1500000000,
        tanggal_mulai=today + timedelta(days=20),
        estimasi_selesai=today + timedelta(days=120),
        tanggal_kontrak_terbit=today - timedelta(days=5),
        tanggal_input_sistem=datetime.now() - timedelta(days=2),
        tanggal_mulai_rencana=today + timedelta(days=20),
        radius_dampak_meter=1200,
        is_published=True
    )
    db_session.add(proyek1)
    db_session.flush()

    # Log notifikasi dengan prioritas normal dan tinggi
    log1 = NotificationLog(
        proyek_id=proyek1.id,
        user_id=user1.id,
        trigger_type="status_change",
        channel="web_push",
        judul="Peringatan Dini",
        pesan="Pekerjaan H-20",
        target_type="radius",
        priority=NotificationPriority.normal,
        radius_meter=1200,
        is_delivered=True
    )
    log2 = NotificationLog(
        proyek_id=proyek1.id,
        user_id=user2.id,
        trigger_type="route_overlap",
        channel="web_push",
        judul="🚨 PRIORITAS TINGGI: Rute Harian Terdampak",
        pesan="Rute harian Anda terdampak",
        target_type="route_overlap",
        priority=NotificationPriority.tinggi,
        radius_meter=1200,
        is_delivered=True
    )
    db_session.add_all([log1, log2])
    db_session.commit()

    return {
        "wilayah": wilayah,
        "dinas": dinas,
        "user1": user1,
        "user2": user2,
        "proyek1": proyek1
    }

def test_lead_time_advantage_endpoint_and_aggregation(client, db_session, lead_time_test_data):
    # 1. Test endpoint primer bahasa Indonesia
    res = client.get("/api/v1/statistik/lead-time-advantage")
    assert res.status_code == 200
    data = res.json()

    assert data["avg_lead_time_hari"] >= 15.0
    assert "Hari Peringatan Dini" in data["label_hari_peringatan_dini"]
    assert data["total_unique_warga_terjangkau"] >= 2
    assert len(data["warga_terjangkau_per_proyek"]) >= 1

    # Cek breakdown target_type
    assert data["breakdown_target_type"]["radius"] >= 1
    assert data["breakdown_target_type"]["route_overlap"] >= 1

    # Cek breakdown priority
    assert data["breakdown_priority"]["normal"] >= 1
    assert data["breakdown_priority"]["tinggi"] >= 1
    assert data["total_notifikasi_terkirim"] >= 2

    # Cek tren bulanan
    assert isinstance(data["tren_lead_time_per_bulan"], list)
    assert len(data["tren_lead_time_per_bulan"]) >= 1

    # 2. Test alias endpoint /stats/lead-time-advantage
    res_alias = client.get("/api/v1/stats/lead-time-advantage")
    assert res_alias.status_code == 200
    assert res_alias.json()["total_notifikasi_terkirim"] == data["total_notifikasi_terkirim"]
