import json
import csv
import os
from datetime import datetime, date

ref_date = date(2024, 10, 15)

os.makedirs('paper/data', exist_ok=True)
os.makedirs('paper/references', exist_ok=True)

# 20 Reference Projects for CivicTrack Uji 1, Uji 2, and Uji 3
raw_projects = [
    {
        'id': 1,
        'kode_proyek': 'SKD-SKD-001',
        'nama_proyek': 'Peningkatan Jalan Sukodadi - Sumberwudi (JAMULA)',
        'kategori': 'Jalan',
        'kecamatan': 'Sukodadi',
        'koordinat': [-7.115200, 112.332400],
        'pagu_anggaran': 7920000000,
        'tanggal_mulai': '2024-03-01',
        'target_selesai': '2024-11-30',
        'progres_fisik_milestone': 82.0,
        'tanggal_update_terakhir': '2024-10-10',
        'status_pelaksanaan': 'Berjalan',
        'kondisi_uji': 'On-Track',
        'dataset_split': 'Set A'
    },
    {
        'id': 2,
        'kode_proyek': 'PCK-PCK-001',
        'nama_proyek': 'Peningkatan Jalan Pucuk - Sekaran (JAMULA)',
        'kategori': 'Jalan',
        'kecamatan': 'Pucuk',
        'koordinat': [-7.098400, 112.285300],
        'pagu_anggaran': 6850000000,
        'tanggal_mulai': '2023-11-01',
        'target_selesai': '2024-08-31',
        'progres_fisik_milestone': 100.0,
        'tanggal_update_terakhir': '2024-08-28',
        'status_pelaksanaan': 'Selesai',
        'kondisi_uji': 'Completed',
        'dataset_split': 'Set B'
    },
    {
        'id': 3,
        'kode_proyek': 'SGO-GND-001',
        'nama_proyek': 'Rekonstruksi Jalan Sugio - Kedungpring (JAMULA)',
        'kategori': 'Jalan',
        'kecamatan': 'Sugio',
        'koordinat': [-7.186500, 112.245200],
        'pagu_anggaran': 6450000000,
        'tanggal_mulai': '2024-02-01',
        'target_selesai': '2024-10-31',
        'progres_fisik_milestone': 75.0,
        'tanggal_update_terakhir': '2024-10-08',
        'status_pelaksanaan': 'Berjalan',
        'kondisi_uji': 'Delayed',
        'dataset_split': 'Set A'
    },
    {
        'id': 4,
        'kode_proyek': 'BBT-BBT-001',
        'nama_proyek': 'Rekonstruksi Jalan Poros Babat - Sukorame',
        'kategori': 'Jalan',
        'kecamatan': 'Babat',
        'koordinat': [-7.115000, 112.162000],
        'pagu_anggaran': 9800000000,
        'tanggal_mulai': '2024-03-15',
        'target_selesai': '2024-12-31',
        'progres_fisik_milestone': 58.0,
        'tanggal_update_terakhir': '2024-10-01',
        'status_pelaksanaan': 'Berjalan',
        'kondisi_uji': 'Delayed',
        'dataset_split': 'Set B'
    },
    {
        'id': 5,
        'kode_proyek': 'DKT-SDR-001',
        'nama_proyek': 'Peningkatan Jalan Deket - Soko',
        'kategori': 'Jalan',
        'kecamatan': 'Deket',
        'koordinat': [-7.098200, 112.462100],
        'pagu_anggaran': 4950000000,
        'tanggal_mulai': '2024-04-01',
        'target_selesai': '2024-11-30',
        'progres_fisik_milestone': 62.0,
        'tanggal_update_terakhir': '2024-10-12',
        'status_pelaksanaan': 'Berjalan',
        'kondisi_uji': 'Delayed',
        'dataset_split': 'Set A'
    },
    {
        'id': 6,
        'kode_proyek': 'TUR-TUR-001',
        'nama_proyek': 'Peningkatan Jalan Turi - Kiringan',
        'kategori': 'Jalan',
        'kecamatan': 'Turi',
        'koordinat': [-7.068200, 112.388400],
        'pagu_anggaran': 4350000000,
        'tanggal_mulai': '2024-05-01',
        'target_selesai': '2024-12-31',
        'progres_fisik_milestone': 54.0,
        'tanggal_update_terakhir': '2024-09-25',
        'status_pelaksanaan': 'Berjalan',
        'kondisi_uji': 'Delayed',
        'dataset_split': 'Set B'
    },
    {
        'id': 7,
        'kode_proyek': 'BRD-BRN-001',
        'nama_proyek': 'Peningkatan Jalan Brengkok - Brondong (Pantura)',
        'kategori': 'Jalan',
        'kecamatan': 'Brondong',
        'koordinat': [-6.902300, 112.235400],
        'pagu_anggaran': 6200000000,
        'tanggal_mulai': '2024-03-01',
        'target_selesai': '2024-10-31',
        'progres_fisik_milestone': 88.0,
        'tanggal_update_terakhir': '2024-10-14',
        'status_pelaksanaan': 'Berjalan',
        'kondisi_uji': 'On-Track',
        'dataset_split': 'Set A'
    },
    {
        'id': 8,
        'kode_proyek': 'SMB-RDR-001',
        'nama_proyek': 'Rekonstruksi Jalan Mantup - Sambeng',
        'kategori': 'Jalan',
        'kecamatan': 'Sambeng',
        'koordinat': [-7.285400, 112.285600],
        'pagu_anggaran': 8100000000,
        'tanggal_mulai': '2024-02-15',
        'target_selesai': '2024-11-30',
        'progres_fisik_milestone': 67.0,
        'tanggal_update_terakhir': '2024-10-05',
        'status_pelaksanaan': 'Berjalan',
        'kondisi_uji': 'Delayed',
        'dataset_split': 'Set B'
    },
    {
        'id': 9,
        'kode_proyek': 'SKR-SKR-001',
        'nama_proyek': 'Peningkatan Jalan Bluluk - Sukorame',
        'kategori': 'Jalan',
        'kecamatan': 'Sukorame',
        'koordinat': [-7.345200, 112.115400],
        'pagu_anggaran': 5150000000,
        'tanggal_mulai': '2024-04-15',
        'target_selesai': '2024-12-31',
        'progres_fisik_milestone': 45.0,
        'tanggal_update_terakhir': '2024-09-18',
        'status_pelaksanaan': 'Berjalan',
        'kondisi_uji': 'Delayed',
        'dataset_split': 'Set A'
    },
    {
        'id': 10,
        'kode_proyek': 'LRN-PLN-001',
        'nama_proyek': 'Rekonstruksi Jalan Laren - Blawi',
        'kategori': 'Jalan',
        'kecamatan': 'Laren',
        'koordinat': [-6.985200, 112.275400],
        'pagu_anggaran': 5400000000,
        'tanggal_mulai': '2024-03-01',
        'target_selesai': '2024-10-31',
        'progres_fisik_milestone': 78.0,
        'tanggal_update_terakhir': '2024-10-09',
        'status_pelaksanaan': 'Berjalan',
        'kondisi_uji': 'Delayed',
        'dataset_split': 'Set B'
    },
    {
        'id': 11,
        'kode_proyek': 'TKG-WNK-001',
        'nama_proyek': 'Peningkatan Jalan Tikung - Kembangbahu',
        'kategori': 'Jalan',
        'kecamatan': 'Tikung',
        'koordinat': [-7.185200, 112.418200],
        'pagu_anggaran': 4600000000,
        'tanggal_mulai': '2024-03-15',
        'target_selesai': '2024-09-30',
        'progres_fisik_milestone': 92.0,
        'tanggal_update_terakhir': '2024-10-02',
        'status_pelaksanaan': 'Berjalan',
        'kondisi_uji': 'Delayed',
        'dataset_split': 'Set A'
    },
    {
        'id': 12,
        'kode_proyek': 'MDO-MJR-001',
        'nama_proyek': 'Peningkatan Jalan Modo - Babat',
        'kategori': 'Jalan',
        'kecamatan': 'Modo',
        'koordinat': [-7.202400, 112.135200],
        'pagu_anggaran': 5850000000,
        'tanggal_mulai': '2024-02-01',
        'target_selesai': '2024-10-31',
        'progres_fisik_milestone': 85.0,
        'tanggal_update_terakhir': '2024-10-11',
        'status_pelaksanaan': 'Berjalan',
        'kondisi_uji': 'On-Track',
        'dataset_split': 'Set B'
    },
    {
        'id': 13,
        'kode_proyek': 'KBN-KUR-001',
        'nama_proyek': 'Pembangunan Pintu Air & Retensi Kuro',
        'kategori': 'Drainase & SDA',
        'kecamatan': 'Karangbinangun',
        'koordinat': [-7.034200, 112.465400],
        'pagu_anggaran': 12850000000,
        'tanggal_mulai': '2023-10-01',
        'target_selesai': '2024-07-31',
        'progres_fisik_milestone': 100.0,
        'tanggal_update_terakhir': '2024-07-25',
        'status_pelaksanaan': 'Selesai',
        'kondisi_uji': 'Completed',
        'dataset_split': 'Set A'
    },
    {
        'id': 14,
        'kode_proyek': 'LMG-BNJ-001',
        'nama_proyek': 'Pembangunan Gedung Laboratorium Kesehatan Daerah (Labkesda)',
        'kategori': 'Gedung Publik',
        'kecamatan': 'Lamongan',
        'koordinat': [-7.121500, 112.416800],
        'pagu_anggaran': 6850000000,
        'tanggal_mulai': '2024-01-15',
        'target_selesai': '2024-08-31',
        'progres_fisik_milestone': 100.0,
        'tanggal_update_terakhir': '2024-08-20',
        'status_pelaksanaan': 'Selesai',
        'kondisi_uji': 'Completed',
        'dataset_split': 'Set B'
    },
    {
        'id': 15,
        'kode_proyek': 'LMG-PLS-002',
        'nama_proyek': 'Pembangunan Jembatan Penyeberangan & Jalur Hijau Plosowahyu',
        'kategori': 'Jembatan',
        'kecamatan': 'Lamongan',
        'koordinat': [-7.112000, 112.398000],
        'pagu_anggaran': 2500000000,
        'tanggal_mulai': '2024-11-01',
        'target_selesai': '2025-06-30',
        'progres_fisik_milestone': 0.0,
        'tanggal_update_terakhir': '2024-09-15',
        'status_pelaksanaan': 'Belum Dimulai',
        'kondisi_uji': 'Not Started',
        'dataset_split': 'Set A'
    },
    {
        'id': 16,
        'kode_proyek': 'KGN-KRN-002',
        'nama_proyek': 'Pembangunan Dermaga Wisata Bantaran Bengawan Karanggeneng',
        'kategori': 'Taman & RTH',
        'kecamatan': 'Karanggeneng',
        'koordinat': [-7.025000, 112.348000],
        'pagu_anggaran': 1800000000,
        'tanggal_mulai': '2024-12-01',
        'target_selesai': '2025-05-31',
        'progres_fisik_milestone': 0.0,
        'tanggal_update_terakhir': '2024-10-01',
        'status_pelaksanaan': 'Belum Dimulai',
        'kondisi_uji': 'Not Started',
        'dataset_split': 'Set B'
    },
    {
        'id': 17,
        'kode_proyek': 'KTG-PCN-001',
        'nama_proyek': 'Normalisasi Kali Asin & Pengerukan Bengawan Jero',
        'kategori': 'Drainase & SDA',
        'kecamatan': 'Kalitengah',
        'koordinat': [-7.025400, 112.395200],
        'pagu_anggaran': 4500000000,
        'tanggal_mulai': '2024-02-01',
        'target_selesai': '2024-11-30',
        'progres_fisik_milestone': None,
        'tanggal_update_terakhir': '2024-05-10',
        'status_pelaksanaan': 'Berjalan',
        'kondisi_uji': 'Missing Progress Data & Stale',
        'dataset_split': 'Set A'
    },
    {
        'id': 18,
        'kode_proyek': 'LMG-SKR-001',
        'nama_proyek': 'Saluran Drainase Primer Box Culvert Jl. Basuki Rahmat',
        'kategori': 'Drainase & SDA',
        'kecamatan': 'Lamongan',
        'koordinat': [-7.118900, 112.414200],
        'pagu_anggaran': 5800000000,
        'tanggal_mulai': '2024-04-01',
        'target_selesai': '2024-11-30',
        'progres_fisik_milestone': 68.0,
        'tanggal_update_terakhir': '2024-06-20',
        'status_pelaksanaan': 'Berjalan',
        'kondisi_uji': 'Stale Data',
        'dataset_split': 'Set B'
    },
    {
        'id': 19,
        'kode_proyek': 'KGN-KRN-001',
        'nama_proyek': 'Rekonstruksi Jembatan Karanggeneng - Maduran',
        'kategori': 'Jembatan',
        'kecamatan': 'Karanggeneng',
        'koordinat': [-7.022400, 112.345200],
        'pagu_anggaran': 7850000000,
        'tanggal_mulai': '2024-03-01',
        'target_selesai': '2024-12-31',
        'progres_fisik_milestone': 55.0,
        'tanggal_update_terakhir': '2024-06-15',
        'status_pelaksanaan': 'Berjalan',
        'kondisi_uji': 'Stale Data',
        'dataset_split': 'Set A'
    },
    {
        'id': 20,
        'kode_proyek': 'BRD-BRN-002',
        'nama_proyek': 'Pembangunan RSUD Brondong Pantura (Tahap II)',
        'kategori': 'Gedung Publik',
        'kecamatan': 'Brondong',
        'koordinat': [-6.901800, 112.234800],
        'pagu_anggaran': 24800000000,
        'tanggal_mulai': '2023-08-01',
        'target_selesai': '2024-12-31',
        'progres_fisik_milestone': 82.0,
        'tanggal_update_terakhir': '2024-10-13',
        'status_pelaksanaan': 'Berjalan',
        'kondisi_uji': 'On-Track',
        'dataset_split': 'Set B'
    }
]

# Process Ground Truth Computations
projects = []
for p in raw_projects:
    t_start = datetime.strptime(p['tanggal_mulai'], '%Y-%m-%d').date()
    t_end = datetime.strptime(p['target_selesai'], '%Y-%m-%d').date()
    t_update = datetime.strptime(p['tanggal_update_terakhir'], '%Y-%m-%d').date()
    total_dur = (t_end - t_start).days
    elapsed_dur = (ref_date - t_start).days
    
    if elapsed_dur <= 0:
        pct_time_elapsed = 0.0
    elif elapsed_dur >= total_dur:
        pct_time_elapsed = 100.0
    else:
        pct_time_elapsed = round((elapsed_dur / total_dur) * 100.0, 1)
        
    p_processed = dict(p)
    p_processed['durasi_hari_total'] = total_dur
    p_processed['durasi_hari_terlewati'] = max(0, min(total_dur, elapsed_dur))
    p_processed['persentase_waktu_terlewati'] = pct_time_elapsed
    p_processed['hari_sejak_update'] = (ref_date - t_update).days
    
    # Ground truth determination
    if p['progres_fisik_milestone'] is None:
        p_processed['ground_truth_status'] = 'Data Tidak Tersedia (Null)'
        p_processed['ground_truth_keterangan'] = 'Data progres fisik kosong/tidak dilaporkan'
    elif p['progres_fisik_milestone'] == 100.0:
        p_processed['ground_truth_status'] = 'Selesai'
        p_processed['ground_truth_keterangan'] = 'Pekerjaan fisik rampung 100%'
    elif pct_time_elapsed == 0.0:
        p_processed['ground_truth_status'] = 'Belum Dimulai'
        p_processed['ground_truth_keterangan'] = 'Jadwal pelaksanaan belum dimulai'
    else:
        dev = p['progres_fisik_milestone'] - pct_time_elapsed
        p_processed['deviasi_progres'] = round(dev, 1)
        if dev < -10.0:
            p_processed['ground_truth_status'] = 'Terlambat'
            p_processed['ground_truth_keterangan'] = f'Progres fisik ({p["progres_fisik_milestone"]}%) tertinggal dari waktu ({pct_time_elapsed}%), deviasi {round(dev,1)}%'
        else:
            p_processed['ground_truth_status'] = 'Tepat Waktu'
            p_processed['ground_truth_keterangan'] = f'Progres fisik ({p["progres_fisik_milestone"]}%) sesuai jadwal waktu ({pct_time_elapsed}%)'

    projects.append(p_processed)

# Save ground truth JSON and CSV
with open('paper/data/ground_truth_20_projects.json', 'w', encoding='utf-8') as f:
    json.dump(projects, f, indent=2, ensure_ascii=False)

fieldnames = [
    'id', 'kode_proyek', 'nama_proyek', 'kategori', 'kecamatan', 'pagu_anggaran',
    'tanggal_mulai', 'target_selesai', 'durasi_hari_total', 'persentase_waktu_terlewati',
    'progres_fisik_milestone', 'tanggal_update_terakhir', 'hari_sejak_update',
    'status_pelaksanaan', 'kondisi_uji', 'dataset_split', 'ground_truth_status', 'ground_truth_keterangan'
]
with open('paper/data/ground_truth_20_projects.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    for p in projects:
        writer.writerow(p)

print('Successfully written ground truth datasets.')
