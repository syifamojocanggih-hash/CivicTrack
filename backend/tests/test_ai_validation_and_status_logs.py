import pytest
from decimal import Decimal
from app.models.ai_route import RekomendasiRute, PrioritasRute
from app.services.gemini_service import analyze_evaluation_with_ai
from app.routers.ai_routes import validate_ai_route

def test_ai_evaluation_validation_and_fallback_resilience():
    """
    Test 1: Memastikan analyze_evaluation_with_ai memvalidasi skor_urgensi_ai,
    ringkasan_analisis_ai, menghasilkan raw_response_ai, dan tahan terhadap respons rusak.
    """
    # 1. Analisis normal melalui fallback heuristik deterministik
    res_urgent = analyze_evaluation_with_ai(
        kategori_masalah="Kerusakan Jembatan",
        deskripsi="Pilar jembatan retak besar dan ambles ke dasar sungai.",
        nama_proyek="Jembatan Babat",
        kategori_proyek="jembatan"
    )
    assert res_urgent["skor_urgensi_ai"] == 5
    assert len(res_urgent["ringkasan_analisis_ai"]) >= 10
    assert "raw_response_ai" in res_urgent
    assert res_urgent["raw_response_ai"]["source"] == "heuristic_fallback"

    res_minor = analyze_evaluation_with_ai(
        kategori_masalah="Pengecatan",
        deskripsi="Warna cat pada trotoar mulai pudar.",
        nama_proyek="Jalan Veteran",
        kategori_proyek="jalan"
    )
    assert res_minor["skor_urgensi_ai"] == 2
    assert res_minor["raw_response_ai"] is not None


def test_evaluation_status_log_lifecycle_manual_and_automatic(client):
    """
    Test 2: Memastikan riwayat evaluasi_status_log mencatat jejak audit
    baik untuk transisi otomatis (dipicu AI) maupun verifikasi manual oleh admin dinas.
    """
    # 1. Setup Admin, Wilayah, Dinas, dan Proyek Selesai
    admin_res = client.post("/api/v1/auth/register", json={
        "nama": "Admin Pengawas Log",
        "email": "admin.log@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    })
    assert admin_res.status_code == 201
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    wil_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.08",
        "nama_wilayah": "Kecamatan Tikung",
        "level": "kecamatan"
    }, headers=admin_headers)
    wil_id = wil_res.json()["id"]

    dinas_res = client.post("/api/v1/dinas", json={
        "nama_dinas": "Dinas PU Cipta Karya",
        "wilayah_id": wil_id
    }, headers=admin_headers)
    dinas_id = dinas_res.json()["id"]

    proj_res = client.post("/api/v1/proyek", json={
        "nama_proyek": "Pembangunan Saluran Drainase Tikung",
        "kategori": "drainase",
        "deskripsi": "Saluran pembuangan air utama.",
        "latitude": -7.1500,
        "longitude": 112.4000,
        "wilayah_id": wil_id,
        "dinas_id": dinas_id,
        "anggaran": 500000000,
        "status": "selesai",
        "progres_persen": 100,
        "tanggal_mulai": "2023-01-01",
        "estimasi_selesai": "2023-07-31"
    }, headers=admin_headers)
    proyek_id = proj_res.json()["id"]

    # 2. Setup Warga Pelapor
    warga_res = client.post("/api/v1/auth/register", json={
        "nama": "Warga Tikung",
        "email": "warga.tikung@civictrack.demo",
        "password": "password123",
        "role": "warga"
    })
    warga_token = warga_res.json()["access_token"]
    warga_headers = {"Authorization": f"Bearer {warga_token}"}

    # 3. Submit Evaluasi dengan Skor AI Tinggi (kata kunci "ambles" -> skor 5 >= 4)
    eval_res = client.post(f"/api/v1/proyek/{proyek_id}/evaluasi", json={
        "kategori_masalah": "Saluran Ambles",
        "deskripsi": "Tanggul drainase ambles parah dan menutup aliran air warga."
    }, headers=warga_headers)
    assert eval_res.status_code == 201
    eval_id = eval_res.json()["id"]

    # 4. Ambil log status melalui endpoint GET /api/v1/evaluasi/{eval_id}/status-log
    logs_res = client.get(f"/api/v1/evaluasi/{eval_id}/status-log", headers=admin_headers)
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert len(logs) >= 2

    # Log 1: Pengajuan awal oleh warga
    assert logs[0]["status_sebelumnya"] is None
    assert logs[0]["status_baru"] == "menunggu_verifikasi"
    assert "diajukan" in logs[0]["catatan"].lower()

    # Log 2: Kejadian otomatis AI
    assert logs[1]["status_baru"] == "menunggu_verifikasi"
    assert "otomatis ai" in logs[1]["catatan"].lower() or "skor urgensi" in logs[1]["catatan"].lower()

    # 5. Admin verifikasi manual ke 'terverifikasi_perlu_tindak_lanjut'
    verify_res = client.patch(f"/api/v1/evaluasi/{eval_id}/verifikasi", json={
        "status": "terverifikasi_perlu_tindak_lanjut",
        "catatan": "Tim survei membenarkan amblesan, diterbitkan surat tugas perbaikan."
    }, headers=admin_headers)
    assert verify_res.status_code == 200

    logs_after_verify = client.get(f"/api/v1/evaluasi/{eval_id}/status-log", headers=admin_headers).json()
    assert len(logs_after_verify) >= 3
    assert logs_after_verify[-1]["status_sebelumnya"] == "menunggu_verifikasi"
    assert logs_after_verify[-1]["status_baru"] == "terverifikasi_perlu_tindak_lanjut"
    assert "tim survei" in logs_after_verify[-1]["catatan"].lower()


def test_get_evaluation_status_logs_endpoint_validity(client):
    """
    Test 3: Uji fungsionalitas dan penanganan error endpoint GET /api/v1/evaluasi/{eval_id}/status-log.
    """
    # 1. ID tidak valid -> HARUS 404
    res_404 = client.get("/api/v1/evaluasi/999999/status-log")
    assert res_404.status_code == 404
    assert "tidak ditemukan" in res_404.json()["detail"].lower()


def test_ai_route_validation_and_public_filtering(client, db_session):
    """
    Test 4: Memastikan validasi AI rekomendasi rute berjalan:
    - Rute dengan atribut tidak realistis / placeholder di-set is_valid = False
    - Endpoint publik GET /proyek/{id}/rute-alternatif HANYA mengembalikan rute yang is_valid == True.
    """
    # 1. Uji unit validator fungsi validate_ai_route
    valid_route, _ = validate_ai_route({
        "nama_rute": "Jl. Basuki Rahmat - Jl. Sunan Giri",
        "prioritas": "utama",
        "estimasi_jarak_km": 3.5,
        "estimasi_waktu_menit": 10,
        "alasan_rekomendasi": "Jalur alternatif jalan lebar beraspal."
    })
    assert valid_route is True

    # Placeholder nama_rute -> invalid
    invalid_route_name, reason = validate_ai_route({
        "nama_rute": "string",
        "prioritas": "utama",
        "estimasi_jarak_km": 3.5,
        "estimasi_waktu_menit": 10,
        "alasan_rekomendasi": "Jalur alternatif."
    })
    assert invalid_route_name is False
    assert "placeholder" in reason

    # Prioritas tidak valid -> invalid
    invalid_priority, _ = validate_ai_route({
        "nama_rute": "Jl. KH Ahmad Dahlan",
        "prioritas": "prioritas_tidak_dikenal",
        "estimasi_jarak_km": 3.5,
        "estimasi_waktu_menit": 10,
        "alasan_rekomendasi": "Jalur alternatif."
    })
    assert invalid_priority is False

    # 2. Uji endpoint generate-rute dan filter publik
    admin_res = client.post("/api/v1/auth/register", json={
        "nama": "Admin Rute PU",
        "email": "admin.rute@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    wil_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.09",
        "nama_wilayah": "Kecamatan Lamongan Kota",
        "level": "kecamatan"
    }, headers=admin_headers)
    wil_id = wil_res.json()["id"]

    dinas_res = client.post("/api/v1/dinas", json={
        "nama_dinas": "Dinas Perhubungan",
        "wilayah_id": wil_id
    }, headers=admin_headers)
    dinas_id = dinas_res.json()["id"]

    proj_res = client.post("/api/v1/proyek", json={
        "nama_proyek": "Perbaikan Aspal Alun-alun Kota",
        "kategori": "jalan",
        "deskripsi": "Penutupan jalur lingkar alun-alun.",
        "latitude": -7.1200,
        "longitude": 112.4150,
        "wilayah_id": wil_id,
        "dinas_id": dinas_id,
        "anggaran": 250000000,
        "status": "berjalan",
        "progres_persen": 20,
        "tanggal_mulai": "2024-01-01",
        "estimasi_selesai": "2024-06-30"
    }, headers=admin_headers)
    proyek_id = proj_res.json()["id"]

    # Generate rute via endpoint
    gen_res = client.post(f"/api/v1/proyek/{proyek_id}/generate-rute", json={
        "catatan_penutupan": "Jalan ditutup total 2 minggu."
    })
    assert gen_res.status_code == 200
    routes = gen_res.json()
    assert len(routes) == 3
    assert all(r["is_valid"] is True for r in routes)

    # Tambahkan satu entri rute tidak valid ke database untuk verifikasi filter publik
    invalid_db_route = RekomendasiRute(
        proyek_id=proyek_id,
        nama_rute="string",
        prioritas=PrioritasRute.utama,
        estimasi_jarak_km=Decimal("0.0"),
        estimasi_waktu_menit=0,
        alasan_rekomendasi="Placeholder test",
        raw_response_ai={"nama_rute": "string", "error": "test"},
        is_valid=False
    )
    db_session.add(invalid_db_route)
    db_session.commit()

    # Panggil endpoint publik GET /api/v1/proyek/{id}/rute-alternatif
    public_res = client.get(f"/api/v1/proyek/{proyek_id}/rute-alternatif")
    assert public_res.status_code == 200
    public_routes = public_res.json()

    # Rute tidak valid (is_valid == False) TIDAK BOLEH muncul di endpoint publik
    assert len(public_routes) == 3
    assert all(r["is_valid"] is True for r in public_routes)
    assert not any(r["nama_rute"] == "string" for r in public_routes)
