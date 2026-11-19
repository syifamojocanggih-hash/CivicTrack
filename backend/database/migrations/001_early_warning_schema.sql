-- ==========================================================
-- MIGRATION: 001_early_warning_schema.sql
-- FASE 1: Perluasan Status Lifecycle Proyek & Skema Database
-- Sistem Early-Warning Proyek — CivicTrack Kabupaten Lamongan
-- ==========================================================

-- 1. Perluas ENUM status pada tabel proyek
ALTER TABLE proyek 
    MODIFY COLUMN status ENUM(
        'planned', 
        'scheduled', 
        'in_progress', 
        'completed', 
        'suspended', 
        'berjalan', 
        'selesai', 
        'tertunda', 
        'dalam_peninjauan_ulang', 
        'ditangguhkan'
    ) NOT NULL DEFAULT 'berjalan';

-- 2. Tambahkan kolom Early Warning & Lead Time Advantage (Hulu SiRUP/LPSE)
ALTER TABLE proyek 
    ADD COLUMN tanggal_kontrak_terbit DATE NULL COMMENT 'Tanggal penerbitan kontrak SiRUP / LPSE' AFTER estimasi_selesai,
    ADD COLUMN tanggal_mulai_rencana DATE NULL COMMENT 'Estimasi mobilisasi alat berat' AFTER tanggal_kontrak_terbit,
    ADD COLUMN tanggal_input_sistem TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan record proyek di sistem' AFTER tanggal_mulai_rencana,
    ADD COLUMN radius_dampak_meter INT NOT NULL DEFAULT 1500 COMMENT 'Radius perimeter peringatan dini spasial warga' AFTER tanggal_input_sistem,
    ADD COLUMN jalur_terdampak TEXT NULL COMMENT 'JSON array ruas jalan atau koridor yang ditutup/dialihkan' AFTER radius_dampak_meter;

-- Catatan Komputasi Virtual:
-- lead_time_hari = DATEDIFF(tanggal_mulai_rencana, DATE(tanggal_input_sistem))
