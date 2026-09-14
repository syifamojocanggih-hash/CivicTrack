# CivicTrack Backend API (FastAPI + MySQL)

Backend REST API untuk platform **CivicTrack** (Transparansi dan Akuntabilitas Proyek Pembangunan Daerah) yang dibangun menggunakan framework **FastAPI**, basis data **MySQL**, dan integrasi **Google Gemini AI**.

Proyek ini mengimplementasikan seluruh kebutuhan fungsional (12 fitur) dan skema basis data (14 tabel) sesuai dengan *Product Requirement Document* (PRD).

---

## Daftar Fitur Sesuai PRD

1. **Peta Lokasi Proyek Berjenjang (Skala Desa hingga Kabupaten)**: API hierarki wilayah administratif dan layer poligon spasial (GeoJSON).
2. **Progress dan Timeline Proyek**: Riwayat tahapan linimasa, persentase progres (0–100%), dan estimasi tanggal penyelesaian.
3. **Dashboard Pemerintah**: Panel kontrol CRUD proyek bagi admin dinas dan pimpinan instansi dengan Role-Based Access Control (RBAC).
4. **Dokumentasi Perkembangan**: Upload dan penyimpanan foto/video fisik proyek per tahapan linimasa dengan validasi format dan ukuran file.
5. **Laporan dan Tanggapan Masyarakat**: Kanal partisipasi warga dengan respons resmi dinas, dilengkapi sensor otomatis kata-kata tidak pantas (*profanity filter*).
6. **Notifikasi Pembaruan Proyek**: Sistem langganan (*subscribe*) pembaruan proyek yang memicu notifikasi otomatis ke warga saat progres berubah.
7. **Pencarian dan Filter Proyek**: Filter hierarkis wilayah, kategori pekerjaan (*jalan, taman, drainase, dll.*), status pengerjaan, dan rentang anggaran.
8. **Statistik dan Grafik Agregat**: Endpoint analitik ringkasan proyek per status, serapan anggaran, dan distribusi per wilayah.
9. **Ekspor Data Terbuka (Open Data API)**: Endpoint publik tanpa login (`/api/v1/open-data/proyek`) format JSON dan GeoJSON untuk jurnalis, akademisi, dan LSM.
10. **Rating Kepuasan Masyarakat**: Penilaian bintang (1–5) dan ulasan warga khusus untuk proyek yang telah berstatus *Selesai*.
11. **Rekomendasi Rute Alternatif Berbasis AI**: Pemanfaatan Google Gemini API untuk menganalisis pengalihan arus lalu lintas terstruktur dalam 3 skala prioritas (*Utama, Kedua, Tambahan*).
12. **Evaluasi Pembangunan Pasca-Proyek**: Pengaduan cacat fisik pasca-proyek dengan skor urgensi otomatis oleh AI (1–5), verifikasi dinas, dan jejak audit (*audit trail*).

---

## Prasyarat Sistem

- Python 3.10+ (Diuji pada Python 3.14)
- Server MySQL 8.0+ (XAMPP, Laragon, Docker, atau MySQL Community Server)

---

## Panduan Instalasi & Menjalankan Backend

### 1. Masuk ke Direktori Backend
```bash
cd backend
```

### 2. Buat & Aktifkan Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux / MacOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependensi
```bash
pip install -r requirements.txt
```

### 4. Konfigurasi Database MySQL & File `.env`
1. Buka MySQL client (phpMyAdmin / MySQL Workbench / Terminal MySQL).
2. Buat database dan tabel dengan mengeksekusi file:
   - `backend/database/schema.sql` (Membuat 14 tabel basis data)
   - `backend/database/seed.sql` (Mengisi data dummy contoh lengkap)

   *Atau jalankan via terminal:*
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```

3. Buat file `.env` dari contoh template `.env.example`:
   ```ini
   APP_NAME="CivicTrack API"
   ENVIRONMENT=development
   DEBUG=True

   # Sesuaikan user, password, host, port, dan nama database MySQL Anda
   DATABASE_URL=mysql+pymysql://root:@localhost:3306/civictrack_db

   SECRET_KEY=civictrack-super-secret-key-development-change-in-production-2025
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=120
   REFRESH_TOKEN_EXPIRE_DAYS=7

   # Opsional: Masukkan API key dari https://aistudio.google.com/
   # (Jika kosong, sistem akan menggunakan fallback cerdas otomatis tanpa error)
   GEMINI_API_KEY=
   ```

### 5. Jalankan Server Pengembangan
```bash
uvicorn app.main:app --reload --port 8000
```

Server akan aktif di:
- **API Base URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

---

## Akun Demo Siap Pakai (dari `seed.sql`)

Semua akun di bawah memiliki password: **`password123`**

| Role | Email | Nama | Keterangan |
|---|---|---|---|
| **Admin Dinas** | `admin.pu@bojonegoro.go.id` | Ir. Hendro Wijaya | Hak akses input proyek, tahapan, dokumentasi, verifikasi evaluasi |
| **Pimpinan Instansi** | `pimpinan.pu@bojonegoro.go.id` | Drs. H. M. Fauzi, M.Si | Hak akses monitoring pimpinan seluruh proyek & dinas |
| **Warga** | `budi.santoso@gmail.com` | Budi Santoso | Hak akses langganan proyek, rating, kirim laporan aduan |
| **Warga** | `siti.nurhaliza@gmail.com` | Siti Nurhaliza | Hak akses pelaporan & evaluasi cacat pasca-proyek |
| **Media / Peneliti**| `rahmat.peneliti@unair.ac.id`| Dr. Rahmat Hidayat | Akses data historis dan Open Data API |

---

## Menjalankan Automated Test Suite

Pengujian otomatis mencakup unit test validasi, otentikasi JWT, proteksi otorisasi peran RBAC, dan integrasi seluruh alur 12 fitur PRD:

```bash
pytest -v
```

Hasil uji:
- `test_full_civictrack_features_flow`: End-to-end seluruh alur 12 fitur PRD
- `test_register_and_login_flow`: Registrasi, otentikasi JWT, token refresh
- `test_rbac_protection`: Pembatasan hak akses endpoint administratif
- `test_profanity_detector`: Filter deteksi kata-kata tidak pantas
- `test_profanity_sanitizer`: Sensor otomatis teks aduan masyarakat
- `test_password_hash_and_verify`: Validasi keamanan hash bcrypt kata sandi
