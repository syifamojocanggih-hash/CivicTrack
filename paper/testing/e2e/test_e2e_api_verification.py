import requests
import json
import uuid
import sys
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

results = {}

def log_step(name, passed, detail, resp=None):
    results[name] = {
        "status": "PASS" if passed else "FAIL",
        "detail": detail,
        "response": resp
    }
    print(f"[{'PASS' if passed else 'FAIL'}] {name}: {detail}")

print("=== Starting E2E Verification with Fresh Unprivileged Accounts ===")

# 1. Register 3 fresh users with random unique emails
uid = uuid.uuid4().hex[:6]
warga_email = f"warga.fresh.{uid}@testcivic.id"
admin_email = f"admin.fresh.{uid}@testcivic.id"
pimpinan_email = f"pimpinan.fresh.{uid}@testcivic.id"
password = "Password123!"

# 1a. Register Warga
r_warga = requests.post(f"{BASE_URL}/auth/register", json={
    "nama": f"Warga Uji {uid}",
    "email": warga_email,
    "password": password,
    "role": "warga"
})
pass_reg_warga = r_warga.status_code == 201
warga_token = r_warga.json().get("access_token") if pass_reg_warga else None
log_step("1a. Register Akun Warga Baru", pass_reg_warga, f"Status: {r_warga.status_code}", r_warga.json() if pass_reg_warga else r_warga.text)

# 1b. Register Admin Dinas
r_admin = requests.post(f"{BASE_URL}/auth/register", json={
    "nama": f"Admin Dinas Uji {uid}",
    "email": admin_email,
    "password": password,
    "role": "admin_dinas",
    "dinas_id": 1
})
pass_reg_admin = r_admin.status_code == 201
admin_token = r_admin.json().get("access_token") if pass_reg_admin else None
log_step("1b. Register Akun Admin Dinas Baru", pass_reg_admin, f"Status: {r_admin.status_code}", r_admin.json() if pass_reg_admin else r_admin.text)

# 1c. Register Pimpinan Instansi
r_pim = requests.post(f"{BASE_URL}/auth/register", json={
    "nama": f"Pimpinan Instansi Uji {uid}",
    "email": pimpinan_email,
    "password": password,
    "role": "pimpinan_instansi",
    "dinas_id": 1
})
pass_reg_pim = r_pim.status_code == 201
pimpinan_token = r_pim.json().get("access_token") if pass_reg_pim else None
log_step("1c. Register Akun Pimpinan Instansi Baru", pass_reg_pim, f"Status: {r_pim.status_code}", r_pim.json() if pass_reg_pim else r_pim.text)

# 2. Login verification for the fresh accounts
r_login_w = requests.post(f"{BASE_URL}/auth/login", json={"email": warga_email, "password": password})
pass_login_w = r_login_w.status_code == 200 and "access_token" in r_login_w.json()
if pass_login_w:
    warga_token = r_login_w.json()["access_token"]
log_step("2. Login Akun Baru (Dapatkan Token Asli)", pass_login_w, f"Status: {r_login_w.status_code}", {
    "user": r_login_w.json().get("user"),
    "token_type": r_login_w.json().get("token_type")
} if pass_login_w else r_login_w.text)

headers_warga = {"Authorization": f"Bearer {warga_token}"}
headers_admin = {"Authorization": f"Bearer {admin_token}"}
headers_pim = {"Authorization": f"Bearer {pimpinan_token}"}

# 3a. GET /api/v1/wilayah?level=desa&parent_id=8 (Kecamatan Brondong)
r_desa = requests.get(f"{BASE_URL}/wilayah?level=desa&parent_id=8")
desas = r_desa.json() if r_desa.status_code == 200 else []
pass_3a = r_desa.status_code == 200 and len(desas) == 10 and any(d["nama_wilayah"] == "Kelurahan Brondong" for d in desas)
log_step("3a. GET /api/v1/wilayah (Kecamatan Brondong)", pass_3a, f"Total Desa Ditemukan: {len(desas)}", [d["nama_wilayah"] for d in desas])

# 3b. POST /api/v1/proyek (desa_id valid vs tidak valid)
# Valid: Proyek di Brondong (wilayah_id=8), desa_id=129 (Kelurahan Brondong, parent=8)
proj_valid_payload = {
    "nama_proyek": f"Pembangunan Saluran Drainase Brondong {uid}",
    "kategori": "drainase",
    "deskripsi": "Pembangunan saluran drainase pencegah genangan air pesisir pantai Brondong.",
    "latitude": -6.9020,
    "longitude": 112.2350,
    "wilayah_id": 8,
    "desa_id": 129,
    "dinas_id": 1,
    "anggaran": 500000000.0,
    "status": "berjalan",
    "progres_persen": 25,
    "tanggal_mulai": "2024-01-01",
    "estimasi_selesai": "2024-12-31"
}
r_proj_valid = requests.post(f"{BASE_URL}/proyek", json=proj_valid_payload, headers=headers_admin)
pass_3b_valid = r_proj_valid.status_code == 201
new_project_id = r_proj_valid.json().get("id") if pass_3b_valid else None
log_step("3b-1. POST /proyek dengan desa_id valid", pass_3b_valid, f"Status: {r_proj_valid.status_code}, Proyek ID: {new_project_id}", {
    "id": new_project_id,
    "nama_proyek": r_proj_valid.json().get("nama_proyek"),
    "wilayah_id": r_proj_valid.json().get("wilayah_id"),
    "desa_id": r_proj_valid.json().get("desa_id")
} if pass_3b_valid else r_proj_valid.text)

# Invalid: Proyek di Brondong (wilayah_id=8), desa_id=46 (Desa Primpen yang parent_id-nya Bluluk/3, bukan 8)
proj_invalid_payload = dict(proj_valid_payload)
proj_invalid_payload["nama_proyek"] = f"Proyek Cacat Wilayah {uid}"
proj_invalid_payload["desa_id"] = 46
r_proj_invalid = requests.post(f"{BASE_URL}/proyek", json=proj_invalid_payload, headers=headers_admin)
pass_3b_invalid = r_proj_invalid.status_code == 422
log_step("3b-2. POST /proyek dengan desa_id lintas kecamatan (Ditolak 422)", pass_3b_invalid, f"Status: {r_proj_invalid.status_code}", r_proj_invalid.json())

# 3c. GET /api/v1/stats/wilayah & /stats/ringkasan
r_ringkasan = requests.get(f"{BASE_URL}/stats/ringkasan")
r_stats_wil = requests.get(f"{BASE_URL}/stats/wilayah")
pass_3c = r_ringkasan.status_code == 200 and r_stats_wil.status_code == 200
wil_data = r_stats_wil.json() if pass_3c else []
ringkasan_data = r_ringkasan.json() if pass_3c else {}
# Cek apakah ada kecamatan yang handled tanpa error
zero_kec = [w for w in wil_data if w.get("total_proyek") == 0]
sample_kec = wil_data[0] if wil_data else {}
log_step("3c. GET /stats/wilayah & /stats/ringkasan", pass_3c and len(wil_data) == 27, f"Total Kecamatan: {len(wil_data)}, Status: {r_ringkasan.status_code}", {
    "ringkasan": ringkasan_data,
    "contoh_wilayah": sample_kec,
    "kecamatan_nol_proyek": len(zero_kec)
})

# 3d. POST /proyek/{id}/subscribe oleh warga -> PUT /proyek/{id} oleh admin -> GET /notifikasi warga
# Subscribe
r_sub = requests.post(f"{BASE_URL}/proyek/{new_project_id}/subscribe", headers=headers_warga)
pass_sub = r_sub.status_code in [200, 201]

# Update progress oleh admin (25 -> 40)
r_update_prog = requests.put(f"{BASE_URL}/proyek/{new_project_id}", json={
    "progres_persen": 40
}, headers=headers_admin)
pass_up_prog = r_update_prog.status_code == 200

# Cek notifikasi akun warga (tunggu hingga 3 detik karena notifikasi diproses via BackgroundTasks)
notifs = []
for _ in range(6):
    time.sleep(0.5)
    r_notif = requests.get(f"{BASE_URL}/notifikasi", headers=headers_warga)
    if r_notif.status_code == 200:
        notifs = r_notif.json()
        if len(notifs) > 0 and any("40" in n.get("pesan", "") for n in notifs):
            break

pass_3d = pass_sub and pass_up_prog and len(notifs) > 0 and any("40" in n.get("pesan", "") for n in notifs)
log_step("3d. Subscribe Warga -> Update Proyek -> Notifikasi Masuk", pass_3d, f"Status Sub: {r_sub.status_code}, Status Update: {r_update_prog.status_code}, Notifikasi Diterima: {len(notifs)}", notifs[0] if notifs else [])

# 3e. POST /proyek/{id}/evaluasi dengan kerusakan berat ("ambles"/"runtuh") -> status berubah ke 'dalam_peninjauan_ulang'
# Buat proyek selesai terlebih dahulu untuk di-evaluasi
proj_selesai_payload = dict(proj_valid_payload)
proj_selesai_payload["nama_proyek"] = f"Pembangunan Jembatan Pesisir {uid}"
proj_selesai_payload["status"] = "selesai"
proj_selesai_payload["progres_persen"] = 100
r_create_selesai = requests.post(f"{BASE_URL}/proyek", json=proj_selesai_payload, headers=headers_admin)
proj_selesai_id = r_create_selesai.json().get("id")

eval_payload = {
    "kategori_masalah": "kerusakan_struktur",
    "deskripsi": "Aspal jalan ambles sedalam 50cm dan abutmen jembatan runtuh parah membahayakan keselamatan pengendara jalan.",
    "skor_urgensi_ai": 5
}
r_eval = requests.post(f"{BASE_URL}/proyek/{proj_selesai_id}/evaluasi", json=eval_payload, headers=headers_warga)
pass_eval_post = r_eval.status_code in [200, 201]

# Cek status proyek sekarang via GET /proyek/{id}
r_check_proj = requests.get(f"{BASE_URL}/proyek/{proj_selesai_id}")
proj_status_after = r_check_proj.json().get("status") if r_check_proj.status_code == 200 else None
pass_3e = pass_eval_post and proj_status_after == "dalam_peninjauan_ulang"
log_step("3e. Evaluasi Kerusakan Berat 'ambles/runtuh' -> Auto Trigger 'dalam_peninjauan_ulang'", pass_3e, f"Status Evaluasi: {r_eval.status_code}, Status Proyek Berubah Menjadi: {proj_status_after}", {
    "proyek_id": proj_selesai_id,
    "status_proyek": proj_status_after,
    "evaluasi": r_eval.json() if pass_eval_post else None
})

# 3f. PUT /proyek/{id} menurunkan progres:
# Tanpa catatan -> Ditolak 422
r_down_no_note = requests.put(f"{BASE_URL}/proyek/{new_project_id}", json={
    "progres_persen": 30
}, headers=headers_admin)
pass_3f_no_note = r_down_no_note.status_code == 422

# Dengan catatan >= 10 karakter -> Diterima 200
r_down_with_note = requests.put(f"{BASE_URL}/proyek/{new_project_id}", json={
    "progres_persen": 30,
    "catatan_perubahan": "Pondasi tergerus banjir rob pesisir pantai sehingga perlu pengecoran ulang"
}, headers=headers_admin)
pass_3f_with_note = r_down_with_note.status_code == 200
pass_3f = pass_3f_no_note and pass_3f_with_note
log_step("3f. Validasi Penurunan Progres Fisik (PRD 10.1)", pass_3f, f"Tanpa Catatan: {r_down_no_note.status_code} (Harus 422), Dengan Catatan: {r_down_with_note.status_code} (Harus 200)", {
    "response_tanpa_catatan": r_down_no_note.json(),
    "response_dengan_catatan": {
        "id": r_down_with_note.json().get("id"),
        "progres_persen": r_down_with_note.json().get("progres_persen"),
        "catatan": "Diterima"
    } if pass_3f_with_note else None
})

# 3g. POST /proyek/{id}/dokumentasi upload file executable/script masquerading sebagai .jpg
files_malicious = {
    'file': ('exploit.jpg', b'MZ\x90\x00\x03\x00\x00\x00ThisIsAnExecutableFile masquerading as image', 'image/jpeg')
}
data_doc = {
    'tipe_media': 'foto'
}
r_doc_malicious = requests.post(f"{BASE_URL}/proyek/{new_project_id}/dokumentasi", files=files_malicious, data=data_doc, headers=headers_admin)
pass_3g = r_doc_malicious.status_code == 422
log_step("3g. Upload Berkas executable/script .jpg (PRD 10.1 Magic Bytes Security)", pass_3g, f"Status: {r_doc_malicious.status_code} (Harus 422 Ditolak)", r_doc_malicious.json())

# Summary output to JSON file
with open("scratch/e2e_verification_report.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("\n=== E2E Verification Completed ===")
