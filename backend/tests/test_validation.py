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
    """Pengujian integrasi: Endpoint API menolak koordinat proyek di luar batas wilayah administratif (HTTP 422)."""
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

    # 1. Coba input proyek dengan koordinat DI LUAR poligon (lat: -7.25, lon: 111.80) -> HARUS DITOLAK HTTP 422
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
    assert fail_res.status_code == 422
    err_detail = fail_res.json()["detail"].lower()
    assert "di luar batas poligon" in err_detail or "point-in-polygon" in err_detail
    assert "meter" in err_detail

    # 2. Input proyek dengan koordinat VALID DI DALAM poligon -> HARUS DITERIMA HTTP 201
    valid_proyek = dict(invalid_proyek)
    valid_proyek["latitude"] = -7.1534
    valid_proyek["longitude"] = 111.8867
    success_res = client.post("/api/v1/proyek", json=valid_proyek, headers=headers)
    assert success_res.status_code == 201
    proyek_id = success_res.json()["id"]

    # 3. Coba update koordinat ke luar poligon -> HARUS DITOLAK HTTP 422
    update_fail = client.put(f"/api/v1/proyek/{proyek_id}", json={"latitude": -7.3000, "longitude": 111.5000}, headers=headers)
    assert update_fail.status_code == 422
    update_err_detail = update_fail.json()["detail"].lower()
    assert "di luar batas poligon" in update_err_detail or "point-in-polygon" in update_err_detail
    assert "meter" in update_err_detail

    # 4. Update koordinat ke lokasi VALID di dalam poligon -> HARUS DITERIMA HTTP 200
    update_ok = client.put(f"/api/v1/proyek/{proyek_id}", json={"latitude": -7.1600, "longitude": 111.8900}, headers=headers)
    assert update_ok.status_code == 200
    assert float(update_ok.json()["latitude"]) == -7.1600

def test_point_in_polygon_comprehensive_validation(client):
    """
    Pengujian komprehensif validasi spasial Point-in-Polygon (Shapely):
    - Penolakan POST proyek di luar polygon dengan HTTP 422 & informasi meter
    - Penerimaan POST proyek di dalam polygon dengan HTTP 201
    - Toleransi batas tepi (.buffer(0) / .covers()) menerima titik tepat di batas poligon
    - Penolakan PUT proyek saat memindahkan wilayah_id ke polygon lain yang tidak mencakup koordinatnya
    """
    # 1. Register Admin
    admin_res = client.post("/api/v1/auth/register", json={
        "nama": "Admin Spasial Lamongan",
        "email": "admin.spasial@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    })
    token = admin_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Buat Wilayah A (Kecamatan Sukorame uji)
    # Kotak: lon [112.00, 112.10], lat [-7.30, -7.20]
    wil_a = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.01.UJI",
        "nama_wilayah": "Kecamatan Sukorame Uji",
        "level": "kecamatan",
        "geom_boundary": '{"type": "Polygon", "coordinates": [[[112.00, -7.20], [112.10, -7.20], [112.10, -7.30], [112.00, -7.30], [112.00, -7.20]]]}'
    }, headers=headers).json()

    # Buat Wilayah B (Kecamatan Bluluk uji)
    # Kotak: lon [112.15, 112.25], lat [-7.30, -7.20]
    wil_b = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.02.UJI",
        "nama_wilayah": "Kecamatan Bluluk Uji",
        "level": "kecamatan",
        "geom_boundary": '{"type": "Polygon", "coordinates": [[[112.15, -7.20], [112.25, -7.20], [112.25, -7.30], [112.15, -7.30], [112.15, -7.20]]]}'
    }, headers=headers).json()

    dinas = client.post("/api/v1/dinas", json={
        "nama_dinas": "Dinas PU Bina Marga Uji Spasial",
        "wilayah_id": wil_a["id"]
    }, headers=headers).json()

    # 3. Kasus 1: Titik jauh di luar Wilayah A (misal lon 112.50, lat -7.50) -> HTTP 422
    out_project = {
        "nama_proyek": "Pembangunan Jembatan Di Luar Wilayah A",
        "kategori": "jembatan",
        "deskripsi": "Uji penolakan 422 koordinat jauh.",
        "latitude": -7.5000,
        "longitude": 112.5000,
        "wilayah_id": wil_a["id"],
        "dinas_id": dinas["id"],
        "anggaran": 1000000000.0,
        "status": "berjalan",
        "progres_persen": 0,
        "tanggal_mulai": "2025-03-01",
        "estimasi_selesai": "2025-11-01"
    }
    res_422 = client.post("/api/v1/proyek", json=out_project, headers=headers)
    assert res_422.status_code == 422
    detail_str = res_422.json()["detail"]
    assert "Kecamatan Sukorame Uji" in detail_str
    assert "meter" in detail_str
    assert "di luar batas poligon" in detail_str

    # 4. Kasus 2: Titik di dalam Wilayah A (lon 112.05, lat -7.25) -> HTTP 201
    in_project = dict(out_project)
    in_project["latitude"] = -7.2500
    in_project["longitude"] = 112.0500
    res_201 = client.post("/api/v1/proyek", json=in_project, headers=headers)
    assert res_201.status_code == 201
    pid = res_201.json()["id"]

    # 5. Kasus 3: Toleransi tepi - Titik tepat pada garis batas tepi poligon Wilayah A (lon 112.00, lat -7.25) -> HTTP 201
    edge_project = dict(out_project)
    edge_project["nama_proyek"] = "Proyek Tepat Di Garis Tepi Wilayah"
    edge_project["latitude"] = -7.2500
    edge_project["longitude"] = 112.0000
    res_edge = client.post("/api/v1/proyek", json=edge_project, headers=headers)
    assert res_edge.status_code == 201

    # 6. Kasus 4: Pindah wilayah_id ke Wilayah B padahal koordinat tetap di Wilayah A -> HTTP 422
    # Proyek pid berada di lon 112.05, lat -7.25 (wilayah A). Jika diubah ke wilayah B (lon [112.15, 112.25]), harus ditolak 422
    res_switch_wil = client.put(f"/api/v1/proyek/{pid}", json={"wilayah_id": wil_b["id"]}, headers=headers)
    assert res_switch_wil.status_code == 422
    assert "Kecamatan Bluluk Uji" in res_switch_wil.json()["detail"]
    assert "meter" in res_switch_wil.json()["detail"]

    # 7. Kasus 5: Pindah wilayah_id ke Wilayah B sekaligus update koordinat yang valid di Wilayah B -> HTTP 200
    res_switch_valid = client.put(f"/api/v1/proyek/{pid}", json={
        "wilayah_id": wil_b["id"],
        "latitude": -7.2500,
        "longitude": 112.2000
    }, headers=headers)
    assert res_switch_valid.status_code == 200
    assert res_switch_valid.json()["wilayah_id"] == wil_b["id"]

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

def test_progres_persen_validation(client):
    """
    Pengujian validasi PRD 10.1 untuk persentase progres proyek:
    1. Update progres naik (mis. 40% ke 60%) tanpa alasan -> diterima (200).
    2. Update progres turun (mis. 60% ke 40%) tanpa alasan -> ditolak 422.
    3. Update progres turun dengan alasan terlalu pendek / spasi kosong -> ditolak 422.
    4. Update progres turun dengan alasan memadai (>= 10 karakter) -> diterima (200),
       dan histori tercatat di tahapan_progres.
    5. Tambah tahapan progres turun di endpoint /{id}/tahapan dengan & tanpa alasan.
    6. Nilai progres di luar rentang 0-100 (mis. 150 atau -10) -> ditolak 422 oleh Pydantic.
    """
    # 1. Register Admin & setup wilayah + dinas
    admin_res = client.post("/api/v1/auth/register", json={
        "nama": "Admin Progres Tester",
        "email": "admin.progres@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    })
    token = admin_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    w_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.88",
        "nama_wilayah": "Kecamatan Uji Progres",
        "level": "kecamatan"
    }, headers=headers)
    wilayah_id = w_res.json()["id"]

    d_res = client.post("/api/v1/dinas", json={
        "nama_dinas": "Dinas Bina Marga Progres",
        "wilayah_id": wilayah_id
    }, headers=headers)
    dinas_id = d_res.json()["id"]

    # Buat proyek awal dengan progres 40%
    proyek_payload = {
        "nama_proyek": "Pembangunan Saluran Uji Progres",
        "kategori": "drainase",
        "deskripsi": "Pengujian aturan PRD 10.1 penurunan progres.",
        "latitude": -7.15,
        "longitude": 112.35,
        "wilayah_id": wilayah_id,
        "dinas_id": dinas_id,
        "anggaran": 500000000.0,
        "status": "berjalan",
        "progres_persen": 40,
        "tanggal_mulai": "2025-01-01",
        "estimasi_selesai": "2025-08-01"
    }
    p_res = client.post("/api/v1/proyek", json=proyek_payload, headers=headers)
    assert p_res.status_code == 201
    pid = p_res.json()["id"]
    assert p_res.json()["progres_persen"] == 40

    # 1. Progres naik (40% -> 60%) tanpa alasan -> HARUS DITERIMA (200)
    up_res = client.put(f"/api/v1/proyek/{pid}", json={"progres_persen": 60}, headers=headers)
    assert up_res.status_code == 200
    assert up_res.json()["progres_persen"] == 60

    # 2. Progres turun (60% -> 40%) tanpa alasan -> HARUS DITOLAK 422
    down_no_reason = client.put(f"/api/v1/proyek/{pid}", json={"progres_persen": 40}, headers=headers)
    assert down_no_reason.status_code == 422
    detail_msg = down_no_reason.json()["detail"]
    assert "Progres tidak boleh diturunkan dari 60% ke 40% tanpa keterangan" in detail_msg

    # 3. Progres turun dengan alasan terlalu pendek / spasi saja -> HARUS DITOLAK 422
    down_short_reason = client.put(f"/api/v1/proyek/{pid}", json={
        "progres_persen": 40,
        "catatan_perubahan": "revisi"  # Hanya 6 karakter (< 10)
    }, headers=headers)
    assert down_short_reason.status_code == 422

    down_spaces_only = client.put(f"/api/v1/proyek/{pid}", json={
        "progres_persen": 40,
        "catatan_perubahan": "          "  # Hanya spasi
    }, headers=headers)
    assert down_spaces_only.status_code == 422

    # 4. Progres turun dengan alasan memadai (>= 10 karakter) -> HARUS DITERIMA (200)
    valid_alasan = "Revisi teknis anggaran akibat penyesuaian lapangan pasca evaluasi."
    down_valid = client.put(f"/api/v1/proyek/{pid}", json={
        "progres_persen": 40,
        "catatan_perubahan": valid_alasan
    }, headers=headers)
    assert down_valid.status_code == 200
    assert down_valid.json()["progres_persen"] == 40

    # Pastikan entri histori audit tercatat di tahapan_progres
    tahapan_list = down_valid.json()["tahapan_list"]
    assert len(tahapan_list) >= 1
    latest_tahap = tahapan_list[-1]
    assert latest_tahap["progres_persen"] == 40
    assert latest_tahap["catatan"] == valid_alasan

    # 5. Uji endpoint penambahan tahapan: /{id}/tahapan
    # Progres naik (40% -> 70%) tanpa catatan khusus -> DITERIMA (201)
    tahap_naik = client.post(f"/api/v1/proyek/{pid}/tahapan", json={
        "nama_tahap": "Pemasangan Pondasi Tiang",
        "progres_persen": 70,
        "catatan": None
    }, headers=headers)
    assert tahap_naik.status_code == 201

    # Progres turun (70% -> 50%) tanpa catatan -> DITOLAK 422
    tahap_turun_fail = client.post(f"/api/v1/proyek/{pid}/tahapan", json={
        "nama_tahap": "Penurunan Progres Tanpa Alasan",
        "progres_persen": 50,
        "catatan": None
    }, headers=headers)
    assert tahap_turun_fail.status_code == 422
    assert "Progres tidak boleh diturunkan dari 70% ke 50% tanpa keterangan" in tahap_turun_fail.json()["detail"]

    # Progres turun (70% -> 50%) dengan alasan memadai -> DITERIMA (201)
    alasan_tahap = "Penghentian sementara dan peninjauan ulang spesifikasi struktur."
    tahap_turun_ok = client.post(f"/api/v1/proyek/{pid}/tahapan", json={
        "nama_tahap": "Revisi Spesifikasi Struktur",
        "progres_persen": 50,
        "catatan": alasan_tahap
    }, headers=headers)
    assert tahap_turun_ok.status_code == 201
    assert tahap_turun_ok.json()["progres_persen"] == 50

    # 6. Progres di luar batas 0-100 -> DITOLAK 422
    out_of_bounds_high = client.put(f"/api/v1/proyek/{pid}", json={"progres_persen": 150}, headers=headers)
    assert out_of_bounds_high.status_code == 422

    out_of_bounds_low = client.put(f"/api/v1/proyek/{pid}", json={"progres_persen": -10}, headers=headers)
    assert out_of_bounds_low.status_code == 422

    out_tahap_high = client.post(f"/api/v1/proyek/{pid}/tahapan", json={
        "nama_tahap": "Tahap Melebihi Maksimal",
        "progres_persen": 101
    }, headers=headers)
    assert out_tahap_high.status_code == 422

    out_tahap_low = client.post(f"/api/v1/proyek/{pid}/tahapan", json={
        "nama_tahap": "Tahap Di Bawah Nol",
        "progres_persen": -5
    }, headers=headers)
    assert out_tahap_low.status_code == 422

def test_media_upload_security_validation(client):
    """
    Pengujian validasi keamanan upload berkas media (Opsi A - PRD 10.1):
    1. Upload foto JPEG asli valid ke dokumentasi proyek -> DITERIMA (201).
    2. Upload file berekstensi .jpg tapi berisi executable Windows (MZ) -> DITOLAK 422.
    3. Upload file berekstensi .jpg tapi berisi skrip PHP -> DITOLAK 422.
    4. Upload file gambar corrupt/rusak (truncated) -> DITOLAK 422.
    5. Upload file gambar melebihi batas 10MB -> DITOLAK 422.
    6. Upload file berekstensi tidak diizinkan (.exe) -> DITOLAK 422.
    7. Pengujian serupa pada endpoint evaluasi pasca-proyek (evaluations.py) -> DITERIMA 201 & DITOLAK 422.
    """
    import io
    from PIL import Image

    # 1. Setup Admin, Wilayah, Dinas, dan Proyek
    admin_res = client.post("/api/v1/auth/register", json={
        "nama": "Admin Media Tester",
        "email": "admin.media@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    w_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.77",
        "nama_wilayah": "Kecamatan Uji Media",
        "level": "kecamatan"
    }, headers=admin_headers)
    wid = w_res.json()["id"]

    d_res = client.post("/api/v1/dinas", json={
        "nama_dinas": "Dinas Bina Marga Media",
        "wilayah_id": wid
    }, headers=admin_headers)
    did = d_res.json()["id"]

    # Proyek Selesai agar bisa menguji dokumentasi proyek dan evaluasi
    p_res = client.post("/api/v1/proyek", json={
        "nama_proyek": "Pembangunan Jembatan Uji Media",
        "kategori": "jembatan",
        "latitude": -7.12,
        "longitude": 112.40,
        "wilayah_id": wid,
        "dinas_id": did,
        "status": "selesai",
        "progres_persen": 100,
        "tanggal_mulai": "2024-01-01",
        "estimasi_selesai": "2024-12-31"
    }, headers=admin_headers)
    pid = p_res.json()["id"]

    # Register Warga untuk evaluasi
    warga_res = client.post("/api/v1/auth/register", json={
        "nama": "Warga Evaluator Media",
        "email": "warga.media@gmail.com",
        "password": "password123",
        "role": "warga"
    })
    warga_token = warga_res.json()["access_token"]
    warga_headers = {"Authorization": f"Bearer {warga_token}"}

    eval_res = client.post(f"/api/v1/proyek/{pid}/evaluasi", json={
        "kategori_masalah": "Struktur Retak",
        "deskripsi": "Ditemukan retakan struktural pada sambungan pilar jembatan."
    }, headers=warga_headers)
    eval_id = eval_res.json()["id"]

    # Helper generator citra valid
    def generate_image_bytes(fmt="JPEG", color="blue", size=(40, 40)):
        buf = io.BytesIO()
        img = Image.new("RGB", size, color=color)
        img.save(buf, format=fmt)
        return buf.getvalue()

    valid_jpg_bytes = generate_image_bytes(fmt="JPEG")
    valid_png_bytes = generate_image_bytes(fmt="PNG")

    # ==========================================================
    # BAGIAN A: Uji Endpoint Dokumentasi Proyek (documentation.py)
    # ==========================================================
    # 1. Upload valid JPEG -> HARUS DITERIMA (201)
    res_valid_doc = client.post(
        f"/api/v1/proyek/{pid}/dokumentasi",
        files={"file": ("foto_fisik.jpg", valid_jpg_bytes, "image/jpeg")},
        headers=admin_headers
    )
    assert res_valid_doc.status_code == 201
    assert res_valid_doc.json()["tipe_media"] == "foto"
    assert "proyek_" in res_valid_doc.json()["url_file"]

    # 2. Upload file ekstensi .jpg tapi isinya Windows Executable (MZ) -> HARUS DITOLAK 422
    fake_exe = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00This is a binary executable disguised as photo"
    res_fake_exe = client.post(
        f"/api/v1/proyek/{pid}/dokumentasi",
        files={"file": ("trojan_disguised.jpg", fake_exe, "image/jpeg")},
        headers=admin_headers
    )
    assert res_fake_exe.status_code == 422
    assert "terdeteksi sebagai Windows Executable" in res_fake_exe.json()["detail"] or "ditolak" in res_fake_exe.json()["detail"]

    # 3. Upload file ekstensi .jpg tapi isinya script PHP -> HARUS DITOLAK 422
    fake_php = b"<?php echo 'malicious webshell'; ?>"
    res_fake_php = client.post(
        f"/api/v1/proyek/{pid}/dokumentasi",
        files={"file": ("shell.jpg", fake_php, "image/jpeg")},
        headers=admin_headers
    )
    assert res_fake_php.status_code == 422
    assert "PHP Script" in res_fake_php.json()["detail"] or "ditolak" in res_fake_php.json()["detail"]

    # 4. Upload file gambar rusak / truncated -> HARUS DITOLAK 422
    corrupt_jpg = valid_jpg_bytes[:25]  # Dipotong paksa
    res_corrupt = client.post(
        f"/api/v1/proyek/{pid}/dokumentasi",
        files={"file": ("corrupt_sample.jpg", corrupt_jpg, "image/jpeg")},
        headers=admin_headers
    )
    assert res_corrupt.status_code == 422
    assert "rusak atau tidak valid" in res_corrupt.json()["detail"].lower() or "corrupted" in res_corrupt.json()["detail"].lower()

    # 5. Upload file melebihi batas 10MB -> HARUS DITOLAK 422
    oversized_data = valid_jpg_bytes + (b"\x00" * (11 * 1024 * 1024))
    res_oversized = client.post(
        f"/api/v1/proyek/{pid}/dokumentasi",
        files={"file": ("huge_photo.jpg", oversized_data, "image/jpeg")},
        headers=admin_headers
    )
    assert res_oversized.status_code == 422
    assert "melebihi batas maksimum 10MB" in res_oversized.json()["detail"]

    # 6. Upload ekstensi tidak diizinkan (.exe) -> HARUS DITOLAK 422
    res_bad_ext = client.post(
        f"/api/v1/proyek/{pid}/dokumentasi",
        files={"file": ("program.exe", b"MZDummyPayload", "application/octet-stream")},
        headers=admin_headers
    )
    assert res_bad_ext.status_code == 422
    assert "tidak didukung" in res_bad_ext.json()["detail"]

    # ==========================================================
    # BAGIAN B: Uji Endpoint Bukti Evaluasi (evaluations.py)
    # ==========================================================
    # 1. Upload valid PNG -> HARUS DITERIMA (201)
    res_valid_eval = client.post(
        f"/api/v1/evaluasi/{eval_id}/dokumentasi",
        files={"file": ("bukti_retak.png", valid_png_bytes, "image/png")},
        headers=warga_headers
    )
    assert res_valid_eval.status_code == 201
    assert res_valid_eval.json()["tipe_media"] == "foto"

    # 2. Upload file palsu (Linux ELF) dengan ekstensi .png -> HARUS DITOLAK 422
    fake_elf = b"\x7fELF\x02\x01\x01\x00MaliciousLinuxBinary"
    res_eval_elf = client.post(
        f"/api/v1/evaluasi/{eval_id}/dokumentasi",
        files={"file": ("bukti_palsu.png", fake_elf, "image/png")},
        headers=warga_headers
    )
    assert res_eval_elf.status_code == 422
    assert "Linux Executable" in res_eval_elf.json()["detail"] or "ditolak" in res_eval_elf.json()["detail"]

    # 3. Upload file rusak ke evaluasi -> HARUS DITOLAK 422
    corrupt_png = valid_png_bytes[:20]
    res_eval_corrupt = client.post(
        f"/api/v1/evaluasi/{eval_id}/dokumentasi",
        files={"file": ("bukti_rusak.png", corrupt_png, "image/png")},
        headers=warga_headers
    )
    assert res_eval_corrupt.status_code == 422

    # 4. Upload file melebihi 10MB ke evaluasi -> HARUS DITOLAK 422
    res_eval_huge = client.post(
        f"/api/v1/evaluasi/{eval_id}/dokumentasi",
        files={"file": ("bukti_terlalu_besar.png", oversized_data, "image/png")},
        headers=warga_headers
    )
    assert res_eval_huge.status_code == 422
    assert "melebihi batas maksimum 10MB" in res_eval_huge.json()["detail"]




