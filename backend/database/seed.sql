-- ==========================================================
-- Data Seed / Demo CivicTrack (MySQL 8.0+)
-- Eksekusi file ini setelah schema.sql dijalankan
-- Password default semua user: password123
-- ==========================================================

USE civictrack_db;

-- 1. Data Wilayah Administratif Berjenjang
INSERT INTO wilayah_administratif (id, kode_wilayah, nama_wilayah, level, parent_id, geom_boundary) VALUES
(1, '35.22', 'Kabupaten Bojonegoro', 'kabupaten', NULL, '{"type": "Polygon", "coordinates": [[[111.7, -7.1], [112.0, -7.1], [112.0, -7.3], [111.7, -7.3], [111.7, -7.1]]]}'),
(2, '35.22.01', 'Kecamatan Bojonegoro', 'kecamatan', 1, '{"type": "Polygon", "coordinates": [[[111.85, -7.14], [111.91, -7.14], [111.91, -7.18], [111.85, -7.18], [111.85, -7.14]]]}'),
(3, '35.22.01.1001', 'Kelurahan Sukorejo', 'desa', 2, '{"type": "Polygon", "coordinates": [[[111.87, -7.15], [111.89, -7.15], [111.89, -7.17], [111.87, -7.17], [111.87, -7.15]]]}'),
(4, '35.22.01.1002', 'Desa Klangonan', 'desa', 2, '{"type": "Polygon", "coordinates": [[[111.86, -7.16], [111.88, -7.16], [111.88, -7.18], [111.86, -7.18], [111.86, -7.16]]]}'),
(5, '35.22.02', 'Kecamatan Dander', 'kecamatan', 1, '{"type": "Polygon", "coordinates": [[[111.82, -7.19], [111.90, -7.19], [111.90, -7.26], [111.82, -7.26], [111.82, -7.19]]]}'),
(6, '35.22.02.2001', 'Desa Ngumpakdalem', 'desa', 5, '{"type": "Polygon", "coordinates": [[[111.85, -7.20], [111.88, -7.20], [111.88, -7.23], [111.85, -7.23], [111.85, -7.20]]]}');

-- 2. Data Dinas Instansi Pemerintah
INSERT INTO dinas (id, nama_dinas, wilayah_id) VALUES
(1, 'Dinas Pekerjaan Umum Bina Marga dan Penataan Ruang', 1),
(2, 'Dinas Perumahan, Kawasan Permukiman dan Cipta Karya', 1),
(3, 'Dinas Lingkungan Hidup', 1);

-- 3. Data Pengguna (Password: password123, hash bcrypt $2b$12$w0.038D1n7Hl/ZkL...)
-- Hash berikut valid untuk kata sandi "password123"
INSERT INTO users (id, nama, email, password_hash, role, dinas_id, is_active) VALUES
(1, 'Ir. Hendro Wijaya (Admin PU)', 'admin.pu@bojonegoro.go.id', '$2b$12$K82mE8M.8wGq0uR1N5aDfu85zXb9gK.5hP5W9m1d5p0p4u9o8p1z6', 'admin_dinas', 1, TRUE),
(2, 'Drs. H. M. Fauzi, M.Si (Kepala Dinas PU)', 'pimpinan.pu@bojonegoro.go.id', '$2b$12$K82mE8M.8wGq0uR1N5aDfu85zXb9gK.5hP5W9m1d5p0p4u9o8p1z6', 'pimpinan_instansi', 1, TRUE),
(3, 'Budi Santoso', 'budi.santoso@gmail.com', '$2b$12$K82mE8M.8wGq0uR1N5aDfu85zXb9gK.5hP5W9m1d5p0p4u9o8p1z6', 'warga', NULL, TRUE),
(4, 'Siti Nurhaliza', 'siti.nurhaliza@gmail.com', '$2b$12$K82mE8M.8wGq0uR1N5aDfu85zXb9gK.5hP5W9m1d5p0p4u9o8p1z6', 'warga', NULL, TRUE),
(5, 'Dr. Rahmat Hidayat (Pusat Studi Kebijakan)', 'rahmat.peneliti@unair.ac.id', '$2b$12$K82mE8M.8wGq0uR1N5aDfu85zXb9gK.5hP5W9m1d5p0p4u9o8p1z6', 'media_peneliti', NULL, TRUE);

-- 4. Data Proyek
INSERT INTO proyek (id, nama_proyek, kategori, deskripsi, latitude, longitude, wilayah_id, dinas_id, anggaran, status, progres_persen, tanggal_mulai, estimasi_selesai, dibuat_oleh) VALUES
(1, 'Rekonstruksi & Pelebaran Jalan Veteran - Sukorejo', 'jalan', 'Pekerjaan perkerasan kaku (rigid pavement) sepanjang 2,4 KM guna mengurai kemacetan kawasan komersial.', -7.153400, 111.886700, 3, 1, 4500000000.00, 'berjalan', 65, '2025-03-01', '2025-08-30', 1),
(2, 'Normalisasi dan Pembangunan Saluran Drainase Kali Kaliasin', 'drainase', 'Pengerukan sedimentasi lumpur dan pemasangan u-ditch beton 120x120 cm pencegah genangan saat musim hujan.', -7.158200, 111.891200, 3, 1, 1250000000.00, 'berjalan', 40, '2025-04-10', '2025-09-15', 1),
(3, 'Revitalisasi Fasilitas Publik Taman Kota Rajekwesi', 'taman', 'Pemugaran jogging track, penambahan lampu penerangan taman hemat energi, serta area bermain anak ramah difabel.', -7.161000, 111.879500, 4, 3, 2800000000.00, 'selesai', 100, '2025-01-15', '2025-06-30', 1),
(4, 'Pembangunan Jembatan Antar Desa Ngumpakdalem - Pacul', 'jembatan', 'Pembangunan struktur jembatan beton balok T ganda dengan bentang 40 meter penghubung sentra pertanian.', -7.210400, 111.865300, 6, 1, 6750000000.00, 'tertunda', 25, '2025-02-01', '2025-11-20', 1);

-- 5. Data Tahapan Progres
INSERT INTO tahapan_progres (id, proyek_id, nama_tahap, progres_persen, catatan, dicatat_oleh, tanggal_pencatatan) VALUES
(1, 1, 'Pembersihan Lahan & Pengupasan Aspal Lama', 15, 'Selesai 100% tanpa hambatan lalu lintas.', 1, '2025-03-15 10:00:00'),
(2, 1, 'Pemasangan Tulangan Besi & Bekisting', 40, 'Pemasangan pembesian lapis pertama selesai di sisi timur jalan.', 1, '2025-04-20 11:30:00'),
(3, 1, 'Pengecoran Beton K-350 Jalur Timur', 65, 'Selesai pengecoran jalur timur, masa curing 14 hari.', 1, '2025-05-25 14:15:00'),
(4, 2, 'Pengerukan Lumpur & Sedimentasi', 20, 'Sedimentasi dibuang ke landfill yang telah disetujui.', 1, '2025-04-25 09:00:00'),
(5, 2, 'Pemasangan Box Culvert Segmen 1', 40, 'Telah terpasang sepanjang 150 meter.', 1, '2025-05-18 16:00:00'),
(6, 3, 'Pekerjaan Struktur Taman & Area Ramah Anak', 50, 'Pondasi lampu dan jalur paving terpasang.', 1, '2025-03-30 08:30:00'),
(7, 3, 'Finishing, Penanaman Pohon & Serah Terima Akhir (PHO)', 100, 'Proyek dinyatakan selesai 100% dan telah diserahterimakan.', 1, '2025-06-30 13:00:00'),
(8, 4, 'Pemasangan Tiang Pancang Jembatan', 25, 'Pengerjaan tertunda sementara menunggu suplai girder beton dari pabrik.', 1, '2025-03-20 15:45:00');

-- 6. Data Dokumentasi Proyek
INSERT INTO dokumentasi_proyek (id, proyek_id, tahapan_id, tipe_media, url_file, ukuran_file, diunggah_oleh) VALUES
(1, 1, 1, 'foto', '/uploads/proyek_1_tahap_1.jpg', 1240, 1),
(2, 1, 2, 'foto', '/uploads/proyek_1_tahap_2.jpg', 2150, 1),
(3, 1, 3, 'foto', '/uploads/proyek_1_tahap_3.jpg', 1890, 1),
(4, 2, 4, 'foto', '/uploads/proyek_2_tahap_1.jpg', 1420, 1),
(5, 3, 7, 'foto', '/uploads/proyek_3_selesai.jpg', 3200, 1);

-- 7. Data Rekomendasi Rute AI (Google Gemini API)
INSERT INTO rekomendasi_rute (id, proyek_id, nama_rute, prioritas, estimasi_jarak_km, estimasi_waktu_menit, alasan_rekomendasi, is_valid) VALUES
(1, 1, 'Jl. Pemuda -> Jl. Panglima Polim -> Jl. Pattimura', 'utama', 3.20, 8, 'Rute dengan lebar jalan memadai dan lampu lalu lintas terkoordinasi.', TRUE),
(2, 1, 'Jl. Lettu Suwolo -> Lingkar Luar Barat', 'kedua', 4.50, 12, 'Alternatif terbaik untuk kendaraan angkutan barang dan roda 4 ke atas guna menghindari padat pemukiman.', TRUE),
(3, 1, 'Jl. Lisman -> Gang Rajawali (Jalur Khusus Motor)', 'tambahan', 2.80, 7, 'Khusus pengendara sepeda motor untuk memangkas waktu saat jam sibuk pagi hari.', TRUE);

-- 8. Data Langganan Notifikasi
INSERT INTO subscription_notifikasi (id, user_id, proyek_id) VALUES
(1, 3, 1),
(2, 3, 3),
(3, 4, 1);

-- 9. Data Riwayat Notifikasi
INSERT INTO notifikasi (id, user_id, proyek_id, pesan, is_read) VALUES
(1, 3, 1, 'Pembaruan Proyek: Progres proyek Rekonstruksi & Pelebaran Jalan Veteran mencapai 65%.', FALSE),
(2, 4, 1, 'Pembaruan Proyek: Progres proyek Rekonstruksi & Pelebaran Jalan Veteran mencapai 65%.', TRUE),
(3, 3, 3, 'Pemberitahuan: Proyek Revitalisasi Taman Kota Rajekwesi telah rampung 100%. Berikan ulasan Anda!', TRUE);

-- 10. Data Laporan Masyarakat & Tanggapan Dinas
INSERT INTO laporan_masyarakat (id, proyek_id, user_id, isi_laporan, status_tindak_lanjut, tanggapan_dinas, ditanggapi_oleh) VALUES
(1, 1, 3, 'Mohon rambu peringatan di persimpangan Sukorejo diperbanyak karena minim penerangan saat malam hari.', 'ditanggapi', 'Terima kasih atas masukannya. Tim lapangan PU telah menambah 4 unit reflektor dan lampu peringatan berkedip di persimpangan.', 1),
(2, 2, 4, 'Bahan galian tanah sempat menghalangi jalan masuk toko warga, mohon dirapikan setelah jam kerja.', 'diproses', 'Laporan telah diteruskan ke mandor pelaksana di lapangan untuk pembersihan harian sebelum pukul 17.00 WIB.', 1);

-- 11. Data Rating Kepuasan (Khusus Proyek Selesai)
INSERT INTO rating_kepuasan (id, proyek_id, user_id, skor, komentar) VALUES
(1, 3, 3, 5, 'Taman sekarang sangat bersih, terang, dan anak-anak sangat suka area bermain barunya. Sangat transparan!'),
(2, 3, 4, 4, 'Bagus sekali hasilnya, semoga kebersihannya terus dijaga oleh pengelola dan pengunjung.');

-- 12. Data Evaluasi Pembangunan Pasca-Proyek (Dengan Analisis AI)
INSERT INTO evaluasi_pembangunan (id, proyek_id, user_id, kategori_masalah, deskripsi, skor_urgensi_ai, ringkasan_analisis_ai, status, ditinjau_oleh) VALUES
(1, 3, 3, 'Drainase Taman Menggenang', 'Saluran pembuangan air di sudut tenggara taman tersumbat sisa semen proyek saat hujan deras kemarin sehingga memicu genangan setinggi 10 cm.', 3, 'Analisis AI mengindikasikan potensi erosi paving dan perkembangbiakan jentik nyamuk jika dibiarkan. Rekomendasi: inspeksi pembersihan sedimentasi saluran.', 'menunggu_verifikasi', NULL);

-- 13. Data Dokumentasi Evaluasi
INSERT INTO dokumentasi_evaluasi (id, evaluasi_id, tipe_media, url_file) VALUES
(1, 1, 'foto', '/uploads/evaluasi_taman_genangan.jpg');

-- 14. Data Log Status Evaluasi (Audit Trail)
INSERT INTO evaluasi_status_log (id, evaluasi_id, status_sebelumnya, status_baru, diubah_oleh, catatan) VALUES
(1, 1, NULL, 'menunggu_verifikasi', 3, 'Laporan evaluasi pasca-proyek pertama kali diajukan oleh warga.');
