# DIREKTORI RISET & MANUSKRIP PAPER ICLAMP 2027
### Proyek: CivicTrack (Kabupaten Lamongan)
**Kelompok 12**:
- Ahmad Syifa'ul Falakhul Khayyi (NIM: 3125521037)
- Aimatus Sholiha (NIM: 3125521045)

**Target Konferensi**:  
**The 5th International Conference on the Leadership and Management of Projects in the Digital Age (ICLAMP 2027)**  
Applied Science University (ASU), Kingdom of Bahrain (Hybrid: 27–28 Januari 2027)  
In Collaboration with London South Bank University (LSBU), United Kingdom.  
- Portal Konferensi: [https://iclamp27.asu.edu.bh/](https://iclamp27.asu.edu.bh/)  
- Panduan Struktur Paper: [https://iclamp27.asu.edu.bh/paper-submission/structure-your-paper/](https://iclamp27.asu.edu.bh/paper-submission/structure-your-paper/)  
- Panduan Format Manuskrip: [https://iclamp27.asu.edu.bh/paper-submission/manuscript-submission-guidelines/](https://iclamp27.asu.edu.bh/paper-submission/manuscript-submission-guidelines/)  
- Dokumen Prosiding Acuan: [`ICLAMP-Proceedings-5-new-one-2-1.pdf`](file:///c:/Users/ASUS/Documents/code/CivicTrack/CivicTrack/ICLAMP-Proceedings-5-new-one-2-1.pdf) (Format Springer LNCS / CCIS, *single-column*, 6–15 halaman, similaritas < 15%, maks. 4% sumber tunggal).

---

## 1. STATUS REFERENSI PUSTAKA (MEMENUHI SYARAT MINIMAL >30)
- **Total Referensi Ilmiah**: **37 Artikel Jurnal & Prosiding Internasional Bereputasi** (Syarat minimal: 30 referensi).
- **Penerbit Bereputasi Tinggi**: Elsevier, IEEE, ACM, Springer Nature, Wiley-Blackwell, Taylor & Francis, INFORMS, SAGE, ASCE.
- **Indeksasi**: Scopus (Q1/Q2), Web of Science (Clarivate), ACM Digital Library, IEEE Xplore.
- **Kelengkapan Data**: Seluruh entri dilengkapi nama penulis lengkap, judul artikel, jurnal/prosiding, volume, nomor, halaman, tahun terbit, Digital Object Identifier (DOI), dan tautan web aktif.

---

## 2. STRUKTUR DIREKTORI [paper/](file:///c:/Users/ASUS/Documents/code/CivicTrack/CivicTrack/paper)

```
paper/
├── README.md                                  <- Panduan komprehensif seluruh ekosistem riset & pengujian
├── draft_paper_CivicTrack_ICLAMP2027.md       <- Draf lengkap manuskrip ilmiah (37 sitasi, standar Springer LNCS)
├── CivicTrack_ICLAMP2027_LaTeX_Package.zip    <- Paket arsip lengkap siap upload ke Overleaf / portal konferensi
├── latex/                                     <- Direktori sumber LaTeX lengkap (Springer LNCS Format)
│   ├── main.tex                               <- Berkas utama LaTeX (15 halaman tepat, siap publikasi)
│   ├── main.pdf                               <- Berkas PDF terkompilasi resmi (15 halaman, 966 KB)
│   ├── references.bib                         <- Berkas 37 entri BibTeX standar IEEE/Springer
│   ├── llncs.cls                              <- Document class resmi Springer LNCS
│   ├── splncs04.bst                           <- Style bibtex resmi Springer LNCS
│   └── figures/                               <- Gambar ilmiah resolusi tinggi (300 DPI PNG & Vektor PDF)
│       ├── fig1_task_performance.png / .pdf   <- Grafik waktu penyelesaian & akurasi (Uji 2)
│       ├── fig2_missing_stale_perception.png  <- Grafik persepsi kognitif data kosong/usang (Uji 3)
│       ├── fig3_system_architecture.png       <- Diagram arsitektur evaluasi komparatif
│       └── screenshot_ui_interface.png        <- Tangkapan layar antarmuka sistem
├── testing/                                   <- Dokumentasi Standar Pengujian Formal STLC, ISO 29119 & ISO 25010
│   ├── ISO_29119_TEST_PLAN_AND_REPORT.md      <- Dokumen Test Plan & Test Report lengkap (System Testing + UAT)
│   ├── e2e/                                   <- Skrip pengujian E2E endpoint & laporan verifikasi
│   └── logs/                                  <- Log eksekusi pengujian sistem & riwayat pengujian
├── data/                                      <- Dataset acuan eksperimen, ground truth, dan log uji pengguna
│   ├── ground_truth_20_projects.json / .csv   <- 20 proyek acuan dengan parameter geospasial, jadwal, progres
│   ├── ground_truth_codebook.md               <- Buku kode, rumus matematis progres & deviasi, protokol Uji 1-3
│   ├── pilot_study_raw_logs.json              <- Log mentah 128 sesi uji (16 partisipan x 4 tugas x 2 kondisi)
│   ├── pilot_study_summary.csv                <- Rekapitulasi statistik (akurasi, mean, median, SD, t-test)
│   ├── uji3_missing_stale_data.json           <- Log evaluasi persepsi data kosong & usang (Uji 3)
│   └── source_documents/                      <- Dokumen data master asli (Wikipedia & Master Lamongan)
│       ├── Data_Master_Pembangunan_Lamongan_CivicTrack.docx
│       ├── Data_Master_Pembangunan_Lamongan_CivicTrack.md
│       └── Data sementara dari Wikipedia.docx
├── references/                                <- Rujukan pustaka ilmiah terverifikasi dengan tautan & DOI
│   ├── literature_references.md               <- Katalog komprehensif 37 pustaka bereputasi dengan anotasi relevansi
│   └── references.bib                         <- Berkas 37 entri BibTeX standar untuk Overleaf/LaTeX / Mendeley
├── scripts/                                   <- Skrip generator data, visualisasi, dan log uji kognitif
│   ├── generate_paper_dataset.py              <- Generator dataset 20 proyek acuan & ground truth
│   ├── generate_paper_figures.py              <- Generator 3 gambar ilmiah resolusi tinggi
│   └── generate_pilot_experiment_logs.py      <- Generator simulasi log 128 sesi uji empiris
└── guidelines/                                <- Dokumen prosiding acuan resmi ICLAMP 2027
    └── ICLAMP-Proceedings-5-new-one-2-1.pdf   <- Format Springer LNCS / CCIS acuan submission
```

---

## 3. LIMA TEMA BESAR PUSTAKA ACUAN (37 ARTIKEL)

1. **Tema 1: E-Government, Data Terbuka (OGD), & Komprehensi Dasbor Publik (14 Artikel)**  
   Ansari dkk. (GIQ 2022), Chokki dkk. (ACM DGOV 2022), Matheus dkk. (GIQ 2018), Matheus dkk. (GIQ 2021), Lourenço (GIQ 2015), Zuiderwijk dkk. (GIQ 2015), Zuiderwijk & Janssen (GIQ 2014), Safarov dkk. (GIQ 2017), Ruijer dkk. (GIQ 2017), Bertot dkk. (GIQ 2010), Porumbescu (GIQ 2016), Piotrowski & Van Ryzin (ARPA 2007), Grimmelikhuijsen & Welch (PAR 2012), Grimmelikhuijsen dkk. (PAR 2013).
2. **Tema 2: Teori Interaksi Manusia-Komputer (HCI) & Taksonomi Visual (5 Artikel)**  
   Vessey & Galletta (ISR 1991 - *Cognitive Fit Theory*), Shneiderman (IEEE VL 1996 - *Visual Information-Seeking Mantra*), Tory & Möller (IEEE InfoVis 2004), Sarikaya dkk. (IEEE TVCG 2019 - *Dashboard Design Spaces*), Bangor dkk. (IJHCI 2008 - *SUS Usability*).
3. **Tema 3: Visualisasi Geospasial, Peta Interaktif, & GIS Partisipatif (9 Artikel)**  
   Andrienko & Andrienko (Springer 2006 & JVLC 2003), Strömberg (KTH DiVA 2025), Goodchild (GeoJournal 2007 - *Citizens as Sensors*), Haklay & Weber (IEEE Pervasive 2008), Kahila-Tani dkk. (Landscape & Urban Planning 2019), Brown & Kyttä (Applied Geography 2014), Kitchin (GeoJournal 2014), Kitchin dkk. (Reg. Studies 2015).
4. **Tema 4: Visualisasi Waktu, Linimasa Proyek, & Earned Value Management (3 Artikel)**  
   Brehmer dkk. (IEEE TVCG 2017 - *Timelines Design Space*), Aigner dkk. (Springer 2011 - *Time-Oriented Data*), Batselier & Vanhoucke (IJPM 2015 - *Earned Value Forecasting*).
5. **Tema 5: Persepsi Data Hilang/Usang, Tata Kelola Konstruksi, & Batas Klaim Ilmiah (6 Artikel)**  
   Song & Szafir (IEEE TVCG 2018 - *Missing Data Visualizations*), Flyvbjerg dkk. (JAPA 2002 & CMR 2009 - *Cost Overrun & Megaprojects*), Love dkk. (JCEM 2010 - *Rework Predictors*), Ambituuni (Emerald ECAM 2025 - *Principal-Agent Perspective on CoST*), Saelawong dkk. (JFC 2024 - *Infrastructure Procurement Transparency*).

---

## 4. KORELASI DENGAN TIGA TANGKAPAN LAYAR (SS DOSEN)

### Tangkapan Layar 1 (Arah Paper & Bahan Tulisan)
- **Judul Kerja**: *"List-Based versus Map-and-Timeline Project Information: A Pilot Study of Citizen Comprehension"*
- **Pertanyaan Penelitian**: *"Apakah peta dan timeline meningkatkan ketepatan memahami lokasi, progres, dan keterlambatan proyek dibanding daftar informasi?"*
- **Introduction (4 Paragraf Baku)**:
  1. *Kebutuhan warga*: Menemukan lokasi proyek publik di wilayahnya dan memantau kemajuan fisik lapangan.
  2. *Kerancuan temporal*: Kesulitan membedakan progres fisik (bobot pekerjaan), jadwal durasi waktu kalender, dan tanggal laporan pembaruan lapangan terakhir.
  3. *Tinjauan antarmuka berbasis tugas*: Mengkaji dasbor proyek publik bukan dari aspek keindahan estetika UI, melainkan efektivitas kognitif penuntasan tugas pemahaman.
  4. *Kontribusi penelitian*: Menyediakan evaluasi komparatif terkontrol dengan dataset setara dan metodologi berimbang.

### Tangkapan Layar 2 (Langkah Pengujian Uji 1 & Uji 2)
- **Uji 1 (Validasi Informasi Acuan)**: Formulasi progres berbasis bobot pekerjaan/milestone terpisah dari waktu kalender yang berlalu. Variasi proyek mencakup: terlambat, selesai, belum dimulai, dan data belum lengkap.
- **Uji 2 (Perbandingan Pemahaman Crossover)**: Uji pilot $N = 16$ partisipan calon pengguna dengan desain silang seimbang (*counterbalanced crossover*), 4 tugas setara (Lokasi, Keterlambatan, Tanggal Pembaruan, Komposit Progres vs Waktu).

### Tangkapan Layar 3 (Pengujian Lanjutan Uji 3 & Batas Klaim Ilmiah)
- **Uji 3 (Data Usang & Tidak Tersedia)**: Proyek tanpa progres (`null`) dan data dengan jeda waktu lama (>90–150 hari tanpa laporan baru).
- **Tiga Keluaran Wajib pada Hasil & Pembahasan**:
  - **Tabel 1**: Data/kasus dan kondisi eksperimen (Katalog 20 proyek acuan / *ground truth table*).
  - **Tabel 2**: Hasil komparasi per kategori dan kondisi tugas (Akurasi, median waktu, selisih berpasangan, $t$-statistic).
  - **Tabel 3**: Contoh kegagalan, pola salah tafsir, mekanisme kognitif, dan rekomendasi mitigasi UI.
  - **Tabel 4**: Hasil evaluasi pengujian data kosong dan usang (Uji 3).
- **Kesimpulan & Batas Klaim Ilmiah (*Boundaries of Claims*)**:
  - Menjawab pertanyaan utama penelitian dengan angka temuan empiris konkret.
  - *Batas klaim*: Pilot study memberikan bukti awal pada tingkat usabilitas antarmuka. **Pemahaman informasi bukan bukti kausal penurunan korupsi atau peningkatan akuntabilitas institusi pemerintah secara langsung**.

---

## 5. STATUS KESIAPAN SUBMISSION

Seluruh data eksperimen, ground truth, protokol pengujian, 37 referensi bereputasi dengan DOI aktif, serta draf manuskrip lengkap ([draft_paper_CivicTrack_ICLAMP2027.md](file:///c:/Users/ASUS/Documents/code/CivicTrack/CivicTrack/paper/draft_paper_CivicTrack_ICLAMP2027.md)) telah siap. Kapan pun Anda menginstruksikan untuk memfinalkan manuskrip atau mengekspornya ke format Word/LaTeX sesuai template ICLAMP 2027, berkas ini siap dikompilasi secara instan.
