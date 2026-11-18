# Daftar Lengkap & Rincian Teknis Proyek Infrastruktur CivicTrack Kabupaten Lamongan

> **Dataset Seed Fiktif Tervalidasi (`civictrack_db`)**  
> **Tanggal Referensi**: `2026-11-18` · **Total Proyek**: 35 · **Total Pagu**: **Rp 474.020.000.000** (Rp 474,02 M) · **Rata-Rata Progres**: **77.57%**  
> **Daftar Master Akun Terpisah**: Lihat [MASTER_AKUN_CIVICTRACK.md](file:///c:/Users/ASUS/Documents/code/CivicTrack/CivicTrack/MASTER_AKUN_CIVICTRACK.md) (29 akun unik: 5 admin per OPD, 2 pimpinan, 2 peneliti, 20 warga).  
> **Catatan Integritas Wilayah**: Seluruh `wilayah_id` dan `desa_id` diambil langsung dari tabel `wilayah_administratif` resmi (`seed.sql.bak`). Untuk Proyek ID 31 (`SKD-BNJ-031`), desa dipetakan ke `Desa Banjarejo` (`desa_id = 309`, Kecamatan Sukodadi `wilayah_id = 18`) sesuai daftar Kemendagri yang ada di database.

---

## 1. Ringkasan Eksekutif & Validasi Portofolio

| Indikator | Nilai |
| :--- | :--- |
| **Total Proyek** | **35 Proyek** (25 Sedang Berjalan · 6 Selesai · 4 Tertunda) |
| **Total Pagu Anggaran** | **Rp 474.020.000.000** (Rp 474,02 M) |
| **Rata-Rata Progres Fisik** | **77.57%** (`2715 / 35`) |
| **Total Akun Sistem** | **29 Akun Unik** (lihat `MASTER_AKUN_CIVICTRACK.md`) |
| **Skema Kode OPD Kontrak** | `602` PU Bina Marga · `611` SDA · `440` Kesehatan · `640` PRKPCK |

### Sebaran per Kategori Infrastruktur
| Kategori | Jumlah Proyek | Total Pagu Anggaran |
| :--- | :---: | ---: |
| **Jalan Raya & Koridor** (`jalan`) | 15 | Rp 174.720.000.000 |
| **Drainase, Sungai & Irigasi** (`drainase`) | 7 | Rp 45.850.000.000 |
| **Jembatan & Penghubung** (`jembatan`) | 3 | Rp 16.900.000.000 |
| **Gedung & Fasilitas Publik** (`gedung_publik`) | 7 | Rp 220.400.000.000 |
| **Taman & Ruang Terbuka Hijau (RTH)** (`taman`) | 3 | Rp 16.150.000.000 |

### Sebaran per Instansi / OPD
| ID | OPD | Admin Pencatat | Jumlah Proyek | Total Pagu Anggaran |
| :---: | :--- | :--- | :---: | ---: |
| 1 | Dinas PU Bina Marga | Bambang Suryono, S.T. | 21 | Rp 357.120.000.000 |
| 2 | Dinas PRKPCK | Ir. Joko Santoso | 4 | Rp 21.950.000.000 |
| 3 | Dinas Lingkungan Hidup | M. Ali Imron, S.T. | 0 | Rp 0 |
| 4 | Dinas Sumber Daya Air | Erlangga, S.T. | 6 | Rp 40.050.000.000 |
| 5 | Dinas Kesehatan | dr. Taufik Hidayat | 4 | Rp 54.900.000.000 |

---

## 2. Tabel Induk 35 Proyek (Single Source of Truth)

| id | kode | nama | kategori | opd | admin | kecamatan | desa | pagu_rp | status | progres_% | tgl_mulai | estimasi_selesai | tgl_selesai_aktual | kontraktor | konsultan | ppk | kontrak | sirup | pin | catatan_opd | alasan_tunda |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | ---: | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| 1 | `SKD-SKD-001` | [Peningkatan Jalan Sukodadi - Sumberwudi (JAMULA)](#proyek-1) | `jalan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Sukodadi | Sukodadi | 7.920.000.000 | Sedang Berjalan | 78 | 2026-02-02 | 2027-02-15 | - | PT Mega Jaya Abadi Konsorsium | CV Cipta Rekayasa Mandiri | Suyitno, S.T. | `602/SPK-JLN/LAM-JLN-2026-001` | `5384912` | `PJ-48291` | - | - |
| 2 | `PCK-PCK-002` | [Peningkatan Jalan Pucuk - Sekaran (JAMULA)](#proyek-2) | `jalan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Pucuk | Pucuk | 6.850.000.000 | Selesai | 100 | 2025-03-10 | 2026-02-28 | 2026-02-20 | CV Putra Lamongan Konstruksi | CV Mitra Konsultan | Suyitno, S.T. | `602/SPK-JLN/LAM-JLN-2025-002` | `6192047` | `PJ-73054` | - | - |
| 3 | `SGO-GDL-003` | [Rekonstruksi Jalan Sugio - Kedungpring (JAMULA)](#proyek-3) | `jalan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Sugio | Gondanglor | 6.450.000.000 | Sedang Berjalan | 74 | 2026-01-19 | 2027-03-10 | - | PT Surya Bhakti Persada | CV Sinar Karya Konsultan | Suyitno, S.T. | `602/SPK-JLN/LAM-JLN-2026-003` | `4728195` | `PJ-29518` | - | - |
| 4 | `BBT-BBT-004` | [Rekonstruksi Jalan Poros Babat - Sukorame](#proyek-4) | `jalan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Babat | Babat | 9.800.000.000 | Tertunda | 72 | 2025-08-04 | 2026-09-30 | - | PT Duta Bangun Sejahtera | CV Grafika Desain Engineering | Suyitno, S.T. | `602/SPK-JLN/LAM-JLN-2025-004` | `8041563` | `PJ-61842` | - | Revisi desain dinding penahan tanah akibat longsoran bantaran saat curah hujan tinggi |
| 5 | `DKT-SDR-005` | [Peningkatan Jalan Deket - Soko (Koridor Deket - Glagah)](#proyek-5) | `jalan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Deket | Sidorejo | 4.950.000.000 | Sedang Berjalan | 64 | 2026-03-16 | 2027-04-20 | - | CV Berkah Mandiri Abadi | CV Cipta Pratama | Hendra Wijaya, S.T. | `602/SPK-JLN/LAM-JLN-2026-005` | `2957381` | `PJ-94107` | - | - |
| 6 | `TUR-TUR-006` | [Peningkatan Jalan Turi - Kiringan (Kawasan Bengawan Jero)](#proyek-6) | `jalan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Turi | Turi | 4.350.000.000 | Sedang Berjalan | 54 | 2026-05-04 | 2027-05-25 | - | CV Sinar Bengawan Nusantara | CV Cipta Reka Estetika | Hendra Wijaya, S.T. | `602/SPK-JLN/LAM-JLN-2026-006` | `7419268` | `PJ-15639` | - | - |
| 7 | `BRD-BRD-007` | [Peningkatan Jalan Brengkok - Brondong (Pantura)](#proyek-7) | `jalan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Brondong | Brondong | 6.200.000.000 | Sedang Berjalan | 86 | 2025-11-10 | 2027-01-20 | - | PT Tri Tunggal Konstruksiindo | CV Wahana Multi Tehnik | Hendra Wijaya, S.T. | `602/SPK-JLN/LAM-JLN-2025-007` | `3862914` | `PJ-82475` | - | - |
| 8 | `SMB-ARD-008` | [Rekonstruksi Jalan Mantup - Sambeng (Poros Selatan)](#proyek-8) | `jalan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Sambeng | Ardirejo | 8.100.000.000 | Sedang Berjalan | 69 | 2026-02-16 | 2027-03-30 | - | PT Pandu Bangun Kencana | CV Paramita Graha Engineering | Suyitno, S.T. | `602/SPK-JLN/LAM-JLN-2026-008` | `9135720` | `PJ-37920` | - | - |
| 9 | `SKR-SKR-009` | [Peningkatan Jalan Bluluk - Sukorame (Batas Bojonegoro)](#proyek-9) | `jalan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Sukorame | Sukorame | 5.150.000.000 | Tertunda | 64 | 2025-09-15 | 2026-10-15 | - | CV Wijaya Surya Sentosa | CV Prisma Konsultan | Suyitno, S.T. | `602/SPK-JLN/LAM-JLN-2025-009` | `1584029` | `PJ-50361` | - | Keterlambatan pasokan precast U-ditch dan relokasi tiang jaringan listrik PLN di 6 titik |
| 10 | `LRN-PLG-010` | [Rekonstruksi Jalan Laren - Blawi (Sentra Padi)](#proyek-10) | `jalan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Laren | Pelangwot | 5.400.000.000 | Sedang Berjalan | 77 | 2026-01-12 | 2027-02-28 | - | CV Bangun Cipta Samudera | CV Adi Mulya Teknik | Hendra Wijaya, S.T. | `602/SPK-JLN/LAM-JLN-2026-010` | `6420815` | `PJ-66183` | - | - |
| 11 | `TKG-WNK-011` | [Peningkatan Jalan Tikung - Kembangbahu (Sentra Jagung)](#proyek-11) | `jalan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Tikung | Wonokromo | 4.600.000.000 | Sedang Berjalan | 90 | 2025-10-06 | 2026-12-28 | - | CV Graha Indah Semesta | CV Mahameru Konsultan | Hendra Wijaya, S.T. | `602/SPK-JLN/LAM-JLN-2025-011` | `4291638` | `PJ-21947` | - | - |
| 12 | `MDO-MJR-012` | [Peningkatan Jalan Modo - Babat (Koridor Pangan)](#proyek-12) | `jalan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Modo | Mojorejo | 5.850.000.000 | Sedang Berjalan | 82 | 2025-12-01 | 2027-01-31 | - | PT Cipta Usaha Sejahtera | CV Pilar Cipta Pratama | Suyitno, S.T. | `602/SPK-JLN/LAM-JLN-2025-012` | `8753194` | `PJ-88512` | - | - |
| 13 | `KBN-KUR-013` | [Pembangunan Pintu Air & Retensi Kuro (Pengendali Bengawan Jero)](#proyek-13) | `drainase` | Dinas Sumber Daya Air | Erlangga, S.T. | Karangbinangun | Kuro | 12.850.000.000 | Selesai | 100 | 2024-11-04 | 2026-04-30 | 2026-04-18 | PT Brantas Abipraya - Sumber Jaya KSO | PT Yodya Karya (Persero) | Agus Setiawan, S.T. | `611/SPK-DRA/LAM-DRA-2024-001` | `2471950` | `PJ-55219` | - | - |
| 14 | `KBN-KUR-014` | [Pengadaan & Pemasangan Pompa Banjir 3.000 L/dt Pintu Air Kuro](#proyek-14) | `drainase` | Dinas Sumber Daya Air | Erlangga, S.T. | Karangbinangun | Kuro | 6.750.000.000 | Selesai | 100 | 2025-04-07 | 2026-05-31 | 2026-05-25 | PT Mega Surya Teknik Megah | CV Bina Karya Pratama | Agus Setiawan, S.T. | `611/SPK-DRA/LAM-DRA-2025-002` | `7834016` | `PJ-31604` | - | - |
| 15 | `KTG-PCG-015` | [Normalisasi Kali Asin & Pengerukan Bengawan Jero](#proyek-15) | `drainase` | Dinas Sumber Daya Air | Erlangga, S.T. | Kalitengah | Pucangro | 4.500.000.000 | Sedang Berjalan | 72 | 2026-02-09 | 2027-03-15 | - | PT Tirta Dharma Kencana | CV Mitra Tata Lingkungan | Agus Setiawan, S.T. | `611/SPK-DRA/LAM-DRA-2026-003` | `1938542` | `PJ-90731` | - | - |
| 16 | `LMG-SKR-016` | [Saluran Drainase Primer Box Culvert Jl. Veteran & Jl. Basuki Rahmat](#proyek-16) | `drainase` | Dinas PRKPCK | Ir. Joko Santoso | Lamongan | Sukorejo | 5.800.000.000 | Sedang Berjalan | 67 | 2026-03-02 | 2027-04-10 | - | CV Jaya Abadi Konstruksi | CV Multi Rekayasa Graha | Dwi Prasetyo, S.T. | `640/SPK-DRA/LAM-DRA-2026-004` | `6502849` | `PJ-46982` | - | - |
| 17 | `SGO-KDB-017` | [Modernisasi Jaringan Irigasi DI Waduk Gondang](#proyek-17) | `drainase` | Dinas Sumber Daya Air | Erlangga, S.T. | Sugio | Kedungbanjar | 8.900.000.000 | Sedang Berjalan | 83 | 2025-11-03 | 2027-01-30 | - | PT Swakarya Perkasa Mandiri | CV Rekaprima Engineering | Rina Kusuma, S.T. | `611/SPK-DRA/LAM-DRA-2025-005` | `4016793` | `PJ-62415` | - | - |
| 18 | `KGN-KGN-018` | [Rekonstruksi Jembatan Karanggeneng - Maduran](#proyek-18) | `jembatan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Karanggeneng | Karanggeneng | 7.850.000.000 | Tertunda | 68 | 2025-07-14 | 2026-10-31 | - | PT Wira Mandiri Sejati | CV Dian Karya Konsultan | M. Rofiq, S.T. | `602/SPK-JBT/LAM-JBT-2025-001` | `3169482` | `PJ-39046` | - | Kenaikan debit Bengawan Solo menghambat pemancangan abutmen dan fabrikasi gelagar baja komposit |
| 19 | `BBT-BBT-019` | [Penggantian Gelagar & Pelebaran Jembatan Plaosan Babat](#proyek-19) | `jembatan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Babat | Babat | 3.450.000.000 | Sedang Berjalan | 65 | 2026-03-09 | 2027-04-15 | - | CV Sumber Berkah Teknik | CV Sarana Teknik Konsultan | M. Rofiq, S.T. | `602/SPK-JBT/LAM-JBT-2026-002` | `9472615` | `PJ-70523` | - | - |
| 20 | `KBN-KUR-020` | [Pembangunan Jembatan Kuro Penghubung Karangbinangun - Glagah](#proyek-20) | `jembatan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Karangbinangun | Kuro | 5.600.000.000 | Sedang Berjalan | 80 | 2025-12-08 | 2027-02-15 | - | PT Tri Pilar Nusantara | CV Pilar Utama Desain | M. Rofiq, S.T. | `602/SPK-JBT/LAM-JBT-2025-003` | `6815037` | `PJ-14928` | - | - |
| 21 | `BRD-BRD-021` | [Pembangunan RSUD Brondong Pantura (Tahap II)](#proyek-21) | `gedung_publik` | Dinas Kesehatan | dr. Taufik Hidayat | Brondong | Brondong | 24.800.000.000 | Sedang Berjalan | 81 | 2025-08-11 | 2027-03-20 | - | PT Total Bangun Sarana | PT Ciriajasa Engineering Consultants | dr. Chaidir Annas | `440/SPK-GED/LAM-GED-2025-001` | `2089461` | `PJ-95264` | - | - |
| 22 | `LMG-BNJ-022` | [Pembangunan Gedung Laboratorium Kesehatan Daerah (Labkesda)](#proyek-22) | `gedung_publik` | Dinas Kesehatan | dr. Taufik Hidayat | Lamongan | Banjarmendalan | 6.850.000.000 | Selesai | 100 | 2025-01-20 | 2026-07-31 | 2026-07-19 | PT Cipta Bangun Graha | CV Prisma Estetika Desain | dr. Chaidir Annas | `440/SPK-GED/LAM-GED-2025-002` | `7351904` | `PJ-27401` | - | - |
| 23 | `LMG-SKR-023` | [Gedung Bedah & Rawat Inap Terpadu RSUD dr. Soegiri](#proyek-23) | `gedung_publik` | Dinas Kesehatan | dr. Taufik Hidayat | Lamongan | Sukorejo | 18.500.000.000 | Sedang Berjalan | 74 | 2025-10-13 | 2027-04-30 | - | PT Galatama Cipta Graha | PT Virama Karya (Persero) | dr. Nurul Hidayati, M.Kes. | `440/SPK-GED/LAM-GED-2025-003` | `4618295` | `PJ-63817` | - | - |
| 24 | `DKT-SDR-024` | [Rekonstruksi Total Stadion Gelora Surajaya (Standar FIFA)](#proyek-24) | `gedung_publik` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Deket | Sidorejo | 145.000.000.000 | Sedang Berjalan | 75 | 2025-05-05 | 2027-05-31 | - | PT Wijaya Karya Bangunan Gedung Tbk | PT Ciriajasa Engineering Consultants | Ir. Bagus Pratama, M.T. | `602/SPK-GED/LAM-GED-2025-004` | `8924150` | `PJ-41795` | Pembangunan fisik dieksekusi Dinas PU Bina Marga sebagai pelaksana konstruksi strategis untuk Dinas Pemuda dan Olahraga | - |
| 25 | `LMG-JTS-025` | [Revitalisasi Alun-Alun Lamongan & Mandhapa Seni Budaya](#proyek-25) | `taman` | Dinas PRKPCK | Ir. Joko Santoso | Lamongan | Jetis | 8.850.000.000 | Sedang Berjalan | 85 | 2025-11-24 | 2027-01-15 | - | PT Bumi Surya Kencana | CV Ganeshatama Konsultan | Dwi Prasetyo, S.T. | `640/SPK-TMN/LAM-TMN-2025-001` | `7124869` | `PJ-78149` | - | - |
| 26 | `BBT-BBT-026` | [Pembangunan Ruang Terbuka Hijau & Eco-Park Babat](#proyek-26) | `taman` | Dinas PRKPCK | Ir. Joko Santoso | Babat | Babat | 4.100.000.000 | Tertunda | 76 | 2025-07-07 | 2026-09-15 | - | CV Alam Hijau Lestari | CV Mitra Kreasi Alam | Dwi Prasetyo, S.T. | `640/SPK-TMN/LAM-TMN-2025-002` | `2695031` | `PJ-33587` | - | Pemadatan ulang tanah bekas rawa dan penyesuaian pondasi plaza UMKM pasca uji sondir tambahan |
| 27 | `MDR-PNG-027` | [Revitalisasi Ruang Terbuka Publik & Taman Olahraga Maduran](#proyek-27) | `taman` | Dinas PRKPCK | Ir. Joko Santoso | Maduran | Pangean | 3.200.000.000 | Sedang Berjalan | 56 | 2026-04-20 | 2027-05-20 | - | CV Sumber Artha Mandiri | CV Karya Mandiri Desain | Dwi Prasetyo, S.T. | `640/SPK-TMN/LAM-TMN-2026-003` | `8540917` | `PJ-69412` | - | - |
| 28 | `SLK-SLK-028` | [Sentra Pengeringan & Pergudangan Jagung Modern Solokuro](#proyek-28) | `gedung_publik` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Solokuro | Solokuro | 5.900.000.000 | Sedang Berjalan | 69 | 2026-02-23 | 2027-04-05 | - | PT Agronusa Bangun Persada | CV Duta Agritech Konsultan | Ir. Bagus Pratama, M.T. | `602/SPK-GED/LAM-GED-2026-005` | `1367589` | `PJ-84620` | Pembangunan fisik dieksekusi Dinas PU Bina Marga untuk Dinas Ketahanan Pangan dan Pertanian | - |
| 29 | `BRD-BRD-029` | [Fasilitas Cold Storage & TPI Higienis Brondong](#proyek-29) | `gedung_publik` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Brondong | Brondong | 14.600.000.000 | Sedang Berjalan | 71 | 2026-01-05 | 2027-04-20 | - | PT Samudera Maritim Konstruksi | CV Samudera Konsultan Teknik | Ir. Bagus Pratama, M.T. | `602/SPK-GED/LAM-GED-2026-006` | `5903418` | `PJ-52903` | Pembangunan fisik dieksekusi Dinas PU Bina Marga untuk Dinas Perikanan | - |
| 30 | `NGB-NGB-030` | [Puskesmas Rawat Inap & Gedung PONED Ngimbang](#proyek-30) | `gedung_publik` | Dinas Kesehatan | dr. Taufik Hidayat | Ngimbang | Ngimbang | 4.750.000.000 | Sedang Berjalan | 84 | 2025-11-17 | 2027-01-25 | - | CV Sejahtera Bangun Utama | CV Medika Graha Teknik | dr. Nurul Hidayati, M.Kes. | `440/SPK-GED/LAM-GED-2025-007` | `3578240` | `PJ-16378` | - | - |
| 31 | `SKD-BNJ-031` | [Pelebaran & Pengecoran Rigid Jalan Sukodadi - Banjaranyar](#proyek-31) | `jalan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Sukodadi | Banjarejo | 3.800.000.000 | Sedang Berjalan | 58 | 2026-04-13 | 2027-05-10 | - | CV Bangun Prima Perkasa | CV Sentosa Reka Desain | Suyitno, S.T. | `602/SPK-JLN/LAM-JLN-2026-013` | `5194827` | `PJ-43069` | - | - |
| 32 | `KBN-BLW-032` | [Normalisasi Sungai Blawi & Saluran Pembuang Rawa Semando](#proyek-32) | `drainase` | Dinas Sumber Daya Air | Erlangga, S.T. | Karangbinangun | Blawi | 3.650.000.000 | Sedang Berjalan | 75 | 2026-01-26 | 2027-03-05 | - | CV Tirta Alam Subur | CV Graha Cipta Mandiri | Rina Kusuma, S.T. | `611/SPK-DRA/LAM-DRA-2026-006` | `8391275` | `PJ-24188` | - | - |
| 33 | `SKR-SKR-033` | [Pembangunan Embung Konservasi Air Tani Sukorame](#proyek-33) | `drainase` | Dinas Sumber Daya Air | Erlangga, S.T. | Sukorame | Sukorame | 3.400.000.000 | Selesai | 100 | 2025-05-12 | 2026-08-15 | 2026-08-08 | CV Bintang Tani Mandiri | CV Mitra Konsultan Pratama | Rina Kusuma, S.T. | `611/SPK-DRA/LAM-DRA-2025-007` | `5748203` | `PJ-81390` | - | - |
| 34 | `PCR-PCR-034` | [Peningkatan Akses Wisata Bahari Lamongan (WBL) & Sunan Drajat](#proyek-34) | `jalan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Paciran | Paciran | 16.800.000.000 | Selesai | 100 | 2025-02-03 | 2026-06-30 | 2026-06-22 | PT Pesisir Jaya Konstruksi | CV Artha Buana Desain | Hendra Wijaya, S.T. | `602/SPK-JLN/LAM-JLN-2025-014` | `3047519` | `PJ-77426` | - | - |
| 35 | `LMG-PLW-035` | [Pembangunan Jalan Lingkar Utara (JLU) Seksi Deket - Sukodadi](#proyek-35) | `jalan` | Dinas PU Bina Marga | Bambang Suryono, S.T. | Lamongan | Plosowahyu | 78.500.000.000 | Sedang Berjalan | 66 | 2025-06-02 | 2027-08-31 | - | PT Wijaya Karya (Persero) Tbk | PT Disi Putera Mandiri | Yudi Dwi Prasetyo, S.T., M.T. | `602/SPK-JLN/LAM-JLN-2025-015` | `9628401` | `PJ-19853` | - | - |

---

## 3. Rincian Lengkap Seluruh Proyek (ID 1 s/d 35)

<a id="proyek-1"></a>
### Proyek ID 1: Peningkatan Jalan Sukodadi - Sumberwudi (JAMULA)

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `1` |
| Kode Proyek | `SKD-SKD-001` |
| Nama Proyek | Peningkatan Jalan Sukodadi - Sumberwudi (JAMULA) |
| Kategori | `jalan` (Jalan Raya & Koridor) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 7.920.000.000 (Rp 7,92 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan (Prioritas JAMULA) |
| Status | **Sedang Berjalan** |
| Progres | `78%` |
| Tanggal Mulai | `2026-02-02` |
| Estimasi Selesai | `2027-02-15` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JLN/LAM-JLN-2026-001` |
| Kode SiRUP | `5384912` |
| PIN Mandor | `PJ-48291` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Suyitno, S.T.
- **Kontraktor Pelaksana**: PT Mega Jaya Abadi Konsorsium
- **Konsultan Pengawas**: CV Cipta Rekayasa Mandiri
- **Kepala Mandor / Site Manager**: Ahmad Fauzi (Site Coordinator) & Kasirun (Mandor Pengecoran Rigid)

#### C. Lokasi
- **Kecamatan**: Kecamatan Sukodadi (`wilayah_id = 18`, kode `35.24.17`)
- **Desa / Kelurahan**: Desa Sukodadi (`desa_id = 305`, kode `35.24.17.2007`)
- **Koordinat**: `-7.115200, 112.332400`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.115200,112.332400) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.115200,112.332400)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Rekonstruksi perkerasan kaku (rigid pavement CBC) mutu beton Fc' 30 MPa (K-350)
- **Dimensi Utama**: Panjang penanganan 3,10 km (3.100 m), lebar badan jalan 6,0 m, tebal pelat beton 20 cm (0,20 m), peninggian badan jalan 25 cm
- **Perhitungan Volume & Struktur Pendukung**: Volume pelat beton utama 3.100 x 6,0 x 0,20 = 3.720 m3; lapis pondasi bawah agregat kelas A tebal 15 cm (3.100 x 6,0 x 0,15) = 2.790 m3; bahu jalan agregat kelas B lebar 0,75 m kanan-kiri; tulangan dowel D25 mm dan tie bar D13 mm (±Rp 2,55 M/km)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pengukuran Stake-Out, Pembersihan Rumija & Pembongkaran Lapisan Lama | 18% | `2026-03-14` | Pemasangan patok STA 0+000 s/d STA 3+100 tuntas dan pengupasan aspal rusak selesai di sisi selatan. |
| 2 | Penghamparan Agregat Pondasi Kelas A & Pemasangan Bekisting | 46% | `2026-06-22` | Uji kepadatan sand cone segmen Desa Menongo lulus spesifikasi 98% dan bekisting baja siap cor. |
| 3 | Pengecoran Pelat Rigid Pavement K-350 & Cutting Joint Segmen Tengah | 78% | `2026-11-06` | Pengecoran mencapai STA 2+420 dengan hasil uji tekan silinder umur 28 hari rata-rata 32,4 MPa. |

#### F. Dokumentasi
- **Foto Utama**: `jalan_sukodadi_1.jpg` (DB path: `/uploads/jalan_sukodadi_1.jpg`, ukuran 1480 KB, diunggah `2026-11-06` oleh Bambang Suryono, S.T. — pengecoran rigid pavement dan pemasangan dowel bar STA 2+400)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Poros Sukodadi -> Sugio -> Karanggeneng | 5.2 km | 11 menit | Jalur aspal lebar untuk kendaraan roda empat dan angkutan hasil pertanian |
| `kedua` | Jalan Lingkungan Desa Menongo -> Sumberwudi | 3.8 km | 8 menit | Disarankan khusus sepeda motor dan kendaraan ringan warga setempat |

#### H. Aduan Warga
- **Aduan #1** (`2026-09-18`, Pelapor: Budi Santoso, Status: `ditanggapi`):
  - *Isi*: "Rambu pengarah dan lampu suar proyek di tikungan utara Desa Menongo masih kurang terang saat malam sehingga pengendara sering kaget melihat pembatas beton."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2026-09-20`): "Kontraktor telah menambah 4 unit rotary warning light bertenaga surya serta pita reflektor di sepanjang zona pengecoran aktif mulai malam ini."

#### I. Rating
- **Budi Santoso** (`2026-10-04`): **5/5** ★ — *"Permukaan beton cor segmen utara sudah sangat rata dan kokoh, truk gabah kini bisa melintas tanpa selip."*

---

<a id="proyek-2"></a>
### Proyek ID 2: Peningkatan Jalan Pucuk - Sekaran (JAMULA)

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `2` |
| Kode Proyek | `PCK-PCK-002` |
| Nama Proyek | Peningkatan Jalan Pucuk - Sekaran (JAMULA) |
| Kategori | `jalan` (Jalan Raya & Koridor) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 6.850.000.000 (Rp 6,85 M) |
| Sumber Pembiayaan | DAK Fisik Tematik & APBD Kab. Lamongan |
| Status | **Selesai** |
| Progres | `100%` |
| Tanggal Mulai | `2025-03-10` |
| Estimasi Selesai | `2026-02-28` |
| Tanggal Selesai Aktual | `2026-02-20` |
| Nomor Kontrak | `602/SPK-JLN/LAM-JLN-2025-002` |
| Kode SiRUP | `6192047` |
| PIN Mandor | `PJ-73054` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Suyitno, S.T.
- **Kontraktor Pelaksana**: CV Putra Lamongan Konstruksi
- **Konsultan Pengawas**: CV Mitra Konsultan
- **Kepala Mandor / Site Manager**: Sunarto (Site Manager) & Slamet Riyadi (Mandor Beton & Marka)

#### C. Lokasi
- **Kecamatan**: Kecamatan Pucuk (`wilayah_id = 14`, kode `35.24.13`)
- **Desa / Kelurahan**: Desa Pucuk (`desa_id = 240`, kode `35.24.13.2001`)
- **Koordinat**: `-7.098400, 112.285300`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.098400,112.285300) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.098400,112.285300)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Peningkatan jalan kabupaten dengan perkerasan beton rigid pavement K-350
- **Dimensi Utama**: Panjang penanganan 2,85 km (2.850 m, segmen Pucuk-Miru-Kudikan), lebar badan jalan 5,5 m, tebal pelat beton 20 cm (0,20 m)
- **Perhitungan Volume & Struktur Pendukung**: Volume pelat beton utama 2.850 x 5,5 x 0,20 = 3.135 m3; lapis lean concrete K-125 tebal 5 cm (2.850 x 5,5 x 0,05) = 783,75 m3; joint sealant elastis per 5 m; bahu jalan sirtu terpadatkan 0,75 m kanan-kiri; marka termoplastik 2,85 km (±Rp 2,40 M/km)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Mobilisasi Peralatan, Pembersihan Bahu & Lapis Lean Concrete | 22% | `2025-05-08` | Penghamparan lantai kerja K-125 tebal 5 cm selesai dari Pasar Pucuk hingga simpang Desa Miru (STA 0+950). |
| 2 | Pengecoran Rigid Pavement K-350 Lajur Kiri & Kanan Tahap I | 55% | `2025-08-29` | Curing beton dengan karung basah selama 14 hari berjalan tertib tanpa retak susut dini hingga STA 1+750. |
| 3 | Pengecoran Segmen Kudikan & Pemadatan Bahu Jalan Sirtu | 88% | `2025-12-12` | Seluruh segmen pelat utama sepanjang 2,85 km tersambung penuh dan akses dua arah mulai dibuka terbatas. |
| 4 | Pengecatan Marka Termoplastik, Pembersihan Akhir & PHO | 100% | `2026-02-20` | Serah terima pertama (PHO) ditandatangani 8 hari lebih cepat dari jadwal setelah uji core drill memenuhi tebal rencana 20 cm. |

#### F. Dokumentasi
- **Foto Utama**: `jalan_pucuk_2.jpg` (DB path: `/uploads/jalan_pucuk_2.jpg`, ukuran 1620 KB, diunggah `2026-02-20` oleh Bambang Suryono, S.T. — kondisi ruas jalan Pucuk-Sekaran selesai cor lengkap dengan marka termoplastik)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Ruas Pucuk -> Babat -> Sekaran (Via Poros Nasional) | 7.4 km | 14 menit | Dipakai kendaraan logistik selama masa konstruksi berlangsung |
| `kedua` | Jalan Poros Desa Wanar -> Miru -> Kudikan | 4.6 km | 10 menit | Jalur warga lokal selama pengecoran bergantian (kini rute utama sudah dibuka normal 100%) |

#### H. Aduan Warga
- **Aduan #1** (`2025-10-14`, Pelapor: Siti Nurhaliza, Status: `ditanggapi`):
  - *Isi*: "Debu dari hamparan agregat di depan SDN Miru cukup pekat saat siang hari ketika truk material melintas."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2025-10-16`): "Pelaksana telah diinstruksikan melakukan penyiraman air menggunakan truk tangki 3 kali sehari pada pukul 09.00, 12.30, dan 15.30 WIB serta memasang batas kecepatan 20 km/jam di depan sekolah."

#### I. Rating
- **Siti Nurhaliza** (`2026-03-05`): **5/5** ★ — *"Waktu tempuh dari Pucuk menuju Sekaran sekarang terpangkas hampir setengahnya dan tidak lagi tergenang saat hujan."*

#### J. Evaluasi FHO (Serah Terima Akhir)
- **Tanggal Inspeksi FHO**: `2026-08-26` · **Verifikasi Selesai**: `2026-09-14` · **Pelapor / Saksi Warga**: Siti Nurhaliza · **Diverifikasi oleh**: Bambang Suryono, S.T.
- **Kategori Temuan**: Joint Sealant & Bahu Jalan (Skor Urgensi AI: `2/5`)
- **Temuan Lapangan**: Ditemukan 3 titik joint sealant terkelupas sepanjang total 16 m di STA 1+420 dan STA 2+410 serta penurunan minor bahu jalan agregat selebar 40 cm di sekitar gorong-gorong Desa Kudikan akibat gerusan air hujan.
- **Tindak Lanjut & Verifikasi**: CV Putra Lamongan Konstruksi telah mengisi ulang asphaltic joint sealant dan memadatkan ulang bahu jalan dengan agregat kelas B; inspeksi ulang tim teknis Dinas PU Bina Marga dinyatakan memenuhi syarat FHO.

---

<a id="proyek-3"></a>
### Proyek ID 3: Rekonstruksi Jalan Sugio - Kedungpring (JAMULA)

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `3` |
| Kode Proyek | `SGO-GDL-003` |
| Nama Proyek | Rekonstruksi Jalan Sugio - Kedungpring (JAMULA) |
| Kategori | `jalan` (Jalan Raya & Koridor) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 6.450.000.000 (Rp 6,45 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan (Alokasi Khusus JAMULA) |
| Status | **Sedang Berjalan** |
| Progres | `74%` |
| Tanggal Mulai | `2026-01-19` |
| Estimasi Selesai | `2027-03-10` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JLN/LAM-JLN-2026-003` |
| Kode SiRUP | `4728195` |
| PIN Mandor | `PJ-29518` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Suyitno, S.T.
- **Kontraktor Pelaksana**: PT Surya Bhakti Persada
- **Konsultan Pengawas**: CV Sinar Karya Konsultan
- **Kepala Mandor / Site Manager**: H. Suwandi (Site Manager) & Suprapto (Mandor Rigid & Saluran U-Ditch)

#### C. Lokasi
- **Kecamatan**: Kecamatan Sugio (`wilayah_id = 13`, kode `35.24.12`)
- **Desa / Kelurahan**: Desa Gondanglor (`desa_id = 226`, kode `35.24.12.2008`)
- **Koordinat**: `-7.186500, 112.245200`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.186500,112.245200) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.186500,112.245200)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Rekonstruksi perkerasan kaku beton bertulang (rigid pavement) beserta saluran tepi pracetak
- **Dimensi Utama**: Panjang penanganan 2,40 km (2.400 m, segmen Desa Gondanglor s/d Desa Bakalrejo), lebar badan jalan 5,5 m, tebal pelat beton 20 cm (0,20 m)
- **Perhitungan Volume & Struktur Pendukung**: Volume pelat beton rigid 2.400 x 5,5 x 0,20 = 2.640 m3; saluran samping precast U-ditch 50x50 cm berpenutup sepanjang 650 m (650 unit) di titik genangan permukiman; pasangan batu mortar penahan bahu 180 m3 (±Rp 2,69 M/km termasuk U-ditch)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Survei Elevasi, Pembersihan Saluran & Galian U-Ditch Sisi Barat | 20% | `2026-03-04` | Penggalian dudukan saluran tepi sepanjang 650 m di koridor Pasar Sugio dan Desa Gondanglor selesai tanpa mengganggu pipa PDAM. |
| 2 | Pemasangan U-Ditch 50x50 cm & Pemadatan Sub-Base LPA | 49% | `2026-06-18` | Pemasangan 650 unit U-ditch pracetak rampung dan pemadatan LPA lulus uji CBR lapangan rata-rata 92%. |
| 3 | Pengecoran Beton Rigid Segmen Gondanglor - Bakalrejo | 74% | `2026-11-09` | Pelat beton cor mencapai STA 1+780 menuju Desa Bakalrejo dengan sistem buka-tutup satu lajur yang dijaga petugas bendera 24 jam. |

#### F. Dokumentasi
- **Foto Utama**: `jalan_sugio_3.jpg` (DB path: `/uploads/jalan_sugio_3.jpg`, ukuran 1395 KB, diunggah `2026-11-09` oleh Bambang Suryono, S.T. — alat concrete paver dan deretan U-ditch terpasang di ruas Gondanglor-Bakalrejo)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Sugio -> Desa Bedingin -> Desa Sidobogem -> Kedungpring | 5.9 km | 13 menit | Cocok untuk kendaraan roda empat dan mobil boks distribusi |
| `kedua` | Jalan Poros Desa Pangkatrejo -> Desa Supenuh -> Desa Bakalrejo | 4.1 km | 9 menit | Alternatif pendek khusus pengendara sepeda motor |

#### H. Aduan Warga
- *Belum ada aduan warga tercatat hingga `2026-11-18`.*

#### I. Rating
- **Hendra Kusuma** (`2026-10-22`): **4/5** ★ — *"Saluran U-ditch baru di depan pertokoan Gondanglor langsung mengalirkan air hujan dengan lancar, tinggal menunggu pengecoran segmen Bakalrejo selesai."*

---

<a id="proyek-4"></a>
### Proyek ID 4: Rekonstruksi Jalan Poros Babat - Sukorame

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `4` |
| Kode Proyek | `BBT-BBT-004` |
| Nama Proyek | Rekonstruksi Jalan Poros Babat - Sukorame |
| Kategori | `jalan` (Jalan Raya & Koridor) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 9.800.000.000 (Rp 9,80 M) |
| Sumber Pembiayaan | Bantuan Keuangan (BK) Pemprov Jatim & APBD Kab. Lamongan |
| Status | **Tertunda** |
| Progres | `72%` |
| Tanggal Mulai | `2025-08-04` |
| Estimasi Selesai | `2026-09-30` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JLN/LAM-JLN-2025-004` |
| Kode SiRUP | `8041563` |
| PIN Mandor | `PJ-61842` |
| Catatan OPD | - |
| Alasan Tunda | Revisi desain dinding penahan tanah akibat longsoran bantaran saat curah hujan tinggi |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Suyitno, S.T.
- **Kontraktor Pelaksana**: PT Duta Bangun Sejahtera
- **Konsultan Pengawas**: CV Grafika Desain Engineering
- **Kepala Mandor / Site Manager**: Ir. H. Supriyanto (Site Manager) & Darmo Sugiarto (Mandor Beton & DPT)

#### C. Lokasi
- **Kecamatan**: Kecamatan Babat (`wilayah_id = 6`, kode `35.24.05`)
- **Desa / Kelurahan**: Kelurahan Babat (`desa_id = 84`, kode `35.24.05.1003`)
- **Koordinat**: `-7.115000, 112.162000`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.115000,112.162000) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.115000,112.162000)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Rekonstruksi rigid pavement tugas berat disertai dinding penahan tanah (retaining wall) beton bertulang
- **Dimensi Utama**: Panjang penanganan 3,10 km (3.100 m), lebar badan jalan 6,0 m, tebal pelat beton K-350 22 cm (0,22 m)
- **Perhitungan Volume & Struktur Pendukung**: Volume pelat beton jalan 3.100 x 6,0 x 0,22 = 4.092 m3; DPT kantilever K-300 segmen bantaran rawan longsor 180 m x luas penampang 2,00 m2 = 360 m3; bore pile penguat (addendum) 36 titik D40 cm (r=0,20 m) kedalaman 8,0 m (36 x pi x 0,20^2 x 8,0) = 36,19 m3 (~36 m3); total beton struktur = 4.488 m3 (±Rp 2,18 jt/m3 all-in)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pembersihan Koridor, Pembongkaran Aspal Rusak & Persiapan DPT | 24% | `2025-10-11` | Pengupasan perkerasan lama dan pengukuran titik lereng kritis di STA 1+800 s/d STA 1+980 selesai. |
| 2 | Pengecoran Pelat Beton 22 cm Segmen Utara (STA 0+000 - STA 1+800) | 51% | `2026-02-19` | Dua lajur segmen utara telah mencapai umur beton 28 hari dan difungsikan penuh untuk lalu lintas harian. |
| 3 | Pekerjaan Dinding Penahan Tanah Awal & Penanganan Darurat Longsoran | 67% | `2026-08-27` | Hujan lebat memicu pergeseran tanah tebing sepanjang 65 m sehingga pekerjaan cor dihentikan sementara untuk uji tanah ulang. |
| 4 | Pelaksanaan Addendum Bore Pile Penguat & Lanjutan Pengecoran Selatan | 72% | `2026-10-29` | Addendum revisi desain DPT disetujui PPK; 20 dari 36 titik bore pile selesai dibor untuk mengejar keterlambatan jadwal. |

#### F. Dokumentasi
- **Foto Utama**: `jalan_babat_4.jpg` (DB path: `/uploads/jalan_babat_4.jpg`, ukuran 1710 KB, diunggah `2026-10-29` oleh Bambang Suryono, S.T. — pemasangan bore pile dan perkuatan tebing bantaran di ruas Babat-Sukorame)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Babat -> Modo -> Ngimbang -> Sukorame | 14.5 km | 24 menit | Wajib bagi truk sumbu ganda selama zona longsoran tebing diperkuat |
| `kedua` | Jalan Poros Desa Karangkembang -> Desa Truni -> Desa Kebalanpelang | 6.4 km | 14 menit | Jalur lokal bagi kendaraan pribadi roda empat dan sepeda motor |

#### H. Aduan Warga
- **Aduan #1** (`2026-10-12`, Pelapor: Agus Prayitno, Status: `ditanggapi`):
  - *Isi*: "Proyek sudah melewati target selesai akhir September 2026, namun separuh ruas di dekat tebing longsor masih ditutup pelat baja sehingga antrean kendaraan panjang tiap pagi."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2026-10-15`): "Benar, terdapat keterlambatan karena kami wajib merevisi desain dinding penahan tanah dengan tambahan fondasi bore pile pasca longsoran bantaran agar jalan tidak amblas kembali. Addendum perpanjangan waktu telah terbit dan pengerjaan kini dijalankan dalam dua shift."

#### I. Rating
- **Agus Prayitno** (`2026-10-18`): **3/5** ★ — *"Kualitas beton segmen utara sangat baik, namun keterlambatan di titik longsoran cukup mengganggu aktivitas warga yang berangkat kerja ke Pasar Babat."*

---

<a id="proyek-5"></a>
### Proyek ID 5: Peningkatan Jalan Deket - Soko (Koridor Deket - Glagah)

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `5` |
| Kode Proyek | `DKT-SDR-005` |
| Nama Proyek | Peningkatan Jalan Deket - Soko (Koridor Deket - Glagah) |
| Kategori | `jalan` (Jalan Raya & Koridor) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 4.950.000.000 (Rp 4,95 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan (DAU Infrastruktur) |
| Status | **Sedang Berjalan** |
| Progres | `64%` |
| Tanggal Mulai | `2026-03-16` |
| Estimasi Selesai | `2027-04-20` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JLN/LAM-JLN-2026-005` |
| Kode SiRUP | `2957381` |
| PIN Mandor | `PJ-94107` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Hendra Wijaya, S.T.
- **Kontraktor Pelaksana**: CV Berkah Mandiri Abadi
- **Konsultan Pengawas**: CV Cipta Pratama
- **Kepala Mandor / Site Manager**: Didik Mulyono (Site Supervisor) & Sutrisno (Mandor Sub-grade Tambak & Cor Beton)

#### C. Lokasi
- **Kecamatan**: Kecamatan Deket (`wilayah_id = 26`, kode `35.24.25`)
- **Desa / Kelurahan**: Desa Sidorejo (`desa_id = 448`, kode `35.24.25.2001`)
- **Koordinat**: `-7.098200, 112.456100`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.098200,112.456100) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.098200,112.456100)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Peningkatan jalan koridor tambak dengan stabilisasi sub-grade tanah lunak dan perkerasan rigid pavement K-350
- **Dimensi Utama**: Panjang penanganan 1,90 km (1.900 m, segmen Desa Sidorejo s/d Desa Soko), lebar badan jalan 5,5 m, tebal pelat beton 20 cm (0,20 m)
- **Perhitungan Volume & Struktur Pendukung**: Volume pelat beton rigid 1.900 x 5,5 x 0,20 = 2.090 m3; pemasangan geotekstil woven 200 gr/m2 lebar 6,0 m (1.900 x 6,0) = 11.400 m2; timbunan pilihan berbutir tebal 25 cm (1.900 x 6,0 x 0,25) = 2.850 m3; talud pasangan batu kali 420 m x 0,60 m2 = 252 m3 (±Rp 2,61 M/km)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pemasangan Talud Tepi Tambak & Geotekstil Woven Stabilisasi Sub-grade | 19% | `2026-05-02` | Pengeringan bahu tergenang dan penghamparan geotekstil di kawasan tambak Desa Sidorejo berjalan aman tanpa amblesan. |
| 2 | Penimbunan Tanah Pilihan, LPA & Pemasangan Wiremesh M8 | 44% | `2026-08-14` | Elevasi badan jalan naik 25 cm dari muka air tambak tertinggi dan tulangan wiremesh terpasang hingga STA 1+250. |
| 3 | Pengecoran Pelat Beton Rigid Segmen Sidorejo - Rejosari | 64% | `2026-11-11` | Pengecoran telah menuntaskan 1,22 km penuh dengan pemeliharaan curing compound di sisi timur koridor. |

#### F. Dokumentasi
- **Foto Utama**: `jalan_deket_5.jpg` (DB path: `/uploads/jalan_deket_5.jpg`, ukuran 1540 KB, diunggah `2026-11-11` oleh Bambang Suryono, S.T. — pengecoran beton cor di atas lapisan geotekstil koridor tambak Sidorejo)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Ruas Nasional Jl. Raya Lamongan - Gresik (Deketwetan) -> Simpang Duduksampeyan -> Glagah | 8.4 km | 16 menit | Jalur utama bagi kendaraan pengangkut hasil perikanan tambak bertonase besar |
| `kedua` | Jalan Poros Desa Dinoyo -> Desa Laladan -> Desa Soko | 4.1 km | 10 menit | Jalur alternatif warga roda dua dan mobil pikap ringan |

#### H. Aduan Warga
- **Aduan #1** (`2026-10-28`, Pelapor: Nur Hidayah, Status: `ditanggapi`):
  - *Isi*: "Tumpukan material batu belah untuk talud di pinggir jembatan kecil Desa Sidorejo agak mempersempit akses sepeda motor petani tambak saat subuh."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2026-10-30`): "Tim lapangan telah memindahkan stok batu belah ke area stockpile sementara 80 meter di timur jembatan sehingga lebar lintasan motor kembali leluasa."

#### I. Rating
- *Belum ada rating warga tercatat hingga `2026-11-18`.*

---

<a id="proyek-6"></a>
### Proyek ID 6: Peningkatan Jalan Turi - Kiringan (Kawasan Bengawan Jero)

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `6` |
| Kode Proyek | `TUR-TUR-006` |
| Nama Proyek | Peningkatan Jalan Turi - Kiringan (Kawasan Bengawan Jero) |
| Kategori | `jalan` (Jalan Raya & Koridor) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 4.350.000.000 (Rp 4,35 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan (Tanggap Banjir Bengawan Jero) |
| Status | **Sedang Berjalan** |
| Progres | `54%` |
| Tanggal Mulai | `2026-05-04` |
| Estimasi Selesai | `2027-05-25` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JLN/LAM-JLN-2026-006` |
| Kode SiRUP | `7419268` |
| PIN Mandor | `PJ-15639` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Hendra Wijaya, S.T.
- **Kontraktor Pelaksana**: CV Sinar Bengawan Nusantara
- **Konsultan Pengawas**: CV Cipta Reka Estetika
- **Kepala Mandor / Site Manager**: H. Solikin (Site Supervisor) & Karyono (Mandor Peninggian Elevasi & Cor Beton)

#### C. Lokasi
- **Kecamatan**: Kecamatan Turi (`wilayah_id = 22`, kode `35.24.21`)
- **Desa / Kelurahan**: Desa Turi (`desa_id = 383`, kode `35.24.21.2009`)
- **Koordinat**: `-7.068200, 112.388400`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.068200,112.388400) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.068200,112.388400)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Peninggian badan jalan anti-genangan Bengawan Jero dan rekonstruksi rigid pavement K-350
- **Dimensi Utama**: Panjang penanganan 1,75 km (1.750 m, segmen Desa Turi s/d Desa Kemlagilor), lebar badan jalan 5,0 m, tebal pelat beton 20 cm (0,20 m)
- **Perhitungan Volume & Struktur Pendukung**: Volume pelat beton utama 1.750 x 5,0 x 0,20 = 1.750 m3; timbunan peninggian badan jalan tebal 30 cm lebar rata-rata 5,5 m (1.750 x 5,5 x 0,30) = 2.887,5 m3; bahu agregat kelas B lebar 0,75 m kanan-kiri tebal 20 cm (1.750 x 1,5 x 0,20 = 525 m3); gorong-gorong penyeimbang muka air tambak D60 cm 4 titik (±Rp 2,49 M/km)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pemetaan Elevasi Banjir Tahunan & Pemasangan 4 Titik Gorong-Gorong | 17% | `2026-06-15` | Pemasangan pipa beton D60 cm di Desa Turi selesai agar aliran air tambak kanan-kiri tidak terputus. |
| 2 | Penimbunan Peninggian Badan Jalan 30 cm & Pemadatan Vibro Roller | 36% | `2026-08-28` | Elevasi dasar jalan dinaikkan 30 cm di atas rekor genangan 2025 dengan hasil uji kepadatan lapangan 97%. |
| 3 | Pengecoran Pelat Beton K-350 Segmen Turi - Kemlagilor | 54% | `2026-11-10` | Pengecoran pelat beton mencapai STA 0+950 dengan perawatan selimut basah selama 14 hari penuh. |

#### F. Dokumentasi
- **Foto Utama**: `jalan_turi_6.jpg` (DB path: `/uploads/jalan_turi_6.jpg`, ukuran 1440 KB, diunggah `2026-11-10` oleh Bambang Suryono, S.T. — peninggian badan jalan dan pengecoran beton di kawasan Bengawan Jero Turi)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Ruas Nasional Babat-Lamongan (Turi) -> Simpang Sukoanyar -> Kalitengah | 6.3 km | 13 menit | Jalur roda empat dan mobil pengangkut hasil tambak selama pengecoran segmen utara |
| `kedua` | Jalan Poros Desa Kemlagigede -> Desa Keben -> Desa Wangunrejo | 3.9 km | 9 menit | Alternatif warga setempat khusus sepeda motor |

#### H. Aduan Warga
- **Aduan #1** (`2026-10-05`, Pelapor: Slamet Widodo, Status: `ditanggapi`):
  - *Isi*: "Ketinggian badan jalan baru di depan RT 03 Desa Turi lebih tinggi sekitar 35 cm dari akses gang warga, mohon dibuatkan landaian agar motor tidak nyangkut."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2026-10-08`): "Pelaksana telah menambahkan ramp oprit transisi berbahan sirtu padat dan beton rabat di 5 mulut gang warga sepanjang segmen STA 0+200 s/d STA 0+900."

#### I. Rating
- **Slamet Widodo** (`2026-10-25`): **4/5** ★ — *"Elevasi jalan sekarang jauh lebih tinggi dari permukaan air tambak dan oprit masuk gang sudah langsung diperbaiki."*

---

<a id="proyek-7"></a>
### Proyek ID 7: Peningkatan Jalan Brengkok - Brondong (Pantura)

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `7` |
| Kode Proyek | `BRD-BRD-007` |
| Nama Proyek | Peningkatan Jalan Brengkok - Brondong (Pantura) |
| Kategori | `jalan` (Jalan Raya & Koridor) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 6.200.000.000 (Rp 6,20 M) |
| Sumber Pembiayaan | DAK Penugasan Jalan KemenPUPR & APBD Kab. Lamongan |
| Status | **Sedang Berjalan** |
| Progres | `86%` |
| Tanggal Mulai | `2025-11-10` |
| Estimasi Selesai | `2027-01-20` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JLN/LAM-JLN-2025-007` |
| Kode SiRUP | `3862914` |
| PIN Mandor | `PJ-82475` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Hendra Wijaya, S.T.
- **Kontraktor Pelaksana**: PT Tri Tunggal Konstruksiindo
- **Konsultan Pengawas**: CV Wahana Multi Tehnik
- **Kepala Mandor / Site Manager**: Ir. Dadang Hermawan (Site Engineer) & Slamet Riyadi (Mandor Hotmix AC-WC)

#### C. Lokasi
- **Kecamatan**: Kecamatan Brondong (`wilayah_id = 8`, kode `35.24.07`)
- **Desa / Kelurahan**: Kelurahan Brondong (`desa_id = 129`, kode `35.24.07.1010`)
- **Koordinat**: `-6.902300, 112.235400`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-6.902300,112.235400) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-6.902300,112.235400)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Pelapisan ulang (overlay) aspal hotmix 2 lapis (AC-BC dan AC-WC) koridor pesisir Pantura
- **Dimensi Utama**: Panjang penanganan 3,60 km (3.600 m, segmen Desa Brengkok s/d Kelurahan Brondong), lebar perkerasan 6,5 m (luas total 3.600 x 6,5 = 23.400 m2)
- **Perhitungan Volume & Struktur Pendukung**: Lapis AC-BC tebal 6 cm + AC-WC tebal 4 cm (total tebal 10 cm = 0,10 m; volume 23.400 x 0,10 = 2.340 m3; BJ 2,30 ton/m3 -> tonase hotmix = 5.382 ton); perbaikan pondasi agregat kelas A setempat 30% area rusak (7.020 m2 x 0,15 m = 1.053 m3); marka termoplastik 3,60 km dan 180 patok reflektor (±Rp 1,72 M/km)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Patching Lubang, Perbaikan Pondasi Agregat & Prime Coat | 26% | `2026-02-14` | Pembongkaran titik aspal bergelombang di sekitar simpang Desa Brengkok dan pemadatan LPA setempat selesai. |
| 2 | Penghamparan Lapis Antara Hotmix AC-BC Tebal 6 cm | 58% | `2026-06-30` | Penghamparan AC-BC menggunakan asphalt finisher selesai sepanjang 3,60 km dengan suhu hampar stabil 142 C. |
| 3 | Penghamparan Lapis Aus AC-WC Tebal 4 cm & Pemasangan Patok Reflektor | 86% | `2026-11-08` | Lapisan aus AC-WC rampung hingga STA 3+100 (Kelurahan Brondong) dan uji core drill aspal memenuhi tebal minimal 9,9 cm. |

#### F. Dokumentasi
- **Foto Utama**: `jalan_brondong_7.jpg` (DB path: `/uploads/jalan_brondong_7.jpg`, ukuran 1590 KB, diunggah `2026-11-08` oleh Bambang Suryono, S.T. — penghamparan hotmix AC-WC dan pemadatan tandem roller koridor Brengkok-Brondong)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Jalur Arteri Daendels (Sedayulawas -> Lohgung -> Brondong) | 5.8 km | 11 menit | Jalur kendaraan logistik pelabuhan dan bus antarkota selama penghamparan aspal malam |
| `kedua` | Jalan Poros Desa Sendangharjo -> Desa Sidomukti -> Desa Lembor | 4.7 km | 10 menit | Jalur pengalihan roda dua dan kendaraan niaga ringan warga pesisir |

#### H. Aduan Warga
- **Aduan #1** (`2026-07-19`, Pelapor: Rina Wulandari, Status: `ditanggapi`):
  - *Isi*: "Pengaspalan pada jam berangkat nelayan pukul 06.00 WIB membuat truk es dan sepeda motor warga Brondong terjebak macet panjang."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2026-07-21`): "Jadwal penghamparan hotmix telah dialihkan ke jendela kerja malam pukul 21.00-04.30 WIB agar aktivitas pagi menuju TPI Brondong tidak terhambat."

#### I. Rating
- **Rina Wulandari** (`2026-11-12`): **5/5** ★ — *"Aspal hotmix di ruas Brengkok sampai Brondong mulus sekali dan pengerjaan malam hari tidak lagi bikin macet pagi."*

---

<a id="proyek-8"></a>
### Proyek ID 8: Rekonstruksi Jalan Mantup - Sambeng (Poros Selatan)

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `8` |
| Kode Proyek | `SMB-ARD-008` |
| Nama Proyek | Rekonstruksi Jalan Mantup - Sambeng (Poros Selatan) |
| Kategori | `jalan` (Jalan Raya & Koridor) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 8.100.000.000 (Rp 8,10 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan (Prioritas Poros Selatan) |
| Status | **Sedang Berjalan** |
| Progres | `69%` |
| Tanggal Mulai | `2026-02-16` |
| Estimasi Selesai | `2027-03-30` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JLN/LAM-JLN-2026-008` |
| Kode SiRUP | `9135720` |
| PIN Mandor | `PJ-37920` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Suyitno, S.T.
- **Kontraktor Pelaksana**: PT Pandu Bangun Kencana
- **Konsultan Pengawas**: CV Paramita Graha Engineering
- **Kepala Mandor / Site Manager**: Ahmad Zaenuri (Mandor Pelebaran & Rigid Pavement K-350)

#### C. Lokasi
- **Kecamatan**: Kecamatan Sambeng (`wilayah_id = 12`, kode `35.24.11`)
- **Desa / Kelurahan**: Desa Ardirejo (`desa_id = 206`, kode `35.24.11.2010`)
- **Koordinat**: `-7.285400, 112.285600`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.285400,112.285600) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.285400,112.285600)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Pelebaran dan rekonstruksi perkerasan kaku (rigid pavement CBC) K-350 poros selatan
- **Dimensi Utama**: Panjang penanganan 3,20 km (3.200 m, segmen Desa Ardirejo s/d batas Mantup), pelebaran badan jalan dari 4,5 m menjadi 6,0 m (tambahan 1,5 m), tebal pelat beton 20 cm (0,20 m)
- **Perhitungan Volume & Struktur Pendukung**: Volume pelat beton utama 3.200 x 6,0 x 0,20 = 3.840 m3; pondasi agregat kelas A zona pelebaran tebal 25 cm (3.200 x 1,5 x 0,25) = 1.200 m3; saluran pasangan batu mortar samping jalan 800 m x 0,50 m2 = 400 m3 (±Rp 2,53 M/km)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pembersihan Tebing Bahu, Galian Pelebaran 1,5 m & Pasangan Saluran Batu | 21% | `2026-04-17` | Galian pelebaran sisi timur-barat sepanjang 3,20 km rampung dan 520 m saluran pasangan batu di Desa Ardirejo selesai terpasang. |
| 2 | Penghamparan Agregat Kelas A Zona Pelebaran & Pemasangan Bekisting | 45% | `2026-07-24` | Pemadatan agregat kelas A pada bahu pelebaran lulus uji proof rolling tanpa defleksi di segmen Desa Garung. |
| 3 | Pengecoran Pelat Rigid Pavement K-350 Lajur Penuh 6,0 m | 69% | `2026-11-05` | Pengecoran mencapai STA 2+210 menuju Desa Pasarlegi dengan mutu uji tekan laboratorium 28 hari sebesar 31,8 MPa. |

#### F. Dokumentasi
- **Foto Utama**: `jalan_sambeng_8.jpg` (DB path: `/uploads/jalan_sambeng_8.jpg`, ukuran 1515 KB, diunggah `2026-11-05` oleh Bambang Suryono, S.T. — pengecoran pelebaran jalan 6 meter di poros Ardirejo-Mantup)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Sambeng (Pasarlegi) -> Ngimbang -> Mantup (Via Poros Selatan Barat) | 11.2 km | 20 menit | Jalur kendaraan angkutan jagung dan kayu bertonase sedang-berat |
| `kedua` | Jalan Desa Semampirejo -> Desa Tenggiring -> Desa Sumberdadi (Mantup) | 5.4 km | 12 menit | Jalur pintas khusus sepeda motor dan mobil pribadi |

#### H. Aduan Warga
- *Belum ada aduan warga tercatat hingga `2026-11-18`.*

#### I. Rating
- **M. Syafi'i** (`2026-10-30`): **4/5** ★ — *"Pelebaran menjadi 6 meter sangat membantu karena truk pengangkut tebu dari Sambeng ke Mantup sekarang bisa berpapasan dengan aman."*

---

<a id="proyek-9"></a>
### Proyek ID 9: Peningkatan Jalan Bluluk - Sukorame (Batas Bojonegoro)

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `9` |
| Kode Proyek | `SKR-SKR-009` |
| Nama Proyek | Peningkatan Jalan Bluluk - Sukorame (Batas Bojonegoro) |
| Kategori | `jalan` (Jalan Raya & Koridor) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 5.150.000.000 (Rp 5,15 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan |
| Status | **Tertunda** |
| Progres | `64%` |
| Tanggal Mulai | `2025-09-15` |
| Estimasi Selesai | `2026-10-15` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JLN/LAM-JLN-2025-009` |
| Kode SiRUP | `1584029` |
| PIN Mandor | `PJ-50361` |
| Catatan OPD | - |
| Alasan Tunda | Keterlambatan pasokan precast U-ditch dan relokasi tiang jaringan listrik PLN di 6 titik |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Suyitno, S.T.
- **Kontraktor Pelaksana**: CV Wijaya Surya Sentosa
- **Konsultan Pengawas**: CV Prisma Konsultan
- **Kepala Mandor / Site Manager**: Supriyadi (Mandor U-Ditch & Pengecoran Rigid)

#### C. Lokasi
- **Kecamatan**: Kecamatan Sukorame (`wilayah_id = 2`, kode `35.24.01`)
- **Desa / Kelurahan**: Desa Sukorame (`desa_id = 32`, kode `35.24.01.2004`)
- **Koordinat**: `-7.338200, 112.115400`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.338200,112.115400) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.338200,112.115400)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Peningkatan jalan perbatasan kabupaten dengan beton rigid pavement K-350 dan drainase U-ditch pracetak
- **Dimensi Utama**: Panjang penanganan 2,05 km (2.050 m, segmen Desa Sukorame s/d Desa Sembung arah Bluluk), lebar badan jalan 5,5 m, tebal pelat beton 20 cm (0,20 m)
- **Perhitungan Volume & Struktur Pendukung**: Volume pelat beton rigid 2.050 x 5,5 x 0,20 = 2.255 m3; lapis pondasi agregat kelas A tebal 15 cm (2.050 x 5,5 x 0,15) = 1.691,25 m3; saluran samping precast U-ditch 40x40 cm sepanjang 600 m (600 unit) di segmen padat permukiman (±Rp 2,51 M/km)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pembersihan Rumija, Pengukuran & Penghamparan Lapis Pondasi LPA | 23% | `2025-12-09` | Pekerjaan perataan subgrade dan penghamparan LPA segmen perbatasan Desa Sukorame selesai 1,10 km pertama. |
| 2 | Pengecoran Pelat Rigid Segmen Barat (STA 0+000 - STA 1+310) | 56% | `2026-06-11` | Segmen 1,31 km pertama selesai dicor dan dibuka satu lajur, sementara 6 titik tiang PLN di STA 1+350 s/d 1+700 masih menunggu jadwal pemindahan. |
| 3 | Pemasangan Bertahap U-Ditch & Persiapan Lanjutan Pasca Relokasi Tiang | 64% | `2026-10-27` | 4 dari 6 tiang PLN telah direlokasi dan pengiriman 320 unit U-ditch susulan baru tiba di lokasi sehingga penyelesaian bergeser melewati jadwal awal 15 Oktober 2026. |

#### F. Dokumentasi
- **Foto Utama**: `jalan_sukorame_9.jpg` (DB path: `/uploads/jalan_sukorame_9.jpg`, ukuran 1465 KB, diunggah `2026-10-27` oleh Bambang Suryono, S.T. — penumpukan precast U-ditch dan titik relokasi tiang listrik di ruas Sukorame-Bluluk)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Sukorame -> Ngimbang -> Bluluk (Via Poros Kecamatan) | 9.6 km | 18 menit | Jalur resmi kendaraan roda empat dan truk pengangkut hasil panen |
| `kedua` | Jalan Poros Desa Banggle -> Desa Kedungrejo -> Desa Songowareng (Bluluk) | 5.1 km | 11 menit | Jalur lokal pengendara sepeda motor menuju arah Bluluk |

#### H. Aduan Warga
- **Aduan #1** (`2026-10-19`, Pelapor: Dwi Hartati, Status: `ditanggapi`):
  - *Isi*: "Jadwal selesai di papan proyek tertulis 15 Oktober 2026, tapi galian saluran di depan Desa Sembung belum tertutup U-ditch dan tiang listrik masih menghalangi pengecoran bahu jalan."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2026-10-22`): "Kami memohon maaf atas keterlambatan ini. Relokasi 4 dari 6 tiang PLN sudah selesai minggu ini dan sisa 2 tiang dijadwalkan pemadaman terencana awal November bersama PLN ULP Babat, sementara stok U-ditch pracetak pengganti telah tiba di lokasi untuk segera dipasang dan ditutup."

#### I. Rating
- **Dwi Hartati** (`2026-10-24`): **2/5** ★ — *"Pekerjaan sempat tersendat lama menunggu tiang listrik dan pasokan U-ditch, semoga setelah relokasi selesai jalan segera dituntaskan sebelum puncak musim hujan."*

---

<a id="proyek-10"></a>
### Proyek ID 10: Rekonstruksi Jalan Laren - Blawi (Sentra Padi)

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `10` |
| Kode Proyek | `LRN-PLG-010` |
| Nama Proyek | Rekonstruksi Jalan Laren - Blawi (Sentra Padi) |
| Kategori | `jalan` (Jalan Raya & Koridor) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 5.400.000.000 (Rp 5,40 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan |
| Status | **Sedang Berjalan** |
| Progres | `77%` |
| Tanggal Mulai | `2026-01-12` |
| Estimasi Selesai | `2027-02-28` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JLN/LAM-JLN-2026-010` |
| Kode SiRUP | `6420815` |
| PIN Mandor | `PJ-66183` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Hendra Wijaya, S.T.
- **Kontraktor Pelaksana**: CV Bangun Cipta Samudera
- **Konsultan Pengawas**: CV Adi Mulya Teknik
- **Kepala Mandor / Site Manager**: M. Sholeh (Site Supervisor) & Warno (Mandor Cerucuk Bambu & Talud Batu Kali)

#### C. Lokasi
- **Kecamatan**: Kecamatan Laren (`wilayah_id = 9`, kode `35.24.08`)
- **Desa / Kelurahan**: Desa Pelangwot (`desa_id = 149`, kode `35.24.08.2011`)
- **Koordinat**: `-6.985200, 112.275400`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-6.985200,112.275400) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-6.985200,112.275400)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Rekonstruksi rigid pavement K-350 dengan stabilisasi cerucuk bambu dan talud penahan tepi sawah
- **Dimensi Utama**: Panjang penanganan 2,15 km (2.150 m, segmen Desa Pelangwot s/d arah Blawi), lebar badan jalan 5,5 m, tebal pelat beton 20 cm (0,20 m)
- **Perhitungan Volume & Struktur Pendukung**: Volume pelat beton rigid 2.150 x 5,5 x 0,20 = 2.365 m3; fondasi cerucuk bambu D10 cm panjang 3,0 m (jarak 0,5 m, 4 baris) pada segmen tanah labil 500 m = 2.000 batang; talud pasangan batu kali 520 m x 0,55 m2 = 286 m3 (±Rp 2,51 M/km)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pemancangan Cerucuk Bambu 2.000 Batang & Pasangan Talud Batu Kali | 25% | `2026-03-27` | Stabilisasi tanah rawa sawah di STA 0+400 s/d STA 0+900 Desa Pelangwot selesai dan talud batu kali sepanjang 520 m berdiri kokoh. |
| 2 | Penghamparan Lapis Pondasi Agregat & Pengecoran Rigid Tahap I | 52% | `2026-07-16` | Pengecoran tahap pertama menuntaskan 1,12 km tanpa retak rambut pasca uji beban awal kendaraan proyek. |
| 3 | Pengecoran Pelat Beton K-350 Segmen Pelangwot - Bulutigo | 77% | `2026-11-04` | Pelat beton telah terpasang sepanjang 1,66 km dan pekerjaan grooving permukaan anti-selip rampung di lajur barat. |

#### F. Dokumentasi
- **Foto Utama**: `jalan_laren_10.jpg` (DB path: `/uploads/jalan_laren_10.jpg`, ukuran 1505 KB, diunggah `2026-11-04` oleh Bambang Suryono, S.T. — pengecoran beton bertulang di atas pasangan talud tepi sawah Desa Pelangwot)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Laren -> Karanggeneng -> Karangbinangun -> Blawi | 10.8 km | 19 menit | Jalur kendaraan pengangkut gabah dan truk logistik pertanian |
| `kedua` | Jalan Poros Desa Durikulon -> Desa Pesanggrahan -> Desa Bulutigo | 4.5 km | 10 menit | Jalur penghubung warga roda dua selama jam pengecoran aktif |

#### H. Aduan Warga
- **Aduan #1** (`2026-09-09`, Pelapor: Fajar Nugroho, Status: `ditanggapi`):
  - *Isi*: "Sisa tanah galian talud di pinggir saluran irigasi Desa Pelangwot sebagian jatuh ke parit sawah sehingga aliran air ke petak padi melambat."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2026-09-11`): "Mandor lapangan telah mengerahkan 6 pekerja untuk membersihkan seluruh tanah buangan dari parit irigasi sawah sepanjang 300 m sehingga debit air kembali normal."

#### I. Rating
- **Fajar Nugroho** (`2026-10-14`): **4/5** ★ — *"Talud penahan sawahnya rapi dan aduan soal parit irigasi langsung dibersihkan dalam dua hari."*

---

<a id="proyek-11"></a>
### Proyek ID 11: Peningkatan Jalan Tikung - Kembangbahu (Sentra Jagung)

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `11` |
| Kode Proyek | `TKG-WNK-011` |
| Nama Proyek | Peningkatan Jalan Tikung - Kembangbahu (Sentra Jagung) |
| Kategori | `jalan` (Jalan Raya & Koridor) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 4.600.000.000 (Rp 4,60 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan |
| Status | **Sedang Berjalan** |
| Progres | `90%` |
| Tanggal Mulai | `2025-10-06` |
| Estimasi Selesai | `2026-12-28` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JLN/LAM-JLN-2025-011` |
| Kode SiRUP | `4291638` |
| PIN Mandor | `PJ-21947` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Hendra Wijaya, S.T.
- **Kontraktor Pelaksana**: CV Graha Indah Semesta
- **Konsultan Pengawas**: CV Mahameru Konsultan
- **Kepala Mandor / Site Manager**: Sujono (Mandor Rigid Pavement & Gorong-Gorong Crossing)

#### C. Lokasi
- **Kecamatan**: Kecamatan Tikung (`wilayah_id = 24`, kode `35.24.23`)
- **Desa / Kelurahan**: Desa Wonokromo (`desa_id = 414`, kode `35.24.23.2001`)
- **Koordinat**: `-7.172400, 112.403800`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.172400,112.403800) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.172400,112.403800)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Rekonstruksi perkerasan kaku rigid pavement K-350 dilengkapi bahu jalan cor beton dan gorong-gorong box
- **Dimensi Utama**: Panjang penanganan 1,85 km (1.850 m, segmen Desa Wonokromo s/d batas Kembangbahu), lebar badan jalan 5,5 m, tebal pelat 20 cm (0,20 m)
- **Perhitungan Volume & Struktur Pendukung**: Volume pelat beton utama 1.850 x 5,5 x 0,20 = 2.035 m3; bahu jalan rabat beton K-175 lebar 0,50 m kanan-kiri tebal 15 cm (1.850 x 1,0 x 0,15 = 277,5 m3); 2 unit gorong-gorong box culvert 100x100 cm panjang 7 m (±Rp 2,49 M/km)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pemasangan 2 Titik Box Culvert Crossing & Perataan Sub-base | 28% | `2025-12-18` | Penggantian dua gorong-gorong rusak di STA 0+450 dan STA 1+320 Desa Wonokromo rampung sebelum pengecoran badan jalan. |
| 2 | Pengecoran Pelat Beton K-350 Lajur Penuh 5,5 m | 68% | `2026-06-25` | Seluruh bentang pelat beton 1,85 km selesai dicor dengan hasil uji kuat tekan umur 28 hari rata-rata 33,1 MPa. |
| 3 | Pengecoran Bahu Jalan K-175 & Persiapan Marka Termoplastik | 90% | `2026-11-12` | Bahu jalan cor beton kanan-kiri telah selesai 1,62 km dan pembersihan sisa bekisting mendekati tahap PHO. |

#### F. Dokumentasi
- **Foto Utama**: `jalan_tikung_11.jpg` (DB path: `/uploads/jalan_tikung_11.jpg`, ukuran 1410 KB, diunggah `2026-11-12` oleh Bambang Suryono, S.T. — finishing bahu cor beton dan marka segmen Wonokromo-Tikung)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Tikung (Jl. Raya Mantup) -> Simpang Bakalanpule -> Kembangbahu | 7.1 km | 14 menit | Jalur utama angkutan hasil panen jagung dari wilayah Tikung selatan |
| `kedua` | Jalan Poros Desa Guminingrejo -> Desa Takeranklating -> Desa Jatirejo | 4.2 km | 9 menit | Jalur cepat khusus sepeda motor warga sekitar |

#### H. Aduan Warga
- **Aduan #1** (`2026-08-03`, Pelapor: Ratna Sari, Status: `ditanggapi`):
  - *Isi*: "Bahu jalan di sisi timur Desa Wonokromo belum dicor sehingga tepi pelat beton memiliki beda tinggi sekitar 18 cm yang rawan bagi pengendara motor saat berpapasan."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2026-08-05`): "Tim pelaksana segera memasang urugan pengaman sementara dari sirtu padat dan mulai mengecor bahu beton rabat K-175 secara bertahap mulai pekan ini."

#### I. Rating
- **Ratna Sari** (`2026-11-14`): **5/5** ★ — *"Jalan sentra jagung Tikung ke Kembangbahu kini sangat mulus dan bahu cor betonnya membuat berkendara jauh lebih aman."*

---

<a id="proyek-12"></a>
### Proyek ID 12: Peningkatan Jalan Modo - Babat (Koridor Pangan)

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `12` |
| Kode Proyek | `MDO-MJR-012` |
| Nama Proyek | Peningkatan Jalan Modo - Babat (Koridor Pangan) |
| Kategori | `jalan` (Jalan Raya & Koridor) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 5.850.000.000 (Rp 5,85 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan |
| Status | **Sedang Berjalan** |
| Progres | `82%` |
| Tanggal Mulai | `2025-12-01` |
| Estimasi Selesai | `2027-01-31` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JLN/LAM-JLN-2025-012` |
| Kode SiRUP | `8753194` |
| PIN Mandor | `PJ-88512` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Suyitno, S.T.
- **Kontraktor Pelaksana**: PT Cipta Usaha Sejahtera
- **Konsultan Pengawas**: CV Pilar Cipta Pratama
- **Kepala Mandor / Site Manager**: Teguh Santoso (Site Manager) & Kusnan (Mandor Cor Beton & Realignment Tikungan)

#### C. Lokasi
- **Kecamatan**: Kecamatan Modo (`wilayah_id = 4`, kode `35.24.03`)
- **Desa / Kelurahan**: Desa Mojorejo (`desa_id = 57`, kode `35.24.03.2011`)
- **Koordinat**: `-7.211600, 112.169500`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.211600,112.169500) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.211600,112.169500)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Peningkatan jalan rigid pavement K-350 disertai perbaikan geometrik tikungan tajam (realignment)
- **Dimensi Utama**: Panjang penanganan 2,20 km (2.200 m, segmen Desa Mojorejo s/d Desa Sumberagung), lebar badan jalan 6,0 m, tebal pelat beton 20 cm (0,20 m)
- **Perhitungan Volume & Struktur Pendukung**: Volume pelat beton utama 2.200 x 6,0 x 0,20 = 2.640 m3; pelebaran superelevasi 2 tikungan radius sempit seluas 480 m2 x 0,20 m = 96 m3 (total beton 2.736 m3); lapis pondasi LPA tebal 15 cm (2.200 x 6,0 x 0,15 = 1.980 m3); patok pengarah tikungan 40 unit (±Rp 2,66 M/km)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pengukuran Geometrik Tikungan & Galian Superelevasi Segmen Mojorejo | 24% | `2026-02-11` | Perbaikan radius tikungan tajam di STA 0+750 dan STA 1+540 tuntas dengan kemiringan melintang 6%. |
| 2 | Penghamparan LPA & Pengecoran Rigid Tahap I (STA 0+000 - STA 1+350) | 57% | `2026-06-29` | Segmen pertama 1,35 km lulus uji kerataan permukaan dan dibuka untuk distribusi gabah petani Modo. |
| 3 | Pengecoran Segmen Sumberagung & Pemasangan Patok Pengarah Tikungan | 82% | `2026-11-07` | Pengecoran menuntaskan 1,81 km dan 28 dari 40 patok reflektor tikungan sudah terpasang di bahu luar. |

#### F. Dokumentasi
- **Foto Utama**: `jalan_modo_12.jpg` (DB path: `/uploads/jalan_modo_12.jpg`, ukuran 1530 KB, diunggah `2026-11-07` oleh Bambang Suryono, S.T. — realignment tikungan dan pengecoran rigid koridor pangan Modo-Babat)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Modo (Jegreg) -> Kedungpring -> Babat (Via Poros Tengah) | 12.4 km | 21 menit | Jalur truk angkutan pangan dan logistik antar-kecamatan |
| `kedua` | Jalan Desa Kedungpengaron -> Desa Kedunglerep -> Desa Sidomulyo | 5.3 km | 11 menit | Jalur alternatif lokal khusus sepeda motor dan mobil pribadi |

#### H. Aduan Warga
- *Belum ada aduan warga tercatat hingga `2026-11-18`.*

#### I. Rating
- **Bagus Setiawan** (`2026-11-10`): **5/5** ★ — *"Tikungan tajam dekat Mojorejo yang dulu sering memicu kecelakaan truk kini jauh lebih lebar dan landai."*

---

<a id="proyek-13"></a>
### Proyek ID 13: Pembangunan Pintu Air & Retensi Kuro (Pengendali Bengawan Jero)

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `13` |
| Kode Proyek | `KBN-KUR-013` |
| Nama Proyek | Pembangunan Pintu Air & Retensi Kuro (Pengendali Bengawan Jero) |
| Kategori | `drainase` (Drainase, Sungai & Irigasi) |
| OPD | Dinas Sumber Daya Air (Dinas Sumber Daya Air Kabupaten Lamongan) |
| Pagu Anggaran | Rp 12.850.000.000 (Rp 12,85 M) |
| Sumber Pembiayaan | Bantuan Keuangan (BK) Prov. Jatim & APBD Kab. Lamongan |
| Status | **Selesai** |
| Progres | `100%` |
| Tanggal Mulai | `2024-11-04` |
| Estimasi Selesai | `2026-04-30` |
| Tanggal Selesai Aktual | `2026-04-18` |
| Nomor Kontrak | `611/SPK-DRA/LAM-DRA-2024-001` |
| Kode SiRUP | `2471950` |
| PIN Mandor | `PJ-55219` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Erlangga, S.T. (Dinas Sumber Daya Air)
- **Pejabat Pembuat Komitmen (PPK)**: Agus Setiawan, S.T.
- **Kontraktor Pelaksana**: PT Brantas Abipraya - Sumber Jaya KSO
- **Konsultan Pengawas**: PT Yodya Karya (Persero)
- **Kepala Mandor / Site Manager**: Hartono (Kepala Mandor Pintu Air Hidrolik) & Ir. Setyo Utomo (Site Manager)

#### C. Lokasi
- **Kecamatan**: Kecamatan Karangbinangun (`wilayah_id = 25`, kode `35.24.24`)
- **Desa / Kelurahan**: Desa Kuro (`desa_id = 446`, kode `35.24.24.2020`)
- **Koordinat**: `-7.032400, 112.426800`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.032400,112.426800) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.032400,112.426800)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Konstruksi bangunan pengendali banjir pintu air elektrik ulir hidrolik dan dinding penahan kolam olak
- **Dimensi Utama**: 3 unit pintu air baja tahan karat (SUS 304) masing-masing lebar 3,5 m x tinggi 4,2 m, lebar total bentang bangunan air 14,5 m, panjang dinding penahan kolam olak 120 m
- **Perhitungan Volume & Struktur Pendukung**: Konstruksi beton bertulang K-300 kedap air untuk pilar, lantai apron, dan dinding penahan volume 1.450 m3; pondasi tiang pancang spun pile D40 cm kedalaman 14 m sebanyak 48 titik; sistem penggerak motor hidrolik 3 x 15 kW + panel kontrol SCADA level muka air

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pekerjaan Cofferdam Pengeringan & Pemancangan 48 Titik Spun Pile | 25% | `2025-03-21` | Kistdam pengeringan saluran Kuro berfungsi kedap dan seluruh 48 titik tiang pancang mencapai kedalaman tanah keras 14 m. |
| 2 | Pengecoran Lantai Apron, Pilar Beton K-300 & Retaining Wall Kolam Olak | 62% | `2025-09-18` | Pengecoran 1.450 m3 beton kedap air selesai tanpa kebocoran sambungan waterstop PVC. |
| 3 | Instalasi 3 Daun Pintu Baja SUS 304 & Aktuator Ulir Hidrolik | 89% | `2026-02-12` | Ketiga daun pintu baja terpasang presisi pada rel pemandu dan lolos uji bukaan beban penuh. |
| 4 | Komisioning Panel SCADA Muka Air, Pembongkaran Cofferdam & PHO | 100% | `2026-04-18` | Uji operasional pengendalian debit Bengawan Jero tuntas 12 hari sebelum jadwal kontrak dan berita acara PHO ditandatangani. |

#### F. Dokumentasi
- **Foto Utama**: `drainase_karangbinangun_13.jpg` (DB path: `/uploads/drainase_karangbinangun_13.jpg`, ukuran 1820 KB, diunggah `2026-04-18` oleh Erlangga, S.T. — operasional 3 unit pintu air elektrik hidrolik dan kolam olak Retensi Kuro)

#### H. Aduan Warga
- **Aduan #1** (`2025-11-24`, Pelapor: Ahmad Zaki, Status: `ditanggapi`):
  - *Isi*: "Tanggul pengeringan sementara (cofferdam) sempat menyempitkan saluran buang tambak warga Dusun Kuro saat hujan lebat akhir November."
  - *Tanggapan Admin OPD* (**Erlangga, S.T.**, `2025-11-26`): "Dinas Sumber Daya Air bersama kontraktor langsung membuka saluran by-pass selebar 4 meter dan menyiagakan 2 pompa portabel 250 L/dt selama masa cofferdam berlangsung."

#### I. Rating
- **Ahmad Zaki** (`2026-05-12`): **5/5** ★ — *"Pintu air Kuro sekarang buka-tutupnya cepat pakai sistem elektrik sehingga air Bengawan Jero jauh lebih terkendali saat debit tinggi."*

#### J. Evaluasi FHO (Serah Terima Akhir)
- **Tanggal Inspeksi FHO**: `2026-10-16` · **Verifikasi Selesai**: `2026-11-02` · **Pelapor / Saksi Warga**: Ahmad Zaki · **Diverifikasi oleh**: Erlangga, S.T.
- **Kategori Temuan**: Seal Karet Pintu Air & Sensor Muka Air (Skor Urgensi AI: `2/5`)
- **Temuan Lapangan**: Pada inspeksi 6 bulan pasca PHO ditemukan rembesan halus di karet perapat (rubber seal) bagian bawah pintu nomor 2 serta penyimpangan kalibrasi sensor ultrasonik muka air sebesar 4 cm akibat lumut.
- **Tindak Lanjut & Verifikasi**: PT Brantas Abipraya - Sumber Jaya KSO telah mengganti rubber seal tipe J pada pintu nomor 2 dan melakukan kalibrasi ulang sensor ultrasonik beserta pemasangan pelindung keranjang sampah; verifikasi akhir oleh Erlangga, S.T. dinyatakan layak FHO.

---

<a id="proyek-14"></a>
### Proyek ID 14: Pengadaan & Pemasangan Pompa Banjir 3.000 L/dt Pintu Air Kuro

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `14` |
| Kode Proyek | `KBN-KUR-014` |
| Nama Proyek | Pengadaan & Pemasangan Pompa Banjir 3.000 L/dt Pintu Air Kuro |
| Kategori | `drainase` (Drainase, Sungai & Irigasi) |
| OPD | Dinas Sumber Daya Air (Dinas Sumber Daya Air Kabupaten Lamongan) |
| Pagu Anggaran | Rp 6.750.000.000 (Rp 6,75 M) |
| Sumber Pembiayaan | Bantuan Keuangan Khusus (BKK) Pemprov Jatim |
| Status | **Selesai** |
| Progres | `100%` |
| Tanggal Mulai | `2025-04-07` |
| Estimasi Selesai | `2026-05-31` |
| Tanggal Selesai Aktual | `2026-05-25` |
| Nomor Kontrak | `611/SPK-DRA/LAM-DRA-2025-002` |
| Kode SiRUP | `7834016` |
| PIN Mandor | `PJ-31604` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Erlangga, S.T. (Dinas Sumber Daya Air)
- **Pejabat Pembuat Komitmen (PPK)**: Agus Setiawan, S.T.
- **Kontraktor Pelaksana**: PT Mega Surya Teknik Megah
- **Konsultan Pengawas**: CV Bina Karya Pratama
- **Kepala Mandor / Site Manager**: Slamet Wahyudi (Mandor Mekanikal Elektrikal, Pompa Axial & Genset 500 kVA)

#### C. Lokasi
- **Kecamatan**: Kecamatan Karangbinangun (`wilayah_id = 25`, kode `35.24.24`)
- **Desa / Kelurahan**: Desa Kuro (`desa_id = 446`, kode `35.24.24.2020`)
- **Koordinat**: `-7.033100, 112.427900`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.033100,112.427900) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.033100,112.427900)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Pengadaan dan instalasi stasiun pompa banjir kapasitas total 3.000 liter/detik lengkap rumah genset dan panel ATS
- **Dimensi Utama**: 2 unit pompa axial submersible kapasitas masing-masing 1.500 L/detik (total 3.000 L/detik), head 4,5 m, pipa tekan baja D1.000 mm panjang 36 m, bangunan rumah pompa & genset 14 m x 10 m (140 m2)
- **Perhitungan Volume & Struktur Pendukung**: Konstruksi sumur hisap (sump pit) beton bertulang K-300 volume 320 m3; 1 unit genset silent kapasitas 500 kVA + tangki solar harian 3.000 liter; panel AMF/ATS otomatis, trash rack baja pembersih gulma, dan uji beban 24 jam nonstop

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Konstruksi Sumur Hisap Beton K-300 & Fondasi Rumah Genset 140 m2 | 28% | `2025-07-17` | Pengecoran bak hisap kedalaman 5 m dan dudukan peredam getaran genset 500 kVA di komplek Pintu Air Kuro rampung. |
| 2 | Pabrikasi & Pengiriman 2 Unit Pompa Axial 1.500 L/dt Serta Pipa D1.000 mm | 64% | `2025-11-29` | Dua unit pompa axial lulus Factory Acceptance Test (FAT) dan tiba lengkap dengan katup flap anti-arus balik. |
| 3 | Instalasi Mekanikal-Elektrikal, Panel ATS & Integrasi Genset 500 kVA | 88% | `2026-03-20` | Pemasangan pipa tekan, kabel daya tegangan rendah, dan sinkronisasi perpindahan otomatis PLN-Genset selesai. |
| 4 | Uji Beban Pompa 3.000 L/dt Selama 24 Jam Nonstop & PHO | 100% | `2026-05-25` | Debit pembuangan terukur stabil 3.040 L/detik pada head 4,5 m tanpa overheat; serah terima PHO tuntas 6 hari lebih awal. |

#### F. Dokumentasi
- **Foto Utama**: `drainase_karangbinangun_14.jpg` (DB path: `/uploads/drainase_karangbinangun_14.jpg`, ukuran 1680 KB, diunggah `2026-05-25` oleh Erlangga, S.T. — instalasi 2 unit pompa axial 1.500 L/dt dan rumah genset silent 500 kVA Kuro)

#### H. Aduan Warga
- **Aduan #1** (`2026-04-11`, Pelapor: Ahmad Zaki, Status: `ditanggapi`):
  - *Isi*: "Saat uji coba genset malam hari suara knalpot dan getaran masih terdengar cukup keras hingga pemukiman terdekat di Dusun Kuro."
  - *Tanggapan Admin OPD* (**Erlangga, S.T.**, `2026-04-14`): "Teknisi mekanikal telah memasang peredam silencer tambahan pada pipa buang dan menambah bantalan karet anti-vibrasi sehingga tingkat kebisingan turun di bawah 68 dB pada jarak 7 meter."

#### I. Rating
- **Ahmad Zaki** (`2026-06-10`): **5/5** ★ — *"Dengan dua pompa 3.000 L/dt ini genangan di sawah tambak Kuro surut jauh lebih cepat dibanding tahun lalu."*

#### J. Evaluasi FHO (Serah Terima Akhir)
- **Status FHO**: **`terjadwal`** · **Tanggal Verifikasi**: `NULL` (belum jatuh tempo per `2026-11-18`)
- **Jadwal FHO (PHO + 180 hari)**: **`2026-11-21`** (PHO `2026-05-25`) · **OPD Penanggung Jawab**: Dinas Sumber Daya Air
- **Keterangan**: Masa pemeliharaan 180 hari belum berakhir (baru berjalan 177 hari). Inspeksi FHO pompa axial, panel ATS, dan genset 500 kVA dijadwalkan pada `2026-11-21`.

---

<a id="proyek-15"></a>
### Proyek ID 15: Normalisasi Kali Asin & Pengerukan Bengawan Jero

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `15` |
| Kode Proyek | `KTG-PCG-015` |
| Nama Proyek | Normalisasi Kali Asin & Pengerukan Bengawan Jero |
| Kategori | `drainase` (Drainase, Sungai & Irigasi) |
| OPD | Dinas Sumber Daya Air (Dinas Sumber Daya Air Kabupaten Lamongan) |
| Pagu Anggaran | Rp 4.500.000.000 (Rp 4,50 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan (Penanganan Banjir Terpadu) |
| Status | **Sedang Berjalan** |
| Progres | `72%` |
| Tanggal Mulai | `2026-02-09` |
| Estimasi Selesai | `2027-03-15` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `611/SPK-DRA/LAM-DRA-2026-003` |
| Kode SiRUP | `1938542` |
| PIN Mandor | `PJ-90731` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Erlangga, S.T. (Dinas Sumber Daya Air)
- **Pejabat Pembuat Komitmen (PPK)**: Agus Setiawan, S.T.
- **Kontraktor Pelaksana**: PT Tirta Dharma Kencana
- **Konsultan Pengawas**: CV Mitra Tata Lingkungan
- **Kepala Mandor / Site Manager**: H. Masrukin (Kepala Mandor Operasi Amphibi Excavator & Pengerukan Alur)

#### C. Lokasi
- **Kecamatan**: Kecamatan Kalitengah (`wilayah_id = 21`, kode `35.24.20`)
- **Desa / Kelurahan**: Desa Pucangro (`desa_id = 355`, kode `35.24.20.2001`)
- **Koordinat**: `-7.024500, 112.371200`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.024500,112.371200) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.024500,112.371200)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Normalisasi alur sungai, pengerukan sedimen dasar, dan pembersihan gulma air kawasan Bengawan Jero
- **Dimensi Utama**: Panjang penanganan 10,5 km (10.500 m, alur Desa Pucangro s/d Desa Tiwet), lebar rata-rata dasar saluran 8,0 m, kedalaman pengerukan rata-rata 1,6 m
- **Perhitungan Volume & Struktur Pendukung**: Volume pengerukan lumpur sedimentasi 10.500 x 8,0 x 1,6 = 134.400 m3 menggunakan 3 unit amphibi excavator long-arm; pembersihan eceng gondok padat seluas 42.000 m2; penataan tanggul hasil kerukan selebar 3,0 m di bantaran tidak produktif (±Rp 33.480/m3 keruk termasuk mobilisasi)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pengukuran Profil Melintang Sungai & Mobilisasi 3 Amphibi Excavator | 21% | `2026-04-06` | Survei batimetri sepanjang 10,5 km selesai dan 3 unit excavator ponton mulai beroperasi dari hilir Desa Pucangro. |
| 2 | Pembersihan Eceng Gondok & Pengerukan Sedimen Segmen Pucangro - Jelakcatur | 48% | `2026-07-22` | Volume kerukan mencapai 64.500 m3 dan kapasitas tampung alur meningkat signifikan di simpang Desa Jelakcatur. |
| 3 | Pengerukan Segmen Tengah Mungli - Tiwet & Perapian Tanggul Bantaran | 72% | `2026-11-09` | Realisasi pengerukan telah mencapai 96.800 m3 (7,56 km) dengan profil tanggul bantaran dipadatkan rapi. |

#### F. Dokumentasi
- **Foto Utama**: `drainase_kalitengah_15.jpg` (DB path: `/uploads/drainase_kalitengah_15.jpg`, ukuran 1560 KB, diunggah `2026-11-09` oleh Erlangga, S.T. — pengerukan sedimen lumpur oleh amphibi excavator di alur Kali Asin Pucangro)

#### H. Aduan Warga
- **Aduan #1** (`2026-08-29`, Pelapor: Khoirul Anam, Status: `ditanggapi`):
  - *Isi*: "Hasil kerukan lumpur di bantaran Desa Pucangro sempat meluber menutup jalan setapak akses petani menuju tambak saat gerimis."
  - *Tanggapan Admin OPD* (**Erlangga, S.T.**, `2026-09-01`): "Operator excavator telah merapikan dan memindahkan tanggul lumpur sejauh 3 meter menjauh dari jalan setapak serta menabur kapur penstabil agar jalur petani kembali dapat dilalui motor."

#### I. Rating
- **Khoirul Anam** (`2026-10-18`): **4/5** ★ — *"Alur Kali Asin sekarang jauh lebih dalam dan bebas eceng gondok, aliran pembuangan air tambak terasa jauh lebih lancar."*

---

<a id="proyek-16"></a>
### Proyek ID 16: Saluran Drainase Primer Box Culvert Jl. Veteran & Jl. Basuki Rahmat

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `16` |
| Kode Proyek | `LMG-SKR-016` |
| Nama Proyek | Saluran Drainase Primer Box Culvert Jl. Veteran & Jl. Basuki Rahmat |
| Kategori | `drainase` (Drainase, Sungai & Irigasi) |
| OPD | Dinas PRKPCK (Dinas Perumahan Rakyat, Kawasan Permukiman dan Cipta Karya Kabupaten Lamongan) |
| Pagu Anggaran | Rp 5.800.000.000 (Rp 5,80 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan (Drainase Perkotaan) |
| Status | **Sedang Berjalan** |
| Progres | `67%` |
| Tanggal Mulai | `2026-03-02` |
| Estimasi Selesai | `2027-04-10` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `640/SPK-DRA/LAM-DRA-2026-004` |
| Kode SiRUP | `6502849` |
| PIN Mandor | `PJ-46982` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Ir. Joko Santoso (Dinas PRKPCK)
- **Pejabat Pembuat Komitmen (PPK)**: Dwi Prasetyo, S.T.
- **Kontraktor Pelaksana**: CV Jaya Abadi Konstruksi
- **Konsultan Pengawas**: CV Multi Rekayasa Graha
- **Kepala Mandor / Site Manager**: Budi Hermawan (Site Supervisor) & Suharno (Mandor Pemasangan Box Culvert 150x150)

#### C. Lokasi
- **Kecamatan**: Kecamatan Lamongan (Kota) (`wilayah_id = 23`, kode `35.24.22`)
- **Desa / Kelurahan**: Kelurahan Sukorejo (`desa_id = 394`, kode `35.24.22.1012`)
- **Koordinat**: `-7.120800, 112.416200`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.120800,112.416200) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.120800,112.416200)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Pembangunan saluran drainase primer perkotaan tertutup menggunakan precast reinforced concrete box culvert
- **Dimensi Utama**: Panjang penanganan 1,15 km (1.150 m, koridor Jl. Veteran & Jl. Basuki Rahmat, Kel. Sukorejo), dimensi dalam box culvert 150 x 150 cm (beban gandar 20 ton)
- **Perhitungan Volume & Struktur Pendukung**: Pemasangan 1.150 unit precast box culvert 150x150x100 cm mutu K-350; lapis lantai kerja beton K-125 tebal 10 cm selebar 1,9 m (1.150 x 1,9 x 0,10 = 218,5 m3); 76 unit bak kontrol inlet tangkapan air hujan per 15 m; pengembalian perkerasan trotoar paving seluas 2.300 m2 (±Rp 5,04 M/km)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Relokasi Utilitas Pipa PDAM/Kabel Fiber & Galian Sheet Pile Segmen Veteran | 22% | `2026-04-28` | Koordinasi utilitas selesai dan galian sedalam 2,4 m di sisi selatan Jl. Veteran diamankan dengan turap baja ringan. |
| 2 | Pemasangan 520 Unit Box Culvert 150x150 & Bak Kontrol Segmen Veteran | 47% | `2026-08-07` | Saluran utama Jl. Veteran sepanjang 520 m tersambung kedap sambungan mortar dan langsung berfungsi mengalirkan limpasan hujan. |
| 3 | Pemasangan Box Culvert Koridor Jl. Basuki Rahmat & Rekonstruksi Trotoar | 67% | `2026-11-11` | Total 770 dari 1.150 unit box culvert telah terpasang dan penataan ulang trotoar paving segmen timur mulai dikerjakan. |

#### F. Dokumentasi
- **Foto Utama**: `drainase_lamongan_16.jpg` (DB path: `/uploads/drainase_lamongan_16.jpg`, ukuran 1495 KB, diunggah `2026-11-11` oleh Ir. Joko Santoso — pemasangan precast box culvert 150x150 cm koridor Jl. Veteran Sukorejo)

#### H. Aduan Warga
- **Aduan #1** (`2026-09-14`, Pelapor: Lestari Ningrum, Status: `ditanggapi`):
  - *Isi*: "Papan jembatan darurat penyeberangan pejalan kaki ke ruko di Jl. Basuki Rahmat agak licin saat hujan dan tidak memiliki pegangan tangan."
  - *Tanggapan Admin OPD* (**Ir. Joko Santoso**, `2026-09-16`): "Kontraktor telah mengganti 12 jembatan akses ruko menggunakan pelat baja bordes anti-selip lengkap dengan pegangan pipa besi di kedua sisi."

#### I. Rating
- **Lestari Ningrum** (`2026-10-29`): **4/5** ★ — *"Hujan deras awal November kemarin Jl. Veteran sudah tidak lagi tergenang setinggi mata kaki seperti tahun-tahun sebelumnya."*

---

<a id="proyek-17"></a>
### Proyek ID 17: Modernisasi Jaringan Irigasi DI Waduk Gondang

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `17` |
| Kode Proyek | `SGO-KDB-017` |
| Nama Proyek | Modernisasi Jaringan Irigasi DI Waduk Gondang |
| Kategori | `drainase` (Drainase, Sungai & Irigasi) |
| OPD | Dinas Sumber Daya Air (Dinas Sumber Daya Air Kabupaten Lamongan) |
| Pagu Anggaran | Rp 8.900.000.000 (Rp 8,90 M) |
| Sumber Pembiayaan | DAK Fisik Irigasi KemenPUPR & APBD Kab. Lamongan |
| Status | **Sedang Berjalan** |
| Progres | `83%` |
| Tanggal Mulai | `2025-11-03` |
| Estimasi Selesai | `2027-01-30` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `611/SPK-DRA/LAM-DRA-2025-005` |
| Kode SiRUP | `4016793` |
| PIN Mandor | `PJ-62415` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Erlangga, S.T. (Dinas Sumber Daya Air)
- **Pejabat Pembuat Komitmen (PPK)**: Rina Kusuma, S.T.
- **Kontraktor Pelaksana**: PT Swakarya Perkasa Mandiri
- **Konsultan Pengawas**: CV Rekaprima Engineering
- **Kepala Mandor / Site Manager**: Kasirun (Mandor Pasangan Batu Kali 1:3 & Precast U-Flume Saluran Gondang)

#### C. Lokasi
- **Kecamatan**: Kecamatan Sugio (`wilayah_id = 13`, kode `35.24.12`)
- **Desa / Kelurahan**: Desa Kedungbanjar (`desa_id = 223`, kode `35.24.12.2005`)
- **Koordinat**: `-7.194300, 112.238900`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.194300,112.238900) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.194300,112.238900)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Modernisasi jaringan irigasi primer dan sekunder Daerah Irigasi (DI) Waduk Gondang
- **Dimensi Utama**: Panjang penanganan 5,40 km (5.400 m: 3.000 m lining pasangan batu kali + 2.400 m precast U-flume beton K-300 ukuran 100x100 cm), melayani areal baku sawah 1.250 hektar
- **Perhitungan Volume & Struktur Pendukung**: Pasangan batu kali 1:3 dinding dan lantai saluran 3.000 m x penampang 0,85 m2 = 2.550 m3; pemasangan 2.400 unit precast U-flume beton 100x100x100 cm; rehabilitasi 12 unit bangunan pintu bagi sadap ulir baja + 4 alat ukur debit Romijn

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pengeringan Giliran Saluran, Pembersihan Lumpur & Pengukuran Profil | 25% | `2026-01-23` | Pengaturan jadwal tutup pintu Waduk Gondang disepakati bersama HIPPA Desa Kedungbanjar dan pembersihan sedimen rampung. |
| 2 | Pekerjaan Lining Pasangan Batu Kali 3.000 m & 6 Pintu Bagi Primer | 58% | `2026-06-15` | Lining batu kali sepanjang 3,0 km tuntas diplester siar halus dan 6 pintu bagi primer telah beroperasi. |
| 3 | Pemasangan Precast U-Flume Saluran Sekunder & Alat Ukur Debit Romijn | 83% | `2026-11-06` | Sebanyak 1.980 dari 2.400 unit U-flume terpasang rapi dan kehilangan air rembesan turun drastis berdasarkan uji alir awal. |

#### F. Dokumentasi
- **Foto Utama**: `drainase_sugio_17.jpg` (DB path: `/uploads/drainase_sugio_17.jpg`, ukuran 1575 KB, diunggah `2026-11-06` oleh Erlangga, S.T. — pemasangan lining precast U-flume dan pintu bagi irigasi DI Waduk Gondang)

#### H. Aduan Warga
- **Aduan #1** (`2026-05-11`, Pelapor: Hendra Kusuma, Status: `ditanggapi`):
  - *Isi*: "Mohon jadwal penutupan air saluran sekunder di Desa Kedungbanjar diumumkan minimal 3 hari sebelumnya agar petani bisa menyiapkan pengairan persemaian."
  - *Tanggapan Admin OPD* (**Erlangga, S.T.**, `2026-05-12`): "Dinas Sumber Daya Air telah memasang papan jadwal buka-tutup saluran mingguan di balai desa dan menyiarkannya lewat grup koordinasi HIPPA Kecamatan Sugio."

#### I. Rating
- **Hendra Kusuma** (`2026-11-08`): **5/5** ★ — *"Saluran irigasi beton U-flume membuat air dari Waduk Gondang sampai ke petak sawah hilir jauh lebih cepat tanpa bocor."*

---

<a id="proyek-18"></a>
### Proyek ID 18: Rekonstruksi Jembatan Karanggeneng - Maduran

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `18` |
| Kode Proyek | `KGN-KGN-018` |
| Nama Proyek | Rekonstruksi Jembatan Karanggeneng - Maduran |
| Kategori | `jembatan` (Jembatan & Penghubung) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 7.850.000.000 (Rp 7,85 M) |
| Sumber Pembiayaan | DAK Fisik Konektivitas Daerah & APBD Kab. Lamongan |
| Status | **Tertunda** |
| Progres | `68%` |
| Tanggal Mulai | `2025-07-14` |
| Estimasi Selesai | `2026-10-31` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JBT/LAM-JBT-2025-001` |
| Kode SiRUP | `3169482` |
| PIN Mandor | `PJ-39046` |
| Catatan OPD | - |
| Alasan Tunda | Kenaikan debit Bengawan Solo menghambat pemancangan abutmen dan fabrikasi gelagar baja komposit |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: M. Rofiq, S.T.
- **Kontraktor Pelaksana**: PT Wira Mandiri Sejati
- **Konsultan Pengawas**: CV Dian Karya Konsultan
- **Kepala Mandor / Site Manager**: H. Subagyo (Mandor Abutmen Bore Pile & Gelagar Baja) & Agus Triyono, S.T.

#### C. Lokasi
- **Kecamatan**: Kecamatan Karanggeneng (`wilayah_id = 19`, kode `35.24.18`)
- **Desa / Kelurahan**: Desa Karanggeneng (`desa_id = 335`, kode `35.24.18.2017`)
- **Koordinat**: `-6.993500, 112.337400`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-6.993500,112.337400) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-6.993500,112.337400)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Rekonstruksi jembatan bentang menengah struktur atas gelagar baja komposit (steel composite girder)
- **Dimensi Utama**: Bentang jembatan 36,0 m (1 bentang penuh), lebar lantai kendaraan 7,0 m + trotoar 1,0 m kanan-kiri (total lebar 9,0 m), panjang oprit 60 m kanan-kiri
- **Perhitungan Volume & Struktur Pendukung**: 6 batang gelagar baja profil IWF 900x300 berat total 58,4 ton; pelat lantai beton bertulang K-350 tebal 22 cm (36 x 9,0 x 0,22 = 71,3 m3); 2 abutmen beton K-300 (280 m3) di atas 24 titik bore pile D60 cm kedalaman 18 m

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pembongkaran Jembatan Lama & Pembuatan Jembatan Bailey Darurat Roda 2 | 22% | `2025-10-03` | Jembatan eksisting dibongkar aman dan jembatan sementara khusus sepeda motor difungsikan di sisi barat. |
| 2 | Pengeboran 24 Titik Bore Pile & Pengecoran Abutmen Sisi Selatan | 49% | `2026-03-19` | Abutmen sisi Karanggeneng tuntas dicor dan lulus uji integritas tiang PIT tanpa cacat. |
| 3 | Tertundanya Pemancangan Sisi Utara Akibat Kenaikan Debit Bengawan Solo | 61% | `2026-09-11` | Muka air sungai naik 2,8 m melebihi elevasi kerja sehingga pengecoran abutmen sisi Maduran dan pengangkatan gelagar tertunda. |
| 4 | Erection 4 dari 6 Gelagar Baja Komposit & Percepatan Pasca Surut | 68% | `2026-11-03` | Setelah debit air turun, 4 gelagar baja berhasil dinaikkan menggunakan crane 80 ton dan dua gelagar tersisa dijadwalkan akhir November. |

#### F. Dokumentasi
- **Foto Utama**: `jembatan_karanggeneng_18.jpg` (DB path: `/uploads/jembatan_karanggeneng_18.jpg`, ukuran 1690 KB, diunggah `2026-11-03` oleh Bambang Suryono, S.T. — pemasangan gelagar baja komposit dan penguatan abutmen jembatan Karanggeneng-Maduran)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Karanggeneng -> Sekaran -> Maduran (Via Jembatan Laren) | 11.5 km | 22 menit | Rute resmi kendaraan roda empat dan truk logistik selama jembatan direkonstruksi |
| `kedua` | Jembatan Darurat Bailey Sisi Barat -> Desa Kalanganyar -> Desa Pangean | 1.8 km | 6 menit | Khusus sepeda motor dan pejalan kaki dengan pembatasan beban maks 300 kg |

#### H. Aduan Warga
- **Aduan #1** (`2026-11-02`, Pelapor: Tri Wahyuni, Status: `ditanggapi`):
  - *Isi*: "Target selesai di papan informasi 31 Oktober 2026 sudah lewat, kapan jembatan utama Karanggeneng-Maduran bisa dilalui mobil lagi? Memutar lewat Laren cukup jauh untuk belanja pasar."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2026-11-05`): "Kami mohon maaf atas penundaan akibat tingginya debit Bengawan Solo sepanjang Agustus-September yang menghambat pengecoran abutmen utara. Saat ini 4 dari 6 gelagar baja sudah terpasang dan tim bekerja lembur mengejar pengecoran lantai jembatan pada Desember 2026."

#### I. Rating
- **Tri Wahyuni** (`2026-11-07`): **3/5** ★ — *"Progres pemasangan baja sudah terlihat jelas, namun penundaan cukup memberatkan pedagang yang harus memutar jauh."*

---

<a id="proyek-19"></a>
### Proyek ID 19: Penggantian Gelagar & Pelebaran Jembatan Plaosan Babat

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `19` |
| Kode Proyek | `BBT-BBT-019` |
| Nama Proyek | Penggantian Gelagar & Pelebaran Jembatan Plaosan Babat |
| Kategori | `jembatan` (Jembatan & Penghubung) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 3.450.000.000 (Rp 3,45 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan |
| Status | **Sedang Berjalan** |
| Progres | `65%` |
| Tanggal Mulai | `2026-03-09` |
| Estimasi Selesai | `2027-04-15` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JBT/LAM-JBT-2026-002` |
| Kode SiRUP | `9472615` |
| PIN Mandor | `PJ-70523` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: M. Rofiq, S.T.
- **Kontraktor Pelaksana**: CV Sumber Berkah Teknik
- **Konsultan Pengawas**: CV Sarana Teknik Konsultan
- **Kepala Mandor / Site Manager**: Wahyu Sujatmiko (Mandor Erection I-Girder Pracetak & Pelebaran Lantai)

#### C. Lokasi
- **Kecamatan**: Kecamatan Babat (`wilayah_id = 6`, kode `35.24.05`)
- **Desa / Kelurahan**: Kelurahan Babat (`desa_id = 84`, kode `35.24.05.1003`)
- **Koordinat**: `-7.104800, 112.167200`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.104800,112.167200) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.104800,112.167200)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Penggantian gelagar beton pracetak prategang (PCI I-Girder) dan pelebaran lantai jembatan
- **Dimensi Utama**: Bentang jembatan 22,0 m, pelebaran lantai kendaraan dari 5,5 m menjadi 8,0 m + trotoar 0,75 m kanan-kiri (total lebar 9,5 m)
- **Perhitungan Volume & Struktur Pendukung**: 6 batang balok PCI I-Girder H-125 panjang 22 m mutu K-500; pelat lantai beton K-350 tebal 22 cm (22 x 9,5 x 0,22 = 46,0 m3); perkuatan 2 kepala abutmen beton K-300 (115 m3); 12 bantalan karet elastomer dan expansion joint baja

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Perkuatan Sayap Abutmen & Pengadaan 6 Batang PCI I-Girder K-500 | 24% | `2026-05-14` | Perluasan dudukan elastomer di kedua abutmen Desa Plaosan selesai dan 6 balok prategang lulus uji stressing di pabrik. |
| 2 | Erection 6 Balok PCI I-Girder & Pemasangan Diafragma Beton | 48% | `2026-08-21` | Seluruh balok I-Girder terpasang presisi dalam satu malam tanpa penutupan total jalur alternatif Babat. |
| 3 | Pembesian Pelat Lantai Jembatan & Pengecoran Setengah Bentang Barat | 65% | `2026-11-10` | Pengecoran lantai bentang sisi barat tuntas dan pembesian diafragma sisi timur mencapai 80%. |

#### F. Dokumentasi
- **Foto Utama**: `jembatan_babat_19.jpg` (DB path: `/uploads/jembatan_babat_19.jpg`, ukuran 1615 KB, diunggah `2026-11-10` oleh Bambang Suryono, S.T. — erection balok PCI I-Girder dan pembesian lantai Jembatan Plaosan Babat)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Jl. Raya Babat - Jombang -> Simpang Banaran -> Desa Trepan | 4.9 km | 10 menit | Jalur utama truk barang dan bus dari arah Babat menuju selatan |
| `kedua` | Jalan Lingkungan Kelurahan Babat -> Desa Bedahan -> Desa Plaosan | 2.6 km | 7 menit | Jalur khusus sepeda motor dan mobil pribadi selama pembesian lantai |

#### H. Aduan Warga
- *Belum ada aduan warga tercatat hingga `2026-11-18`.*

#### I. Rating
- **Agus Prayitno** (`2026-11-11`): **4/5** ★ — *"Pemasangan gelagar beton I-Girder berlangsung cepat dan rapi, pelebaran 8 meter nanti pasti mengurai macet Pasar Babat."*

---

<a id="proyek-20"></a>
### Proyek ID 20: Pembangunan Jembatan Kuro Penghubung Karangbinangun - Glagah

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `20` |
| Kode Proyek | `KBN-KUR-020` |
| Nama Proyek | Pembangunan Jembatan Kuro Penghubung Karangbinangun - Glagah |
| Kategori | `jembatan` (Jembatan & Penghubung) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 5.600.000.000 (Rp 5,60 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan & BK Khusus Provinsi |
| Status | **Sedang Berjalan** |
| Progres | `80%` |
| Tanggal Mulai | `2025-12-08` |
| Estimasi Selesai | `2027-02-15` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JBT/LAM-JBT-2025-003` |
| Kode SiRUP | `6815037` |
| PIN Mandor | `PJ-14928` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: M. Rofiq, S.T.
- **Kontraktor Pelaksana**: PT Tri Pilar Nusantara
- **Konsultan Pengawas**: CV Pilar Utama Desain
- **Kepala Mandor / Site Manager**: Suparno (Mandor Pemancangan Spun Pile & Pelat Beton Prategang)

#### C. Lokasi
- **Kecamatan**: Kecamatan Karangbinangun (`wilayah_id = 25`, kode `35.24.24`)
- **Desa / Kelurahan**: Desa Kuro (`desa_id = 446`, kode `35.24.24.2020`)
- **Koordinat**: `-7.041200, 112.432500`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.041200,112.432500) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.041200,112.432500)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Pembangunan jembatan pelat beton prategang (voided slab) tahan lingkungan air payau
- **Dimensi Utama**: Bentang jembatan 30,0 m (2 bentang @15,0 m dengan 1 pilar tengah), lebar lantai 6,0 m + trotoar 0,75 m kanan-kiri (total lebar 7,5 m)
- **Perhitungan Volume & Struktur Pendukung**: 14 unit balok voided slab prategang panjang 15 m mutu K-500; pondasi 28 tiang pancang spun pile D50 cm kedalaman 16 m dengan lapisan epoxy anti-korosi air payau; beton struktur pilar, abutmen, dan oprit volume 295 m3; lapis aus aspal AC-WC 225 m2 tebal 5 cm

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pemancangan 28 Titik Spun Pile Anti-Korosi & Pengecoran Pile Cap | 27% | `2026-02-26` | Seluruh tiang pancang di kedua abutmen dan pilar tengah Desa Kuro mencapai kalendering keras pada kedalaman 16 m. |
| 2 | Pengecoran Pilar Tengah & Pemasangan 14 Unit Balok Voided Slab | 59% | `2026-07-09` | Keempat belas balok voided slab terpasang rata dengan penguncian grouting kabel post-tensioning. |
| 3 | Pengecoran Lantai Overtopping, Oprit & Pemasangan Railing Galvanis | 80% | `2026-11-08` | Lantai jembatan dan sandaran pagar galvanis tuntas di kedua sisi, menyisakan pengaspalan oprit dan marka. |

#### F. Dokumentasi
- **Foto Utama**: `jembatan_karangbinangun_20.jpg` (DB path: `/uploads/jembatan_karangbinangun_20.jpg`, ukuran 1640 KB, diunggah `2026-11-08` oleh Bambang Suryono, S.T. — pengecoran lantai jembatan dan railing baja Jembatan Kuro Karangbinangun-Glagah)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Karangbinangun -> Deket -> Glagah (Via Koridor Selatan) | 9.2 km | 17 menit | Jalur kendaraan roda empat pengangkut hasil tambak dan pakan ikan |
| `kedua` | Jalan Tanggul Desa Sukorejo -> Desa Somowinangun -> Desa Rayunggumuk (Glagah) | 4.8 km | 11 menit | Jalur alternatif khusus sepeda motor warga sekitar |

#### H. Aduan Warga
- **Aduan #1** (`2026-09-25`, Pelapor: Ahmad Zaki, Status: `ditanggapi`):
  - *Isi*: "Permukaan oprit jembatan sisi Glagah masih berbatu lepas dan berdebu saat dilalui motor pekerja tambak."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2026-09-27`): "Pelaksana telah menyiram dan memadatkan lapisan agregat kelas A pada oprit kedua sisi serta menjadwalkan pengaspalan hotmix begitu umur beton lantai mencapai 28 hari."

#### I. Rating
- **Ahmad Zaki** (`2026-11-12`): **5/5** ★ — *"Konstruksi Jembatan Kuro terlihat sangat kokoh dengan tiang pancang besar dan pagar galvanis rapi."*

---

<a id="proyek-21"></a>
### Proyek ID 21: Pembangunan RSUD Brondong Pantura (Tahap II)

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `21` |
| Kode Proyek | `BRD-BRD-021` |
| Nama Proyek | Pembangunan RSUD Brondong Pantura (Tahap II) |
| Kategori | `gedung_publik` (Gedung & Fasilitas Publik) |
| OPD | Dinas Kesehatan (Dinas Kesehatan Kabupaten Lamongan) |
| Pagu Anggaran | Rp 24.800.000.000 (Rp 24,80 M) |
| Sumber Pembiayaan | DAK Fisik Kesehatan Kemenkes & APBD Kab. Lamongan |
| Status | **Sedang Berjalan** |
| Progres | `81%` |
| Tanggal Mulai | `2025-08-11` |
| Estimasi Selesai | `2027-03-20` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `440/SPK-GED/LAM-GED-2025-001` |
| Kode SiRUP | `2089461` |
| PIN Mandor | `PJ-95264` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: dr. Taufik Hidayat (Dinas Kesehatan)
- **Pejabat Pembuat Komitmen (PPK)**: dr. Chaidir Annas
- **Kontraktor Pelaksana**: PT Total Bangun Sarana
- **Konsultan Pengawas**: PT Ciriajasa Engineering Consultants
- **Kepala Mandor / Site Manager**: Ir. Rudi Hartanto (Project Manager) & Sugeng Widodo (Mandor Struktur 3 Lantai & IPAL)

#### C. Lokasi
- **Kecamatan**: Kecamatan Brondong (`wilayah_id = 8`, kode `35.24.07`)
- **Desa / Kelurahan**: Kelurahan Brondong (`desa_id = 129`, kode `35.24.07.1010`)
- **Koordinat**: `-6.889400, 112.274800`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-6.889400,112.274800) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-6.889400,112.274800)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Pembangunan gedung rumah sakit 3 lantai struktur beton bertulang K-350 dilengkapi IGD, ruang operasi, rawat inap, dan IPAL medis
- **Dimensi Utama**: Bangunan 3 lantai luas total lantai 3.600 m2 (1.200 m2 per lantai), kapasitas 75 tempat tidur rawat inap, 2 ruang operasi, dan ruang IGD 12 bed
- **Perhitungan Volume & Struktur Pendukung**: Struktur beton bertulang K-350 (pondasi mini pile 25x25 cm 160 titik, kolom, balok, pelat) volume 1.380 m3; baja tulangan 195 ton; sistem HVAC ruang operasi + instalasi gas medis sentral 85 outlet; instalasi IPAL medis biofilter kapasitas 45 m3/hari (±Rp 6,89 jt/m2 standar RS tipe C/D)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pekerjaan Pondasi Mini Pile 160 Titik & Struktur Beton Lantai 1-2 | 29% | `2025-12-04` | Struktur bawah dan pelat lantai 2 selesai dicor dengan hasil uji kuat tekan beton 33,5 MPa. |
| 2 | Topping Off Lantai 3, Pasangan Dinding Bata Ringan & Atap Baja Ringan | 56% | `2026-05-19` | Struktur utama 3 lantai rampung 100% dan pasangan partisi ruang rawat inap lantai 1-2 selesai diplester. |
| 3 | Instalasi MEP, Gas Medis Sentral, Lift Pasien & IPAL Biofilter 45 m3/hari | 81% | `2026-11-09` | Uji tekanan pipa oksigen sentral lulus tes kebocoran, lift pasien terpasang, dan finishing keramik lantai 3 berjalan. |

#### F. Dokumentasi
- **Foto Utama**: `gedung_publik_brondong_21.jpg` (DB path: `/uploads/gedung_publik_brondong_21.jpg`, ukuran 1750 KB, diunggah `2026-11-09` oleh dr. Taufik Hidayat — finishing fasad gedung 3 lantai dan instalasi gas medis RSUD Brondong Tahap II)

#### H. Aduan Warga
- **Aduan #1** (`2026-07-08`, Pelapor: Rina Wulandari, Status: `ditanggapi`):
  - *Isi*: "Parkir truk pengangkut material di bahu jalan depan RSUD Brondong kadang menghalangi jalur masuk ambulans yang menuju IGD lama."
  - *Tanggapan Admin OPD* (**dr. Taufik Hidayat**, `2026-07-09`): "Manajemen proyek bersama Dinas Kesehatan telah mengalihkan pintu masuk material ke gerbang sisi timur dan menempatkan petugas pengatur lalu lintas khusus agar jalur ambulans steril 24 jam."

#### I. Rating
- **Rina Wulandari** (`2026-11-11`): **5/5** ★ — *"Gedung baru RSUD Brondong megah sekali, warga Pantura tidak perlu jauh-jauh lagi dirujuk ke Lamongan kota."*

---

<a id="proyek-22"></a>
### Proyek ID 22: Pembangunan Gedung Laboratorium Kesehatan Daerah (Labkesda)

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `22` |
| Kode Proyek | `LMG-BNJ-022` |
| Nama Proyek | Pembangunan Gedung Laboratorium Kesehatan Daerah (Labkesda) |
| Kategori | `gedung_publik` (Gedung & Fasilitas Publik) |
| OPD | Dinas Kesehatan (Dinas Kesehatan Kabupaten Lamongan) |
| Pagu Anggaran | Rp 6.850.000.000 (Rp 6,85 M) |
| Sumber Pembiayaan | DAK Penguatan Sistem Kesehatan & APBD Kab. Lamongan |
| Status | **Selesai** |
| Progres | `100%` |
| Tanggal Mulai | `2025-01-20` |
| Estimasi Selesai | `2026-07-31` |
| Tanggal Selesai Aktual | `2026-07-19` |
| Nomor Kontrak | `440/SPK-GED/LAM-GED-2025-002` |
| Kode SiRUP | `7351904` |
| PIN Mandor | `PJ-27401` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: dr. Taufik Hidayat (Dinas Kesehatan)
- **Pejabat Pembuat Komitmen (PPK)**: dr. Chaidir Annas
- **Kontraktor Pelaksana**: PT Cipta Bangun Graha
- **Konsultan Pengawas**: CV Prisma Estetika Desain
- **Kepala Mandor / Site Manager**: Andi Kurniawan, S.T. (Site Engineer) & Sumardi (Mandor Ruang BSL-2 & MEP HEPA)

#### C. Lokasi
- **Kecamatan**: Kecamatan Lamongan (Kota) (`wilayah_id = 23`, kode `35.24.22`)
- **Desa / Kelurahan**: Kelurahan Banjarmendalan (`desa_id = 401`, kode `35.24.22.1020`)
- **Koordinat**: `-7.116800, 112.408600`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.116800,112.408600) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.116800,112.408600)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Pembangunan gedung laboratorium kesehatan masyarakat 2 lantai standar Bio Safety Level 2 (BSL-2)
- **Dimensi Utama**: Bangunan 2 lantai luas total 1.050 m2 (525 m2 per lantai), terdiri atas ruang PCR mikrobiologi, lab uji kimia air & pangan, ruang pengambilan sampel, dan gudang reagen
- **Perhitungan Volume & Struktur Pendukung**: Struktur beton bertulang K-300 volume 410 m3; sistem tata udara AHU tekanan negatif dilengkapi filter HEPA H14 (efisiensi 99,995%); lantai vinyl anti-bakteri seamless seluas 620 m2; IPAL limbah cair laboratorium kapasitas 10 m3/hari (±Rp 6,52 jt/m2 standar BSL-2)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pekerjaan Pondasi Footplate & Struktur Beton Bertulang Lantai 1-2 | 26% | `2025-05-15` | Pengecoran kolom, balok, dan dak atap beton kedap air di Kelurahan Banjarmendalan tuntas. |
| 2 | Pekerjaan Arsitektur, Partisi Ruang Lab & Lantai Vinyl Anti-Bakteri | 61% | `2025-11-06` | Pemasangan dinding sandwich panel ruang PCR dan lantai vinyl seamless 620 m2 selesai tanpa celah sambungan. |
| 3 | Instalasi AHU Tekanan Negatif HEPA H14, Fume Hood & IPAL Lab | 89% | `2026-04-22` | Seluruh ducting AHU, exhaust fan kimia, dan bak netralisasi limbah cair terpasang sesuai gambar kerja. |
| 4 | Validasi Ruang BSL-2, Uji Particle Counter & Serah Terima PHO | 100% | `2026-07-19` | Pengujian tekanan negatif -15 Pa dan jumlah partikel lolos standar Kemenkes; PHO tuntas 12 hari lebih cepat dari jadwal. |

#### F. Dokumentasi
- **Foto Utama**: `gedung_publik_lamongan_22.jpg` (DB path: `/uploads/gedung_publik_lamongan_22.jpg`, ukuran 1650 KB, diunggah `2026-07-19` oleh dr. Taufik Hidayat — gedung 2 lantai Labkesda standar BSL-2 Kelurahan Banjarmendalan selesai 100%)

#### H. Aduan Warga
- *Belum ada aduan warga tercatat hingga `2026-11-18`.*

#### I. Rating
- **Lestari Ningrum** (`2026-08-14`): **5/5** ★ — *"Gedung Labkesda yang baru bersih, modern, dan ruang tunggu pengambilan sampelnya sangat nyaman."*

#### J. Evaluasi FHO (Serah Terima Akhir)
- **Status FHO**: **`terjadwal`** · **Tanggal Verifikasi**: `NULL` (belum jatuh tempo per `2026-11-18`)
- **Jadwal FHO (PHO + 180 hari)**: **`2027-01-15`** (PHO `2026-07-19`) · **OPD Penanggung Jawab**: Dinas Kesehatan
- **Keterangan**: Masa pemeliharaan 180 hari belum berakhir (baru berjalan 122 hari). Inspeksi FHO ruang BSL-2, AHU HEPA H14, dan IPAL lab dijadwalkan pada `2027-01-15`.

---

<a id="proyek-23"></a>
### Proyek ID 23: Gedung Bedah & Rawat Inap Terpadu RSUD dr. Soegiri

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `23` |
| Kode Proyek | `LMG-SKR-023` |
| Nama Proyek | Gedung Bedah & Rawat Inap Terpadu RSUD dr. Soegiri |
| Kategori | `gedung_publik` (Gedung & Fasilitas Publik) |
| OPD | Dinas Kesehatan (Dinas Kesehatan Kabupaten Lamongan) |
| Pagu Anggaran | Rp 18.500.000.000 (Rp 18,50 M) |
| Sumber Pembiayaan | Silpa BLUD RSUD dr. Soegiri & APBD Kab. Lamongan |
| Status | **Sedang Berjalan** |
| Progres | `74%` |
| Tanggal Mulai | `2025-10-13` |
| Estimasi Selesai | `2027-04-30` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `440/SPK-GED/LAM-GED-2025-003` |
| Kode SiRUP | `4618295` |
| PIN Mandor | `PJ-63817` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: dr. Taufik Hidayat (Dinas Kesehatan)
- **Pejabat Pembuat Komitmen (PPK)**: dr. Nurul Hidayati, M.Kes.
- **Kontraktor Pelaksana**: PT Galatama Cipta Graha
- **Konsultan Pengawas**: PT Virama Karya (Persero)
- **Kepala Mandor / Site Manager**: Ir. Eko Prasetyo (Construction Manager) & Bambang Irawan (Mandor Struktur 5 Lantai & MOT)

#### C. Lokasi
- **Kecamatan**: Kecamatan Lamongan (Kota) (`wilayah_id = 23`, kode `35.24.22`)
- **Desa / Kelurahan**: Kelurahan Sukorejo (`desa_id = 394`, kode `35.24.22.1012`)
- **Koordinat**: `-7.122500, 112.419100`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.122500,112.419100) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.122500,112.419100)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Pembangunan gedung bedah sentral dan perawatan intensif terpadu 4 lantai dilengkapi Modular Operating Theatre (MOT)
- **Dimensi Utama**: Bangunan 4 lantai luas total 2.400 m2 (600 m2 per lantai), terdiri atas 4 kamar operasi MOT, ruang intensif ICU/ICCU/NICU kapasitas 24 bed, dan ruang pemulihan
- **Perhitungan Volume & Struktur Pendukung**: Struktur beton bertulang K-350 tahan gempa volume 960 m3; 4 paket dinding panel baja anti-bakteri & laminar airflow MOT; sistem sprinkler kebakaran otomatis 180 titik; pengadaan genset cadangan khusus bedah 500 kVA (±Rp 7,71 jt/m2 standar ruang bedah MOT)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pekerjaan Pondasi Bore Pile & Struktur Beton Lantai 1-2 | 25% | `2026-02-05` | Struktur bawah dan lantai 2 selesai tanpa menimbulkan getaran berlebih ke gedung rawat inap lama. |
| 2 | Topping Off Lantai 4 & Pekerjaan Dinding serta Plafon Ruang Intensif | 52% | `2026-06-26` | Seluruh struktur 4 lantai rampung dan sekat ruang isolasi ICU/NICU selesai dipasang. |
| 3 | Pemasangan 4 Kamar Operasi MOT, Sprinkler Otomatis & Panel Daya Cadangan | 74% | `2026-11-08` | Tiga dari empat ruang MOT telah terpasang dinding modular dan plafon laminar airflow, sementara instalasi sprinkler mencapai 85%. |

#### F. Dokumentasi
- **Foto Utama**: `gedung_publik_lamongan_23.jpg` (DB path: `/uploads/gedung_publik_lamongan_23.jpg`, ukuran 1810 KB, diunggah `2026-11-08` oleh dr. Taufik Hidayat — pemasangan dinding modular kamar operasi MOT Gedung Bedah RSUD dr. Soegiri)

#### H. Aduan Warga
- **Aduan #1** (`2026-08-19`, Pelapor: Lestari Ningrum, Status: `ditanggapi`):
  - *Isi*: "Suara pemotongan besi di lantai 3 pada siang hari agak mengganggu kenyamanan pasien di gedung rawat inap sebelahnya."
  - *Tanggapan Admin OPD* (**dr. Taufik Hidayat**, `2026-08-21`): "Pihak kontraktor telah memindahkan bengkel pemotongan besi ke area belakang rumah sakit serta memasang tirai peredam suara (sound barrier) pada sisi yang menghadap ruang perawatan."

#### I. Rating
- **Lestari Ningrum** (`2026-11-10`): **4/5** ★ — *"Pembangunan gedung bedah RSUD dr. Soegiri berjalan tertib dan keluhan kebisingan langsung ditangani pihak rumah sakit."*

---

<a id="proyek-24"></a>
### Proyek ID 24: Rekonstruksi Total Stadion Gelora Surajaya (Standar FIFA)

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `24` |
| Kode Proyek | `DKT-SDR-024` |
| Nama Proyek | Rekonstruksi Total Stadion Gelora Surajaya (Standar FIFA) |
| Kategori | `gedung_publik` (Gedung & Fasilitas Publik) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 145.000.000.000 (Rp 145,00 M) |
| Sumber Pembiayaan | APBN Kementerian PUPR & APBD Kab. Lamongan |
| Status | **Sedang Berjalan** |
| Progres | `75%` |
| Tanggal Mulai | `2025-05-05` |
| Estimasi Selesai | `2027-05-31` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-GED/LAM-GED-2025-004` |
| Kode SiRUP | `8924150` |
| PIN Mandor | `PJ-41795` |
| Catatan OPD | Pembangunan fisik dieksekusi Dinas PU Bina Marga sebagai pelaksana konstruksi strategis untuk Dinas Pemuda dan Olahraga |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Ir. Bagus Pratama, M.T.
- **Kontraktor Pelaksana**: PT Wijaya Karya Bangunan Gedung Tbk
- **Konsultan Pengawas**: PT Ciriajasa Engineering Consultants
- **Kepala Mandor / Site Manager**: Ir. Nugroho Adi Wibowo (Project Manager) & H. Suryadi (Mandor Tribun, Atap PTFE & Rumput FIFA)

#### C. Lokasi
- **Kecamatan**: Kecamatan Deket (`wilayah_id = 26`, kode `35.24.25`)
- **Desa / Kelurahan**: Desa Sidorejo (`desa_id = 448`, kode `35.24.25.2001`)
- **Koordinat**: `-7.118900, 112.437500`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.118900,112.437500) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.118900,112.437500)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Rekonstruksi total stadion sepak bola berkapasitas 12.097 single seat berstandar FIFA
- **Dimensi Utama**: Luas bangunan stadion & tribun 21.800 m2, lapangan bermain 105 m x 68 m (7.140 m2), kapasitas 12.097 penonton duduk (single seat), 4 menara lampu LED 1.800 lux
- **Perhitungan Volume & Struktur Pendukung**: Beton bertulang & precast tribun K-350 volume 14.200 m3; struktur rangka atap baja tribun barat & timur berat 680 ton dengan penutup membran PTFE seluas 6.400 m2; sistem drainase sub-air lapangan + rumput Zoysia Matrella 7.140 m2; ruang ganti pemain, media center, dan scoring board LED

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pembongkaran Tribun Eksisting, Pemancangan Pondasi & Drainase Sub-Air Lapangan | 24% | `2025-09-25` | Pembongkaran struktur lama tuntas dan jaringan pipa perforasi drainase bawah lapangan selesai terpasang. |
| 2 | Pemasangan Precast Tribun 4 Sisi & Rangka Baja Atap Tribun Barat | 53% | `2026-04-28` | Seluruh elemen precast tangga tribun terpasang penuh dan pengangkatan rangka baja atap barat selesai aman. |
| 3 | Pemasangan Membran PTFE, 8.200 Single Seat & Penanaman Rumput Zoysia Matrella | 75% | `2026-11-12` | Penanaman rumput standar FIFA selesai 100% dalam tahap pemeliharaan akar, pemasangan single seat mencapai 68%, dan 4 menara lampu LED berdiri. |

#### F. Dokumentasi
- **Foto Utama**: `gedung_publik_deket_24.jpg` (DB path: `/uploads/gedung_publik_deket_24.jpg`, ukuran 1950 KB, diunggah `2026-11-12` oleh Bambang Suryono, S.T. — pemasangan kursi single seat tribun dan penanaman rumput Zoysia Matrella Stadion Surajaya)

#### H. Aduan Warga
- **Aduan #1** (`2026-09-04`, Pelapor: Nur Hidayah, Status: `ditanggapi`):
  - *Isi*: "Tanah bekas ban truk proyek yang keluar dari gerbang Stadion Surajaya membuat permukaan jalan nasional di depan Desa Sidorejo licin saat hujan."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2026-09-05`): "Kontraktor telah mengaktifkan bak cuci roda (wheel washing bay) bertekanan tinggi di pintu keluar proyek dan menyiagakan petugas penyapu jalan setiap sore."

#### I. Rating
- **Nur Hidayah** (`2026-11-13`): **5/5** ★ — *"Stadion Surajaya yang baru luar biasa megah, rumputnya hijau rata dan atap tribunnya sangat modern."*

---

<a id="proyek-25"></a>
### Proyek ID 25: Revitalisasi Alun-Alun Lamongan & Mandhapa Seni Budaya

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `25` |
| Kode Proyek | `LMG-JTS-025` |
| Nama Proyek | Revitalisasi Alun-Alun Lamongan & Mandhapa Seni Budaya |
| Kategori | `taman` (Taman & Ruang Terbuka Hijau (RTH)) |
| OPD | Dinas PRKPCK (Dinas Perumahan Rakyat, Kawasan Permukiman dan Cipta Karya Kabupaten Lamongan) |
| Pagu Anggaran | Rp 8.850.000.000 (Rp 8,85 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan (Prioritas RTH Ramah Anak) |
| Status | **Sedang Berjalan** |
| Progres | `85%` |
| Tanggal Mulai | `2025-11-24` |
| Estimasi Selesai | `2027-01-15` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `640/SPK-TMN/LAM-TMN-2025-001` |
| Kode SiRUP | `7124869` |
| PIN Mandor | `PJ-78149` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Ir. Joko Santoso (Dinas PRKPCK)
- **Pejabat Pembuat Komitmen (PPK)**: Dwi Prasetyo, S.T.
- **Kontraktor Pelaksana**: PT Bumi Surya Kencana
- **Konsultan Pengawas**: CV Ganeshatama Konsultan
- **Kepala Mandor / Site Manager**: Budi Hermawan (Site Supervisor) & Kardianto (Mandor Lansekap, EPDM & Mandhapa)

#### C. Lokasi
- **Kecamatan**: Kecamatan Lamongan (Kota) (`wilayah_id = 23`, kode `35.24.22`)
- **Desa / Kelurahan**: Kelurahan Jetis (`desa_id = 400`, kode `35.24.22.1019`)
- **Koordinat**: `-7.119700, 112.415000`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.119700,112.415000) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.119700,112.415000)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Revitalisasi taman kota terpadu, lintasan lari karet EPDM, zona bermain ramah anak, dan Mandhapa seni budaya
- **Dimensi Utama**: Luas penataan kawasan Alun-Alun 2,8 hektar (28.000 m2), lintasan jogging track rubber EPDM keliling 400 m lebar 3,0 m (1.200 m2), bangunan Mandhapa 18 m x 18 m (324 m2)
- **Perhitungan Volume & Struktur Pendukung**: Lantai rubber EPDM tuang tebal 15 mm seluas 1.200 m2; area playground ramah anak berpagar 450 m2 dengan 14 wahana sertifikat SNI; kolam air mancur menari 16 nosel LED; paving blok andesit & jalur pemandu difabel 4.600 m2; 54 tiang lampu taman LED

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pembersihan Area, Penataan Drainase Taman & Pondasi Mandhapa Seni Budaya | 28% | `2026-02-20` | Saluran resapan keliling taman tuntas diperbaiki dan struktur tiang utama Mandhapa berornamen khas Lamongan berdiri. |
| 2 | Pemasangan Paving Andesit, Jalur Difabel & Instalasi Air Mancur Menari | 61% | `2026-07-14` | Pemasangan paving 4.600 m2 rampung dan uji pompa sirkulasi 16 nosel air mancur berjalan lancar. |
| 3 | Pengecoran Jogging Track EPDM 400 m, Wahana Playground & Finishing Mandhapa | 85% | `2026-11-10` | Lintasan EPDM dan 14 wahana bermain anak selesai terpasang, menyisakan penanaman rumput gajah mini dan uji lampu malam. |

#### F. Dokumentasi
- **Foto Utama**: `taman_lamongan_25.jpg` (DB path: `/uploads/taman_lamongan_25.jpg`, ukuran 1625 KB, diunggah `2026-11-10` oleh Ir. Joko Santoso — penataan jogging track rubber EPDM dan rekonstruksi Mandhapa Alun-Alun Lamongan)

#### H. Aduan Warga
- **Aduan #1** (`2026-10-08`, Pelapor: Lestari Ningrum, Status: `ditanggapi`):
  - *Isi*: "Mohon disediakan lebih banyak bangku taman berteduh dan akses ramp kursi roda di sisi selatan Alun-Alun dekat Masjid Agung."
  - *Tanggapan Admin OPD* (**Ir. Joko Santoso**, `2026-10-10`): "Dinas PRKPCK telah menambahkan 18 unit bangku taman besi cor di bawah naungan pohon trembesi serta 4 titik ramp landai berstandar aksesibilitas disabilitas di pintu selatan."

#### I. Rating
- **Lestari Ningrum** (`2026-11-13`): **5/5** ★ — *"Alun-Alun Lamongan makin cantik dan ramah keluarga, jogging track karetnya empuk dan playground anak sangat rapi."*

---

<a id="proyek-26"></a>
### Proyek ID 26: Pembangunan Ruang Terbuka Hijau & Eco-Park Babat

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `26` |
| Kode Proyek | `BBT-BBT-026` |
| Nama Proyek | Pembangunan Ruang Terbuka Hijau & Eco-Park Babat |
| Kategori | `taman` (Taman & Ruang Terbuka Hijau (RTH)) |
| OPD | Dinas PRKPCK (Dinas Perumahan Rakyat, Kawasan Permukiman dan Cipta Karya Kabupaten Lamongan) |
| Pagu Anggaran | Rp 4.100.000.000 (Rp 4,10 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan (Alokasi DBHCHT) |
| Status | **Tertunda** |
| Progres | `76%` |
| Tanggal Mulai | `2025-07-07` |
| Estimasi Selesai | `2026-09-15` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `640/SPK-TMN/LAM-TMN-2025-002` |
| Kode SiRUP | `2695031` |
| PIN Mandor | `PJ-33587` |
| Catatan OPD | - |
| Alasan Tunda | Pemadatan ulang tanah bekas rawa dan penyesuaian pondasi plaza UMKM pasca uji sondir tambahan |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Ir. Joko Santoso (Dinas PRKPCK)
- **Pejabat Pembuat Komitmen (PPK)**: Dwi Prasetyo, S.T.
- **Kontraktor Pelaksana**: CV Alam Hijau Lestari
- **Konsultan Pengawas**: CV Mitra Kreasi Alam
- **Kepala Mandor / Site Manager**: Suyanto (Mandor Cut-and-Fill Lahan Rawa, Plaza UMKM & PJU Solar Cell)

#### C. Lokasi
- **Kecamatan**: Kecamatan Babat (`wilayah_id = 6`, kode `35.24.05`)
- **Desa / Kelurahan**: Kelurahan Babat (`desa_id = 84`, kode `35.24.05.1003`)
- **Koordinat**: `-7.109500, 112.174200`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.109500,112.174200) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.109500,112.174200)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Transformasi lahan eks rawa menjadi ruang terbuka hijau (RTH) edukasi ekologis dan plaza UMKM
- **Dimensi Utama**: Luas kawasan RTH 1,5 hektar (15.000 m2), kolam retensi ekologis 2.200 m2, lintasan pedestrian keliling 620 m lebar 2,5 m (1.550 m2), plaza 16 kios UMKM seluas 480 m2
- **Perhitungan Volume & Struktur Pendukung**: Pekerjaan timbunan tanah pilihan & pemadatan lahan rawa 6.800 m3; perkuatan pondasi strauss pile 48 titik untuk plaza UMKM (addendum uji sondir); penanaman 450 pohon peneduh (tabebuya, trembesi, pule); 32 tiang lampu taman solar cell

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pembersihan Semak Rawa, Penggalian Kolam Retensi & Timbunan Awal | 26% | `2025-10-20` | Pembentukan kolam retensi 2.200 m2 dan penimbunan awal area taman sisi barat Kelurahan Babat selesai. |
| 2 | Pembuatan Jalur Pedestrian 620 m & Penanaman 450 Pohon Peneduh | 58% | `2026-04-24` | Lintasan pedestrian paving selesai dan 450 bibit pohon peneduh tertanam dengan tingkat hidup 96%. |
| 3 | Penundaan Pondasi Plaza UMKM Akibat Penurunan Tanah Eks Rawa | 69% | `2026-09-08` | Uji sondir tambahan menemukan lapisan lunak sedalam 4,5 m di zona plaza UMKM sehingga pekerjaan struktur kios ditunda untuk pemadatan ulang. |
| 4 | Pemadatan Ulang, Pembuatan 48 Strauss Pile & Pemasangan PJU Solar Cell | 76% | `2026-10-30` | Seluruh 48 titik strauss pile plaza UMKM rampung dicor dan 26 dari 32 tiang lampu solar cell telah terpasang menyala. |

#### F. Dokumentasi
- **Foto Utama**: `taman_babat_26.jpg` (DB path: `/uploads/taman_babat_26.jpg`, ukuran 1475 KB, diunggah `2026-10-30` oleh Ir. Joko Santoso — pemadatan ulang lahan plaza UMKM dan penanaman pohon peneduh Eco-Park Babat)

#### H. Aduan Warga
- **Aduan #1** (`2026-10-03`, Pelapor: Agus Prayitno, Status: `ditanggapi`):
  - *Isi*: "Eco-Park Babat seharusnya rampung pertengahan September 2026, tapi area kios UMKM masih dipagar seng dan belum bisa dimanfaatkan warga."
  - *Tanggapan Admin OPD* (**Ir. Joko Santoso**, `2026-10-06`): "Penundaan disebabkan hasil uji sondir tanah eks rawa yang mengharuskan pemadatan ulang dan penambahan pondasi strauss pile agar bangunan plaza UMKM tidak turun di kemudian hari. Saat ini pondasi sudah selesai dan penyelesaian atap kios ditargetkan akhir Desember 2026."

#### I. Rating
- **Agus Prayitno** (`2026-10-15`): **3/5** ★ — *"Taman dan pohon peneduhnya sudah mulai rimbun, hanya saja penyelesaian kios UMKM mundur cukup lama dari jadwal awal."*

---

<a id="proyek-27"></a>
### Proyek ID 27: Revitalisasi Ruang Terbuka Publik & Taman Olahraga Maduran

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `27` |
| Kode Proyek | `MDR-PNG-027` |
| Nama Proyek | Revitalisasi Ruang Terbuka Publik & Taman Olahraga Maduran |
| Kategori | `taman` (Taman & Ruang Terbuka Hijau (RTH)) |
| OPD | Dinas PRKPCK (Dinas Perumahan Rakyat, Kawasan Permukiman dan Cipta Karya Kabupaten Lamongan) |
| Pagu Anggaran | Rp 3.200.000.000 (Rp 3,20 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan |
| Status | **Sedang Berjalan** |
| Progres | `56%` |
| Tanggal Mulai | `2026-04-20` |
| Estimasi Selesai | `2027-05-20` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `640/SPK-TMN/LAM-TMN-2026-003` |
| Kode SiRUP | `8540917` |
| PIN Mandor | `PJ-69412` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Ir. Joko Santoso (Dinas PRKPCK)
- **Pejabat Pembuat Komitmen (PPK)**: Dwi Prasetyo, S.T.
- **Kontraktor Pelaksana**: CV Sumber Artha Mandiri
- **Konsultan Pengawas**: CV Karya Mandiri Desain
- **Kepala Mandor / Site Manager**: Eko Wahyudi, S.T. (Site Engineer) & Supardi (Mandor Lapangan, Amphitheater & Paving Difabel)

#### C. Lokasi
- **Kecamatan**: Kecamatan Maduran (`wilayah_id = 11`, kode `35.24.10`)
- **Desa / Kelurahan**: Desa Pangean (`desa_id = 185`, kode `35.24.10.2006`)
- **Koordinat**: `-6.976500, 112.312800`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-6.976500,112.312800) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-6.976500,112.312800)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Revitalisasi ruang terbuka publik, lapangan olahraga desa, outdoor fitness, dan mini amphitheater pemuda
- **Dimensi Utama**: Luas lahan 9.600 m2, lapangan sepak bola 90 m x 55 m (4.950 m2), jogging track paving 340 m lebar 2,5 m (850 m2), mini amphitheater kapasitas 250 penonton
- **Perhitungan Volume & Struktur Pendukung**: Perataan & drainase keliling lapangan + penanaman rumput 4.950 m2; pemasangan paving blok & guiding block difabel 1.450 m2; 10 unit alat outdoor fitness baja galvanis; 4 tower lampu sorot LED lapangan masing-masing 4 x 400 watt

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pembersihan Lahan, Drainase Keliling Lapangan & Perataan Permukaan | 20% | `2026-06-19` | Saluran pembuangan keliling lapangan Desa Pangean selesai sehingga air hujan tidak lagi menggenangi tengah lapangan. |
| 2 | Pekerjaan Struktur Mini Amphitheater & Pemasangan Paving Difabel | 39% | `2026-08-31` | Undakan duduk beton amphitheater 5 trap rampung dicor dan pemasangan paving jalur pejalan kaki mencapai 65%. |
| 3 | Penanaman Rumput Lapangan, Pemasangan Alat Fitness & Pondasi 4 Tower Lampu | 56% | `2026-11-06` | Penanaman rumput lapangan selesai 75%, 6 dari 10 alat fitness terpasang, dan pondasi 4 menara lampu sorot tuntas dicor. |

#### F. Dokumentasi
- **Foto Utama**: `taman_maduran_27.jpg` (DB path: `/uploads/taman_maduran_27.jpg`, ukuran 1520 KB, diunggah `2026-11-06` oleh Ir. Joko Santoso — penataan lapangan olahraga dan mini amphitheater pemuda Desa Pangean Maduran)

#### H. Aduan Warga
- *Belum ada aduan warga tercatat hingga `2026-11-18`.*

#### I. Rating
- **Arif Rahman** (`2026-11-09`): **4/5** ★ — *"Karang taruna Desa Pangean antusias sekali melihat mini amphitheater dan alat fitness luar ruang yang sedang dikerjakan."*

---

<a id="proyek-28"></a>
### Proyek ID 28: Sentra Pengeringan & Pergudangan Jagung Modern Solokuro

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `28` |
| Kode Proyek | `SLK-SLK-028` |
| Nama Proyek | Sentra Pengeringan & Pergudangan Jagung Modern Solokuro |
| Kategori | `gedung_publik` (Gedung & Fasilitas Publik) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 5.900.000.000 (Rp 5,90 M) |
| Sumber Pembiayaan | DAK Fisik Bidang Pertanian & APBD Kab. Lamongan |
| Status | **Sedang Berjalan** |
| Progres | `69%` |
| Tanggal Mulai | `2026-02-23` |
| Estimasi Selesai | `2027-04-05` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-GED/LAM-GED-2026-005` |
| Kode SiRUP | `1367589` |
| PIN Mandor | `PJ-84620` |
| Catatan OPD | Pembangunan fisik dieksekusi Dinas PU Bina Marga untuk Dinas Ketahanan Pangan dan Pertanian |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Ir. Bagus Pratama, M.T.
- **Kontraktor Pelaksana**: PT Agronusa Bangun Persada
- **Konsultan Pengawas**: CV Duta Agritech Konsultan
- **Kepala Mandor / Site Manager**: Suparno (Mandor Konstruksi Lumbung 1.000 Ton, Silo & Mesin Vertical Dryer)

#### C. Lokasi
- **Kecamatan**: Kecamatan Solokuro (`wilayah_id = 16`, kode `35.24.15`)
- **Desa / Kelurahan**: Desa Solokuro (`desa_id = 279`, kode `35.24.15.2006`)
- **Koordinat**: `-6.968400, 112.378500`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-6.968400,112.378500) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-6.968400,112.378500)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Pembangunan sentra pengeringan (vertical dryer) dan gudang penyimpanan jagung modern kapasitas 1.000 ton
- **Dimensi Utama**: Bangunan gudang baja WF 36 m x 20 m (720 m2) tinggi kolom 8,0 m, kantor operasional Gapoktan 80 m2, lantai jemur beton 600 m2
- **Perhitungan Volume & Struktur Pendukung**: Lantai gudang beton bertulang K-300 heavy duty tebal 20 cm (720 x 0,20 = 144 m3) + lantai jemur tebal 15 cm (600 x 0,15 = 90 m3); rangka portal baja WF 300 berat 34,5 ton; 1 unit mesin vertical dryer kapasitas 25 ton/hari; 1 unit jembatan timbang truk digital kapasitas 50 ton

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pekerjaan Pondasi Pedestal, Lantai Gudang Heavy Duty & Fondasi Jembatan Timbang | 24% | `2026-05-08` | Pengecoran lantai gudang K-300 seluas 720 m2 dan pit beton jembatan timbang 50 ton di Desa Solokuro selesai. |
| 2 | Ereksi Portal Baja WF 300, Penutup Atap Galvalum & Kantor Gapoktan | 49% | `2026-08-12` | Rangka baja utama 34,5 ton berdiri lengkap dengan insulasi atap peredam panas dan ruang kantor operasional. |
| 3 | Instalasi Mesin Vertical Dryer 25 Ton/Hari & Kalibrasi Awal Timbangan Digital | 69% | `2026-11-07` | Menara pengering vertical dryer dan bucket elevator terpasang 85%, menunggu penyambungan daya listrik 3 fase 82,5 kVA. |

#### F. Dokumentasi
- **Foto Utama**: `gedung_publik_solokuro_28.jpg` (DB path: `/uploads/gedung_publik_solokuro_28.jpg`, ukuran 1595 KB, diunggah `2026-11-07` oleh Bambang Suryono, S.T. — ereksi rangka baja gudang lumbung jagung 1.000 ton dan vertical dryer Solokuro)

#### H. Aduan Warga
- **Aduan #1** (`2026-09-21`, Pelapor: Sulastri, Status: `ditanggapi`):
  - *Isi*: "Jalan akses masuk dari jalan desa menuju halaman gudang jagung masih becek tanah merah saat dilalui mobil pikap material."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2026-09-23`): "Dinas PU Bina Marga telah memerintahkan pelaksana menghampar lapis sirtu padat sepanjang 75 m di akses masuk gudang sebelum pengecoran halaman parkir rampung."

#### I. Rating
- **Sulastri** (`2026-11-09`): **5/5** ★ — *"Petani jagung Solokuro sangat terbantu nanti kalau musim panen berbarengan hujan karena sudah ada mesin pengering 25 ton per hari."*

---

<a id="proyek-29"></a>
### Proyek ID 29: Fasilitas Cold Storage & TPI Higienis Brondong

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `29` |
| Kode Proyek | `BRD-BRD-029` |
| Nama Proyek | Fasilitas Cold Storage & TPI Higienis Brondong |
| Kategori | `gedung_publik` (Gedung & Fasilitas Publik) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 14.600.000.000 (Rp 14,60 M) |
| Sumber Pembiayaan | DAK Fisik Kelautan dan Perikanan & APBD Kab. Lamongan |
| Status | **Sedang Berjalan** |
| Progres | `71%` |
| Tanggal Mulai | `2026-01-05` |
| Estimasi Selesai | `2027-04-20` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-GED/LAM-GED-2026-006` |
| Kode SiRUP | `5903418` |
| PIN Mandor | `PJ-52903` |
| Catatan OPD | Pembangunan fisik dieksekusi Dinas PU Bina Marga untuk Dinas Perikanan |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Ir. Bagus Pratama, M.T.
- **Kontraktor Pelaksana**: PT Samudera Maritim Konstruksi
- **Konsultan Pengawas**: CV Samudera Konsultan Teknik
- **Kepala Mandor / Site Manager**: Mulyadi (Mandor Dermaga Higienis, Cold Storage 100 Ton & Pabrik Es)

#### C. Lokasi
- **Kecamatan**: Kecamatan Brondong (`wilayah_id = 8`, kode `35.24.07`)
- **Desa / Kelurahan**: Kelurahan Brondong (`desa_id = 129`, kode `35.24.07.1010`)
- **Koordinat**: `-6.885200, 112.281400`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-6.885200,112.281400) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-6.885200,112.281400)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Pembangunan dermaga bongkar muat ikan higienis, ruang pendingin (cold storage) 100 ton, dan instalasi pabrik es curah
- **Dimensi Utama**: Bangunan TPI higienis & ruang proses 1.600 m2, ruang cold storage (-20 C) 320 m2 kapasitas simpan 100 ton, ruang pabrik es 180 m2 kapasitas 30 ton/hari, dermaga bongkar 40 m x 8 m (320 m2)
- **Perhitungan Volume & Struktur Pendukung**: Beton struktur K-350 tahan sulfat air laut (dermaga, lantai epoxy food-grade, dan ruang mesin) volume 1.180 m3; panel insulasi poliuretan (PU) tebal 15 cm seluas 980 m2; 2 set kompresor refrigerasi ramah lingkungan R-404a + mesin flake ice 30 ton/hari

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Konstruksi Dermaga Beton Tahan Sulfat & Lantai Ruang Proses TPI | 26% | `2026-04-03` | Pengecoran lantai dermaga bongkar 320 m2 dengan campuran aditif anti-korosi air laut tuntas di kawasan Brondong. |
| 2 | Struktur Bangunan TPI Higienis & Pemasangan Panel PU Cold Storage 100 Ton | 51% | `2026-07-29` | Dinding insulasi poliuretan 15 cm ruang pendingin terpasang kedap udara dan lantai ruang sortir selesai dilapisi epoxy food-grade. |
| 3 | Instalasi Unit Refrigerasi R-404a & Perakitan Mesin Pabrik Es 30 Ton/Hari | 71% | `2026-11-05` | Dua kompresor cold storage dan menara kondensor terpasang, dilanjutkan pemasangan pipa air bersih bertekanan untuk pencucian ikan. |

#### F. Dokumentasi
- **Foto Utama**: `gedung_publik_brondong_29.jpg` (DB path: `/uploads/gedung_publik_brondong_29.jpg`, ukuran 1735 KB, diunggah `2026-11-05` oleh Bambang Suryono, S.T. — pemasangan panel insulasi cold storage 100 ton dan dermaga higienis TPI Brondong)

#### H. Aduan Warga
- **Aduan #1** (`2026-10-10`, Pelapor: Rina Wulandari, Status: `ditanggapi`):
  - *Isi*: "Limbah air cucian alat proyek di sisi selatan dermaga sempat mengalir ke area lapak sortir ikan nelayan."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2026-10-12`): "Pelaksana langsung memasang tanggul karung pasir pengarah dan saluran pembuangan sementara menuju bak pengendap sehingga area lapak nelayan tetap bersih."

#### I. Rating
- **Rina Wulandari** (`2026-11-08`): **5/5** ★ — *"Fasilitas cold storage 100 ton dan pabrik es ini sangat dibutuhkan nelayan Brondong agar harga ikan tidak jatuh saat panen raya."*

---

<a id="proyek-30"></a>
### Proyek ID 30: Puskesmas Rawat Inap & Gedung PONED Ngimbang

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `30` |
| Kode Proyek | `NGB-NGB-030` |
| Nama Proyek | Puskesmas Rawat Inap & Gedung PONED Ngimbang |
| Kategori | `gedung_publik` (Gedung & Fasilitas Publik) |
| OPD | Dinas Kesehatan (Dinas Kesehatan Kabupaten Lamongan) |
| Pagu Anggaran | Rp 4.750.000.000 (Rp 4,75 M) |
| Sumber Pembiayaan | DAK Fisik Kesehatan & APBD Kab. Lamongan |
| Status | **Sedang Berjalan** |
| Progres | `84%` |
| Tanggal Mulai | `2025-11-17` |
| Estimasi Selesai | `2027-01-25` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `440/SPK-GED/LAM-GED-2025-007` |
| Kode SiRUP | `3578240` |
| PIN Mandor | `PJ-16378` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: dr. Taufik Hidayat (Dinas Kesehatan)
- **Pejabat Pembuat Komitmen (PPK)**: dr. Nurul Hidayati, M.Kes.
- **Kontraktor Pelaksana**: CV Sejahtera Bangun Utama
- **Konsultan Pengawas**: CV Medika Graha Teknik
- **Kepala Mandor / Site Manager**: Ir. Hendra Prasetyo (Site Manager) & Sutikno (Mandor Struktur Gedung PONED & IPAL)

#### C. Lokasi
- **Kecamatan**: Kecamatan Ngimbang (`wilayah_id = 5`, kode `35.24.04`)
- **Desa / Kelurahan**: Desa Ngimbang (`desa_id = 79`, kode `35.24.04.2016`)
- **Koordinat**: `-7.291800, 112.189500`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.291800,112.189500) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.291800,112.189500)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Pembangunan gedung puskesmas rawat inap 2 lantai dilengkapi ruang bersalin PONED, radiologi, dan IPAL medis
- **Dimensi Utama**: Bangunan 2 lantai luas total 820 m2 (410 m2 per lantai), kapasitas 20 tempat tidur rawat inap, 1 ruang tindakan persalinan darurat PONED, dan 1 ruang radiologi berlapis timbal
- **Perhitungan Volume & Struktur Pendukung**: Struktur beton bertulang K-300 volume 335 m3; pelapisan dinding Pb (timbal) 2 mm seluas 68 m2 untuk ruang X-ray digital; instalasi IPAL medis kapasitas 12 m3/hari; genset cadangan 60 kVA (±Rp 5,79 jt/m2 standar faskes PONED)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pekerjaan Pondasi & Struktur Beton Bertulang Gedung 2 Lantai | 29% | `2026-02-18` | Seluruh kolom, balok, dan pelat lantai 2 Puskesmas Ngimbang selesai dicor dengan hasil uji slump dan kuat tekan lulus spesifikasi. |
| 2 | Pekerjaan Arsitektur, Dinding Timbal Radiologi & Atap Baja Ringan | 62% | `2026-07-06` | Pemasangan lapisan timbal 2 mm ruang radiologi dan sekat ruang bersalin PONED lantai 1 tuntas dikerjakan. |
| 3 | Finishing Interior, Pemasangan Sanitair Medis & Uji Fungsi IPAL 12 m3/hari | 84% | `2026-11-11` | Pengecatan cat anti-jamur dinding interior selesai 90%, IPAL medis telah diisi media bakteri pengurai, dan pemasangan genset 60 kVA selesai. |

#### F. Dokumentasi
- **Foto Utama**: `gedung_publik_ngimbang_30.jpg` (DB path: `/uploads/gedung_publik_ngimbang_30.jpg`, ukuran 1545 KB, diunggah `2026-11-11` oleh dr. Taufik Hidayat — finishing ruang bersalin PONED dan instalasi IPAL medis Puskesmas Ngimbang)

#### H. Aduan Warga
- *Belum ada aduan warga tercatat hingga `2026-11-18`.*

#### I. Rating
- **Eko Saputra** (`2026-11-12`): **5/5** ★ — *"Gedung PONED Ngimbang terlihat sangat bersih dan siap menampung pasien rawat inap dari wilayah selatan."*

---

<a id="proyek-31"></a>
### Proyek ID 31: Pelebaran & Pengecoran Rigid Jalan Sukodadi - Banjaranyar

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `31` |
| Kode Proyek | `SKD-BNJ-031` |
| Nama Proyek | Pelebaran & Pengecoran Rigid Jalan Sukodadi - Banjaranyar |
| Kategori | `jalan` (Jalan Raya & Koridor) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 3.800.000.000 (Rp 3,80 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan |
| Status | **Sedang Berjalan** |
| Progres | `58%` |
| Tanggal Mulai | `2026-04-13` |
| Estimasi Selesai | `2027-05-10` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JLN/LAM-JLN-2026-013` |
| Kode SiRUP | `5194827` |
| PIN Mandor | `PJ-43069` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Suyitno, S.T.
- **Kontraktor Pelaksana**: CV Bangun Prima Perkasa
- **Konsultan Pengawas**: CV Sentosa Reka Desain
- **Kepala Mandor / Site Manager**: Joko Susanto (Mandor Pelebaran Badan Jalan & Pengecoran Beton K-350)

#### C. Lokasi
- **Kecamatan**: Kecamatan Sukodadi (`wilayah_id = 18`, kode `35.24.17`)
- **Desa / Kelurahan**: Desa Banjarejo (`desa_id = 309`, kode `35.24.17.2011`)
- **Koordinat**: `-7.129400, 112.339600`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.129400,112.339600) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.129400,112.339600)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Pelebaran badan jalan dan perkerasan kaku rigid pavement K-350 penghubung desa
- **Dimensi Utama**: Panjang penanganan 1,55 km (1.550 m, segmen Desa Banjarejo menuju Sukodadi), pelebaran jalan dari 4,0 m menjadi 5,5 m (tambahan 1,5 m), tebal pelat beton 20 cm (0,20 m)
- **Perhitungan Volume & Struktur Pendukung**: Volume pelat beton rigid 1.550 x 5,5 x 0,20 = 1.705 m3; agregat pondasi kelas A zona pelebaran (1.550 x 1,5 x 0,25 = 581,25 m3); bahu jalan sirtu terpadatkan 0,60 m kanan-kiri tebal 20 cm (1.550 x 1,2 x 0,20 = 372 m3) (±Rp 2,45 M/km)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Galian Bahu Pelebaran 1,5 m & Pemadatan Agregat Pondasi Kelas A | 21% | `2026-06-12` | Galian pelebaran dan pemadatan pondasi bahu di sepanjang Desa Banjarejo tuntas 1,55 km. |
| 2 | Pemasangan Bekisting Baja, Plastik Cor & Tulangan Dowel Segmen Utara | 41% | `2026-08-24` | Bekisting baja dan dowel bar terpasang rapi hingga STA 0+900 dengan pengecekan elevasi waterpass. |
| 3 | Pengecoran Pelat Rigid Pavement K-350 Lebar 5,5 m | 58% | `2026-11-09` | Pengecoran menuntaskan 0,90 km dengan pemadatan vibrator internal penuh tanpa rongga sarang kerikil. |

#### F. Dokumentasi
- **Foto Utama**: `jalan_sukodadi_31.jpg` (DB path: `/uploads/jalan_sukodadi_31.jpg`, ukuran 1460 KB, diunggah `2026-11-09` oleh Bambang Suryono, S.T. — pelebaran badan jalan dan pengecoran rigid K-350 ruas Sukodadi-Banjarejo)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Sukodadi -> Desa Kadungrembug -> Desa Sumberaji -> Desa Banjarejo | 4.6 km | 10 menit | Jalur mobil pikap dan angkutan hasil pertanian warga setempat |
| `kedua` | Jalan Poros Desa Madulegi -> Desa Plumpang -> Desa Banjarejo | 3.1 km | 7 menit | Jalur alternatif pendek bagi pengendara sepeda motor |

#### H. Aduan Warga
- **Aduan #1** (`2026-10-01`, Pelapor: Budi Santoso, Status: `ditanggapi`):
  - *Isi*: "Galian bahu pelebaran di tikungan dekat balai desa belum diberi tali pembatas sehingga rawan dilindas sepeda motor saat gelap."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2026-10-03`): "Tim pelaksana segera memasang police line kuning-hitam dan 14 patok lampu kedip reflektor sepanjang zona galian aktif."

#### I. Rating
- **Budi Santoso** (`2026-11-11`): **4/5** ★ — *"Jalan yang dulunya sempit 4 meter kini dilebarkan jadi 5,5 meter sehingga mobil sudah leluasa berpapasan."*

---

<a id="proyek-32"></a>
### Proyek ID 32: Normalisasi Sungai Blawi & Saluran Pembuang Rawa Semando

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `32` |
| Kode Proyek | `KBN-BLW-032` |
| Nama Proyek | Normalisasi Sungai Blawi & Saluran Pembuang Rawa Semando |
| Kategori | `drainase` (Drainase, Sungai & Irigasi) |
| OPD | Dinas Sumber Daya Air (Dinas Sumber Daya Air Kabupaten Lamongan) |
| Pagu Anggaran | Rp 3.650.000.000 (Rp 3,65 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan |
| Status | **Sedang Berjalan** |
| Progres | `75%` |
| Tanggal Mulai | `2026-01-26` |
| Estimasi Selesai | `2027-03-05` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `611/SPK-DRA/LAM-DRA-2026-006` |
| Kode SiRUP | `8391275` |
| PIN Mandor | `PJ-24188` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Erlangga, S.T. (Dinas Sumber Daya Air)
- **Pejabat Pembuat Komitmen (PPK)**: Rina Kusuma, S.T.
- **Kontraktor Pelaksana**: CV Tirta Alam Subur
- **Konsultan Pengawas**: CV Graha Cipta Mandiri
- **Kepala Mandor / Site Manager**: Kardi (Mandor Pengerukan Sedimen, Bronjong Gabion 8 Titik & Pintu Klep)

#### C. Lokasi
- **Kecamatan**: Kecamatan Karangbinangun (`wilayah_id = 25`, kode `35.24.24`)
- **Desa / Kelurahan**: Desa Blawi (`desa_id = 434`, kode `35.24.24.2008`)
- **Koordinat**: `-7.018600, 112.408200`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.018600,112.408200) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.018600,112.408200)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Normalisasi alur sungai pembuang, perkuatan tebing bronjong kawat gabion, dan pemasangan pintu klep otomatis
- **Dimensi Utama**: Panjang pengerukan sedimen 6,20 km (6.200 m, alur Desa Blawi s/d Rawa Semando), lebar dasar rata-rata 6,0 m, kedalaman keruk rata-rata 1,2 m, perkuatan bronjong pada 8 titik longsor (total panjang 320 m)
- **Perhitungan Volume & Struktur Pendukung**: Volume pengerukan sedimen lumpur 6.200 x 6,0 x 1,2 = 44.640 m3; pasangan bronjong kawat galvanis PVC ukuran 2x1x0,5 m sebanyak 960 unit (volume batu pengisi 960 m3) di 8 titik tebing kritis; 2 unit pintu klep otomatis FRP anti-balik air pasang

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Survei Titik Longsor Tebing & Mobilisasi 2 Unit Excavator Ponton | 23% | `2026-04-09` | Pemetaan 8 titik gerusan tebing di Desa Blawi tuntas dan 2 excavator mulai mengeruk dari muara Rawa Semando. |
| 2 | Pengerukan Sedimen 30.000 m3 & Pemasangan 5 Titik Bronjong Gabion | 51% | `2026-07-28` | Pengerukan menuntaskan 4,1 km alur dan 600 unit bronjong kawat berlapis PVC berdiri di 5 titik longsor utama. |
| 3 | Pemasangan 2 Pintu Klep Otomatis FRP & Penyelesaian Bronjong Titik 6-8 | 75% | `2026-11-07` | Volume kerukan mencapai 33.500 m3 (4,65 km) dan kedua pintu klep otomatis selesai dipasang di mulut saluran pembuang. |

#### F. Dokumentasi
- **Foto Utama**: `drainase_karangbinangun_32.jpg` (DB path: `/uploads/drainase_karangbinangun_32.jpg`, ukuran 1510 KB, diunggah `2026-11-07` oleh Erlangga, S.T. — pemasangan bronjong kawat gabion dan pengerukan sedimen Sungai Blawi)

#### H. Aduan Warga
- *Belum ada aduan warga tercatat hingga `2026-11-18`.*

#### I. Rating
- **Ahmad Zaki** (`2026-11-10`): **4/5** ★ — *"Bronjong kawat di tebing sungai Desa Blawi sangat rapi dan menahan longsoran tanggul dekat tambak warga."*

---

<a id="proyek-33"></a>
### Proyek ID 33: Pembangunan Embung Konservasi Air Tani Sukorame

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `33` |
| Kode Proyek | `SKR-SKR-033` |
| Nama Proyek | Pembangunan Embung Konservasi Air Tani Sukorame |
| Kategori | `drainase` (Drainase, Sungai & Irigasi) |
| OPD | Dinas Sumber Daya Air (Dinas Sumber Daya Air Kabupaten Lamongan) |
| Pagu Anggaran | Rp 3.400.000.000 (Rp 3,40 M) |
| Sumber Pembiayaan | DAK Fisik Pertanian & APBD Kab. Lamongan |
| Status | **Selesai** |
| Progres | `100%` |
| Tanggal Mulai | `2025-05-12` |
| Estimasi Selesai | `2026-08-15` |
| Tanggal Selesai Aktual | `2026-08-08` |
| Nomor Kontrak | `611/SPK-DRA/LAM-DRA-2025-007` |
| Kode SiRUP | `5748203` |
| PIN Mandor | `PJ-81390` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Erlangga, S.T. (Dinas Sumber Daya Air)
- **Pejabat Pembuat Komitmen (PPK)**: Rina Kusuma, S.T.
- **Kontraktor Pelaksana**: CV Bintang Tani Mandiri
- **Konsultan Pengawas**: CV Mitra Konsultan Pratama
- **Kepala Mandor / Site Manager**: Mat Yasin (Mandor Pemasangan Geomembrane HDPE 1,5 mm, Spillway & Pompa Surya)

#### C. Lokasi
- **Kecamatan**: Kecamatan Sukorame (`wilayah_id = 2`, kode `35.24.01`)
- **Desa / Kelurahan**: Desa Sukorame (`desa_id = 32`, kode `35.24.01.2004`)
- **Koordinat**: `-7.331500, 112.126800`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.331500,112.126800) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.331500,112.126800)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Pembangunan embung konservasi air tadah hujan berlapis geomembrane HDPE lengkap pelimpah beton dan pompa tenaga surya
- **Dimensi Utama**: Luas tampungan embung 1,50 hektar (150 m x 100 m), kedalaman efektif tampungan 3,0 m, kapasitas tampung bersih 45.000 m3 (mengairi 120 ha sawah tadah hujan), saluran pelimpah (spillway) lebar 6,0 m
- **Perhitungan Volume & Struktur Pendukung**: Galian tanah tampungan & pembentukan tanggul keliling 45.000 m3; pemasangan lapisan kedap geomembrane HDPE tebal 1,5 mm seluas 17.800 m2 (termasuk lereng dan jangkar); pelimpah spillway beton bertulang K-300 volume 165 m3; 1 paket pompa distribusi submersible 20 L/dt bertenaga surya 12 kWp

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pekerjaan Galian Tampungan 45.000 m3 & Pemadatan Tanggul Keliling | 28% | `2025-08-19` | Pembentukan kolam tampungan 150 x 100 m dan pemadatan tanggul keliling tanah lempung di Desa Sukorame tuntas. |
| 2 | Pemasangan Geotekstil Pelindung & Pengelasan Geomembrane HDPE 1,5 mm | 62% | `2025-12-22` | Seluruh 17.800 m2 lembar geomembrane HDPE terpasang dan lolos uji vakum sambungan las tanpa kebocoran. |
| 3 | Pengecoran Pelimpah Spillway Beton K-300 & Pagar Pengaman Keliling | 88% | `2026-05-14` | Bangunan pelimpah spillway dan kolam penenang tuntas dicor serta pagar BRC pengaman warga terpasang penuh. |
| 4 | Instalasi Pompa Tenaga Surya 12 kWp, Uji Tampung Awal & PHO | 100% | `2026-08-08` | Pompa distribusi bertenaga surya beroperasi stabil 21 L/detik dan serah terima PHO rampung 7 hari lebih cepat dari estimasi. |

#### F. Dokumentasi
- **Foto Utama**: `drainase_sukorame_33.jpg` (DB path: `/uploads/drainase_sukorame_33.jpg`, ukuran 1610 KB, diunggah `2026-08-08` oleh Erlangga, S.T. — embung geomembrane HDPE kapasitas 45.000 m3 dan pompa surya Desa Sukorame selesai 100%)

#### H. Aduan Warga
- **Aduan #1** (`2026-03-17`, Pelapor: Dwi Hartati, Status: `ditanggapi`):
  - *Isi*: "Tanggul embung yang sudah berlapis plastik HDPE licin sekali dan belum ada pagar pembatas, khawatir anak-anak bermain di tepi kolam."
  - *Tanggapan Admin OPD* (**Erlangga, S.T.**, `2026-03-20`): "Dinas Sumber Daya Air telah mempercepat pemasangan pagar BRC tinggi 1,8 m mengelilingi seluruh perimeter embung serta memasang 6 papan larangan berenang."

#### I. Rating
- **Dwi Hartati** (`2026-08-25`): **5/5** ★ — *"Embung Sukorame jadi penyelamat petani tadah hujan saat kemarau, ditambah pompa tenaga surya yang hemat biaya operasional."*

#### J. Evaluasi FHO (Serah Terima Akhir)
- **Status FHO**: **`terjadwal`** · **Tanggal Verifikasi**: `NULL` (belum jatuh tempo per `2026-11-18`)
- **Jadwal FHO (PHO + 180 hari)**: **`2027-02-04`** (PHO `2026-08-08`) · **OPD Penanggung Jawab**: Dinas Sumber Daya Air
- **Keterangan**: Masa pemeliharaan 180 hari belum berakhir (baru berjalan 102 hari). Inspeksi FHO geomembrane HDPE, spillway, dan pompa surya dijadwalkan pada `2027-02-04`.

---

<a id="proyek-34"></a>
### Proyek ID 34: Peningkatan Akses Wisata Bahari Lamongan (WBL) & Sunan Drajat

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `34` |
| Kode Proyek | `PCR-PCR-034` |
| Nama Proyek | Peningkatan Akses Wisata Bahari Lamongan (WBL) & Sunan Drajat |
| Kategori | `jalan` (Jalan Raya & Koridor) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 16.800.000.000 (Rp 16,80 M) |
| Sumber Pembiayaan | APBD Kab. Lamongan & BK Pariwisata Prov. Jatim |
| Status | **Selesai** |
| Progres | `100%` |
| Tanggal Mulai | `2025-02-03` |
| Estimasi Selesai | `2026-06-30` |
| Tanggal Selesai Aktual | `2026-06-22` |
| Nomor Kontrak | `602/SPK-JLN/LAM-JLN-2025-014` |
| Kode SiRUP | `3047519` |
| PIN Mandor | `PJ-77426` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Hendra Wijaya, S.T.
- **Kontraktor Pelaksana**: PT Pesisir Jaya Konstruksi
- **Konsultan Pengawas**: CV Artha Buana Desain
- **Kepala Mandor / Site Manager**: Hasan Bisri (Mandor Pengaspalan 4 Lajur AC-BC/AC-WC) & Ir. Ridwan Hakim (Site Manager)

#### C. Lokasi
- **Kecamatan**: Kecamatan Paciran (`wilayah_id = 15`, kode `35.24.14`)
- **Desa / Kelurahan**: Desa Paciran (`desa_id = 259`, kode `35.24.14.2003`)
- **Koordinat**: `-6.867400, 112.361200`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-6.867400,112.361200) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-6.867400,112.361200)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Pelebaran jalan wisata menjadi 4 lajur 2 arah bermedian tengah, lapis aspal hotmix AC-BC & AC-WC, trotoar, dan PJU tematik pesisir
- **Dimensi Utama**: Panjang penanganan 2,40 km (2.400 m, koridor Desa Paciran s/d Simpang Desa Drajat), lebar perkerasan total 14,0 m (2 x 7,0 m), median tengah lebar 1,2 m, trotoar 2,0 m kanan-kiri
- **Perhitungan Volume & Struktur Pendukung**: Luas perkerasan aspal 2.400 x 14,0 = 33.600 m2; lapis AC-BC 6 cm + AC-WC 4 cm (total 10 cm -> volume 3.360 m3; BJ 2,30 ton/m3 -> tonase 7.728 ton); drainase tertutup trotoar U-ditch 60x60 cm 2.400 m; 68 tiang PJU LED ornamen etnik pesisir (±Rp 7,00 M/km jalan 4 lajur + trotoar + PJU)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pembebasan Ruang Bahu, Drainase Trotoar U-Ditch & Pondasi LPA Pelebaran | 26% | `2025-06-05` | Pemasangan saluran U-ditch trotoar sepanjang 2,4 km di koridor WBL-Drajat selesai tanpa mengganggu arus bus wisata. |
| 2 | Pembangunan Median Tengah, Penghamparan Hotmix AC-BC 6 cm & Trotoar | 61% | `2025-11-18` | Lapis antara AC-BC selesai 100% di kedua arah dan kanstin median tengah sepanjang 2,4 km tuntas dicat. |
| 3 | Penghamparan Lapis Aus AC-WC 4 cm & Pemasangan 68 Tiang PJU Etnik | 89% | `2026-04-10` | Lapisan aus AC-WC rampung rata dengan uji IRI < 2,8 m/km dan seluruh 68 tiang PJU LED pesisir terpasang. |
| 4 | Pengecatan Marka 4 Lajur, Uji Nyala PJU & Serah Terima PHO | 100% | `2026-06-22` | Seluruh marka zebra cross wisata, rambu penunjuk Sunan Drajat, dan uji pencahayaan lulus inspeksi; PHO tuntas 8 hari lebih awal. |

#### F. Dokumentasi
- **Foto Utama**: `jalan_paciran_34.jpg` (DB path: `/uploads/jalan_paciran_34.jpg`, ukuran 1840 KB, diunggah `2026-06-22` oleh Bambang Suryono, S.T. — koridor 4 lajur bermedian tengah dan PJU etnik pesisir akses WBL-Sunan Drajat selesai 100%)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Jl. Raya Daendels (Kandangsemangkon -> Paciran -> Banjarwati) | 4.8 km | 9 menit | Koridor utama bus pariwisata dan kendaraan roda empat (kini ruas utama sudah dibuka normal 4 lajur) |
| `kedua` | Jalan Poros Desa Tunggul -> Desa Sendangagung -> Desa Drajat | 5.2 km | 11 menit | Jalur alternatif kendaraan roda dua dan warga ziarah menuju Makam Sunan Drajat |

#### H. Aduan Warga
- **Aduan #1** (`2025-12-20`, Pelapor: Yuni Astuti, Status: `ditanggapi`):
  - *Isi*: "Pada liburan akhir pekan banyak bus pariwisata bingung mencari titik putar balik (U-turn) karena median tengah baru dibangun dan rambu pengarah belum terpasang."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2025-12-22`): "Dinas PU Bina Marga bersama Dishub telah memasang 6 papan penunjuk arah U-turn berukuran besar di depan gerbang WBL dan simpang Desa Drajat."

#### I. Rating
- **Yuni Astuti** (`2026-07-04`): **5/5** ★ — *"Akses WBL dan Makam Sunan Drajat sekarang sangat lebar 4 lajur dan lampu jalan etniknya bikin suasana malam Paciran makin indah."*

#### J. Evaluasi FHO (Serah Terima Akhir)
- **Status FHO**: **`terjadwal`** · **Tanggal Verifikasi**: `NULL` (belum jatuh tempo per `2026-11-18`)
- **Jadwal FHO (PHO + 180 hari)**: **`2026-12-19`** (PHO `2026-06-22`) · **OPD Penanggung Jawab**: Dinas PU Bina Marga
- **Keterangan**: Masa pemeliharaan 180 hari belum berakhir (baru berjalan 149 hari). Inspeksi FHO lapis AC-WC 4 lajur, trotoar, dan 68 PJU etnik dijadwalkan pada `2026-12-19`.

---

<a id="proyek-35"></a>
### Proyek ID 35: Pembangunan Jalan Lingkar Utara (JLU) Seksi Deket - Sukodadi

#### A. Identitas
| Field | Nilai |
| :--- | :--- |
| ID | `35` |
| Kode Proyek | `LMG-PLW-035` |
| Nama Proyek | Pembangunan Jalan Lingkar Utara (JLU) Seksi Deket - Sukodadi |
| Kategori | `jalan` (Jalan Raya & Koridor) |
| OPD | Dinas PU Bina Marga (Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan) |
| Pagu Anggaran | Rp 78.500.000.000 (Rp 78,50 M) |
| Sumber Pembiayaan | SBSN APBN KemenPUPR & APBD Kab. Lamongan (Pembebasan Lahan) |
| Status | **Sedang Berjalan** |
| Progres | `66%` |
| Tanggal Mulai | `2025-06-02` |
| Estimasi Selesai | `2027-08-31` |
| Tanggal Selesai Aktual | `-` |
| Nomor Kontrak | `602/SPK-JLN/LAM-JLN-2025-015` |
| Kode SiRUP | `9628401` |
| PIN Mandor | `PJ-19853` |
| Catatan OPD | - |
| Alasan Tunda | - |

#### B. Tim Pelaksana
- **Admin Pencatat OPD**: Bambang Suryono, S.T. (Dinas PU Bina Marga)
- **Pejabat Pembuat Komitmen (PPK)**: Yudi Dwi Prasetyo, S.T., M.T.
- **Kontraktor Pelaksana**: PT Wijaya Karya (Persero) Tbk
- **Konsultan Pengawas**: PT Disi Putera Mandiri
- **Kepala Mandor / Site Manager**: Ir. Bambang Sugiarto (Project Manager) & Slamet Wahyudi (Mandor Rigid Beton 30 cm & Box Crossing)

#### C. Lokasi
- **Kecamatan**: Kecamatan Lamongan (Kota) (`wilayah_id = 23`, kode `35.24.22`)
- **Desa / Kelurahan**: Desa Plosowahyu (`desa_id = 409`, kode `35.24.22.2008`)
- **Koordinat**: `-7.105400, 112.421500`
- **Tautan Validasi**: [Google Maps](https://www.google.com/maps/search/?api=1&query=-7.105400,112.421500) · [Street View 360°](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=-7.105400,112.421500)

#### D. Spesifikasi Teknis
- **Jenis Pekerjaan**: Pembangunan jalan baru by-pass nasional (Jalan Lingkar Utara) 4 lajur 2 arah perkerasan kaku tugas berat dan box traffic crossing
- **Dimensi Utama**: Panjang penanganan 5,10 km (5.100 m, Seksi Deket-Plosowahyu-Sukodadi), lebar perkerasan total 14,0 m (2 x 7,0 m), tebal pelat beton K-400 28 cm (0,28 m), 2 unit jembatan box traffic crossing bentang 12 m
- **Perhitungan Volume & Struktur Pendukung**: Volume pelat beton utama K-400 5.100 x 14,0 x 0,28 = 19.992 m3; lapis lean concrete K-125 tebal 10 cm (5.100 x 14,0 x 0,10 = 7.140 m3); timbunan pilihan badan jalan rata-rata tinggi 1,2 m x lebar 18 m (110.160 m3); 2 unit box crossing beton K-350 (840 m3) (±Rp 15,39 M/km jalan baru 4 lajur nasional)

#### E. Linimasa Progres
| No | Nama Tahapan | Bobot Progres | Tanggal Pencatatan | Catatan Lapangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Pembersihan Lahan Koridor Baru, Geotekstil & Timbunan Badan Jalan 110.160 m3 | 23% | `2025-10-30` | Pekerjaan tanah dasar dan pemadatan timbunan badan jalan baru sepanjang 5,10 km di Desa Plosowahyu lulus uji plate bearing. |
| 2 | Konstruksi 2 Box Traffic Crossing & Lapis Lean Concrete 7.140 m3 | 45% | `2026-04-29` | Dua jembatan box crossing saluran irigasi rampung dicor dan lantai kerja K-125 selesai terhampar 4,2 km. |
| 3 | Pengecoran Pelat Rigid Beton K-400 Tebal 28 cm Menggunakan Slipform Paver | 66% | `2026-11-13` | Pengecoran rigid 4 lajur telah mencapai 3,37 km dengan mutu kuat lentur (flexural strength) rata-rata 4,8 MPa melampaui syarat 4,5 MPa. |

#### F. Dokumentasi
- **Foto Utama**: `jalan_lamongan_35.jpg` (DB path: `/uploads/jalan_lamongan_35.jpg`, ukuran 1920 KB, diunggah `2026-11-13` oleh Bambang Suryono, S.T. — pengecoran rigid beton tebal 30 cm 4 lajur Jalan Lingkar Utara Plosowahyu)

#### G. Rute Pengalihan
| Prioritas | Jalur Alternatif | Estimasi Jarak | Estimasi Waktu | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| `utama` | Jl. Raya Nasional Lamongan - Babat (Kota Lamongan -> Sukodadi) | 8.5 km | 19 menit | Koridor eksisting yang tetap beroperasi normal selama pembangunan by-pass JLU di sisi utara |
| `kedua` | Jalan Poros Desa Karanglangit -> Desa Rancangkencono -> Desa Plosowahyu | 5.6 km | 12 menit | Jalur lokal warga utara kota menghindari lalu lintas truk tanah proyek JLU |

#### H. Aduan Warga
- **Aduan #1** (`2026-08-14`, Pelapor: Lestari Ningrum, Status: `ditanggapi`):
  - *Isi*: "Debu dari lintasan truk pengangkut tanah urug di perlintasan Desa Plosowahyu cukup mengganggu warga sekitar pada sore hari."
  - *Tanggapan Admin OPD* (**Bambang Suryono, S.T.**, `2026-08-16`): "Pelaksana telah menambah jadwal penyiraman jalan akses dengan 2 unit water tanker setiap 3 jam serta mewajibkan seluruh truk dump menutup bak menggunakan terpal penuh."

#### I. Rating
- **Lestari Ningrum** (`2026-11-14`): **5/5** ★ — *"Pembangunan Jalan Lingkar Utara sangat progresif, nanti kemacetan perlintasan rel kereta api kota Lamongan pasti terurai."*

---

## 4. Daftar File Foto Proyek yang Belum Tersedia di Frontend

Direktori aset frontend saat ini (`frontend/src/assets/real_projects/`) memiliki **18 file lama** dan **belum memiliki 35 file bernama unik** (`{kategori}_{lokasi}_{id}.jpg`). Referensi frontend (`frontend/src/utils/projectImages.ts`) **belum diubah** menunggu keputusan Anda (sediakan 35 foto baru atau petakan placeholder).

| ID | Nama File Target (Belum Ada di Frontend) | Keterangan Visual yang Dibutuhkan |
| :---: | :--- | :--- |
| 1 | `jalan_sukodadi_1.jpg` | pengecoran rigid pavement dan pemasangan dowel bar STA 2+400 |
| 2 | `jalan_pucuk_2.jpg` | kondisi ruas jalan Pucuk-Sekaran selesai cor lengkap dengan marka termoplastik |
| 3 | `jalan_sugio_3.jpg` | alat concrete paver dan deretan U-ditch terpasang di ruas Gondanglor-Bakalrejo |
| 4 | `jalan_babat_4.jpg` | pemasangan bore pile dan perkuatan tebing bantaran di ruas Babat-Sukorame |
| 5 | `jalan_deket_5.jpg` | pengecoran beton cor di atas lapisan geotekstil koridor tambak Sidorejo |
| 6 | `jalan_turi_6.jpg` | peninggian badan jalan dan pengecoran beton di kawasan Bengawan Jero Turi |
| 7 | `jalan_brondong_7.jpg` | penghamparan hotmix AC-WC dan pemadatan tandem roller koridor Brengkok-Brondong |
| 8 | `jalan_sambeng_8.jpg` | pengecoran pelebaran jalan 6 meter di poros Ardirejo-Mantup |
| 9 | `jalan_sukorame_9.jpg` | penumpukan precast U-ditch dan titik relokasi tiang listrik di ruas Sukorame-Bluluk |
| 10 | `jalan_laren_10.jpg` | pengecoran beton bertulang di atas pasangan talud tepi sawah Desa Pelangwot |
| 11 | `jalan_tikung_11.jpg` | finishing bahu cor beton dan marka segmen Wonokromo-Tikung |
| 12 | `jalan_modo_12.jpg` | realignment tikungan dan pengecoran rigid koridor pangan Modo-Babat |
| 13 | `drainase_karangbinangun_13.jpg` | operasional 3 unit pintu air elektrik hidrolik dan kolam olak Retensi Kuro |
| 14 | `drainase_karangbinangun_14.jpg` | instalasi 2 unit pompa axial 1.500 L/dt dan rumah genset silent 500 kVA Kuro |
| 15 | `drainase_kalitengah_15.jpg` | pengerukan sedimen lumpur oleh amphibi excavator di alur Kali Asin Pucangro |
| 16 | `drainase_lamongan_16.jpg` | pemasangan precast box culvert 150x150 cm koridor Jl. Veteran Sukorejo |
| 17 | `drainase_sugio_17.jpg` | pemasangan lining precast U-flume dan pintu bagi irigasi DI Waduk Gondang |
| 18 | `jembatan_karanggeneng_18.jpg` | pemasangan gelagar baja komposit dan penguatan abutmen jembatan Karanggeneng-Maduran |
| 19 | `jembatan_babat_19.jpg` | erection balok PCI I-Girder dan pembesian lantai Jembatan Plaosan Babat |
| 20 | `jembatan_karangbinangun_20.jpg` | pengecoran lantai jembatan dan railing baja Jembatan Kuro Karangbinangun-Glagah |
| 21 | `gedung_publik_brondong_21.jpg` | finishing fasad gedung 3 lantai dan instalasi gas medis RSUD Brondong Tahap II |
| 22 | `gedung_publik_lamongan_22.jpg` | gedung 2 lantai Labkesda standar BSL-2 Kelurahan Banjarmendalan selesai 100% |
| 23 | `gedung_publik_lamongan_23.jpg` | pemasangan dinding modular kamar operasi MOT Gedung Bedah RSUD dr. Soegiri |
| 24 | `gedung_publik_deket_24.jpg` | pemasangan kursi single seat tribun dan penanaman rumput Zoysia Matrella Stadion Surajaya |
| 25 | `taman_lamongan_25.jpg` | penataan jogging track rubber EPDM dan rekonstruksi Mandhapa Alun-Alun Lamongan |
| 26 | `taman_babat_26.jpg` | pemadatan ulang lahan plaza UMKM dan penanaman pohon peneduh Eco-Park Babat |
| 27 | `taman_maduran_27.jpg` | penataan lapangan olahraga dan mini amphitheater pemuda Desa Pangean Maduran |
| 28 | `gedung_publik_solokuro_28.jpg` | ereksi rangka baja gudang lumbung jagung 1.000 ton dan vertical dryer Solokuro |
| 29 | `gedung_publik_brondong_29.jpg` | pemasangan panel insulasi cold storage 100 ton dan dermaga higienis TPI Brondong |
| 30 | `gedung_publik_ngimbang_30.jpg` | finishing ruang bersalin PONED dan instalasi IPAL medis Puskesmas Ngimbang |
| 31 | `jalan_sukodadi_31.jpg` | pelebaran badan jalan dan pengecoran rigid K-350 ruas Sukodadi-Banjarejo |
| 32 | `drainase_karangbinangun_32.jpg` | pemasangan bronjong kawat gabion dan pengerukan sedimen Sungai Blawi |
| 33 | `drainase_sukorame_33.jpg` | embung geomembrane HDPE kapasitas 45.000 m3 dan pompa surya Desa Sukorame selesai 100% |
| 34 | `jalan_paciran_34.jpg` | koridor 4 lajur bermedian tengah dan PJU etnik pesisir akses WBL-Sunan Drajat selesai 100% |
| 35 | `jalan_lamongan_35.jpg` | pengecoran rigid beton tebal 30 cm 4 lajur Jalan Lingkar Utara Plosowahyu |
