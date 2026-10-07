import pytest
from decimal import Decimal

def test_stats_aggregation_per_wilayah_and_ringkasan(client):
    """
    Menguji endpoint statistik agregat per wilayah (/stats/wilayah)
    dan ringkasan kabupaten (/stats/ringkasan), termasuk verifikasi:
    1. Agregasi SQL (total proyek, jumlah status, pagu, estimasi penyerapan, rata-rata progres).
    2. Filter tingkat kecamatan (level kabupaten tidak bocor ke hasil per_wilayah).
    3. Akses publik tanpa header autentikasi.
    """
    # 1. Setup Auth Admin untuk registrasi master data wilayah dan dinas
    admin_payload = {
        "nama": "Admin Pengujian",
        "email": "admin.stats@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    }
    admin_res = client.post("/api/v1/auth/register", json=admin_payload)
    assert admin_res.status_code == 201
    token = admin_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Buat Wilayah: 1 Kabupaten dan 2 Kecamatan
    kab_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24",
        "nama_wilayah": "Kabupaten Lamongan",
        "level": "kabupaten",
        "parent_id": None
    }, headers=headers)
    assert kab_res.status_code == 201
    kab_id = kab_res.json()["id"]

    kec1_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.05",
        "nama_wilayah": "Kecamatan Babat",
        "level": "kecamatan",
        "parent_id": kab_id
    }, headers=headers)
    assert kec1_res.status_code == 201
    kec1_id = kec1_res.json()["id"]

    kec2_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.22",
        "nama_wilayah": "Kecamatan Lamongan (Kota)",
        "level": "kecamatan",
        "parent_id": kab_id
    }, headers=headers)
    assert kec2_res.status_code == 201
    kec2_id = kec2_res.json()["id"]

    # 3. Buat Master Dinas
    dinas_res = client.post("/api/v1/dinas", json={
        "nama_dinas": "Dinas PU Bina Marga",
        "wilayah_id": kab_id
    }, headers=headers)
    assert dinas_res.status_code == 201
    dinas_id = dinas_res.json()["id"]

    # 4. Input Proyek pada Kecamatan Babat (kec1_id)
    # Proyek A: Berjalan, Anggaran 10M, Progres 40% -> Estimasi penyerapan: 4M
    p_a = {
        "nama_proyek": "Pembangunan Flyover Babat",
        "kategori": "jalan",
        "deskripsi": "Konstruksi flyover simpang babat",
        "latitude": -7.1060,
        "longitude": 112.1640,
        "wilayah_id": kec1_id,
        "dinas_id": dinas_id,
        "anggaran": 10000000000.0,
        "status": "berjalan",
        "progres_persen": 40,
        "tanggal_mulai": "2025-01-01",
        "estimasi_selesai": "2025-12-31"
    }
    res_pa = client.post("/api/v1/proyek", json=p_a, headers=headers)
    assert res_pa.status_code == 201

    # Proyek B: Selesai, Anggaran 6M, Progres 100% -> Estimasi penyerapan: 6M
    p_b = {
        "nama_proyek": "Normalisasi Saluran Bengawan Babat",
        "kategori": "drainase",
        "deskripsi": "Normalisasi tanggul banjir",
        "latitude": -7.1080,
        "longitude": 112.1650,
        "wilayah_id": kec1_id,
        "dinas_id": dinas_id,
        "anggaran": 6000000000.0,
        "status": "selesai",
        "progres_persen": 100,
        "tanggal_mulai": "2024-06-01",
        "estimasi_selesai": "2024-12-31"
    }
    res_pb = client.post("/api/v1/proyek", json=p_b, headers=headers)
    assert res_pb.status_code == 201

    # 5. Input Proyek pada Kecamatan Lamongan Kota (kec2_id)
    # Proyek C: Tertunda, Anggaran 5M, Progres 20% -> Estimasi penyerapan: 1M
    p_c = {
        "nama_proyek": "Pavingisasi Trotoar Alun-Alun",
        "kategori": "taman",
        "deskripsi": "Penataan pedestrian alun-alun kota",
        "latitude": -7.1195,
        "longitude": 112.4154,
        "wilayah_id": kec2_id,
        "dinas_id": dinas_id,
        "anggaran": 5000000000.0,
        "status": "tertunda",
        "progres_persen": 20,
        "tanggal_mulai": "2025-02-01",
        "estimasi_selesai": "2025-08-31"
    }
    res_pc = client.post("/api/v1/proyek", json=p_c, headers=headers)
    assert res_pc.status_code == 201

    # Proyek D: Dalam Peninjauan Ulang, Anggaran 2M, Progres 10% -> Estimasi penyerapan: 0.2M
    p_d = {
        "nama_proyek": "Rehabilitasi Gedung Kesenian",
        "kategori": "gedung_publik",
        "deskripsi": "Renovasi atap gedung kesenian",
        "latitude": -7.1200,
        "longitude": 112.4160,
        "wilayah_id": kec2_id,
        "dinas_id": dinas_id,
        "anggaran": 2000000000.0,
        "status": "dalam_peninjauan_ulang",
        "progres_persen": 10,
        "tanggal_mulai": "2025-03-01",
        "estimasi_selesai": "2025-09-30"
    }
    res_pd = client.post("/api/v1/proyek", json=p_d, headers=headers)
    assert res_pd.status_code == 201

    # ==============================================================
    # 6. PENGUJIAN ENDPOINT GET /api/v1/stats/wilayah (Publik)
    # ==============================================================
    stat_wilayah_res = client.get("/api/v1/stats/wilayah")
    assert stat_wilayah_res.status_code == 200
    wilayah_data = stat_wilayah_res.json()

    # Pastikan hanya 2 kecamatan yang dikembalikan (kabupaten TIDAK boleh masuk)
    assert len(wilayah_data) == 2
    wilayah_ids = [w["wilayah_id"] for w in wilayah_data]
    assert kab_id not in wilayah_ids
    assert kec1_id in wilayah_ids
    assert kec2_id in wilayah_ids

    # Verifikasi Kecamatan Babat (kec1)
    babat_stat = next(w for w in wilayah_data if w["wilayah_id"] == kec1_id)
    assert babat_stat["nama_wilayah"] == "Kecamatan Babat"
    assert babat_stat["total_proyek"] == 2
    assert babat_stat["jumlah_berjalan"] == 1
    assert babat_stat["jumlah_selesai"] == 1
    assert babat_stat["jumlah_tertunda"] == 0
    assert babat_stat["jumlah_dalam_peninjauan_ulang"] == 0
    assert float(babat_stat["total_anggaran"]) == 16000000000.0
    assert float(babat_stat["estimasi_penyerapan_anggaran"]) == 10000000000.0
    # Rata-rata progres: (40 + 100) / 2 = 70.0%
    assert babat_stat["rata_rata_progres"] == 70.0

    # Verifikasi Kecamatan Lamongan Kota (kec2)
    kota_stat = next(w for w in wilayah_data if w["wilayah_id"] == kec2_id)
    assert kota_stat["nama_wilayah"] == "Kecamatan Lamongan (Kota)"
    assert kota_stat["total_proyek"] == 2
    assert kota_stat["jumlah_berjalan"] == 0
    assert kota_stat["jumlah_selesai"] == 0
    assert kota_stat["jumlah_tertunda"] == 1
    assert kota_stat["jumlah_dalam_peninjauan_ulang"] == 1
    assert float(kota_stat["total_anggaran"]) == 7000000000.0
    assert float(kota_stat["estimasi_penyerapan_anggaran"]) == 1200000000.0
    # Rata-rata progres: (20 + 10) / 2 = 15.0%
    assert kota_stat["rata_rata_progres"] == 15.0

    # ==============================================================
    # 7. PENGUJIAN ENDPOINT GET /api/v1/stats/ringkasan (Publik)
    # ==============================================================
    ringkasan_res = client.get("/api/v1/stats/ringkasan")
    assert ringkasan_res.status_code == 200
    ringkasan_data = ringkasan_res.json()

    assert ringkasan_data["total_proyek"] == 4
    assert ringkasan_data["status_proyek"]["berjalan"] == 1
    assert ringkasan_data["status_proyek"]["selesai"] == 1
    assert ringkasan_data["status_proyek"]["tertunda"] == 1
    assert ringkasan_data["status_proyek"]["dalam_peninjauan_ulang"] == 1

    # Total pagu: 16M + 7M = 23M
    assert float(ringkasan_data["total_anggaran"]) == 23000000000.0
    # Estimasi penyerapan: 10M + 1.2M = 11.2M
    assert float(ringkasan_data["estimasi_penyerapan_anggaran"]) == 11200000000.0
    # Rasio penyerapan: 11.2 / 23 * 100 = 48.7%
    assert ringkasan_data["rasio_penyerapan_persen"] == 48.7
    # Rata-rata progres keseluruhan: (40 + 100 + 20 + 10) / 4 = 42.5%
    assert ringkasan_data["rata_rata_progres"] == 42.5

    # ==============================================================
    # 8. PENGUJIAN BUGFIX GET /api/v1/stats/dashboard (Publik)
    # ==============================================================
    dash_res = client.get("/api/v1/stats/dashboard")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()

    # Pastikan per_wilayah hanya berisi kecamatan, id kabupaten (level kabupaten) tidak bocor
    dash_wilayah_ids = [w["wilayah_id"] for w in dash_data["per_wilayah"]]
    assert kab_id not in dash_wilayah_ids
    assert len(dash_wilayah_ids) == 2
