import pytest

def test_full_civictrack_features_flow(client):
    """Pengujian end-to-end fitur CivicTrack sesuai PRD."""
    
    # 1. Register Admin Dinas
    admin_payload = {
        "nama": "Pak Hendro Admin",
        "email": "hendro.admin@bojonegoro.go.id",
        "password": "password123",
        "role": "admin_dinas"
    }
    admin_res = client.post("/api/v1/auth/register", json=admin_payload)
    assert admin_res.status_code == 201
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Register Warga
    warga_payload = {
        "nama": "Ahmad Warga",
        "email": "ahmad.warga@gmail.com",
        "password": "password123",
        "role": "warga"
    }
    warga_res = client.post("/api/v1/auth/register", json=warga_payload)
    assert warga_res.status_code == 201
    warga_token = warga_res.json()["access_token"]
    warga_headers = {"Authorization": f"Bearer {warga_token}"}

    # 3. Fitur 1: Buat Wilayah Administratif
    wilayah_payload = {
        "kode_wilayah": "35.22.01",
        "nama_wilayah": "Kecamatan Bojonegoro",
        "level": "kecamatan"
    }
    w_res = client.post("/api/v1/wilayah", json=wilayah_payload, headers=admin_headers)
    assert w_res.status_code == 201
    wilayah_id = w_res.json()["id"]

    # 4. Buat Master Dinas
    dinas_payload = {
        "nama_dinas": "Dinas Bina Marga dan Tata Ruang",
        "wilayah_id": wilayah_id
    }
    d_res = client.post("/api/v1/dinas", json=dinas_payload, headers=admin_headers)
    assert d_res.status_code == 201
    dinas_id = d_res.json()["id"]

    # 5. Fitur 3: Input Proyek Baru
    proyek_payload = {
        "nama_proyek": "Pembangunan Saluran Air Veteran",
        "kategori": "drainase",
        "deskripsi": "Pemasangan u-ditch beton pencegah genangan.",
        "latitude": -7.1534,
        "longitude": 111.8867,
        "wilayah_id": wilayah_id,
        "dinas_id": dinas_id,
        "anggaran": 1500000000.0,
        "status": "berjalan",
        "progres_persen": 20,
        "tanggal_mulai": "2025-01-10",
        "estimasi_selesai": "2025-06-10"
    }
    p_res = client.post("/api/v1/proyek", json=proyek_payload, headers=admin_headers)
    assert p_res.status_code == 201
    proyek_id = p_res.json()["id"]

    # 6. Fitur 6: Warga Berlangganan Proyek (Subscribe)
    sub_res = client.post(f"/api/v1/proyek/{proyek_id}/subscribe", headers=warga_headers)
    assert sub_res.status_code == 200
    assert sub_res.json()["is_subscribed"] is True

    # 7. Fitur 2: Tambah Tahapan Linimasa (Timeline)
    tahap_payload = {
        "nama_tahap": "Pemasangan Pipa Beton Segmen 1",
        "progres_persen": 50,
        "catatan": "Segmen 1 rampung lebih cepat dari jadwal."
    }
    t_res = client.post(f"/api/v1/proyek/{proyek_id}/tahapan", json=tahap_payload, headers=admin_headers)
    assert t_res.status_code == 201
    assert t_res.json()["progres_persen"] == 50

    # 8. Validasi Aturan PRD 10.1: Progres tidak boleh turun tanpa catatan
    tahap_turun_tanpa_catatan = {
        "nama_tahap": "Penyesuaian Mutu",
        "progres_persen": 30,
        "catatan": None
    }
    fail_res = client.post(f"/api/v1/proyek/{proyek_id}/tahapan", json=tahap_turun_tanpa_catatan, headers=admin_headers)
    assert fail_res.status_code == 400

    # 9. Cek Notifikasi Warga setelah update tahapan (Fitur 6)
    notif_res = client.get("/api/v1/notifikasi", headers=warga_headers)
    assert notif_res.status_code == 200
    notifs = notif_res.json()
    assert len(notifs) >= 1
    assert "Pemasangan Pipa Beton Segmen 1" in notifs[0]["pesan"]

    # 10. Fitur 5: Laporan Warga dengan profanity filter
    lapor_payload = {
        "isi_laporan": "Mohon maaf debu pengerjaan tebal sekali tolong disiram air secara berkala."
    }
    l_res = client.post(f"/api/v1/proyek/{proyek_id}/laporan", json=lapor_payload, headers=warga_headers)
    assert l_res.status_code == 201
    laporan_id = l_res.json()["id"]

    # Admin menanggapi laporan warga
    tanggapi_payload = {
        "status_tindak_lanjut": "ditanggapi",
        "tanggapan_dinas": "Siap, armada tangki air dinas dikerahkan menyiram lokasi 3 kali sehari."
    }
    rep_res = client.put(f"/api/v1/laporan/{laporan_id}/tanggapi", json=tanggapi_payload, headers=admin_headers)
    assert rep_res.status_code == 200
    assert rep_res.json()["status_tindak_lanjut"] == "ditanggapi"

    # 11. Fitur 9: Open Data API Publik
    open_res = client.get("/api/v1/open-data/proyek?format=geojson")
    assert open_res.status_code == 200
    assert open_res.json()["type"] == "FeatureCollection"
    assert len(open_res.json()["features"]) >= 1

    # 12. Fitur 8: Statistik Agregat Dashboard
    stat_res = client.get("/api/v1/stats/dashboard")
    assert stat_res.status_code == 200
    stats = stat_res.json()
    assert stats["total_proyek"] >= 1
    assert stats["total_laporan"] >= 1

    # 13. Selesaikan Proyek menjadi 100%
    finish_tahap = {
        "nama_tahap": "Pekerjaan Akhir dan Serah Terima",
        "progres_persen": 100,
        "catatan": "Pekerjaan tuntas 100%."
    }
    client.post(f"/api/v1/proyek/{proyek_id}/tahapan", json=finish_tahap, headers=admin_headers)

    # 14. Fitur 10: Beri Rating Kepuasan (Hanya bisa saat status selesai)
    rate_payload = {
        "skor": 5,
        "komentar": "Hasil pengerjaan sangat memuaskan, jalan tidak lagi banjir saat hujan."
    }
    rate_res = client.post(f"/api/v1/proyek/{proyek_id}/rating", json=rate_payload, headers=warga_headers)
    assert rate_res.status_code == 201

    # 15. Fitur 11: Rekomendasi Rute AI
    route_res = client.post(f"/api/v1/proyek/{proyek_id}/generate-rute", headers=admin_headers)
    assert route_res.status_code == 200
    routes = route_res.json()
    assert len(routes) == 3
    priorities = [r["prioritas"] for r in routes]
    assert "utama" in priorities and "kedua" in priorities and "tambahan" in priorities

    # 16. Fitur 12: Evaluasi Pembangunan Pasca-Proyek dengan Analisis AI
    eval_payload = {
        "kategori_masalah": "Paving Saluran Ambles",
        "deskripsi": "Ditemukan retakan dan amblesan tanah di pinggir tutup saluran air sepanjang 2 meter."
    }
    eval_res = client.post(f"/api/v1/proyek/{proyek_id}/evaluasi", json=eval_payload, headers=warga_headers)
    assert eval_res.status_code == 201
    eval_id = eval_res.json()["id"]
    assert eval_res.json()["skor_urgensi_ai"] is not None
    assert eval_res.json()["status"] == "menunggu_verifikasi"

    # Admin memverifikasi evaluasi (mencatat log status audit trail)
    verify_payload = {
        "status": "terverifikasi_perlu_tindak_lanjut",
        "catatan": "Tim lapangan telah meninjau, kontraktor diinstruksikan memperbaiki dalam masa retensi garansi."
    }
    verify_res = client.patch(f"/api/v1/evaluasi/{eval_id}/verifikasi", json=verify_payload, headers=admin_headers)
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "terverifikasi_perlu_tindak_lanjut"
    assert len(verify_res.json()["status_logs"]) >= 2
