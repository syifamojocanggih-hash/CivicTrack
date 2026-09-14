-- ==========================================================
-- Skema Basis Data CivicTrack (MySQL 8.0+)
-- Sesuai Product Requirement Document (PRD) Bagian 9 & 10
-- ==========================================================

CREATE DATABASE IF NOT EXISTS civictrack_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE civictrack_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS evaluasi_status_log;
DROP TABLE IF EXISTS dokumentasi_evaluasi;
DROP TABLE IF EXISTS evaluasi_pembangunan;
DROP TABLE IF EXISTS rekomendasi_rute;
DROP TABLE IF EXISTS rating_kepuasan;
DROP TABLE IF EXISTS notifikasi;
DROP TABLE IF EXISTS subscription_notifikasi;
DROP TABLE IF EXISTS laporan_masyarakat;
DROP TABLE IF EXISTS dokumentasi_proyek;
DROP TABLE IF EXISTS tahapan_progres;
DROP TABLE IF EXISTS proyek;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS dinas;
DROP TABLE IF EXISTS wilayah_administratif;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------
-- 1. Tabel wilayah_administratif (PRD 9.3)
-- Menyimpan wilayah berjenjang (desa, kecamatan, kabupaten)
-- ----------------------------------------------------------
CREATE TABLE wilayah_administratif (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    kode_wilayah VARCHAR(20) NOT NULL UNIQUE,
    nama_wilayah VARCHAR(150) NOT NULL,
    level ENUM('desa', 'kecamatan', 'kabupaten') NOT NULL,
    parent_id BIGINT NULL,
    geom_boundary LONGTEXT NULL COMMENT 'Format GeoJSON polygon batas wilayah',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wilayah_parent FOREIGN KEY (parent_id) 
        REFERENCES wilayah_administratif (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. Tabel dinas (PRD 9.2)
-- Instansi pemerintah penanggung jawab proyek
-- ----------------------------------------------------------
CREATE TABLE dinas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nama_dinas VARCHAR(150) NOT NULL,
    wilayah_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dinas_wilayah FOREIGN KEY (wilayah_id) 
        REFERENCES wilayah_administratif (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. Tabel users (PRD 9.1)
-- Pengguna dengan peran RBAC
-- ----------------------------------------------------------
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('warga', 'admin_dinas', 'pimpinan_instansi', 'media_peneliti') NOT NULL,
    dinas_id BIGINT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_dinas FOREIGN KEY (dinas_id) 
        REFERENCES dinas (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. Tabel proyek (PRD 9.4)
-- Data inti proyek pembangunan publik
-- ----------------------------------------------------------
CREATE TABLE proyek (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nama_proyek VARCHAR(200) NOT NULL,
    kategori ENUM('jalan', 'taman', 'drainase', 'jembatan', 'gedung_publik', 'lainnya') NOT NULL,
    deskripsi TEXT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    wilayah_id BIGINT NOT NULL,
    dinas_id BIGINT NOT NULL,
    anggaran DECIMAL(18, 2) NULL,
    status ENUM('berjalan', 'selesai', 'tertunda', 'dalam_peninjauan_ulang') NOT NULL DEFAULT 'berjalan',
    progres_persen SMALLINT NOT NULL DEFAULT 0,
    tanggal_mulai DATE NOT NULL,
    estimasi_selesai DATE NOT NULL,
    dibuat_oleh BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_proyek_wilayah FOREIGN KEY (wilayah_id) 
        REFERENCES wilayah_administratif (id) ON DELETE RESTRICT,
    CONSTRAINT fk_proyek_dinas FOREIGN KEY (dinas_id) 
        REFERENCES dinas (id) ON DELETE RESTRICT,
    CONSTRAINT fk_proyek_creator FOREIGN KEY (dibuat_oleh) 
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_progres_persen CHECK (progres_persen >= 0 AND progres_persen <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. Tabel tahapan_progres (PRD 9.5)
-- Riwayat tahapan linimasa (timeline) pengerjaan proyek
-- ----------------------------------------------------------
CREATE TABLE tahapan_progres (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    proyek_id BIGINT NOT NULL,
    nama_tahap VARCHAR(150) NOT NULL,
    progres_persen SMALLINT NOT NULL,
    catatan TEXT NULL,
    dicatat_oleh BIGINT NOT NULL,
    tanggal_pencatatan TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tahapan_proyek FOREIGN KEY (proyek_id) 
        REFERENCES proyek (id) ON DELETE CASCADE,
    CONSTRAINT fk_tahapan_user FOREIGN KEY (dicatat_oleh) 
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_tahapan_progres CHECK (progres_persen >= 0 AND progres_persen <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 6. Tabel dokumentasi_proyek (PRD 9.6)
-- Foto/video bukti perkembangan fisik proyek per tahap
-- ----------------------------------------------------------
CREATE TABLE dokumentasi_proyek (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    proyek_id BIGINT NOT NULL,
    tahapan_id BIGINT NULL,
    tipe_media ENUM('foto', 'video') NOT NULL,
    url_file VARCHAR(500) NOT NULL,
    ukuran_file INT NULL COMMENT 'Ukuran file dalam KB',
    diunggah_oleh BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dokproyek_proyek FOREIGN KEY (proyek_id) 
        REFERENCES proyek (id) ON DELETE CASCADE,
    CONSTRAINT fk_dokproyek_tahapan FOREIGN KEY (tahapan_id) 
        REFERENCES tahapan_progres (id) ON DELETE SET NULL,
    CONSTRAINT fk_dokproyek_user FOREIGN KEY (diunggah_oleh) 
        REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 7. Tabel laporan_masyarakat (PRD 9.7)
-- Aduan, tanggapan, dan masukan masyarakat
-- ----------------------------------------------------------
CREATE TABLE laporan_masyarakat (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    proyek_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    isi_laporan TEXT NOT NULL,
    status_tindak_lanjut ENUM('baru', 'diproses', 'ditanggapi', 'ditolak') NOT NULL DEFAULT 'baru',
    tanggapan_dinas TEXT NULL,
    ditanggapi_oleh BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_laporan_proyek FOREIGN KEY (proyek_id) 
        REFERENCES proyek (id) ON DELETE CASCADE,
    CONSTRAINT fk_laporan_user FOREIGN KEY (user_id) 
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_laporan_admin FOREIGN KEY (ditanggapi_oleh) 
        REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 8. Tabel subscription_notifikasi (PRD 9.8)
-- Warga berlangganan pembaruan proyek tertentu
-- ----------------------------------------------------------
CREATE TABLE subscription_notifikasi (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    proyek_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_proyek_sub (user_id, proyek_id),
    CONSTRAINT fk_sub_user FOREIGN KEY (user_id) 
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_proyek FOREIGN KEY (proyek_id) 
        REFERENCES proyek (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 9. Tabel notifikasi (PRD 9.9)
-- Riwayat pesan notifikasi kepada pengguna
-- ----------------------------------------------------------
CREATE TABLE notifikasi (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    proyek_id BIGINT NOT NULL,
    pesan VARCHAR(255) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) 
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_proyek FOREIGN KEY (proyek_id) 
        REFERENCES proyek (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 10. Tabel rating_kepuasan (PRD 9.10)
-- Penilaian bintang (1-5) masyarakat untuk proyek selesai
-- ----------------------------------------------------------
CREATE TABLE rating_kepuasan (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    proyek_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    skor SMALLINT NOT NULL,
    komentar TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_proyek_rating (user_id, proyek_id),
    CONSTRAINT fk_rating_proyek FOREIGN KEY (proyek_id) 
        REFERENCES proyek (id) ON DELETE CASCADE,
    CONSTRAINT fk_rating_user FOREIGN KEY (user_id) 
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_rating_skor CHECK (skor >= 1 AND skor <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 11. Tabel rekomendasi_rute (PRD 9.11)
-- Rute alternatif cerdas hasil analisis Google Gemini AI
-- ----------------------------------------------------------
CREATE TABLE rekomendasi_rute (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    proyek_id BIGINT NOT NULL,
    nama_rute VARCHAR(200) NOT NULL,
    prioritas ENUM('utama', 'kedua', 'tambahan') NOT NULL,
    estimasi_jarak_km DECIMAL(6, 2) NULL,
    estimasi_waktu_menit INT NULL,
    alasan_rekomendasi TEXT NULL,
    raw_response_ai JSON NULL,
    is_valid BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rute_proyek FOREIGN KEY (proyek_id) 
        REFERENCES proyek (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 12. Tabel evaluasi_pembangunan (PRD 9.12)
-- Aduan cacat fisik pasca-proyek dengan skor urgensi AI
-- ----------------------------------------------------------
CREATE TABLE evaluasi_pembangunan (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    proyek_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    kategori_masalah VARCHAR(100) NOT NULL,
    deskripsi TEXT NOT NULL,
    skor_urgensi_ai SMALLINT NULL COMMENT 'Skor urgensi 1 (ringan) s/d 5 (sangat mendesak)',
    ringkasan_analisis_ai TEXT NULL,
    status ENUM(
        'menunggu_verifikasi',
        'dalam_peninjauan_ulang',
        'terverifikasi_perlu_tindak_lanjut',
        'selesai_ditindaklanjuti',
        'ditolak_tidak_terbukti'
    ) NOT NULL DEFAULT 'menunggu_verifikasi',
    ditinjau_oleh BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_eval_proyek FOREIGN KEY (proyek_id) 
        REFERENCES proyek (id) ON DELETE CASCADE,
    CONSTRAINT fk_eval_user FOREIGN KEY (user_id) 
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_eval_reviewer FOREIGN KEY (ditinjau_oleh) 
        REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_eval_urgensi CHECK (skor_urgensi_ai IS NULL OR (skor_urgensi_ai >= 1 AND skor_urgensi_ai <= 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 13. Tabel dokumentasi_evaluasi (PRD 9.13)
-- Foto/video bukti pendukung laporan evaluasi pasca-proyek
-- ----------------------------------------------------------
CREATE TABLE dokumentasi_evaluasi (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    evaluasi_id BIGINT NOT NULL,
    tipe_media ENUM('foto', 'video') NOT NULL,
    url_file VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dokeval_eval FOREIGN KEY (evaluasi_id) 
        REFERENCES evaluasi_pembangunan (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 14. Tabel evaluasi_status_log (PRD 9.14)
-- Jejak audit (audit trail) perubahan status evaluasi
-- ----------------------------------------------------------
CREATE TABLE evaluasi_status_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    evaluasi_id BIGINT NOT NULL,
    status_sebelumnya VARCHAR(50) NULL,
    status_baru VARCHAR(50) NOT NULL,
    diubah_oleh BIGINT NOT NULL,
    catatan TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evallog_eval FOREIGN KEY (evaluasi_id) 
        REFERENCES evaluasi_pembangunan (id) ON DELETE CASCADE,
    CONSTRAINT fk_evallog_user FOREIGN KEY (diubah_oleh) 
        REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
