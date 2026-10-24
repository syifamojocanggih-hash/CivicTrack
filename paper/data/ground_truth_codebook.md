# PANDUAN KODEFIKASI & DATA ACUAN EKSPERIMEN (GROUND TRUTH CODEBOOK)
### CivicTrack: Evaluasi Pemahaman Informasi Proyek Pembangunan Daerah

Dokumen ini memuat definisi operasional, spesifikasi dataset acuan 20 proyek sintetis berbasis riil Kabupaten Lamongan, formulasi matematis progres dan keterlambatan jadwal, serta protokol operasional pengujian untuk **Uji 1 (Validasi Informasi Acuan)**, **Uji 2 (Perbandingan Pemahaman Pengguna)**, dan **Uji 3 (Data Usang & Tidak Tersedia)**.

---

## 1. FORMULASI MATEMATIS & DASAR PERHITUNGAN

Dalam sistem informasi pengawasan publik konvensional, sering kali terjadi kerancuan kognitif di mana persentase waktu yang telah berlalu (*elapsed calendar time*) dianggap secara keliru sebagai persentase pekerjaan fisik yang telah selesai. Dalam CivicTrack, kedua metrik ini dipisahkan secara tegas:

### 1.1 Persentase Waktu Berlalu (*Elapsed Time Percentage*)
Dihitung berdasarkan selisih hari kalender dari tanggal mulai kontrak kerja terhadap tanggal acuan audit simulasi ($T_{ref} = \text{15 Oktober 2024}$):

$$\text{Pct\_Time\_Elapsed} = \begin{cases} 
0.0\%, & \text{jika } T_{ref} \le T_{start} \\
100.0\%, & \text{jika } T_{ref} \ge T_{end} \\
\frac{T_{ref} - T_{start}}{T_{end} - T_{start}} \times 100\%, & \text{jika } T_{start} < T_{ref} < T_{end}
\end{cases}$$

### 1.2 Progres Fisik Berbasis Bobot Pekerjaan/Milestone (*Milestone-Based Physical Progress*)
Bukan merupakan fungsi linear waktu, melainkan akumulasi capaian volume fisik per item pekerjaan konstruksi terverifikasi di lapangan:

$$P_{physical} = \sum_{i=1}^{n} w_i \cdot c_i$$

Di mana:
- $w_i$ = Bobot persentase item pekerjaan ke-$i$ terhadap total nilai kontrak ($\sum w_i = 100\%$).
- $c_i$ = Tingkat penyelesaian fisik item ke-$i$ ($0.0 \le c_i \le 1.0$).

### 1.3 Deviasi Jadwal & Kriteria Keterlambatan (*Schedule Variance & Delay Criteria*)
Deviasi progres ($\Delta$) dihitung dari selisih progres fisik terhadap persentase waktu kalender yang telah berjalan:

$$\Delta = P_{physical} - \text{Pct\_Time\_Elapsed}$$

Klasifikasi status evaluasi:
1. **Selesai (*Completed*)**: $P_{physical} = 100.0\%$.
2. **Belum Dimulai (*Not Started*)**: $\text{Pct\_Time\_Elapsed} = 0.0\%$ dan $P_{physical} = 0.0\%$.
3. **Tepat Waktu (*On-Track*)**: $\Delta \ge -10.0\%$ (dalam batas toleransi wajar pekerjaan lapangan).
4. **Terlambat (*Delayed*)**: $\Delta < -10.0\%$ (deviasi negatif signifikan, progres fisik tertinggal dari jadwal waktu).
5. **Data Tidak Lengkap / Usang (*Missing/Stale*)**: $P_{physical} = \text{null}$ atau selisih tanggal pembaruan terhadap $T_{ref} > 90 \text{ hari}$.

---

## 2. KATALOG 20 PROYEK ACUAN & KUNCI JAWABAN (GROUND TRUTH TABLE)

| No | Kode Proyek | Nama Paket Pekerjaan | Lokasi (Kecamatan) | Jadwal Kontrak | Durasi | Waktu Berlalu | Progres Fisik | Selisih ($\Delta$) | Update Terakhir | Status Acuan | Split Set |
|:--:|:-----------:|:---------------------|:-------------------|:--------------:|:------:|:-------------:|:-------------:|:------------------:|:---------------:|:------------:|:---------:|
| 1 | `SKD-SKD-001` | Peningkatan Jl. Sukodadi - Sumberwudi | Sukodadi | 01/03/24 - 30/11/24 | 274 hr | 83.2% | 82.0% | -1.2% | 10/10/2024 | Tepat Waktu | Set A |
| 2 | `PCK-PCK-001` | Peningkatan Jl. Pucuk - Sekaran | Pucuk | 01/11/23 - 31/08/24 | 304 hr | 100.0% | 100.0% | 0.0% | 28/08/2024 | Selesai | Set B |
| 3 | `SGO-GND-001` | Rekonstruksi Jl. Sugio - Kedungpring | Sugio | 01/02/24 - 31/10/24 | 273 hr | 94.1% | 75.0% | -19.1% | 08/10/2024 | Terlambat | Set A |
| 4 | `BBT-BBT-001` | Rekonstruksi Jl. Poros Babat - Sukorame | Babat | 15/03/24 - 31/12/24 | 291 hr | 73.5% | 58.0% | -15.5% | 01/10/2024 | Terlambat | Set B |
| 5 | `DKT-SDR-001` | Peningkatan Jl. Deket - Soko | Deket | 01/04/24 - 30/11/24 | 243 hr | 81.1% | 62.0% | -19.1% | 12/10/2024 | Terlambat | Set A |
| 6 | `TUR-TUR-001` | Peningkatan Jl. Turi - Kiringan | Turi | 01/05/24 - 31/12/24 | 244 hr | 68.4% | 54.0% | -14.4% | 25/09/2024 | Terlambat | Set B |
| 7 | `BRD-BRN-001` | Peningkatan Jl. Brengkok - Brondong | Brondong | 01/03/24 - 31/10/24 | 244 hr | 93.4% | 88.0% | -5.4% | 14/10/2024 | Tepat Waktu | Set A |
| 8 | `SMB-RDR-001` | Rekonstruksi Jl. Mantup - Sambeng | Sambeng | 15/02/24 - 30/11/24 | 289 hr | 84.1% | 67.0% | -17.1% | 05/10/2024 | Terlambat | Set B |
| 9 | `SKR-SKR-001` | Peningkatan Jl. Bluluk - Sukorame | Sukorame | 15/04/24 - 31/12/24 | 260 hr | 70.4% | 45.0% | -25.4% | 18/09/2024 | Terlambat Parah | Set A |
| 10 | `LRN-PLN-001` | Rekonstruksi Jl. Laren - Blawi | Laren | 01/03/24 - 31/10/24 | 244 hr | 93.4% | 78.0% | -15.4% | 09/10/2024 | Terlambat | Set B |
| 11 | `TKG-WNK-001` | Peningkatan Jl. Tikung - Kembangbahu | Tikung | 15/03/24 - 30/09/24 | 199 hr | 100.0% | 92.0% | -8.0% | 02/10/2024 | Lewat Deadline | Set A |
| 12 | `MDO-MJR-001` | Peningkatan Jl. Modo - Babat | Modo | 01/02/24 - 31/10/24 | 273 hr | 94.1% | 85.0% | -9.1% | 11/10/2024 | Tepat Waktu | Set B |
| 13 | `KBN-KUR-001` | Pintu Air & Retensi Kuro | Karangbinangun | 01/10/23 - 31/07/24 | 304 hr | 100.0% | 100.0% | 0.0% | 25/07/2024 | Selesai | Set A |
| 14 | `LMG-BNJ-001` | Gedung Labkesda BSL-2 | Lamongan | 15/01/24 - 31/08/24 | 229 hr | 100.0% | 100.0% | 0.0% | 20/08/2024 | Selesai | Set B |
| 15 | `LMG-PLS-002` | Jembatan Penyeberangan Plosowahyu | Lamongan | 01/11/24 - 30/06/25 | 241 hr | 0.0% | 0.0% | 0.0% | 15/09/2024 | Belum Dimulai | Set A |
| 16 | `KGN-KRN-002` | Dermaga Wisata Bengawan | Karanggeneng | 01/12/24 - 31/05/25 | 181 hr | 0.0% | 0.0% | 0.0% | 01/10/2024 | Belum Dimulai | Set B |
| 17 | `KTG-PCN-001` | Normalisasi Kali Asin Bengawan Jero | Kalitengah | 01/02/24 - 30/11/24 | 303 hr | 84.8% | *Null* | N/A | 10/05/2024 | Data Tidak Lengkap | Set A |
| 18 | `LMG-SKR-001` | Saluran Box Culvert Jl. Basuki Rahmat | Lamongan | 01/04/24 - 30/11/24 | 243 hr | 81.1% | 68.0% | -13.1% | 20/06/2024 | Data Usang (>110 hr) | Set B |
| 19 | `KGN-KRN-001` | Rekonstruksi Jembatan Karanggeneng | Karanggeneng | 01/03/24 - 31/12/24 | 305 hr | 74.8% | 55.0% | -19.8% | 15/06/2024 | Data Usang (>120 hr) | Set A |
| 20 | `BRD-BRN-002` | Pembangunan RSUD Brondong (Tahap II) | Brondong | 01/08/23 - 31/12/24 | 518 hr | 85.1% | 82.0% | -3.1% | 13/10/2024 | Tepat Waktu | Set B |

---

## 3. PROTOKOL PENGUJIAN & PROSEDUR EKSPERIMENTAL

### 3.1 Uji 1 - Validasi Informasi Acuan (Sistemik)
- **Tujuan**: Memastikan integritas data dan konsistensi penyajian antara antarmuka daftar (*list*), peta geospasial, dan diagram linimasa (*timeline*).
- **Prosedur**:
  1. Memasukkan seluruh 20 proyek ke basis data CivicTrack.
  2. Mengaudit apakah persentase progres fisik dihitung independen dari waktu kalender.
  3. Memverifikasi bahwa proyek terlambat, selesai, belum dimulai, dan data kosong ditampilkan secara konsisten tanpa anomali logika.
- **Hasil**: 100% konsisten antar-antarmuka; tidak ada konversi otomatis dari persentase hari ke persentase bobot fisik.

### 3.2 Uji 2 - Perbandingan Pemahaman Pengguna (*User Study Crossover*)
- **Partisipan**: $N = 16$ orang calon pengguna (mahasiswa dan warga masyarakat umum dengan rentang literasi digital beragam).
- **Desain Eksperimen**: *Within-subject counterbalanced design* (2 Grup $\times$ 2 Kondisi $\times$ 2 Split Set A/B).
  * **Grup 1 ($n=8$)**: Mengerjakan Tugas 1–4 pada Kondisi A (*List-Based*, Set A), dilanjutkan Kondisi B (*Map-and-Timeline*, Set B).
  * **Grup 2 ($n=8$)**: Mengerjakan Tugas 1–4 pada Kondisi B (*Map-and-Timeline*, Set A), dilanjutkan Kondisi A (*List-Based*, Set B).
- **Jenis Tugas**:
  * **Tugas 1 (T1 - Lokasi)**: Temukan seluruh proyek yang berada di wilayah kecamatan tertentu (contoh: "Kecamatan Karangbinangun").
  * **Tugas 2 (T2 - Keterlambatan)**: Tentukan proyek yang mengalami keterlambatan pelaksanaan fisik terhadap target jadwal.
  * **Tugas 3 (T3 - Pembaruan Terakhir)**: Sebutkan tanggal laporan pembaruan lapangan terakhir dan bedakan dari tanggal target akhir kontrak.
  * **Tugas 4 (T4 - Komposit Progres vs Durasi)**: Nilai status kemajuan riil proyek ketika waktu kalender telah berjalan lebih dari 70%.
- **Metrik Pencatatan**:
  * Akurasi jawaban (% benar terhadap kunci acuan).
  * Median dan rerata waktu penuntasan tugas (detik).
  * Kebutuhan intervensi bantuan (*assistance rate*).
  * Pola kegagalan tafsir (*misinterpretation error patterns*).

### 3.3 Uji 3 - Evaluasi Data Usang & Tidak Tersedia
- **Tujuan**: Menilai apakah partisipan mampu mengidentifikasi keterbatasan data secara kritis atau justru terjebak dalam penafsiran yang keliru.
- **Kondisi Eksperimen**:
  * Proyek tanpa pembaruan progres fisik (`null`).
  * Proyek dengan tanggal laporan lapangan lampau (>90 hari tanpa laporan baru).
- **Tiga Pertanyaan Evaluasi Kritis**:
  1. *Apa yang dapat disimpulkan dari status pelaksanaan proyek tersebut?*
  2. *Apakah data yang tersedia cukup untuk menyatakan proyek telah selesai atau berhenti total?*
  3. *Apakah peserta mengenali keterbatasan data yang disajikan?*
- **Hasil yang Diharapkan**: Tidak ada kesan bahwa data kosong berarti 0% pengerjaan atau proyek mangkrak permanen.
