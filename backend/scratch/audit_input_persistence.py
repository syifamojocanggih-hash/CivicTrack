import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def login(email, password="password123"):
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if resp.status_code == 200:
        return resp.json()["access_token"], resp.json().get("user", {})
    return None, resp.text

def audit_all_backend_endpoints():
    print("=" * 70)
    print("AUDIT MENYELURUH SEMUA ENDPOINT BACKEND INPUT / CREATE / UPDATE")
    print("=" * 70)

    token_pimpinan, user_pimpinan = login("pimpinan.pu@civictrack.demo")
    token_admin, user_admin = login("admin.pu@civictrack.demo")
    token_warga, user_warga = login("budi.santoso@civictrack.demo")

    h_pimpinan = {"Authorization": f"Bearer {token_pimpinan}", "Content-Type": "application/json"}
    h_admin = {"Authorization": f"Bearer {token_admin}", "Content-Type": "application/json"}
    h_warga = {"Authorization": f"Bearer {token_warga}", "Content-Type": "application/json"}

    results = {}

    # 1. POST /proyek (Pimpinan)
    p_proj = {
        "nama_proyek": "Pembangunan Saluran Drainase Uji Pimpinan",
        "kategori": "drainase",
        "deskripsi": "Proyek pengujian input dari akun pimpinan daerah",
        "latitude": -7.1120,
        "longitude": 112.1640,
        "wilayah_id": 6, # Kecamatan Babat
        "dinas_id": 1,
        "anggaran": 750000000,
        "status": "berjalan",
        "progres_persen": 10,
        "tanggal_mulai": "2024-01-01",
        "estimasi_selesai": "2024-12-31"
    }
    r = requests.post(f"{BASE_URL}/proyek", json=p_proj, headers=h_pimpinan)
    results["1. POST /proyek (Pimpinan)"] = (r.status_code, "OK - Terbuat ID " + str(r.json().get("id")) if r.status_code == 201 else r.text[:100])
    proj_id = r.json().get("id") if r.status_code == 201 else 1

    # 2. POST /proyek/{id}/tahapan (Admin Dinas)
    p_tahap = {
        "nama_tahap": "Tahap Pengukuran & Pembersihan",
        "progres_persen": 20,
        "catatan": "Pengukuran lahan bersama konsultan pengawas."
    }
    r = requests.post(f"{BASE_URL}/proyek/{proj_id}/tahapan", json=p_tahap, headers=h_admin)
    results["2. POST /proyek/{id}/tahapan (Admin)"] = (r.status_code, "OK" if r.status_code == 201 else r.text[:100])

    # 3. POST /proyek/{id}/laporan (Warga)
    p_lap = {
        "isi_laporan": "Mohon dipasang rambu peringatan karena ada galian tanah di pinggir jalan yang membahayakan pengendara malam hari."
    }
    r = requests.post(f"{BASE_URL}/proyek/{proj_id}/laporan", json=p_lap, headers=h_warga)
    results["3. POST /proyek/{id}/laporan (Warga)"] = (r.status_code, "OK" if r.status_code == 201 else r.text[:100])
    lap_id = r.json().get("id") if r.status_code == 201 else None

    # 4. PUT /laporan/{report_id}/tanggapi (Admin Dinas)
    if lap_id:
        p_tang = {
            "status_tindak_lanjut": "diproses",
            "tanggapan_dinas": "Terima kasih atas laporannya. Petugas lapangan telah diinstruksikan untuk memasang rambu dan lampu barikade hari ini."
        }
        r = requests.put(f"{BASE_URL}/laporan/{lap_id}/tanggapi", json=p_tang, headers=h_admin)
        results["4. PUT /laporan/{id}/tanggapi (Admin)"] = (r.status_code, "OK" if r.status_code == 200 else r.text[:100])

    # 5. Cari proyek berstatus 'selesai' untuk rating & evaluasi
    r_list = requests.get(f"{BASE_URL}/proyek?status=selesai")
    selesai_projs = r_list.json().get("items", [])
    selesai_id = selesai_projs[0]["id"] if selesai_projs else None

    # 6. POST /proyek/{id}/rating (Warga)
    if selesai_id:
        p_rate = {
            "skor": 5,
            "komentar": "Kualitas jalan halus dan penerangan sangat baik."
        }
        r = requests.post(f"{BASE_URL}/proyek/{selesai_id}/rating", json=p_rate, headers=h_warga)
        results["5. POST /proyek/{id}/rating (Warga)"] = (r.status_code, "OK" if r.status_code == 201 else r.text[:100])

        # 7. POST /proyek/{id}/evaluasi (Warga)
        p_eval = {
            "kategori_masalah": "Retak Rambut",
            "deskripsi": "Aspal permukaan mulai bergelombang halus di kilometer 2."
        }
        r = requests.post(f"{BASE_URL}/proyek/{selesai_id}/evaluasi", json=p_eval, headers=h_warga)
        results["6. POST /proyek/{id}/evaluasi (Warga)"] = (r.status_code, "OK" if r.status_code == 201 else r.text[:100])
        eval_id = r.json().get("id") if r.status_code == 201 else None

        # 8. PATCH /evaluasi/{id}/verifikasi (Admin Dinas)
        if eval_id:
            p_verif = {
                "status": "terverifikasi_perlu_tindak_lanjut",
                "catatan": "Dijadwalkan inspeksi teknis dan penambalan aspal pada masa retensi."
            }
            r = requests.patch(f"{BASE_URL}/evaluasi/{eval_id}/verifikasi", json=p_verif, headers=h_admin)
            results["7. PATCH /evaluasi/{id}/verifikasi (Admin)"] = (r.status_code, "OK" if r.status_code == 200 else r.text[:100])

    # 9. POST /proyek/{id}/subscribe (Warga)
    r = requests.post(f"{BASE_URL}/proyek/{proj_id}/subscribe", headers=h_warga)
    results["8. POST /proyek/{id}/subscribe (Warga)"] = (r.status_code, "OK" if r.status_code == 200 else r.text[:100])

    # 10. PUT /proyek/{id} (Admin Dinas)
    p_update = {
        "progres_persen": 25,
        "catatan_perubahan": "Pengecoran pondasi rampung dan bekisting dilepas."
    }
    r = requests.put(f"{BASE_URL}/proyek/{proj_id}", json=p_update, headers=h_admin)
    results["9. PUT /proyek/{id} (Admin)"] = (r.status_code, "OK" if r.status_code == 200 else r.text[:100])

    print("\nHASIL AUDIT BACKEND API:")
    for ep, (status_code, detail) in results.items():
        print(f"[{status_code}] {ep} -> {detail}")

if __name__ == "__main__":
    audit_all_backend_endpoints()
