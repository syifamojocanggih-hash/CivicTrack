import pytest
from app.core.profanity import contains_profanity, sanitize_profanity
from app.core.security import get_password_hash, verify_password

def test_profanity_detector():
    """Memastikan profanity detector mendeteksi kata-kata kasar."""
    clean_text = "Jalan ini sangat bagus dan pengerjaannya rapi."
    dirty_text = "Proyek ini lambat sekali, dasar mandor bajingan dan pemalas."

    assert not contains_profanity(clean_text)
    assert contains_profanity(dirty_text)

def test_profanity_sanitizer():
    """Memastikan kata kasar disensor menjadi bintang."""
    text = "Proyek anjing ini merugikan warga."
    sanitized = sanitize_profanity(text)
    assert "anjing" not in sanitized.lower()
    assert "a*****" in sanitized or "a****" in sanitized

def test_password_hash_and_verify():
    """Memastikan hashing dan verifikasi kata sandi bcrypt berjalan tepat."""
    pwd = "SecretPassword123!"
    hashed = get_password_hash(pwd)

    assert hashed != pwd
    assert verify_password(pwd, hashed)
    assert not verify_password("WrongPassword", hashed)

def test_point_in_polygon_algorithm():
    """Memastikan algoritma ray-casting point-in-polygon bekerja akurat."""
    from app.core.spatial import point_in_ring, is_point_in_geojson

    # Poligon kotak bujur sangkar sederhana (dummy)
    box_ring = [[111.85, -7.14], [111.91, -7.14], [111.91, -7.18], [111.85, -7.18], [111.85, -7.14]]

    # Titik di dalam
    assert point_in_ring(111.8867, -7.1534, box_ring) is True

    # Titik di luar (timur/barat/utara/selatan)
    assert point_in_ring(111.8000, -7.1534, box_ring) is False
    assert point_in_ring(111.9500, -7.1534, box_ring) is False
    assert point_in_ring(111.8867, -7.1000, box_ring) is False
    assert point_in_ring(111.8867, -7.2500, box_ring) is False

    # GeoJSON string Polygon
    geojson_str = '{"type": "Polygon", "coordinates": [[[111.85, -7.14], [111.91, -7.14], [111.91, -7.18], [111.85, -7.18], [111.85, -7.14]]]}'
    assert is_point_in_geojson(-7.1534, 111.8867, geojson_str) is True
    assert is_point_in_geojson(-7.2500, 111.8867, geojson_str) is False

    # MultiPolygon
    multipoly_str = '{"type": "MultiPolygon", "coordinates": [[[[10.0, 10.0], [20.0, 10.0], [20.0, 20.0], [10.0, 20.0], [10.0, 10.0]]], [[[30.0, 30.0], [40.0, 30.0], [40.0, 40.0], [30.0, 40.0], [30.0, 30.0]]]]}'
    assert is_point_in_geojson(15.0, 15.0, multipoly_str) is True
    assert is_point_in_geojson(35.0, 35.0, multipoly_str) is True
    assert is_point_in_geojson(25.0, 25.0, multipoly_str) is False

def test_api_point_in_polygon_rejection(client):
    """Pengujian integrasi: Endpoint API menolak koordinat proyek di luar batas wilayah administratif (HTTP 400)."""
    # Register Admin
    admin_payload = {
        "nama": "Pak Irfan Admin",
        "email": "irfan.admin@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    }
    admin_res = client.post("/api/v1/auth/register", json=admin_payload)
    assert admin_res.status_code == 201
    admin_token = admin_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Buat Wilayah dengan batas poligon
    wilayah_payload = {
        "kode_wilayah": "35.24.99",
        "nama_wilayah": "Kecamatan Zona Uji Spasial",
        "level": "kecamatan",
        "geom_boundary": '{"type": "Polygon", "coordinates": [[[111.85, -7.14], [111.91, -7.14], [111.91, -7.18], [111.85, -7.18], [111.85, -7.14]]]}'
    }
    w_res = client.post("/api/v1/wilayah", json=wilayah_payload, headers=headers)
    assert w_res.status_code == 201
    wilayah_id = w_res.json()["id"]

    # Buat Dinas
    d_res = client.post("/api/v1/dinas", json={"nama_dinas": "Dinas Bina Marga Uji", "wilayah_id": wilayah_id}, headers=headers)
    assert d_res.status_code == 201
    dinas_id = d_res.json()["id"]

    # 1. Coba input proyek dengan koordinat DI LUAR poligon (lat: -7.25, lon: 111.80) -> HARUS DITOLAK HTTP 400
    invalid_proyek = {
        "nama_proyek": "Proyek Koordinat Nyasar Di Luar Wilayah",
        "kategori": "jalan",
        "deskripsi": "Pengujian penolakan point-in-polygon.",
        "latitude": -7.2500,
        "longitude": 111.8000,
        "wilayah_id": wilayah_id,
        "dinas_id": dinas_id,
        "anggaran": 500000000.0,
        "status": "berjalan",
        "progres_persen": 0,
        "tanggal_mulai": "2025-05-01",
        "estimasi_selesai": "2025-10-01"
    }
    fail_res = client.post("/api/v1/proyek", json=invalid_proyek, headers=headers)
    assert fail_res.status_code == 400
    assert "di luar batas poligon" in fail_res.json()["detail"].lower() or "point-in-polygon" in fail_res.json()["detail"].lower()

    # 2. Input proyek dengan koordinat VALID DI DALAM poligon -> HARUS DITERIMA HTTP 201
    valid_proyek = dict(invalid_proyek)
    valid_proyek["latitude"] = -7.1534
    valid_proyek["longitude"] = 111.8867
    success_res = client.post("/api/v1/proyek", json=valid_proyek, headers=headers)
    assert success_res.status_code == 201
    proyek_id = success_res.json()["id"]

    # 3. Coba update koordinat ke luar poligon -> HARUS DITOLAK HTTP 400
    update_fail = client.put(f"/api/v1/proyek/{proyek_id}", json={"latitude": -7.3000, "longitude": 111.5000}, headers=headers)
    assert update_fail.status_code == 400
    assert "di luar batas poligon" in update_fail.json()["detail"].lower() or "point-in-polygon" in update_fail.json()["detail"].lower()

def test_wilayah_geom_boundary_validation(client):
    """Pengujian penolakan geometri GeoJSON tidak valid pada pendaftaran wilayah."""
    admin_payload = {
        "nama": "Admin Wilayah Geom",
        "email": "admin.geom@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    }
    admin_res = client.post("/api/v1/auth/register", json=admin_payload)
    admin_token = admin_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Invalid JSON string -> Harus ditolak 422
    bad_json_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.90",
        "nama_wilayah": "Kecamatan Bad JSON",
        "level": "kecamatan",
        "geom_boundary": "{bukan json valid"
    }, headers=headers)
    assert bad_json_res.status_code == 422

    # 2. Invalid GeoJSON type (mis. 'Circle') -> Harus ditolak 422
    bad_type_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.91",
        "nama_wilayah": "Kecamatan Bad Type",
        "level": "kecamatan",
        "geom_boundary": '{"type": "Circle", "coordinates": [0, 0]}'
    }, headers=headers)
    assert bad_type_res.status_code == 422

    # 3. Self-intersecting polygon (bowtie/hourglass: garis menyilang dirinya sendiri) -> Harus ditolak 422
    bowtie_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.92",
        "nama_wilayah": "Kecamatan Bowtie Menyilang",
        "level": "kecamatan",
        "geom_boundary": '{"type": "Polygon", "coordinates": [[[0, 0], [2, 2], [2, 0], [0, 2], [0, 0]]]}'
    }, headers=headers)
    assert bowtie_res.status_code == 422
    assert "tidak valid" in bowtie_res.json()["detail"][0]["msg"].lower()

    # 4. Valid Polygon -> Harus diterima 201
    valid_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.93",
        "nama_wilayah": "Kecamatan Poligon Rapi",
        "level": "kecamatan",
        "geom_boundary": '{"type": "Polygon", "coordinates": [[[112.1, -7.1], [112.2, -7.1], [112.2, -7.2], [112.1, -7.2], [112.1, -7.1]]]}'
    }, headers=headers)
    assert valid_res.status_code == 201


