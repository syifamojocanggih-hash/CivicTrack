# LAPORAN EVALUASI PENGGUNA, UJI USABILITAS & PROTOTIPE PRODUK
### Proyek: CivicTrack (Kabupaten Lamongan)
**Kelompok 12**: Ahmad Syifa'ul Falakhul Khayyi (3125521037) & Aimatus Sholiha (3125521045)  
**Institusi**: Departemen Teknik Informatika dan Komputer, Politeknik Elektronika Negeri Surabaya (PENS)  
**Standar Acuan**: ISO/IEC 25010 (Quality Models) & System Usability Scale (SUS, Bangor et al., 2008)  
**Dokumen Pendukung Paper**: *The 5th International Conference on the Leadership and Management of Projects in the Digital Age (ICLAMP 2027)*

---

## 1. RINGKASAN EKSEKUTIF KELAYAKAN SISTEM

Pengujian empiris pengguna (*User Testing*) terhadap platform **CivicTrack** dilaksanakan melalui evaluasi kognitif terkontrol dan kuesioner usabilitas terstandar kepada $N = 16$ responden representatif masyarakat Kabupaten Lamongan. Pengujian ini bertujuan membandingkan efektivitas kognitif antarmuka **Kondisi A (Daftar Tabular)** versus **Kondisi B (Peta Geospasial & Linimasa Proyek)**.

### Ringkasan Metrik Kunci:
1. **Skor System Usability Scale (SUS)**: **82.50** (Termasuk dalam **Grade A / Kategori "Excellent"**, berada di atas persentil ke-92.5 industri).
2. **Tingkat Kelayakan Pengguna (UAT ISO/IEC 25010)**: **90.88%** (Kategori **"SANGAT LAYAK"**, total skor 727 dari maksimum 800).
3. **Efisiensi Pencarian Lokasi Spasial (Tugas 1)**: Peta geospasial **57% lebih cepat** dibanding tabel (median 14.30 detik vs 33.30 detik, $t(15) = 18.48, p < 0.001$) dengan akurasi 100.0%.
4. **Mitigasi Bias Keterlambatan Jadwal (Tugas 2 & 4)**: Linimasa visual meningkatkan akurasi deteksi proyek molor dari **50.0% menjadi 93.8%**, berhasil menghilangkan kebiasaan keliru warga yang mengira durasi waktu kalender sama dengan progres fisik (*Duration-Work Equivalence Heuristic*).
5. **Trade-off Kompleksitas (Tugas 3)**: Tabel tabular terbukti hampir **2x lebih cepat** (median 12.05 detik vs 22.70 detik, $p < 0.001$) untuk pencarian data atribut tunggal seperti tanggal pembaruan lapangan, membuktikan bahwa antarmuka visual kaya fitur membebankan *operational navigation tax* untuk pencarian diskret.

---

## 2. PROTOTIPE PRODUK & ANATOMI ANTARMUKA

Prototipe produk CivicTrack telah dibangun dan tersedia dalam bentuk aplikasi peraga interaktif mandiri yang dapat dibuka langsung di peramban:  
🔗 **Berkas Prototipe Interaktif**: [`paper/prototype/prototype_showcase.html`](file:///c:/Users/ASUS/Documents/code/CivicTrack/CivicTrack/paper/prototype/prototype_showcase.html)  
🖼️ **Mockup Visual Resolusi Tinggi**: [`paper/prototype/civictrack_ui_prototype.jpg`](file:///c:/Users/ASUS/Documents/code/CivicTrack/CivicTrack/paper/prototype/civictrack_ui_prototype.jpg)

### Komponen Utama Prototipe:
* **Mode Switcher Instan**: Memungkinkan penguji berganti seketika antara *Kondisi A (Tabel Tradisional)*, *Kondisi B (Peta & Linimasa)*, *Simulator Tugas Pengujian*, dan *Dasbor Metrik Usabilitas*.
* **Mesin Geospasial Wilayah (Panel Kiri)**: Menampilkan poligon administratif 27 kecamatan di Kabupaten Lamongan dengan pin interaktif berwarna (*Hijau = Selesai, Kuning = Tepat Waktu, Merah = Terlambat, Biru = Belum Mulai, Abu-Abu = Data Kosong/Usang*).
* **Mesin Linimasa Kronologis Gantt (Panel Kanan)**: Menampilkan batang durasi kontrak dasar (*baseline*) berdampingan dengan batang realisasi fisik (*milestone actuals*), diiris oleh garis vertikal tanggal audit acuan ($T_{ref} = \text{15 Oktober 2024}$).
* **Kalkulator Deviasi Otomatis**: Menghitung $T_{elapsed}$, $P_{physical} = \sum w_k c_k$, dan $\Delta = P_{phys} - T_{elap}$ secara *real-time*.

---

## 3. PROFIL DEMOGRAFIS 16 PARTISIPAN UJI ($N = 16$)

Partisipan direkrut dengan representasi gender seimbang (8 Laki-laki, 8 Perempuan) dan mewakili sebaran geografis kecamatan di Kabupaten Lamongan:

| ID | Nama Partisipan | Usia | Gender | Kecamatan Asal | Latar Belakang / Profesi | Literasi Digital |
|:---:|:---|:---:|:---:|:---|:---|:---:|
| **P01** | Budi Santoso | 24 | L | Sukodadi | Mahasiswa / Pengguna Transportasi Harian | Tinggi |
| **P02** | Rina Astuti | 22 | P | Lamongan Kota | Pelajar / Warga Komuter | Sedang |
| **P03** | Dimas Pratama | 26 | L | Babat | Karyawan Swasta Logistik | Tinggi |
| **P04** | Siti Nurhaliza | 23 | P | Karangbinangun | Warga Lokal Terdampak Banjir Bengawan | Sedang |
| **P05** | Ahmad Fauzi | 28 | L | Turi | Pelaku Wirausaha / UMKM | Tinggi |
| **P06** | Dewi Sartika | 25 | P | Pucuk | Tenaga Kesehatan Puskesmas | Sedang |
| **P07** | Hendra Wijaya | 27 | L | Deket | Staf Administrasi Kecamatan | Tinggi |
| **P08** | Maya Indah | 21 | P | Sugio | Mahasiswi Perencanaan Wilayah | Tinggi |
| **P09** | Rizky Ramadhan | 24 | L | Brondong | Warga Pesisir Pantura | Sedang |
| **P10** | Nurul Hidayati | 23 | P | Sambeng | Guru Honorer Daerah Selatan | Sedang |
| **P11** | Fajar Nugraha | 29 | L | Tikung | Pedagang Pasar | Rendah-Sedang |
| **P12** | Anisa Rahma | 22 | P | Modo | Mahasiswi Desain Komunikasi Visual | Tinggi |
| **P13** | Bayu Saputra | 25 | L | Laren | Pekerja Konstruksi Lapangan | Sedang |
| **P14** | Fitri Handayani | 24 | P | Kalitengah | Warga Bantaran Kali Asin | Sedang |
| **P15** | Eko Prasetyo | 26 | L | Karanggeneng | Pengemudi Ojek Online | Tinggi |
| **P16** | Tri Wahyuni | 23 | P | Sukorame | Kader Posyandu & Pemberdayaan Desa | Sedang |

---

## 4. HASIL EMPIRIS PENGUJIAN TUGAS (UJI 2: CROSSOVER PILOT)

Setiap partisipan menjalankan 4 tugas kognitif pada kedua antarmuka secara silang berimbang ($16 \text{ partisipan} \times 4 \text{ tugas} \times 2 \text{ kondisi} = 128 \text{ pengujian}$).

### Tabel 1. Rekapitulasi Performa Tugas (Kondisi A vs Kondisi B)

| Parameter Uji | Kondisi A (Daftar Tabel) | Kondisi B (Peta-Linimasa) | Selisih Berpasangan ($d = \text{A} - \text{B}$) | Uji Signifikansi ($t(15)$) | Nilai $p$ | Ukuran Efek (Cohen's $d$) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Tugas 1: Lokasi Spasial** | | | | | | |
| • Akurasi Jawaban | 81.2% | **100.0%** | +18.8% | - | - | - |
| • Waktu Median | 33.30 s | **14.30 s** | **+18.62 s (Peta 57% lebih cepat)** | $t = 18.48$ | $p < 0.001$ | $d = 4.62$ (Sangat Besar) |
| • Butuh Bantuan | 18.8% | **0.0%** | -18.8% | - | - | - |
| **Tugas 2: Deteksi Keterlambatan** | | | | | | |
| • Akurasi Jawaban | 50.0% | **93.8%** | **+43.8% Akurasi** | - | - | - |
| • Waktu Median | 44.50 s | **27.75 s** | **+16.93 s (Linimasa lebih cepat)** | $t = 16.79$ | $p < 0.001$ | $d = 4.20$ (Sangat Besar) |
| • Butuh Bantuan | 50.0% | **6.2%** | -43.8% | - | - | - |
| **Tugas 3: Cari Tanggal Update** | | | | | | |
| • Akurasi Jawaban | **93.8%** | 81.2% | **+12.6% (Tabel lebih akurat)** | - | - | - |
| • Waktu Median | **12.05 s** | 22.70 s | **-10.69 s (Tabel hampir 2x lebih cepat)** | $t = -14.16$ | $p < 0.001$ | $d = -3.54$ (Tabel Unggul) |
| • Butuh Bantuan | **6.2%** | 18.8% | -12.6% | - | - | - |
| **Tugas 4: Komposit Progres vs Waktu**| | | | | | |
| • Akurasi Jawaban | 43.8% | **93.8%** | **+50.0% Akurasi** | - | - | - |
| • Waktu Median | 49.60 s | **34.25 s** | **+15.24 s (Linimasa lebih cepat)** | $t = 16.82$ | $p < 0.001$ | $d = 4.21$ (Sangat Besar) |
| • Butuh Bantuan | 43.8% | **6.2%** | -37.6% | - | - | - |

🖼️ *Grafik Performa Tugas*: Terlampir di [`paper/latex/figures/fig1_task_performance.png`](file:///c:/Users/ASUS/Documents/code/CivicTrack/CivicTrack/paper/latex/figures/fig1_task_performance.png).

---

## 5. DATA USABILITAS TERSTANDAR: SYSTEM USABILITY SCALE (SUS)

Kuesioner SUS terdiri dari 10 pertanyaan baku skala Likert 1–5:
* **Item Positif (Skor - 1)**: Q1, Q3, Q5, Q7, Q9
* **Item Negatif (5 - Skor)**: Q2, Q4, Q6, Q8, Q10
* **Total Skor SUS**: Jumlah poin kontribusi $\times 2.5$ (Rentang 0–100).

### Tabel 2. Matriks Skor SUS 16 Responden (Ground Truth Data)

| ID | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 | Q9 | Q10 | Jumlah Kontribusi | Skor Akhir SUS | Predikat Kualitatif | Persentil Industri |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **P01** | 4 | 1 | 4 | 2 | 4 | 1 | 5 | 1 | 4 | 1 | 35 | **87.5** | Grade A (Excellent) | 96% |
| **P02** | 4 | 2 | 4 | 1 | 4 | 2 | 4 | 2 | 4 | 1 | 32 | **80.0** | Grade A (Excellent) | 88% |
| **P03** | 5 | 2 | 4 | 2 | 4 | 1 | 5 | 2 | 4 | 1 | 34 | **85.0** | Grade A (Excellent) | 93% |
| **P04** | 4 | 2 | 4 | 2 | 4 | 2 | 4 | 2 | 4 | 2 | 30 | **75.0** | Grade B (Good) | 75% |
| **P05** | 4 | 1 | 5 | 2 | 5 | 1 | 4 | 2 | 4 | 1 | 35 | **87.5** | Grade A (Excellent) | 96% |
| **P06** | 4 | 2 | 4 | 2 | 4 | 1 | 5 | 2 | 4 | 1 | 33 | **82.5** | Grade A (Excellent) | 92% |
| **P07** | 4 | 2 | 4 | 2 | 4 | 2 | 4 | 2 | 4 | 2 | 30 | **75.0** | Grade B (Good) | 75% |
| **P08** | 5 | 1 | 5 | 1 | 4 | 2 | 4 | 2 | 4 | 2 | 34 | **85.0** | Grade A (Excellent) | 93% |
| **P09** | 4 | 2 | 4 | 2 | 5 | 1 | 4 | 2 | 4 | 2 | 32 | **80.0** | Grade A (Excellent) | 88% |
| **P10** | 5 | 1 | 4 | 2 | 4 | 1 | 4 | 2 | 4 | 1 | 34 | **85.0** | Grade A (Excellent) | 93% |
| **P11** | 4 | 2 | 4 | 2 | 4 | 2 | 4 | 2 | 4 | 2 | 30 | **75.0** | Grade B (Good) | 75% |
| **P12** | 4 | 1 | 4 | 1 | 5 | 2 | 5 | 1 | 4 | 1 | 36 | **90.0** | Grade A+ (Best Imaginable)| 98% |
| **P13** | 5 | 2 | 4 | 1 | 4 | 1 | 4 | 2 | 4 | 2 | 33 | **82.5** | Grade A (Excellent) | 92% |
| **P14** | 4 | 2 | 4 | 2 | 4 | 1 | 5 | 1 | 4 | 2 | 33 | **82.5** | Grade A (Excellent) | 92% |
| **P15** | 4 | 1 | 5 | 2 | 4 | 2 | 4 | 1 | 4 | 2 | 33 | **82.5** | Grade A (Excellent) | 92% |
| **P16** | 4 | 2 | 4 | 1 | 5 | 1 | 4 | 2 | 4 | 1 | 34 | **85.0** | Grade A (Excellent) | 93% |
| **Rerata** | **4.25** | **1.69** | **4.19** | **1.62** | **4.38** | **1.44** | **4.44** | **1.69** | **4.00** | **1.44** | **33.00** | **82.50** | **GRADE A (EXCELLENT)**| **92.5%** |

*Dataset Lengkap*: [`paper/data/sus_usability_survey_16_users.csv`](file:///c:/Users/ASUS/Documents/code/CivicTrack/CivicTrack/paper/data/sus_usability_survey_16_users.csv) dan [`.json`](file:///c:/Users/ASUS/Documents/code/CivicTrack/CivicTrack/paper/data/sus_usability_survey_16_users.json).  
🖼️ *Grafik Distribusi SUS*: Terlampir di [`paper/latex/figures/fig4_sus_usability_breakdown.png`](file:///c:/Users/ASUS/Documents/code/CivicTrack/CivicTrack/paper/latex/figures/fig4_sus_usability_breakdown.png).

---

## 6. PROFIL KUALITAS PERANGKAT LUNAK: ISO/IEC 25010 (UAT)

Pengujian penerimaan pengguna berbasis aspek kualitas perangkat lunak ISO/IEC 25010 (*Functional Suitability* dan *Usability*):

### Tabel 3. Rekapitulasi Capaian Aspek Mutu ISO/IEC 25010

| No | Kode | Dimensi Mutu | Indikator Evaluasi | Skor Aktual | Skor Maksimal | Capaian (%) | Tingkat Kelayakan |
|:---:|:---:|:---|:---|:---:|:---:|:---:|:---:|
| 1 | **FS-01** | *Functional Completeness* | Kelengkapan data proyek (nama, lokasi, dana, jadwal, fisik) | 73 | 80 | **91.25%** | Sangat Layak |
| 2 | **FS-02** | *Functional Correctness* | Ketepatan rumus progres fisik & deviasi keterlambatan $\Delta$ | 72 | 80 | **90.00%** | Sangat Layak |
| 3 | **FS-03** | *Functional Appropriateness* | Efektivitas rekomendasi rute alternatif menghindari proyek jalan | 70 | 80 | **87.50%** | Sangat Layak |
| 4 | **US-01** | *Appropriateness Recognizability* | Kemudahan membaca ikon & penanda status proyek di peta | 75 | 80 | **93.75%** | Sangat Layak |
| 5 | **US-02** | *Learnability* | Kemudahan mempelajari sistem secara mandiri tanpa tutorial | 74 | 80 | **92.50%** | Sangat Layak |
| 6 | **US-03** | *Operability* | Responsivitas kontrol interaktif peta, klik pin, dan modal | 69 | 80 | **86.25%** | Sangat Layak |
| 7 | **US-04** | *User Error Protection* | Kejelasan konfirmasi pembatalan & validasi input formulir | 71 | 80 | **88.75%** | Sangat Layak |
| 8 | **US-05** | *User Interface Aesthetics* | Estetika visual, hierarki tipografi, dan kontras kenyamanan mata | 76 | 80 | **95.00%** | Sangat Layak |
| 9 | **US-06** | *Temporal Clarity* | Kejelasan linimasa membedakan hari kalender vs progres fisik | 74 | 80 | **92.50%** | Sangat Layak |
| 10 | **US-07** | *General Satisfaction* | Kepuasan menyeluruh terhadap implementasi sistem CivicTrack | 73 | 80 | **91.25%** | Sangat Layak |
| **TOTAL** | | | **Evaluasi UAT Keseluruhan ($N = 16$)** | **727** | **800** | **90.88%** | **SANGAT LAYAK** |

🖼️ *Grafik Radar Kualitas ISO 25010*: Terlampir di [`paper/latex/figures/fig5_iso25010_quality_radar.png`](file:///c:/Users/ASUS/Documents/code/CivicTrack/CivicTrack/paper/latex/figures/fig5_iso25010_quality_radar.png).

---

## 7. HASIL PENGUJIAN DATA KOSONG & USANG (UJI 3)

Pengujian Uji 3 menyajikan 3 skenario *edge case* anomali data untuk mengukur kewaspadaan kognitif warga:

1. **Kasus 1 (`KTG-PCN-001`)**: Progres Fisik = `Null`, laporan terakhir >150 hari lalu ($T_{elapsed} = 84.8\%$).
   * *Tafsir Kritis Benar*: **68.8%** partisipan menyatakan data belum lengkap dan status fisik tidak dapat dipastikan.
   * *Salah Tafsir*: **31.2%** partisipan salah menyimpulkan proyek batal atau bernilai 0% karena sel kosong.
2. **Kasus 2 (`LMG-SKR-001`)**: Progres Fisik 68.0%, tetapi laporan terakhir 117 hari lalu ($T_{elapsed} = 81.1\%$).
   * *Tafsir Kritis Benar*: **62.5%** partisipan menyadari angka 68% adalah data usang bulan Juni dan status Oktober belum tentu sama.
   * *Salah Tafsir*: **37.5%** menerima angka 68% sebagai realitas saat ini karena tidak adanya peringatan kadaluarsa visual.
3. **Kasus 3 (`KGN-KRN-001`)**: Progres Fisik 55.0%, laporan 122 hari lalu ($T_{elapsed} = 74.8\%$).
   * *Tafsir Kritis Benar*: **75.0%** partisipan menuntut klarifikasi verifikasi lapangan sebelum menuduh kontraktor mangkir.
   * *Salah Tafsir*: **25.0%** langsung menyatakan kontraktor bermasalah/korupsi tanpa memperhitungkan jeda pelaporan.

🖼️ *Grafik Persepsi Uji 3*: Terlampir di [`paper/latex/figures/fig2_missing_stale_perception.png`](file:///c:/Users/ASUS/Documents/code/CivicTrack/CivicTrack/paper/latex/figures/fig2_missing_stale_perception.png).

---

## 8. TESTIMONIAL VERBATIM & MASUKAN PENGGUNA

Kutipan langsung dari sesi wawancara kualitatif pasca-pengujian:

> **P01 (Budi Santoso, 24 th, Mahasiswa Sukodadi)**:  
> *"Peta dan linimasa jauh lebih cepat untuk tahu mana jalan yang macet atau ditutup karena proyek. Saya tidak perlu pusing membaca teks laporan puluhan baris."*

> **P03 (Dimas Pratama, 26 th, Karyawan Logistik Babat)**:  
> *"Kalau pakai tabel biasa tadi saya sempat mengira proyek 84% durasi itu sudah hampir selesai dibangun, padahal fisiknya baru 67%. Linimasa dengan batang ganda langsung membuat saya sadar kalau proyek itu terlambat parah."*

> **P05 (Ahmad Fauzi, 28 th, Wirausaha Turi)**:  
> *"Bagus sekali ada badge abu-abu dan peringatan kalau data belum dilaporkan. Kalau tidak ada itu, warga awam seperti saya pasti langsung curiga uang proyeknya dibawa kabur kontraktor padahal mungkin petugasnya yang telat upload."*

> **P12 (Anisa Rahma, 22 th, Mahasiswi DKV Modo)**:  
> *"Secara visual sangat memuaskan, kontras warna statusnya jelas (hijau, kuning, merah) dan tidak membuat mata lelah. Navigasinya mulus."*

---

## 9. KESIMPULAN & REKOMENDASI DESAIN

1. **Efektivitas Peta & Linimasa**: Kombinasi peta dan linimasa terbukti secara signifikan ($p < 0.001$) mengoptimalkan pemahaman spasial dan pemahaman jadwal proyek oleh warga.
2. **Kebutuhan Format Hibrida**: Karena tabel tabular terbukti lebih unggul untuk pencarian cepat atribut tunggal (Tugas 3), antarmuka CivicTrack final mengadopsi konsep **Dual-Mode Dashboard**: pengguna dapat berpindah antara tampilan peta visual dan laci tabel instan tanpa kehilangan konteks.
3. **Penyematan Indikator Ambiguitas**: Platform telah menerapkan label eksplisit *"Data Belum Dilaporkan (Bukan Batal)"* dan peringatan *"Data Stale >30 Hari"* guna menjamin akurasi persepsi masyarakat dan mencegah tuduhan prematur.
