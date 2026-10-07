# CivicTrack
CivicTrack adalah platform transparansi pembangunan infrastruktur publik Kabupaten Lamongan (27 Kecamatan). Platform ini memungkinkan dinas pemerintah menginput dan memperbarui progres proyek (jalan, jembatan, taman, drainase), sementara warga dapat memantau linimasa, rute alternatif AI, dokumentasi, dan mengirimkan aduan maupun evaluasi secara terbuka melalui peta interaktif.

## Sumber Data Geospasial
- Batas wilayah administrasi 27 kecamatan: **Badan Pusat Statistik (BPS) & Badan Informasi Geospasial (BIG)** via [UN OCHA HDX (COD-AB)](https://data.humdata.org/dataset/cod-ab-idn) (Lisensi: Creative Commons Attribution CC BY 4.0 / CC BY-IGO).

## Alur Kerja Pengembangan Docker (Development Workflow)
> [!IMPORTANT]
> **Aturan Wajib Rebuild Image Docker:**
> Setiap kali terdapat penambahan dependensi baru di `backend/requirements.txt` atau `frontend/package.json`, selalu jalankan:
> ```bash
> docker compose up -d --build
> ```
> **Jangan hanya menjalankan `docker compose restart`**, agar container selalu memiliki paket dependensi terbaru dan terhindar dari `ModuleNotFoundError` saat container dijalankan.

