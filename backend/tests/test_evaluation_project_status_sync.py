import pytest

def test_evaluation_high_urgency_auto_triggers_dalam_peninjauan_ulang(client):
    """
    Test 1: Evaluasi baru dengan skor urgensi tinggi (>= 4) untuk proyek 'selesai'
    otomatis mengubah proyek.status menjadi 'dalam_peninjauan_ulang', mencatat
    entri baru di tahapan_progres, dan mengirim notifikasi ke subscriber.
    """
    # 1. Setup Admin, Wilayah, Dinas, dan Proyek Selesai
    admin_res = client.post("/api/v1/auth/register", json={
        "nama": "Admin Dinas Pengawas",
        "email": "admin.pengawas@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    })
    assert admin_res.status_code == 201
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    wil_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.02",
        "nama_wilayah": "Kecamatan Babat",
        "level": "kecamatan"
    }, headers=admin_headers)
    wil_id = wil_res.json()["id"]

    dinas_res = client.post("/api/v1/dinas", json={
        "nama_dinas": "Dinas PU Bina Marga",
        "wilayah_id": wil_id
    }, headers=admin_headers)
    dinas_id = dinas_res.json()["id"]

    proj_res = client.post("/api/v1/proyek", json={
        "nama_proyek": "Pembangunan Jembatan Babat Baru",
        "kategori": "jembatan",
        "deskripsi": "Konstruksi jembatan penghubung antar desa.",
        "latitude": -7.1120,
        "longitude": 112.1640,
        "wilayah_id": wil_id,
        "dinas_id": dinas_id,
        "anggaran": 1200000000,
        "status": "selesai",
        "progres_persen": 100,
        "tanggal_mulai": "2023-01-01",
        "estimasi_selesai": "2023-12-31"
    }, headers=admin_headers)
    assert proj_res.status_code == 201
    proyek_id = proj_res.json()["id"]

    # 2. Setup Warga Subscriber & Subscribe ke proyek
    sub_res = client.post("/api/v1/auth/register", json={
        "nama": "Warga Pemerhati Jembatan",
        "email": "warga.pemerhati@civictrack.demo",
        "password": "password123",
        "role": "warga"
    })
    sub_token = sub_res.json()["access_token"]
    sub_headers = {"Authorization": f"Bearer {sub_token}"}

    client.post(f"/api/v1/proyek/{proyek_id}/subscribe", headers=sub_headers)

    # 3. Setup Warga Pelapor Evaluasi
    pelapor_res = client.post("/api/v1/auth/register", json={
        "nama": "Warga Pelapor Cacat",
        "email": "warga.pelapor@civictrack.demo",
        "password": "password123",
        "role": "warga"
    })
    pelapor_token = pelapor_res.json()["access_token"]
    pelapor_headers = {"Authorization": f"Bearer {pelapor_token}"}

    # Submit evaluasi dengan kata kunci kritis ("ambles", "retak besar") -> skor 5 (>= 4)
    eval_payload = {
        "kategori_masalah": "Pondasi Jembatan Ambles",
        "deskripsi": "Pilar penyangga jembatan ambles dan retak besar membahayakan kendaraan."
    }
    eval_res = client.post(f"/api/v1/proyek/{proyek_id}/evaluasi", json=eval_payload, headers=pelapor_headers)
    assert eval_res.status_code == 201
    eval_data = eval_res.json()
    assert eval_data["skor_urgensi_ai"] >= 4

    # 4. Verifikasi Proyek otomatis berubah ke 'dalam_peninjauan_ulang'
    detail_res = client.get(f"/api/v1/proyek/{proyek_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["status"] == "dalam_peninjauan_ulang"

    # Verifikasi entri tahapan_progres audit trail tercatat
    tahapan_list = detail_data["tahapan_list"]
    assert any("Peninjauan Ulang Proyek (Otomatis AI)" in t["nama_tahap"] for t in tahapan_list)
    matching_tahap = next(t for t in tahapan_list if "Peninjauan Ulang Proyek (Otomatis AI)" in t["nama_tahap"])
    assert f"#{eval_data['id']}" in matching_tahap["catatan"]

    # 5. Verifikasi subscriber menerima notifikasi pembaruan status
    notif_res = client.get("/api/v1/notifikasi", headers=sub_headers)
    assert notif_res.status_code == 200
    notifs = notif_res.json()
    assert len(notifs) >= 1
    assert any("dalam_peninjauan_ulang" in n["pesan"] for n in notifs)

    # Verifikasi pelapor tidak menerima notifikasi untuk laporannya sendiri
    pelapor_notif_res = client.get("/api/v1/notifikasi", headers=pelapor_headers)
    assert len(pelapor_notif_res.json()) == 0


def test_evaluation_low_urgency_does_not_auto_trigger(client):
    """
    Test 2: Evaluasi baru dengan skor urgensi rendah (< 4) TIDAK otomatis
    mengubah proyek.status (tetap 'selesai').
    """
    admin_res = client.post("/api/v1/auth/register", json={
        "nama": "Admin PU Low",
        "email": "admin.low@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    wil_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.03",
        "nama_wilayah": "Kecamatan Modo",
        "level": "kecamatan"
    }, headers=admin_headers)
    wil_id = wil_res.json()["id"]

    dinas_res = client.post("/api/v1/dinas", json={
        "nama_dinas": "Dinas Kebersihan",
        "wilayah_id": wil_id
    }, headers=admin_headers)
    dinas_id = dinas_res.json()["id"]

    proj_res = client.post("/api/v1/proyek", json={
        "nama_proyek": "Taman Rekreasi Modo",
        "kategori": "taman",
        "deskripsi": "Ruang terbuka hijau dan taman bermain.",
        "latitude": -7.2100,
        "longitude": 112.1400,
        "wilayah_id": wil_id,
        "dinas_id": dinas_id,
        "anggaran": 300000000,
        "status": "selesai",
        "progres_persen": 100,
        "tanggal_mulai": "2023-01-01",
        "estimasi_selesai": "2023-06-30"
    }, headers=admin_headers)
    proyek_id = proj_res.json()["id"]

    warga_res = client.post("/api/v1/auth/register", json={
        "nama": "Warga Cat",
        "email": "warga.cat@civictrack.demo",
        "password": "password123",
        "role": "warga"
    })
    warga_token = warga_res.json()["access_token"]
    warga_headers = {"Authorization": f"Bearer {warga_token}"}

    # Aduan minor (misal cat pudar / tanaman layu) -> skor < 4
    eval_res = client.post(f"/api/v1/proyek/{proyek_id}/evaluasi", json={
        "kategori_masalah": "Warna Cat Bangku",
        "deskripsi": "Warna cat pada bangku taman agak memudar terkena sinar matahari."
    }, headers=warga_headers)
    assert eval_res.status_code == 201
    eval_data = eval_res.json()
    assert eval_data["skor_urgensi_ai"] < 4

    # Status proyek HARUS tetap 'selesai'
    detail_res = client.get(f"/api/v1/proyek/{proyek_id}")
    assert detail_res.json()["status"] == "selesai"


def test_admin_verification_lifecycle_and_recovery(client):
    """
    Test 3 & Test 4:
    - Admin ubah evaluasi.status ke 'terverifikasi_perlu_tindak_lanjut' -> proyek.status jadi 'dalam_peninjauan_ulang'.
    - Admin ubah evaluasi.status ke 'selesai_ditindaklanjuti' (evaluasi terakhir) -> proyek.status kembali ke 'selesai'.
    """
    admin_res = client.post("/api/v1/auth/register", json={
        "nama": "Admin Dinas Siklus",
        "email": "admin.siklus@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    wil_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.04",
        "nama_wilayah": "Kecamatan Kedungpring",
        "level": "kecamatan"
    }, headers=admin_headers)
    wil_id = wil_res.json()["id"]

    dinas_res = client.post("/api/v1/dinas", json={
        "nama_dinas": "Dinas Sumber Daya Air",
        "wilayah_id": wil_id
    }, headers=admin_headers)
    dinas_id = dinas_res.json()["id"]

    proj_res = client.post("/api/v1/proyek", json={
        "nama_proyek": "Normalisasi Saluran Irigasi Kedungpring",
        "kategori": "drainase",
        "deskripsi": "Pengerukan lumpur dan dinding penahan irigasi.",
        "latitude": -7.1400,
        "longitude": 112.1900,
        "wilayah_id": wil_id,
        "dinas_id": dinas_id,
        "anggaran": 450000000,
        "status": "selesai",
        "progres_persen": 100,
        "tanggal_mulai": "2023-02-01",
        "estimasi_selesai": "2023-08-31"
    }, headers=admin_headers)
    proyek_id = proj_res.json()["id"]

    warga_res = client.post("/api/v1/auth/register", json={
        "nama": "Warga Irigasi",
        "email": "warga.irigasi@civictrack.demo",
        "password": "password123",
        "role": "warga"
    })
    warga_token = warga_res.json()["access_token"]
    warga_headers = {"Authorization": f"Bearer {warga_token}"}

    # Submit evaluasi dengan urgensi sedang (skor 3 -> tidak langsung auto-trigger status)
    eval_res = client.post(f"/api/v1/proyek/{proyek_id}/evaluasi", json={
        "kategori_masalah": "Genangan Air",
        "deskripsi": "Terdapat genangan air dan saluran tersumbat sampah ranting."
    }, headers=warga_headers)
    assert eval_res.status_code == 201
    eval_id = eval_res.json()["id"]

    # Pastikan awalnya masih 'selesai'
    assert client.get(f"/api/v1/proyek/{proyek_id}").json()["status"] == "selesai"

    # --- LANGKAH A: Admin memverifikasi menjadi 'terverifikasi_perlu_tindak_lanjut' ---
    verify_res = client.patch(f"/api/v1/evaluasi/{eval_id}/verifikasi", json={
        "status": "terverifikasi_perlu_tindak_lanjut",
        "catatan": "Instruksi kepada pemeliharaan dinas untuk pembersihan dan perbaikan dinding."
    }, headers=admin_headers)
    assert verify_res.status_code == 200

    # Proyek.status harus otomatis berubah ke 'dalam_peninjauan_ulang'
    proj_after_verify = client.get(f"/api/v1/proyek/{proyek_id}").json()
    assert proj_after_verify["status"] == "dalam_peninjauan_ulang"
    assert any("Peninjauan Ulang Proyek (Verifikasi Dinas)" in t["nama_tahap"] for t in proj_after_verify["tahapan_list"])

    # --- LANGKAH B: Admin menyelesaikan evaluasi menjadi 'selesai_ditindaklanjuti' ---
    resolve_res = client.patch(f"/api/v1/evaluasi/{eval_id}/verifikasi", json={
        "status": "selesai_ditindaklanjuti",
        "catatan": "Pekerjaan pembersihan selesai dilakukan oleh tim reaksi cepat dinas."
    }, headers=admin_headers)
    assert resolve_res.status_code == 200

    # Karena tidak ada evaluasi aktif lain, proyek.status otomatis kembali ke 'selesai'
    proj_after_resolve = client.get(f"/api/v1/proyek/{proyek_id}").json()
    assert proj_after_resolve["status"] == "selesai"
    assert any("Pemulihan Status Proyek (Selesai)" in t["nama_tahap"] for t in proj_after_resolve["tahapan_list"])


def test_multiple_active_evaluations_status_persistence(client):
    """
    Test 5: Proyek dengan MULTIPLE evaluasi aktif sekaligus:
    - Proyek status TIDAK kembali ke 'selesai' jika salah satu selesai tapi masih ada evaluasi lain yang aktif.
    - Hanya kembali ke 'selesai' setelah seluruh evaluasi aktif tuntas diselesaikan atau ditolak.
    """
    admin_res = client.post("/api/v1/auth/register", json={
        "nama": "Admin Multi",
        "email": "admin.multi@civictrack.demo",
        "password": "password123",
        "role": "admin_dinas"
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    wil_res = client.post("/api/v1/wilayah", json={
        "kode_wilayah": "35.24.05",
        "nama_wilayah": "Kecamatan Bluluk",
        "level": "kecamatan"
    }, headers=admin_headers)
    wil_id = wil_res.json()["id"]

    dinas_res = client.post("/api/v1/dinas", json={
        "nama_dinas": "Dinas Perumahan Rakyat",
        "wilayah_id": wil_id
    }, headers=admin_headers)
    dinas_id = dinas_res.json()["id"]

    proj_res = client.post("/api/v1/proyek", json={
        "nama_proyek": "Pusat Komunitas Pemuda Bluluk",
        "kategori": "gedung_publik",
        "deskripsi": "Gedung serbaguna pemuda desa.",
        "latitude": -7.2600,
        "longitude": 112.0500,
        "wilayah_id": wil_id,
        "dinas_id": dinas_id,
        "anggaran": 750000000,
        "status": "selesai",
        "progres_persen": 100,
        "tanggal_mulai": "2023-03-01",
        "estimasi_selesai": "2023-11-30"
    }, headers=admin_headers)
    proyek_id = proj_res.json()["id"]

    warga1_res = client.post("/api/v1/auth/register", json={
        "nama": "Warga Satu",
        "email": "warga.satu@civictrack.demo",
        "password": "password123",
        "role": "warga"
    })
    warga1_token = warga1_res.json()["access_token"]
    warga1_headers = {"Authorization": f"Bearer {warga1_token}"}

    warga2_res = client.post("/api/v1/auth/register", json={
        "nama": "Warga Dua",
        "email": "warga.dua@civictrack.demo",
        "password": "password123",
        "role": "warga"
    })
    warga2_token = warga2_res.json()["access_token"]
    warga2_headers = {"Authorization": f"Bearer {warga2_token}"}

    # 1. Evaluasi Pertama (Urgensi tinggi -> memicu status 'dalam_peninjauan_ulang')
    eval1_res = client.post(f"/api/v1/proyek/{proyek_id}/evaluasi", json={
        "kategori_masalah": "Atap Gedung Runtuh",
        "deskripsi": "Bagian atap samping runtuh dan berbahaya bila dimasuki."
    }, headers=warga1_headers)
    eval1_id = eval1_res.json()["id"]
    assert client.get(f"/api/v1/proyek/{proyek_id}").json()["status"] == "dalam_peninjauan_ulang"

    # 2. Evaluasi Kedua (Diajukan saat proyek dalam peninjauan ulang)
    eval2_res = client.post(f"/api/v1/proyek/{proyek_id}/evaluasi", json={
        "kategori_masalah": "Pintu Kaca Pecah",
        "deskripsi": "Kaca pintu utama retak akibat gempa ringan."
    }, headers=warga2_headers)
    eval2_id = eval2_res.json()["id"]

    # 3. Admin menyelesaikan Evaluasi 1
    client.patch(f"/api/v1/evaluasi/{eval1_id}/verifikasi", json={
        "status": "selesai_ditindaklanjuti",
        "catatan": "Atap sudah diganti baja ringan baru."
    }, headers=admin_headers)

    # KARENA Evaluasi 2 masih aktif (menunggu_verifikasi), status proyek HARUS TETAP 'dalam_peninjauan_ulang'
    proj_check = client.get(f"/api/v1/proyek/{proyek_id}").json()
    assert proj_check["status"] == "dalam_peninjauan_ulang"

    # 4. Admin menolak Evaluasi 2 (karena bukan kelalaian konstruksi)
    client.patch(f"/api/v1/evaluasi/{eval2_id}/verifikasi", json={
        "status": "ditolak_tidak_terbukti",
        "catatan": "Bukan kerusakan cacat konstruksi awal, melainkan vandalisme."
    }, headers=admin_headers)

    # SEKARANG semua evaluasi aktif telah tuntas, status proyek HARUS kembali ke 'selesai'
    proj_final = client.get(f"/api/v1/proyek/{proyek_id}").json()
    assert proj_final["status"] == "selesai"
