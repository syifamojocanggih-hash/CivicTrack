-- Migration: 001_sync_schema_with_models.sql
-- Tujuan: Sinkronisasi skema database DDL dengan model SQLAlchemy CivicTrack

-- 1. Perluas tabel users dengan data spasial & push token
ALTER TABLE users 
    ADD COLUMN wilayah_id BIGINT NULL AFTER dinas_id,
    ADD COLUMN desa_id BIGINT NULL AFTER wilayah_id,
    ADD COLUMN latitude DECIMAL(9, 6) NULL AFTER desa_id,
    ADD COLUMN longitude DECIMAL(9, 6) NULL AFTER latitude,
    ADD COLUMN push_token VARCHAR(255) NULL AFTER longitude;

ALTER TABLE users 
    ADD CONSTRAINT fk_users_wilayah FOREIGN KEY (wilayah_id) REFERENCES wilayah_administratif (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_users_desa FOREIGN KEY (desa_id) REFERENCES wilayah_administratif (id) ON DELETE SET NULL;

-- 2. Perluas tabel proyek dengan cover image, status publikasi, dan constraint unik nomor kontrak
ALTER TABLE proyek
    ADD COLUMN foto_url TEXT NULL COMMENT 'URL foto utama/cover proyek' AFTER sumber_dana,
    ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Status publikasi proyek (draft vs publik)' AFTER foto_url;

-- Pastikan nomor kontrak LPSE unik untuk mencegah duplikasi administrasi
ALTER TABLE proyek
    ADD CONSTRAINT uq_proyek_nomor_kontrak UNIQUE (nomor_kontrak_lpse);

-- 3. Perluas subscription_notifikasi dengan langganan tingkat wilayah/desa
ALTER TABLE subscription_notifikasi
    MODIFY COLUMN proyek_id BIGINT NULL,
    ADD COLUMN wilayah_id BIGINT NULL COMMENT 'ID kecamatan yang disubscribe' AFTER proyek_id,
    ADD COLUMN desa_id BIGINT NULL COMMENT 'ID desa yang disubscribe' AFTER wilayah_id;

ALTER TABLE subscription_notifikasi
    ADD CONSTRAINT fk_sub_wilayah FOREIGN KEY (wilayah_id) REFERENCES wilayah_administratif (id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_sub_desa FOREIGN KEY (desa_id) REFERENCES wilayah_administratif (id) ON DELETE CASCADE;

-- 4. Buat tabel push_subscriptions untuk Web Push Notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    endpoint TEXT NOT NULL,
    p256dh VARCHAR(255) NOT NULL,
    auth VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_push_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Perluas evaluasi_pembangunan dengan kolom raw_response_ai
ALTER TABLE evaluasi_pembangunan
    ADD COLUMN raw_response_ai JSON NULL COMMENT 'Payload respons mentah analisis AI Groq' AFTER ringkasan_analisis_ai;
