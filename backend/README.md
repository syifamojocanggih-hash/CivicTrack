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
python -m uvicorn app.main:app --reload --port 8000
```
*(Catatan Windows: Menjalankan via `python -m uvicorn` mencegah pemblokiran `uvicorn.exe` oleh Windows Application Control / AppLocker)*


Server akan aktif di:
- **API Base URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

---

## Alur Kerja Pengembangan Docker (Development Workflow & Rebuild Rules)

> [!IMPORTANT]
> **ATURAN WAJIB REBUILD IMAGE DOCKER SAAT DEPENDENSI BERUBAH:**
> Setiap kali terdapat penambahan atau perubahan pustaka/dependensi pada:
> - **`backend/requirements.txt`** (misal penambahan `Pillow`, `slowapi`, dll.)
> - **`frontend/package.json`** (misal penambahan pustaka UI/NPM baru)
> 
> Pengembang **WAJIB** menjalankan perintah build dari root direktori proyek:
> ```bash
> docker compose up -d --build
> ```
> **PENTING: Jangan hanya menjalankan `docker compose restart`.** Perintah `restart` hanya mengulang container yang sudah ada tanpa memperbarui layer image Docker, sehingga dependensi baru tidak akan terpasang di container dan mengakibatkan error fatal saat runtime (`ModuleNotFoundError` / container crash-restart loop).

## Akun Demo Siap Pakai (dari `seed.sql` & `seed.py`)

Semua akun di bawah memiliki password: **`password123`** (domain demo fiktif `@civictrack.demo`):

| Role | Email | Nama Fiktif | Keterangan |
|---|---|---|---|
| **Admin Dinas** | `admin.pu@civictrack.demo` | Bambang Suryono, S.T. | Hak akses input proyek, tahapan, dokumentasi, verifikasi evaluasi |
| **Pimpinan Instansi** | `pimpinan.pu@civictrack.demo` | Drs. Joko Prasetyo, M.Si | Hak akses monitoring pimpinan seluruh proyek & dinas |
| **Warga** | `budi.santoso@civictrack.demo` | Budi Santoso | Hak akses langganan proyek, rating, kirim laporan aduan |
| **Warga** | `siti.nurhaliza@civictrack.demo` | Siti Nurhaliza | Hak akses pelaporan & evaluasi cacat pasca-proyek |
| **Media / Peneliti**| `rahmat.peneliti@civictrack.demo`| Dr. Rahmat Hidayat | Akses data historis dan Open Data API |

---

## Atribusi Sumber Data Wilayah Spasial
Batas administratif 27 kecamatan Kabupaten Lamongan bersumber dari:
- **Penyedia Data**: Badan Pusat Statistik (BPS) Republik Indonesia dan Badan Informasi Geospasial (BIG).
- **Kompilasi Global**: UN OCHA Humanitarian Data Exchange (HDX) - [Indonesia Subnational Administrative Boundaries (COD-AB)](https://data.humdata.org/dataset/cod-ab-idn).
- **Lisensi**: [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) & CC BY-IGO.
- **Keterangan Provenance**: Dataset geometri desa/kelurahan resmi BPS/BIG dari HDX diproses *dissolve* tingkat kecamatan (melalui repositori pendukung `JfrAziz/indonesia-district` yang memisahkan batas per wilayah) kemudian disederhanakan topologinya dengan Shapely untuk performa web GIS.

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
- `test_point_in_polygon_algorithm` & `test_api_point_in_polygon_rejection`: Validasi geospasial koordinat terhadap poligon batas wilayah (Point-in-Polygon)
- `test_progres_persen_validation`: Validasi integritas persentase progres dan audit trail penurunan progres
- `test_media_upload_security_validation`: Validasi integritas biner, pencegahan file executable/spoofing, dan pembatasan ukuran media

---

## Keamanan Unggahan Berkas Media (Security & File Integrity)

Sesuai ketentuan **PRD Bagian 10.1**, berkas dokumentasi fisik dan bukti evaluasi diproteksi dengan mekanisme validasi biner mendalam (*in-process integrity check*):

1. **Pemeriksaan Signature Biner (*Magic Bytes*)**:
   - Memeriksa header biner berkas asli (JPEG: `\xFF\xD8\xFF`, PNG: `\x89PNG`, WebP: `RIFF...WEBP`, MP4/MOV: `...ftyp`, WebM: `\x1A\x45\xDF\xA3`, AVI: `RIFF...AVI`).
   - Mencegah teknik *masquerading* (file executable Windows `MZ`, ELF Linux, skrip PHP/HTML/Shell, atau arsip ZIP/RAR yang di-rename menjadi `.jpg` atau `.mp4`).
2. **Pillow Deep Verification**:
   - Berkas citra diverifikasi menggunakan library `Pillow` (`Image.open().verify()`) sebelum disimpan ke media storage guna memastikan chunk file tidak rusak (*corrupted*) dan mencegah eksploitasi *polyglot file*.
3. **Batas Ukuran Berkas Spesifik**:
   - Berkas Foto: Maksimal **10 MB**.
   - Berkas Video: Maksimal **30 MB**.
4. **Pencegahan Berkas Sampah (*Zero-Garbage Pre-Write*)**:
   - Seluruh validasi dilakukan di memory stream sebelum file ditulis ke disk/volume. Jika ditolak (HTTP 422), tidak ada file sementara yang tersisa di storage.

> **Catatan Arsitektur Keamanan**:
> Validasi ini menjamin integritas struktural dan signature format berkas (bukan pemindaian virus universal dengan database malware signature).
> **Roadmap Skala Enterprise (Pengembangan Lanjutan)**: Untuk deployment produksi skala besar dengan volume publik masif, arsitektur dapat ditingkatkan dengan menambahkan service kontainer **ClamAV Antivirus Daemon** (`clamav/clamav:latest` via socket `pyclamd` port 3310) pada `docker-compose.yml` untuk pemindaian signature malware sebelum berkas diteruskan ke object storage (S3/MinIO).

---

## Proteksi Anti-Spam & Rate Limiting Laporan Masyarakat (PRD Bagian 10.2)

Untuk mencegah spam otomatis, bot flooding, dan input asal-asalan pada kanal laporan masyarakat:

1. **Validasi Panjang Teks Wajar**:
   - `isi_laporan` divalidasi dengan sanitasi `.strip()`. Teks tidak boleh kosong atau hanya berisi spasi.
   - Panjang teks minimal **10 karakter non-spasi** dan maksimal **2000 karakter**.
   - Dilengkapi penyaringan kata kasar otomatis (*profanity filter*).
2. **Rate Limiting (SlowAPI)**:
   - Dibatasi maksimal **5 laporan per 10 menit** (`5/10minute`) per pengguna (`user_id` dari JWT, fallback ke IP remote client).
   - Pengiriman yang melebihi batas langsung ditolak dengan status **HTTP 429 Too Many Requests** beserta header `Retry-After`.

> **Catatan Arsitektur & Known Limitation**:
> Rate limiting in-memory (`slowapi` dengan `MemoryStorage`) ini bekerja akurat untuk lingkungan *single-process / single-worker* (sebagaimana `docker-compose.yml` saat ini yang menjalankan 1 kontainer backend).
> Jika di masa mendatang sistem di-scale ke multiple workers (misal Gunicorn multi-worker) atau multiple replica containers di Kubernetes/Docker Swarm, penyimpanan in-memory tidak lagi tersinkronisasi antar-worker. Pada skala multi-worker tersebut, storage limiter perlu dialihkan ke **Redis Storage** (`storage_uri="redis://redis:6379/1"`).

---

## Known Issues & Arsitektur TODO

1. **Penyimpanan Mentah `[RAW_AI_DEBUG]` pada `ringkasan_analisis_ai` (Tabel `evaluasi_pembangunan`)**:
   - **Konteks**: Berbeda dengan tabel `rekomendasi_rute` yang telah memiliki kolom mandiri `raw_response_ai`, skema tabel `evaluasi_pembangunan` belum memiliki kolom khusus tersebut.
   - **Status Sementara**: Untuk persistensi audit tanpa merubah skema migrasi tabel yang sedang berjalan, respons mentah AI saat ini disisipkan dengan separator `\n\n[RAW_AI_DEBUG]:` di ujung kolom `ringkasan_analisis_ai`.
   - **Aturan Frontend**: Seluruh frontend dilarang keras merender teks setelah tanda `[RAW_AI_DEBUG]:` secara mentah ke antarmuka pengguna (UI).
   - **TODO Solusi Permanen**: Penambahan kolom `raw_response_ai TEXT` pada tabel `evaluasi_pembangunan` atau tabel audit log terpisah melalui migrasi basis data terjadwal berikutnya.


