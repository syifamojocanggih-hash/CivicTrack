-- Migrasi: Penambahan Tim dan Pihak Penanggung Jawab Proyek (LPSE)
ALTER TABLE proyek
    ADD COLUMN pejabat_pembuat_komitmen VARCHAR(200) NULL COMMENT 'Nama Pejabat Pembuat Komitmen (PPK)',
    ADD COLUMN kontraktor_pelaksana VARCHAR(200) NULL COMMENT 'Nama Perusahaan/Kontraktor Pelaksana Fisik',
    ADD COLUMN konsultan_pengawas VARCHAR(200) NULL COMMENT 'Nama Konsultan Supervisi / Pengawas Lapangan',
    ADD COLUMN kepala_mandor VARCHAR(200) NULL COMMENT 'Nama Kepala Mandor / Site Manager Lapangan',
    ADD COLUMN nomor_kontrak_lpse VARCHAR(150) NULL COMMENT 'Nomor Kontrak LPSE / SPK Resmi',
    ADD COLUMN sumber_dana VARCHAR(150) NULL COMMENT 'Sumber Pembiayaan Proyek (APBD/APBN/DAK)';

