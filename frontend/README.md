# Frontend Testing Guide (CivicTrack)

Proyek ini menggunakan [Vitest](https://vitest.dev/) dan [React Testing Library](https://testing-library.com/) untuk pengujian komponen UI dan utilitas frontend.

## Menjalankan Test

Karena frontend CivicTrack dijalankan dalam ekosistem Docker, Anda **diwajibkan** menjalankan seluruh test suite melalui container Docker (atau mode interaktif `exec`) agar mendapatkan environment Node.js yang sesuai dengan dependensi proyek.

Gunakan command berikut dari *root directory* proyek (lokasi `docker-compose.yml` berada):

```bash
docker compose exec frontend npm test -- --run
```

**Catatan Flag:**
- `docker compose exec frontend`: Mengeksekusi command secara langsung di dalam container service `frontend`.
- `npm test`: Menjalankan script test yang telah disiapkan di `package.json` (memanggil framework `vitest`).
- `-- --run`: Memerintahkan Vitest berjalan dalam mode *single-run* (tidak berada dalam *watch mode* interaktif), sehingga eksekusi akan langsung selesai setelah semua test di-run. (Gunakan tanpa flag ini jika ingin Vitest re-run otomatis saat file berubah).

### Menjalankan File Spesifik
Untuk mengisolasi debugging dengan menjalankan satu file test tertentu saja, tambahkan sebagian atau seluruh nama file di akhir command:
```bash
docker compose exec frontend npm test -- --run src/components/AuthModal.test.tsx
```

## Struktur Test Saat Ini (Cakupan Kritis)
Saat ini terdapat **18 test cases terisolasi** yang dikhususkan untuk menjaga *functional behavior* aplikasi tanpa menguji perubahan styling (CSS):

- **`spatial.test.ts` (7 Test)**: Utilitas geospasial (`isPointInPolygon` manual dan fungsi validasi letak koordinat kecamatan beserta fallbacks).
- **`AuthModal.test.tsx` (3 Test)**: Logika interaksi autentikasi, memblokir pengiriman API apabila *field* wajib kosong, hingga menangani error UI ketika menerima respons kredensial yang tidak valid dari backend (`401/400`).
- **`AdminDinasDashboard.test.tsx` (3 Test)**: Validasi form penambahan proyek (memastikan submission tertahan apabila pengisian form kosong sama sekali atau hanya sebagian).
- **`PimpinanDashboard.test.tsx` (2 Test)**: Rendering visual data statistik ringkasan dan *edge case handling* yang aman (menghindari crash UI seperti NaN) saat API backend tidak mengembalikan data proyek di suatu kecamatan (`total_proyek=0`).
- **`PublicMapExplorer.test.tsx` (3 Test)**: Interaksi UI terisolasi untuk filter hierarki (cascading dropdown) berjenjang antar wilayah, memvalidasi perbandingan ID, hingga me-reset nilai kembali ke filter atas (status Semua Desa).

## Menambahkan Test Baru
1. Buat file baru dengan ekstensi yang sama menggunakan akhiran `.test.ts` atau `.test.tsx` di direktori (bersebelahan) dengan komponen sumber yang bersangkutan.
2. Gunakan fungsionalitas `vi.mock()` yang disediakan oleh Vitest untuk melakukan stub/meniru kembalian fungsi eksternal (`apiService` API response).
3. **Penting:** Modul berbasis peta dan spasial (seperti `react-leaflet`) tidak secara native didukung oleh engine simulasi DOM (`JSDOM`). Komponen ini telah dibuatkan *mock definition* secara global pada konfigurasi `src/setupTests.tsx` agar framework frontend tetap berjalan mulus. Pastikan mengecek file tersebut jika terdapat error elemen UI dari peta.
