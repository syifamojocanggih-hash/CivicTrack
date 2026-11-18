# Master Akun Pengguna Fiktif CivicTrack Kabupaten Lamongan

> **Catatan**: Seluruh data akun di bawah ini bersifat **fiktif** untuk pengujian aplikasi demo CivicTrack.  
> **Kata sandi default seluruh akun demo**: `password123`  
> **Aturan Integritas**: Seluruh nama admin pencatat OPD, pimpinan, peneliti, pelapor aduan, dan pemberi rating pada dokumen proyek **wajib** merujuk ke tabel ini tanpa duplikasi nama maupun email.

---

## 1. Admin Pencatat per OPD (`admin_dinas`)

| ID Akun | Nama Lengkap | Email | Role | OPD / Instansi | Cakupan Proyek |
| :---: | :--- | :--- | :--- | :--- | :--- |
| U-01 | Bambang Suryono, S.T. | `admin.binamarga@civictrack.demo` | `admin_dinas` | Dinas PU Bina Marga | Jalan, Jembatan, & Gedung Non-Kesehatan (21 proyek) |
| U-02 | Erlangga, S.T. | `admin.sda@civictrack.demo` | `admin_dinas` | Dinas Sumber Daya Air | Drainase Sungai, Irigasi, Pompa & Embung (6 proyek) |
| U-03 | dr. Taufik Hidayat | `admin.kesehatan@civictrack.demo` | `admin_dinas` | Dinas Kesehatan | RSUD, Labkesda & Puskesmas (4 proyek) |
| U-04 | Ir. Joko Santoso | `admin.prkpck@civictrack.demo` | `admin_dinas` | Dinas PRKPCK | Taman/RTH & Drainase Perkotaan (4 proyek) |
| U-05 | M. Ali Imron, S.T. | `admin.dlh@civictrack.demo` | `admin_dinas` | Dinas Lingkungan Hidup | Pemantauan RTH / Lingkungan (0 proyek aktif) |

---

## 2. Pimpinan Daerah & Pengawas Eksekutif (`pimpinan_instansi`)

| ID Akun | Nama Lengkap | Email | Role | Instansi |
| :---: | :--- | :--- | :--- | :--- |
| U-06 | Drs. Joko Prasetyo, M.Si. | `pimpinan.lamongan@civictrack.demo` | `pimpinan_instansi` | Bappeda / Sekretariat Daerah Kab. Lamongan |
| U-07 | Ir. Wahyu Purnomo, M.M. | `inspektorat@civictrack.demo` | `pimpinan_instansi` | Inspektorat Daerah Kab. Lamongan |

---

## 3. Peneliti & Media Independen (`media_peneliti`)

| ID Akun | Nama Lengkap | Email | Role | Afiliasi |
| :---: | :--- | :--- | :--- | :--- |
| U-08 | Dr. Rahmat Hidayat | `rahmat.peneliti@civictrack.demo` | `media_peneliti` | Pusat Studi Kebijakan Publik Jawa Timur |
| U-09 | Dian Kartika, S.Sos. | `dian.media@civictrack.demo` | `media_peneliti` | Forum Transparansi Infrastruktur Lamongan |

---

## 4. Warga Masyarakat — Pelapor & Pemberi Rating (`warga`)

| ID Akun | Nama Lengkap | Email | Role | Domisili Kecamatan |
| :---: | :--- | :--- | :--- | :--- |
| U-10 | Budi Santoso | `budi.santoso@civictrack.demo` | `warga` | Sukodadi |
| U-11 | Siti Nurhaliza | `siti.nurhaliza@civictrack.demo` | `warga` | Pucuk |
| U-12 | Hendra Kusuma | `hendra.kusuma@civictrack.demo` | `warga` | Sugio |
| U-13 | Agus Prayitno | `agus.prayitno@civictrack.demo` | `warga` | Babat |
| U-14 | Nur Hidayah | `nur.hidayah@civictrack.demo` | `warga` | Deket |
| U-15 | Slamet Widodo | `slamet.widodo@civictrack.demo` | `warga` | Turi |
| U-16 | Rina Wulandari | `rina.wulandari@civictrack.demo` | `warga` | Brondong |
| U-17 | M. Syafi'i | `m.syafii@civictrack.demo` | `warga` | Sambeng |
| U-18 | Dwi Hartati | `dwi.hartati@civictrack.demo` | `warga` | Sukorame |
| U-19 | Fajar Nugroho | `fajar.nugroho@civictrack.demo` | `warga` | Laren |
| U-20 | Lestari Ningrum | `lestari.ningrum@civictrack.demo` | `warga` | Lamongan |
| U-21 | Ahmad Zaki | `ahmad.zaki@civictrack.demo` | `warga` | Karangbinangun |
| U-22 | Yuni Astuti | `yuni.astuti@civictrack.demo` | `warga` | Paciran |
| U-23 | Eko Saputra | `eko.saputra@civictrack.demo` | `warga` | Ngimbang |
| U-24 | Ratna Sari | `ratna.sari@civictrack.demo` | `warga` | Tikung |
| U-25 | Bagus Setiawan | `bagus.setiawan@civictrack.demo` | `warga` | Modo |
| U-26 | Khoirul Anam | `khoirul.anam@civictrack.demo` | `warga` | Kalitengah |
| U-27 | Tri Wahyuni | `tri.wahyuni@civictrack.demo` | `warga` | Karanggeneng |
| U-28 | Arif Rahman | `arif.rahman@civictrack.demo` | `warga` | Maduran |
| U-29 | Sulastri | `sulastri@civictrack.demo` | `warga` | Solokuro |

---

## Ringkasan Integritas Akun
- **Total Akun**: 29 akun (5 `admin_dinas`, 2 `pimpinan_instansi`, 2 `media_peneliti`, 20 `warga`)
- **Duplikasi Nama**: 0
- **Duplikasi Email**: 0
- **Cakupan OPD**: 5/5 OPD memiliki 1 admin pencatat unik
