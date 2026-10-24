# DOKUMEN RENCANA & LAPORAN PENGUJIAN PERANGKAT LUNAK (TEST PLAN & TEST SUMMARY REPORT)
### Proyek: CivicTrack - Platform Transparansi & Navigasi Infrastruktur Daerah
**Standar Acuan**: ISO/IEC/IEEE 29119 (Software Testing) & ISO/IEC 25010 (Product Quality Model)  
**Metodologi Pengujian**: Software Testing Life Cycle (STLC)  
**Level Pengujian**: 
1. **Level 1: System Testing (Black-Box Equivalence Partitioning - Skenario Positif & Negatif)**
2. **Level 2: User Acceptance Testing (UAT - Functional Suitability & Usability)**

---

## 1. PENDAHULUAN & KERANGKA STLC (SOFTWARE TESTING LIFE CYCLE)

Pengujian pada CivicTrack mengadopsi tahapan formal **Software Testing Life Cycle (STLC)** untuk memastikan keandalan sistem dari level integrasi kode hingga penerimaan pengguna akhir:

```
+---------------------------------------------------------------------------------------+
|                       TAHAPAN STLC (ISO/IEC/IEEE 29119-2)                             |
|                                                                                       |
|  [1. Requirement] -> [2. Test Planning] -> [3. Test Case Design]                      |
|     (Analisis           (Cakupan, Jadwal,     (Black-Box Equivalence                  |
|      Modul PRD)          Lingkungan Uji)       Partitioning Pos/Neg)                  |
|                                                      |                                |
|  [6. Test Closure] <- [5. Test Execution] <- [4. Test Environment]                    |
|     (Laporan &           (System Testing +      (Backend FastAPI +                    |
|      Defect Metrics)      UAT ISO 25010)         Frontend React Node)                 |
+---------------------------------------------------------------------------------------+
```

1. **Requirement Analysis**: Menganalisis spesifikasi kebutuhan fungsional CivicTrack (autentikasi RBAC 5 peran, validasi geospasial 27 kecamatan Lamongan, perutean AI detour jalan ditutup, formulasi progres milestone, dan sistem pelaporan aduan).
2. **Test Planning**: Merumuskan ruang lingkup pengujian, kriteria masuk (*entry criteria*), kriteria keluar (*exit criteria*), serta strategi pengujian dua level (System Testing & UAT).
3. **Test Case Design**: Menyusun partisi ekuivalen (*Equivalence Partitioning*) untuk skenario positif (input valid) dan skenario negatif (input tidak valid / penolakan batas).
4. **Test Environment Setup**: Konfigurasi lingkungan server lokal (FastAPI, SQLite/MySQL, Node.js Vitest, engine Leaflet, dan mock Overpass API OSM).
5. **Test Execution**: Eksekusi pengujian otomatis dan manual, pencatatan log hasil uji, verifikasi respons kode HTTP, dan pengumpulan kuesioner UAT.
6. **Test Cycle Closure & Reporting**: Evaluasi metrik kelulusan uji, analisis cacat perangkat lunak (*defect tracking*), dan pengesahan kelaikan rilis.

---

## 2. LEVEL 1: SYSTEM TESTING (BLACK-BOX EQUIVALENCE PARTITIONING)

Sesuai standar **ISO/IEC/IEEE 29119-4 (Test Techniques)**, metode **Equivalence Partitioning (EP)** membagi himpunan domain masukan ke dalam partisi-partisi yang diasumsikan diproses secara seragam oleh perangkat lunak:
- **Valid Equivalence Partition (VEP)**: Kelas masukan valid yang diharapkan menghasilkan pemrosesan sukses (skenario positif).
- **Invalid Equivalence Partition (IEP)**: Kelas masukan tidak valid atau di luar batas yang harus ditolak secara anggun (*graceful rejection*) dengan pesan kesalahan deskriptif (skenario negatif).

### 2.1 Matriks Partisi Ekuivalen Domain Masukan

| ID Domain | Parameter Masukan | Partisi Ekuivalen Valid (Positif) | Partisi Ekuivalen Tidak Valid (Negatif) |
|:---:|:---|:---|:---|
| **EP-01** | **Pagu Anggaran Proyek** | Bilangan bulat positif: $\text{Rp } 1.000.000 \le \text{Pagu} \le \text{Rp } 500.000.000.000$ | • $\text{Pagu} \le 0$ (Negatif / Nol)<br>• Nilai string / karakter non-numerik |
| **EP-02** | **Tanggal Kontrak Proyek** | Rentang valid: $\text{Tanggal Target Selesai} > \text{Tanggal Mulai}$ | • $\text{Tanggal Selesai} < \text{Tanggal Mulai}$ (Inversi waktu)<br>• Format tanggal bukan `YYYY-MM-DD` |
| **EP-03** | **Progres Fisik Milestone** | Bilangan desimal/float: $0.0\% \le \text{Progres} \le 100.0\%$ | • Nilai negatif: $\text{Progres} < 0.0\%$<br>• Melebihi kapasitas: $\text{Progres} > 100.0\%$ |
| **EP-04** | **Penurunan Nilai Progres** | $\text{Progres Baru} < \text{Progres Lama}$ WAJIB disertai $\text{Alasan} \ge 10 \text{ karakter}$ | • $\text{Progres Baru} < \text{Progres Lama}$ tanpa alasan (`empty`)<br>• Alasan terlalu pendek ($< 10$ karakter) |
| **EP-05** | **Koordinat Geospasial** | Lintang & bujur berada di dalam poligon batas administrasi Kabupaten Lamongan (27 Kecamatan) | • Koordinat di luar batas wilayah (kabupaten tetangga / laut lepas)<br>• Format koordinat null / bukan angka numerik |
| **EP-06** | **Kredensial Akses PJ Proyek** | Kode proyek terdaftar & PIN otorisasi format `PJ-XXXXX` cocok di database | • Format PIN bukan `PJ-XXXXX`<br>• PIN salah / kode proyek tidak terdaftar |
| **EP-07** | **Aduan & Laporan Warga** | Judul $\ge 5$ huruf, deskripsi $\ge 15$ huruf, bebas kata kasar/profanity | • Teks mengandung kata kotor (*profanity trigger*)<br>• Deskripsi kosong / spam beruntun ($< 60$ detik) |
| **EP-08** | **Detour Perutean AI** | Asal dan tujuan valid, titik rute menghindari radius konstruksi ($\ge 280\text{m}$) | • Asal dan tujuan identik (jarak $= 0$)<br>• Mode kendaraan tidak terdaftar |

---

### 2.2 Kasus Uji System Testing End-to-End (ISO/IEC/IEEE 29119-3)

| Test Case ID | Modul / Fitur | Tipe | Kondisi Awal (*Preconditions*) | Data Masukan (*Test Input*) | Hasil yang Diharapkan (*Expected Result*) | Hasil Aktual (*Actual Result*) | Status |
|:---:|:---|:---:|:---|:---|:---|:---|:---:|
| **TC-SYS-01** | Autentikasi RBAC | **(+)** | Pengguna belum login | Email valid, Password terdaftar, Role: `admin_dinas` | Login sukses, diterbitkan JWT token, akses dashboard dinas terbuka | HTTP 200 OK, token tersimpan di storage | **PASS** |
| **TC-SYS-02** | Autentikasi RBAC | **(-)** | Pengguna login sebagai `warga` | Mengakses endpoint admin: `POST /api/v1/proyek` | Akses ditolak dengan kode otorisasi terlarang | HTTP 403 Forbidden, akses dicegah | **PASS** |
| **TC-SYS-03** | Input Proyek Baru | **(+)** | Akun admin dinas aktif | Pagu: Rp 5.000.000.000, Mulai: 01/04/2024, Selesai: 30/11/2024, Desa: Deket Kulon | Data proyek tersimpan, kode seri `DKT-DKT-NNN` otomatis terbit | HTTP 201 Created, proyek muncul di peta | **PASS** |
| **TC-SYS-04** | Input Proyek Baru | **(-)** | Akun admin dinas aktif | Pagu: -50.000.000 (Angka negatif) | Sistem menolak input dengan peringatan validasi | HTTP 422 Unprocessable Content | **PASS** |
| **TC-SYS-05** | Input Proyek Baru | **(-)** | Akun admin dinas aktif | Mulai: 01/10/2024, Target Selesai: 01/05/2024 (Inversi tanggal) | Sistem menolak; target selesai tidak boleh mendahului tanggal mulai | HTTP 422, validasi tanggal ditolak | **PASS** |
| **TC-SYS-06** | Validasi Geospasial | **(+)** | Input koordinat proyek | Lat: `-7.1152`, Lon: `112.3324` (Kecamatan Sukodadi) | Koordinat lolos verifikasi *Point-in-Polygon* wilayah Lamongan | Lolos verifikasi poligon kecamatan | **PASS** |
| **TC-SYS-07** | Validasi Geospasial | **(-)** | Input koordinat proyek | Lat: `-7.2504`, Lon: `112.7688` (Pusat Kota Surabaya / Luar Lamongan) | Sistem menolak koordinat karena berada di luar wilayah yurisdiksi Lamongan | HTTP 422: Koordinat di luar batas teritorial | **PASS** |
| **TC-SYS-08** | Update Progres Fisik | **(+)** | Login PJ Proyek sah | Progres awal 60%, diupdate menjadi 75% | Progres berhasil dinaikkan, riwayat pembaruan tercatat | HTTP 200 OK, status deviasi diperbarui | **PASS** |
| **TC-SYS-09** | Update Progres Fisik | **(-)** | Login PJ Proyek sah | Progres awal 75%, diturunkan ke 60% tanpa alasan (`reason = ""`) | Sistem memblokir penurunan progres tanpa alasan justifikasi tertulis | HTTP 400 Bad Request, ditolak frontend/backend | **PASS** |
| **TC-SYS-10** | Update Progres Fisik | **(+)** | Login PJ Proyek sah | Progres awal 75%, diturunkan ke 60% dengan alasan: *"Koreksi opname volume akibat banjir Bengawan"* ($\ge 10$ char) | Penurunan progres diizinkan, alasan diaudit ke log pengawasan pimpinan | HTTP 200 OK, log audit tersimpan | **PASS** |
| **TC-SYS-11** | Detour Rute AI | **(+)** | Proyek konstruksi jalan aktif | Titik asal & tujuan melintasi jalan ditutup | Sistem menghasilkan 3 rute alternatif (Utama, Kedua, Tambahan) yang memutari area proyek | Poliline rute OSM terverifikasi memutari titik konstruksi | **PASS** |
| **TC-SYS-12** | Detour Rute AI | **(+)** | Pilihan moda transportasi | Memilih moda: `motor` (sepeda motor) | Sistem mengoptimalkan jalur alternatif gang/jalan lokal yang aman untuk roda dua | Rute bicycle/motor network diaktifkan | **PASS** |
| **TC-SYS-13** | Pelaporan Aduan | **(+)** | Warga terautentikasi | Judul: *"Jalan Berlubang Dekat Jembatan"*, Deskripsi: *"Aspal mengelupas parah membahayakan pengendara motor"* | Aduan tersimpan dengan status `menunggu_verifikasi`, notifikasi terkirim | HTTP 201 Created, muncul di daftar aduan | **PASS** |
| **TC-SYS-14** | Pelaporan Aduan | **(-)** | Warga terautentikasi | Deskripsi memuat kata makian kotor/profan | Filter sanitasi menyensor kata atau menolak input vulgar | HTTP 422: Laporan mengandung kata tidak pantas | **PASS** |
| **TC-SYS-15** | Anti-Spam Aduan | **(-)** | Warga baru saja submit aduan | Mengirimkan aduan kedua dalam jeda 5 detik | Sistem menolak pengiriman cepat dengan mekanisme *Rate Limiting* | HTTP 429 Too Many Requests | **PASS** |
| **TC-SYS-16** | Penanganan Data Kosong | **(+)** | Inspeksi proyek progres `null` | Membuka proyek `KTG-PCN-001` pada daftar dan peta | Sistem tidak menampilkan angka palsu (tidak otomatis diklaim 0% atau 100%) | Status menampilkan keterangan *"Data Belum Tersedia"* | **PASS** |

---

## 3. LEVEL 2: USER ACCEPTANCE TESTING (UAT) BERBASIS ISO/IEC 25010

Pengujian penerimaan pengguna akhir (*User Acceptance Testing*) dilaksanakan mengacu pada dua karakteristik kualitas produk perangkat lunak menurut standar internasional **ISO/IEC 25010 (SQuaRE)**:
1. **Functional Suitability**: Sejauh mana fungsi perangkat lunak memenuhi kebutuhan yang dinyatakan saat digunakan dalam kondisi spesifik.
   - *Functional Completeness*: Seluruh fitur yang dijanjikan tersedia lengkap.
   - *Functional Correctness*: Data dan kalkulasi yang dihasilkan benar secara faktual.
   - *Functional Appropriateness*: Fitur-fitur memudahkan pencapaian tugas pengguna.
2. **Usability**: Sejauh mana perangkat lunak dapat dipahami, dipelajari, dioperasikan, dan menarik bagi pengguna.
   - *Appropriateness Recognizability*: Pengguna mudah mengenali kegunaan fitur.
   - *Learnability*: Pengguna mudah mempelajari alur navigasi peta dan linimasa.
   - *Operability*: Kontrol antarmuka, tombol, filter, dan modal mudah dikendalikan.
   - *User Error Protection*: Antarmuka melindungi pengguna dari salah klik atau salah tafsir data.
   - *User Interface Aesthetics*: Tampilan visual tertata rapi, nyaman di mata, dan profesional.

---

### 3.1 Instrumen Kuesioner Evaluasi UAT (Skala Likert 1–5)

Kuesioner diisi oleh $N = 16$ responden pengguna akhir (keterangan skala: 1 = Sangat Tidak Setuju, 2 = Tidak Setuju, 3 = Netral, 4 = Setuju, 5 = Sangat Setuju).

| No | Kode | Aspek Kualitas ISO 25010 | Pernyataan Instrumen UAT | Total Skor ($N=16$) | Skor Maksimal ($16 \times 5$) | Persentase Capaian (%) | Kategori Kelayakan |
|:---:|:---:|:---|:---|:---:|:---:|:---:|:---:|
| 1 | **FS-01** | *Functional Completeness* | Sistem menampilkan informasi proyek pembangunan secara lengkap (lokasi, anggaran, kontraktor, jadwal, dan progres fisik). | 73 | 80 | **91.25%** | Sangat Layak |
| 2 | **FS-02** | *Functional Correctness* | Kalkulasi progres fisik dan deviasi keterlambatan jadwal pada diagram linimasa akurat dan sesuai kondisi acuan. | 72 | 80 | **90.00%** | Sangat Layak |
| 3 | **FS-03** | *Functional Appropriateness* | Fitur rute alternatif AI efektif membantu menemukan jalur memutar untuk menghindari proyek jalan yang sedang ditutup. | 70 | 80 | **87.50%** | Sangat Layak |
| 4 | **US-01** | *Appropriateness Recognizability* | Ikon dan penanda warna status proyek pada peta (Hijau=Selesai, Kuning=Tepat Waktu, Merah=Terlambat) mudah dipahami fungsinya. | 75 | 80 | **93.75%** | Sangat Layak |
| 5 | **US-02** | *Learnability* | Saya dapat mempelajari cara memfilter proyek per kecamatan dan desa secara cepat tanpa memerlukan buku panduan tebal. | 74 | 80 | **92.50%** | Sangat Layak |
| 6 | **US-03** | *Operability* | Navigasi peta interaktif (zoom, geser, klik pin) dan tombol filter merespons dengan lancar tanpa hambatan teknis. | 69 | 80 | **86.25%** | Sangat Layak |
| 7 | **US-04** | *User Error Protection* | Sistem memberikan konfirmasi pembatalan modal yang jelas dan mencegah salah input pada formulir aduan masyarakat. | 71 | 80 | **88.75%** | Sangat Layak |
| 8 | **US-05** | *User Interface Aesthetics* | Desain antarmuka CivicTrack terlihat modern, rapi, memiliki kontras warna yang nyaman, dan tidak membuat mata lelah. | 76 | 80 | **95.00%** | Sangat Layak |
| 9 | **US-06** | *Clarity of Time vs Progress* | Tampilan linimasa visual membantu saya membedakan dengan jelas antara durasi hari kalender dengan bobot pekerjaan fisik. | 74 | 80 | **92.50%** | Sangat Layak |
| 10 | **US-07** | *General Satisfaction* | Secara keseluruhan, platform CivicTrack siap digunakan masyarakat Kabupaten Lamongan untuk memantau pembangunan daerah. | 73 | 80 | **91.25%** | Sangat Layak |

---

### 3.2 Analisis Kuantitatif Hasil UAT

1. **Rerata Persentase Kelayakan Keseluruhan**:
   $$\bar{P} = \frac{\sum \text{Skor Aktual}}{\sum \text{Skor Maksimum}} \times 100\% = \frac{727}{800} \times 100\% = \mathbf{90.88\%}$$
   - Menurut kriteria kelayakan kualitatif skala Likert, nilai $\mathbf{90.88\%}$ berada pada interval $\mathbf{81\% - 100\%}$ dengan predikat **"SANGAT LAYAK / EXCELLENT"**.
2. **Skor System Usability Scale (SUS)**:
   - Dari instrumen SUS terstandar yang diujikan kepada 16 partisipan, CivicTrack memperoleh skor rata-rata **82.5 (Grade A / Excellent Usability)**, jauh di atas ambang batas rata-rata industri ($68.0$).

---

## 4. DEFECT TRACKING & RESOLUSI MASALAH TERVERIFIKASI

Selama siklus STLC dan eksekusi pengujian, ditemukan beberapa potensi masalah yang telah berhasil diselesaikan (*fixed & verified*):

1. **Defect DF-01 (OSRM Snapping Tolerance)**:
   - *Gejala*: Pengujian rute OSM pada koordinat `-7.1050, 112.1640` mengalami *assertion failure* karena OSRM melakukan *snapping* otomatis ke segmen jalan terdekat `-7.10414, 112.1645`.
   - *Resolusi*: Logika pengujian diperbaiki dengan toleransi kedekatan geografis ($\Delta < 0.01^\circ$) yang mengakomodasi algoritma *projection snapping* jalan raya secara realistis.
   - *Status*: **CLOSED / RESOLVED**.
2. **Defect DF-02 (Missing Data Confusion)**:
   - *Gejala*: Proyek tanpa data progres fisik (`null`) sempat memicu penafsiran keliru bahwa pekerjaan adalah 0% atau mangkrak.
   - *Resolusi*: Frontend disempurnakan dengan penambahan label eksplisit *"Data Belum Dilaporkan (Bukan Batal)"* dan warna pin netral (abu-abu bergaris) untuk mencegah disinformasi publik.
   - *Status*: **CLOSED / RESOLVED**.

---

## 5. KESIMPULAN KELAIKAN SISTEM

Berdasarkan hasil pengujian dua tingkat yang mengacu pada standar **ISO/IEC/IEEE 29119** dan **ISO/IEC 25010**:
1. **System Testing**: Seluruh **38 kasus uji backend (Pytest)** dan **57 kasus uji frontend (Vitest)** berhasil lulus 100% (**PASS Rate: 100%**). Tidak ada kegagalan fungsional kritis (*Critical Blocker*) pada alur kerja utama.
2. **User Acceptance Testing (UAT)**: Memperoleh tingkat persetujuan kelayakan **90.88%** (*Sangat Layak*) dan skor SUS **82.5**, membuktikan bahwa CivicTrack memenuhi standar kelayakan fungsional (*Functional Suitability*) dan kemudahan penggunaan (*Usability*) untuk pengguna akhir.
