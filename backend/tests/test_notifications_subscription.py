import pytest

def test_subscribe_and_unsubscribe_flow(client):
    """
    Memastikan siklus subscribe, unsubscribe, idempotensi duplikasi,
    dan pengecekan status langganan bekerja dengan akurat.
    """
    # 1. Register Admin Dinas untuk buat master data
    admin_payload = {
        "nama": "Admin Dinas PU",
        "email": "admin.sub@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    }
    admin_res = client.post("/api/v1/auth/register", json=admin_payload)
    assert admin_res.status_code == 201
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Buat Wilayah & Dinas & Proyek
    wil_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.01",
        "nama_wilayah": "Kecamatan Sukorame",
        "level": "kecamatan"
    }, headers=admin_headers)
    wil_id = wil_res.json()["id"]

    dinas_res = client.post("/api/v1/dinas", json={
        "nama_dinas": "Dinas Bina Marga",
        "wilayah_id": wil_id
    }, headers=admin_headers)
    dinas_id = dinas_res.json()["id"]

    proj_res = client.post("/api/v1/proyek", json={
        "nama_proyek": "Pembangunan Jalan Sukorame",
        "kategori": "jalan",
        "deskripsi": "Pengaspalan jalan hotmix.",
        "latitude": -7.3400,
        "longitude": 112.0800,
        "wilayah_id": wil_id,
        "dinas_id": dinas_id,
        "anggaran": 500000000,
        "status": "berjalan",
        "progres_persen": 15,
        "tanggal_mulai": "2024-01-01",
        "estimasi_selesai": "2024-12-31"
    }, headers=admin_headers)
    assert proj_res.status_code == 201
    proyek_id = proj_res.json()["id"]

    # 2. Register Warga
    warga_payload = {
        "nama": "Warga Subscriber",
        "email": "warga.sub@civictrack.demo",
        "password": "password123",
        "role": "warga"
    }
    warga_res = client.post("/api/v1/auth/register", json=warga_payload)
    assert warga_res.status_code == 201
    warga_token = warga_res.json()["access_token"]
    warga_headers = {"Authorization": f"Bearer {warga_token}"}

    # 3. Status awal sebelum subscribe: is_subscribed False
    status_res1 = client.get(f"/api/v1/proyek/{proyek_id}/subscribe/status", headers=warga_headers)
    assert status_res1.status_code == 200
    assert status_res1.json()["is_subscribed"] is False

    # 4. Subscribe proyek
    sub_res = client.post(f"/api/v1/proyek/{proyek_id}/subscribe", headers=warga_headers)
    assert sub_res.status_code == 200
    assert sub_res.json()["is_subscribed"] is True
    assert sub_res.json()["proyek_id"] == proyek_id

    # 5. Subscribe ulang (idempotent, tidak boleh error 500 / duplicate key)
    sub_again = client.post(f"/api/v1/proyek/{proyek_id}/subscribe", headers=warga_headers)
    assert sub_again.status_code == 200
    assert sub_again.json()["is_subscribed"] is True

    # 6. Cek status setelah subscribe
    status_res2 = client.get(f"/api/v1/proyek/{proyek_id}/subscribe/status", headers=warga_headers)
    assert status_res2.status_code == 200
    assert status_res2.json()["is_subscribed"] is True

    # 7. Unsubscribe proyek
    unsub_res = client.delete(f"/api/v1/proyek/{proyek_id}/subscribe", headers=warga_headers)
    assert unsub_res.status_code == 200
    assert unsub_res.json()["is_subscribed"] is False

    # 8. Cek status setelah unsubscribe
    status_res3 = client.get(f"/api/v1/proyek/{proyek_id}/subscribe/status", headers=warga_headers)
    assert status_res3.status_code == 200
    assert status_res3.json()["is_subscribed"] is False


def test_notification_trigger_on_project_update_and_stage(client):
    """
    Memastikan trigger otomatis pembuatan notifikasi saat penambahan tahapan linimasa
    dan update status/progres proyek terdistribusi ke subscriber dan mengecualikan updater.
    """
    # 1. Admin
    admin_payload = {
        "nama": "Admin Progres",
        "email": "admin.progres@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    }
    admin_res = client.post("/api/v1/auth/register", json=admin_payload)
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    wil_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.02",
        "nama_wilayah": "Kecamatan Bluluk",
        "level": "kecamatan"
    }, headers=admin_headers)
    wil_id = wil_res.json()["id"]

    dinas_res = client.post("/api/v1/dinas", json={
        "nama_dinas": "Dinas Sumber Daya Air",
        "wilayah_id": wil_id
    }, headers=admin_headers)
    dinas_id = dinas_res.json()["id"]

    proj_res = client.post("/api/v1/proyek", json={
        "nama_proyek": "Normalisasi Saluran Irigasi Bluluk",
        "kategori": "drainase",
        "deskripsi": "Pengerukan lumpur dan sedimentasi saluran primer.",
        "latitude": -7.3200,
        "longitude": 112.0600,
        "wilayah_id": wil_id,
        "dinas_id": dinas_id,
        "anggaran": 300000000,
        "status": "berjalan",
        "progres_persen": 20,
        "tanggal_mulai": "2024-02-01",
        "estimasi_selesai": "2024-08-31"
    }, headers=admin_headers)
    proyek_id = proj_res.json()["id"]

    # 2. Warga A (berlangganan)
    warga_a_res = client.post("/api/v1/auth/register", json={
        "nama": "Warga Langganan A",
        "email": "warga.a@civictrack.demo",
        "password": "password123",
        "role": "warga"
    })
    token_a = warga_a_res.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 3. Warga B (TIDAK berlangganan)
    warga_b_res = client.post("/api/v1/auth/register", json={
        "nama": "Warga Non Sub B",
        "email": "warga.b@civictrack.demo",
        "password": "password123",
        "role": "warga"
    })
    token_b = warga_b_res.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Warga A subscribe
    client.post(f"/api/v1/proyek/{proyek_id}/subscribe", headers=headers_a)

    # 4. Admin menambahkan tahapan linimasa baru
    tahap_res = client.post(f"/api/v1/proyek/{proyek_id}/tahapan", json={
        "nama_tahap": "Pemasangan Sheet Pile Beton",
        "progres_persen": 45,
        "catatan": "Pemasangan tanggul penahan tanah selesai sisi barat."
    }, headers=admin_headers)
    assert tahap_res.status_code == 201

    # Cek notifikasi Warga A (harus dapat notifikasi)
    notif_a = client.get("/api/v1/notifikasi", headers=headers_a).json()
    assert len(notif_a) == 1
    assert "Pemasangan Sheet Pile Beton" in notif_a[0]["pesan"]
    assert "45%" in notif_a[0]["pesan"]
    assert notif_a[0]["is_read"] is False
    assert notif_a[0]["proyek_id"] == proyek_id

    # Cek notifikasi Warga B (tidak subscribe -> tidak dapat notifikasi)
    notif_b = client.get("/api/v1/notifikasi", headers=headers_b).json()
    assert len(notif_b) == 0

    # Cek notifikasi Admin (pembuat aksi -> diexclude agar tidak spam sendiri)
    notif_admin = client.get("/api/v1/notifikasi", headers=admin_headers).json()
    assert len(notif_admin) == 0

    # 5. Admin update data proyek melalui PUT /proyek/{id} mengubah status & progres
    update_res = client.put(f"/api/v1/proyek/{proyek_id}", json={
        "status": "selesai",
        "progres_persen": 100
    }, headers=admin_headers)
    assert update_res.status_code == 200

    # Warga A sekarang punya 2 notifikasi
    notif_a_updated = client.get("/api/v1/notifikasi", headers=headers_a).json()
    assert len(notif_a_updated) == 2
    assert "100%" in notif_a_updated[0]["pesan"] or "selesai" in notif_a_updated[0]["pesan"].lower()


def test_notification_mark_read_and_security(client):
    """
    Memastikan penandaan notifikasi telah dibaca (single read & read-all)
    serta perlindungan bahwa notifikasi milik user lain tidak dapat dimanipulasi.
    """
    # 1. Admin & Proyek
    admin_payload = {
        "nama": "Admin Security Test",
        "email": "admin.security@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    }
    admin_res = client.post("/api/v1/auth/register", json=admin_payload)
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    wil_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.03",
        "nama_wilayah": "Kecamatan Modo",
        "level": "kecamatan"
    }, headers=admin_headers)
    wil_id = wil_res.json()["id"]

    dinas_res = client.post("/api/v1/dinas", json={
        "nama_dinas": "Dinas Perkim",
        "wilayah_id": wil_id
    }, headers=admin_headers)
    dinas_id = dinas_res.json()["id"]

    proj_res = client.post("/api/v1/proyek", json={
        "nama_proyek": "Pembangunan RTH Modo",
        "kategori": "taman",
        "deskripsi": "Ruang terbuka hijau ramah anak.",
        "latitude": -7.3000,
        "longitude": 112.0500,
        "wilayah_id": wil_id,
        "dinas_id": dinas_id,
        "anggaran": 200000000,
        "status": "berjalan",
        "progres_persen": 10,
        "tanggal_mulai": "2024-03-01",
        "estimasi_selesai": "2024-09-30"
    }, headers=admin_headers)
    proyek_id = proj_res.json()["id"]

    # 2. Dua User
    u1_res = client.post("/api/v1/auth/register", json={
        "nama": "User Satu",
        "email": "user1@civictrack.demo",
        "password": "password123",
        "role": "warga"
    })
    token_1 = u1_res.json()["access_token"]
    headers_1 = {"Authorization": f"Bearer {token_1}"}

    u2_res = client.post("/api/v1/auth/register", json={
        "nama": "User Dua",
        "email": "user2@civictrack.demo",
        "password": "password123",
        "role": "warga"
    })
    token_2 = u2_res.json()["access_token"]
    headers_2 = {"Authorization": f"Bearer {token_2}"}

    # User 1 subscribe
    client.post(f"/api/v1/proyek/{proyek_id}/subscribe", headers=headers_1)

    # Trigger 2 notifikasi
    client.post(f"/api/v1/proyek/{proyek_id}/tahapan", json={
        "nama_tahap": "Tahap 1",
        "progres_persen": 30,
        "catatan": "Catatan memadai tahap 1"
    }, headers=admin_headers)

    client.post(f"/api/v1/proyek/{proyek_id}/tahapan", json={
        "nama_tahap": "Tahap 2",
        "progres_persen": 60,
        "catatan": "Catatan memadai tahap 2"
    }, headers=admin_headers)

    notifs_u1 = client.get("/api/v1/notifikasi", headers=headers_1).json()
    assert len(notifs_u1) == 2
    notif_id_1 = notifs_u1[0]["id"]
    notif_id_2 = notifs_u1[1]["id"]

    # 3. Security: User 2 mencoba menandai dibaca notifikasi milik User 1 -> harus 404
    hack_res = client.patch(f"/api/v1/notifikasi/{notif_id_1}/read", headers=headers_2)
    assert hack_res.status_code == 404

    # 4. User 1 menandai single read
    read_res = client.patch(f"/api/v1/notifikasi/{notif_id_1}/read", headers=headers_1)
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True

    # Cek daftar: notif 1 sudah dibaca, notif 2 masih unread
    notifs_check = client.get("/api/v1/notifikasi", headers=headers_1).json()
    map_read = {n["id"]: n["is_read"] for n in notifs_check}
    assert map_read[notif_id_1] is True
    assert map_read[notif_id_2] is False

    # 5. User 1 menandai read-all
    read_all_res = client.patch("/api/v1/notifikasi/read-all", headers=headers_1)
    assert read_all_res.status_code == 200

    notifs_all_read = client.get("/api/v1/notifikasi", headers=headers_1).json()
    for n in notifs_all_read:
        assert n["is_read"] is True
