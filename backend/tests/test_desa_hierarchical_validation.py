import pytest

def test_wilayah_get_filter_by_parent_and_level(client):
    """
    Test 1: Endpoint GET /api/v1/wilayah mendukung filter by level dan parent_id.
    """
    # 1. Register Admin
    admin_payload = {
        "nama": "Admin Wilayah Test",
        "email": "admin.wilayah@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    }
    reg_res = client.post("/api/v1/auth/register", json=admin_payload)
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Buat Kabupaten
    kab_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24",
        "nama_wilayah": "Kabupaten Lamongan",
        "level": "kabupaten",
        "parent_id": None
    }, headers=headers)
    assert kab_res.status_code == 201
    kab_id = kab_res.json()["id"]

    # 3. Buat 2 Kecamatan
    kec1_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.01",
        "nama_wilayah": "Kecamatan Sukorame",
        "level": "kecamatan",
        "parent_id": kab_id
    }, headers=headers)
    assert kec1_res.status_code == 201
    kec1_id = kec1_res.json()["id"]

    kec2_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.02",
        "nama_wilayah": "Kecamatan Bluluk",
        "level": "kecamatan",
        "parent_id": kab_id
    }, headers=headers)
    assert kec2_res.status_code == 201
    kec2_id = kec2_res.json()["id"]

    # 4. Buat Desa di bawah Kec 1 (Sukorame)
    d1_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.01.2001",
        "nama_wilayah": "Desa Sembung",
        "level": "desa",
        "parent_id": kec1_id
    }, headers=headers)
    assert d1_res.status_code == 201

    d2_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.01.2002",
        "nama_wilayah": "Desa Banggle",
        "level": "desa",
        "parent_id": kec1_id
    }, headers=headers)
    assert d2_res.status_code == 201

    # 5. Buat Desa di bawah Kec 2 (Bluluk)
    d3_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.02.2001",
        "nama_wilayah": "Desa Bronjong",
        "level": "desa",
        "parent_id": kec2_id
    }, headers=headers)
    assert d3_res.status_code == 201

    # 6. Test GET /api/v1/wilayah?level=desa&parent_id={kec1_id}
    res = client.get(f"/api/v1/wilayah?level=desa&parent_id={kec1_id}")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    names = [item["nama_wilayah"] for item in data]
    assert "Desa Sembung" in names
    assert "Desa Banggle" in names
    assert "Desa Bronjong" not in names
    for item in data:
        assert item["level"] == "desa"
        assert item["parent_id"] == kec1_id

    # 7. Test GET /api/v1/wilayah?level=desa&parent_id={kec2_id}
    res2 = client.get(f"/api/v1/wilayah?level=desa&parent_id={kec2_id}")
    assert res2.status_code == 200
    data2 = res2.json()
    assert len(data2) == 1
    assert data2[0]["nama_wilayah"] == "Desa Bronjong"
    assert data2[0]["parent_id"] == kec2_id


def test_proyek_create_and_update_desa_parent_child_validation(client):
    """
    Test 2: Validasi konsistensi parent-child desa_id terhadap wilayah_id (kecamatan)
    pada create (POST) dan update (PUT) proyek.
    """
    # 1. Register Admin
    admin_payload = {
        "nama": "Admin Proyek Test",
        "email": "admin.proyek@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    }
    reg_res = client.post("/api/v1/auth/register", json=admin_payload)
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Master Wilayah
    kab_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24",
        "nama_wilayah": "Kabupaten Lamongan",
        "level": "kabupaten",
        "parent_id": None
    }, headers=headers)
    kab_id = kab_res.json()["id"]

    kec1_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.01",
        "nama_wilayah": "Kecamatan Sukorame",
        "level": "kecamatan",
        "parent_id": kab_id
    }, headers=headers)
    kec1_id = kec1_res.json()["id"]

    kec2_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.02",
        "nama_wilayah": "Kecamatan Bluluk",
        "level": "kecamatan",
        "parent_id": kab_id
    }, headers=headers)
    kec2_id = kec2_res.json()["id"]

    d_sukorame = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.01.2001",
        "nama_wilayah": "Desa Sembung",
        "level": "desa",
        "parent_id": kec1_id
    }, headers=headers).json()

    d_bluluk = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.02.2001",
        "nama_wilayah": "Desa Bronjong",
        "level": "desa",
        "parent_id": kec2_id
    }, headers=headers).json()

    # 3. Master Dinas
    dinas_res = client.post("/api/v1/dinas", json={
        "nama_dinas": "Dinas PU Bina Marga",
        "wilayah_id": kab_id
    }, headers=headers)
    dinas_id = dinas_res.json()["id"]

    # Skenario 1: POST dengan desa_id valid yang merupakan child dari wilayah_id (Sukorame)
    valid_payload = {
        "nama_proyek": "Pembangunan Jembatan Desa Sembung",
        "kategori": "jembatan",
        "deskripsi": "Jembatan penghubung dusun di Desa Sembung.",
        "latitude": -7.3510,
        "longitude": 112.1082,
        "wilayah_id": kec1_id,
        "desa_id": d_sukorame["id"],
        "dinas_id": dinas_id,
        "anggaran": 500000000,
        "status": "berjalan",
        "progres_persen": 10,
        "tanggal_mulai": "2024-05-01",
        "estimasi_selesai": "2024-11-30"
    }
    create_res = client.post("/api/v1/proyek", json=valid_payload, headers=headers)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["desa_id"] == d_sukorame["id"]
    proyek_id = created_data["id"]

    # Skenario 2: POST dengan desa_id yang TIDAK konsisten (desa Bluluk tapi wilayah_id Sukorame) -> ditolak 422
    inconsistent_payload = dict(valid_payload)
    inconsistent_payload["nama_proyek"] = "Proyek Error Konsistensi Wilayah"
    inconsistent_payload["desa_id"] = d_bluluk["id"]
    rej_res = client.post("/api/v1/proyek", json=inconsistent_payload, headers=headers)
    assert rej_res.status_code == 422
    assert "bukan merupakan bagian dari kecamatan terpilih" in rej_res.json()["detail"]

    # Skenario 3: POST dengan desa_id tidak terdaftar di database (mis. 999999) -> ditolak 422
    nonexistent_payload = dict(valid_payload)
    nonexistent_payload["nama_proyek"] = "Proyek Desa Nonexistent"
    nonexistent_payload["desa_id"] = 999999
    rej_res2 = client.post("/api/v1/proyek", json=nonexistent_payload, headers=headers)
    assert rej_res2.status_code == 422
    assert "tidak ditemukan" in rej_res2.json()["detail"].lower()

    # Skenario 4: POST dengan desa_id yang levelnya BUKAN desa (mis. kirim ID kecamatan) -> ditolak 422
    not_desa_payload = dict(valid_payload)
    not_desa_payload["nama_proyek"] = "Proyek Level Wilayah Salah"
    not_desa_payload["desa_id"] = kec2_id
    rej_res3 = client.post("/api/v1/proyek", json=not_desa_payload, headers=headers)
    assert rej_res3.status_code == 422
    assert "harus bertingkat 'desa'" in rej_res3.json()["detail"].lower()

    # Skenario 5: PUT update proyek dengan desa_id inkonsisten -> ditolak 422
    update_fail = client.put(f"/api/v1/proyek/{proyek_id}", json={"desa_id": d_bluluk["id"]}, headers=headers)
    assert update_fail.status_code == 422
    assert "bukan merupakan bagian dari kecamatan terpilih" in update_fail.json()["detail"]

    # Skenario 6: Filter proyek via GET /api/v1/proyek?desa_id={d_sukorame['id']}
    filter_res = client.get(f"/api/v1/proyek?desa_id={d_sukorame['id']}")
    assert filter_res.status_code == 200
    items = filter_res.json()["items"]
    assert len(items) == 1
    assert items[0]["id"] == proyek_id
    assert items[0]["desa_id"] == d_sukorame["id"]
    assert items[0]["nama_desa"] == "Desa Sembung"

    # Filter proyek via GET /api/v1/proyek?desa_id={d_bluluk['id']} (desa tanpa proyek)
    filter_empty = client.get(f"/api/v1/proyek?desa_id={d_bluluk['id']}")
    assert filter_empty.status_code == 200
    assert len(filter_empty.json()["items"]) == 0
