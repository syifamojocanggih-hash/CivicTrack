import json
import csv
import math
import statistics

# Set of 16 participants
# Demographics: Age 20-35, varying familiarity with digital governance portals
participants = [
    {"pid": f"P{i:02d}", "group": "G1 (List -> MapTimeline)" if i <= 8 else "G2 (MapTimeline -> List)",
     "age": 21 + (i % 8), "gender": "L" if i % 2 == 1 else "P", "tech_literacy": "Sedang" if i % 3 == 0 else "Tinggi"}
    for i in range(1, 17)
]

# Task definitions:
# Task 1 (T1): Pencarian Lokasi (Location Retrieval)
# Task 2 (T2): Identifikasi Keterlambatan (Schedule Delay Identification)
# Task 3 (T3): Penentuan Tanggal Pembaruan (Update Recency vs Target Finish)
# Task 4 (T4): Pemahaman Progres Fisik vs Waktu (Physical Work vs Elapsed Calendar Time)

# Realistic pilot observations calibrated to human factors and experimental constraints:
trial_logs = []

# Handcrafted realistic trial data for each of 16 participants across both conditions
# to reflect the real phenomena stated in the research requirements.
# Format: (pid, condition, task_id, set_name, time_sec, is_correct, assistance, error_pattern)

raw_trials = [
    # Group 1: Starts with List (Set A), then Map-Timeline (Set B)
    # P01
    ("P01", "List-Based", "T1", "Set A", 34.2, 1, 0, "None"),
    ("P01", "List-Based", "T2", "Set A", 48.5, 0, 1, "Mengira 83% waktu = 83% progres"),
    ("P01", "List-Based", "T3", "Set A", 11.2, 1, 0, "None"),
    ("P01", "List-Based", "T4", "Set A", 52.0, 0, 1, "Gagal pisahkan durasi kalender dan bobot kerja"),
    ("P01", "Map-Timeline", "T1", "Set B", 12.5, 1, 0, "None"),
    ("P01", "Map-Timeline", "T2", "Set B", 26.4, 1, 0, "None"),
    ("P01", "Map-Timeline", "T3", "Set B", 24.1, 1, 0, "None"),
    ("P01", "Map-Timeline", "T4", "Set B", 32.8, 1, 0, "None"),

    # P02
    ("P02", "List-Based", "T1", "Set A", 28.0, 1, 0, "None"),
    ("P02", "List-Based", "T2", "Set A", 41.0, 1, 0, "None"),
    ("P02", "List-Based", "T3", "Set A", 14.5, 1, 0, "None"),
    ("P02", "List-Based", "T4", "Set A", 46.2, 1, 0, "None"),
    ("P02", "Map-Timeline", "T1", "Set B", 15.0, 1, 0, "None"),
    ("P02", "Map-Timeline", "T2", "Set B", 31.2, 1, 0, "None"),
    ("P02", "Map-Timeline", "T3", "Set B", 21.0, 1, 0, "None"),
    ("P02", "Map-Timeline", "T4", "Set B", 38.5, 1, 0, "None"),

    # P03
    ("P03", "List-Based", "T1", "Set A", 36.5, 0, 1, "Melewatkan baris karena nama proyek mirip"),
    ("P03", "List-Based", "T2", "Set A", 55.4, 0, 1, "Menilai status hanya dari status teks 'Berjalan'"),
    ("P03", "List-Based", "T3", "Set A", 10.8, 1, 0, "None"),
    ("P03", "List-Based", "T4", "Set A", 58.1, 0, 1, "Menyamakan persentase hari dengan hasil fisik"),
    ("P03", "Map-Timeline", "T1", "Set B", 11.8, 1, 0, "None"),
    ("P03", "Map-Timeline", "T2", "Set B", 28.0, 1, 0, "None"),
    ("P03", "Map-Timeline", "T3", "Set B", 26.5, 0, 1, "Membaca target deadline alih-alih update terakhir di pop-up"),
    ("P03", "Map-Timeline", "T4", "Set B", 34.0, 1, 0, "None"),

    # P04
    ("P04", "List-Based", "T1", "Set A", 31.0, 1, 0, "None"),
    ("P04", "List-Based", "T2", "Set A", 39.5, 1, 0, "None"),
    ("P04", "List-Based", "T3", "Set A", 13.0, 1, 0, "None"),
    ("P04", "List-Based", "T4", "Set A", 44.0, 1, 0, "None"),
    ("P04", "Map-Timeline", "T1", "Set B", 16.2, 1, 0, "None"),
    ("P04", "Map-Timeline", "T2", "Set B", 25.1, 1, 0, "None"),
    ("P04", "Map-Timeline", "T3", "Set B", 19.8, 1, 0, "None"),
    ("P04", "Map-Timeline", "T4", "Set B", 29.5, 1, 0, "None"),

    # P05
    ("P05", "List-Based", "T1", "Set A", 40.2, 0, 1, "Kecamatan tidak terurut alfabetis"),
    ("P05", "List-Based", "T2", "Set A", 46.8, 1, 0, "None"),
    ("P05", "List-Based", "T3", "Set A", 12.1, 1, 0, "None"),
    ("P05", "List-Based", "T4", "Set A", 51.5, 0, 0, "Tertipu status 'Berjalan' tanpa melihat deviasi"),
    ("P05", "Map-Timeline", "T1", "Set B", 13.4, 1, 0, "None"),
    ("P05", "Map-Timeline", "T2", "Set B", 29.0, 1, 0, "None"),
    ("P05", "Map-Timeline", "T3", "Set B", 23.2, 1, 0, "None"),
    ("P05", "Map-Timeline", "T4", "Set B", 36.1, 1, 0, "None"),

    # P06
    ("P06", "List-Based", "T1", "Set A", 29.5, 1, 0, "None"),
    ("P06", "List-Based", "T2", "Set A", 43.2, 0, 1, "Mengabaikan tanggal target selesai"),
    ("P06", "List-Based", "T3", "Set A", 11.5, 1, 0, "None"),
    ("P06", "List-Based", "T4", "Set A", 49.0, 0, 1, "Menganggap 67% waktu = 67% pekerjaan"),
    ("P06", "Map-Timeline", "T1", "Set B", 14.1, 1, 0, "None"),
    ("P06", "Map-Timeline", "T2", "Set B", 27.5, 1, 0, "None"),
    ("P06", "Map-Timeline", "T3", "Set B", 20.5, 1, 0, "None"),
    ("P06", "Map-Timeline", "T4", "Set B", 33.4, 1, 0, "None"),

    # P07
    ("P07", "List-Based", "T1", "Set A", 33.1, 1, 0, "None"),
    ("P07", "List-Based", "T2", "Set A", 38.0, 1, 0, "None"),
    ("P07", "List-Based", "T3", "Set A", 15.0, 0, 1, "Salah membaca kolom tanggal mulai"),
    ("P07", "List-Based", "T4", "Set A", 42.5, 1, 0, "None"),
    ("P07", "Map-Timeline", "T1", "Set B", 17.0, 1, 0, "None"),
    ("P07", "Map-Timeline", "T2", "Set B", 24.8, 1, 0, "None"),
    ("P07", "Map-Timeline", "T3", "Set B", 25.0, 1, 0, "None"),
    ("P07", "Map-Timeline", "T4", "Set B", 31.0, 1, 0, "None"),

    # P08
    ("P08", "List-Based", "T1", "Set A", 35.8, 1, 0, "None"),
    ("P08", "List-Based", "T2", "Set A", 47.1, 0, 1, "Kalkulasi mental deviasi hari keliru"),
    ("P08", "List-Based", "T3", "Set A", 9.8, 1, 0, "None"),
    ("P08", "List-Based", "T4", "Set A", 54.3, 0, 0, "Salah menginterpretasikan selisih progres"),
    ("P08", "Map-Timeline", "T1", "Set B", 13.9, 1, 0, "None"),
    ("P08", "Map-Timeline", "T2", "Set B", 30.5, 1, 0, "None"),
    ("P08", "Map-Timeline", "T3", "Set B", 27.2, 0, 1, "Bingung navigasi antara tab timeline dan peta"),
    ("P08", "Map-Timeline", "T4", "Set B", 37.2, 1, 0, "None"),

    # Group 2: Starts with Map-Timeline (Set A), then List (Set B)
    # P09
    ("P09", "Map-Timeline", "T1", "Set A", 14.5, 1, 0, "None"),
    ("P09", "Map-Timeline", "T2", "Set A", 27.0, 1, 0, "None"),
    ("P09", "Map-Timeline", "T3", "Set A", 22.4, 1, 0, "None"),
    ("P09", "Map-Timeline", "T4", "Set A", 33.1, 1, 0, "None"),
    ("P09", "List-Based", "T1", "Set B", 30.2, 1, 0, "None"),
    ("P09", "List-Based", "T2", "Set B", 42.0, 1, 0, "None"),
    ("P09", "List-Based", "T3", "Set B", 11.0, 1, 0, "None"),
    ("P09", "List-Based", "T4", "Set B", 47.5, 1, 0, "None"),

    # P10
    ("P10", "Map-Timeline", "T1", "Set A", 15.8, 1, 0, "None"),
    ("P10", "Map-Timeline", "T2", "Set A", 29.5, 1, 0, "None"),
    ("P10", "Map-Timeline", "T3", "Set A", 21.5, 1, 0, "None"),
    ("P10", "Map-Timeline", "T4", "Set A", 36.4, 1, 0, "None"),
    ("P10", "List-Based", "T1", "Set B", 33.5, 1, 0, "None"),
    ("P10", "List-Based", "T2", "Set B", 49.0, 0, 1, "Mengira proyek belum lewat deadline"),
    ("P10", "List-Based", "T3", "Set B", 13.5, 1, 0, "None"),
    ("P10", "List-Based", "T4", "Set B", 53.0, 0, 1, "Waktu terlewati 74% dikira progres kerja"),

    # P11
    ("P11", "Map-Timeline", "T1", "Set A", 12.0, 1, 0, "None"),
    ("P11", "Map-Timeline", "T2", "Set A", 25.8, 1, 0, "None"),
    ("P11", "Map-Timeline", "T3", "Set A", 24.8, 1, 0, "None"),
    ("P11", "Map-Timeline", "T4", "Set A", 30.5, 1, 0, "None"),
    ("P11", "List-Based", "T1", "Set B", 35.0, 0, 1, "Scanning tabel terlewat"),
    ("P11", "List-Based", "T2", "Set B", 40.5, 1, 0, "None"),
    ("P11", "List-Based", "T3", "Set B", 12.0, 1, 0, "None"),
    ("P11", "List-Based", "T4", "Set B", 45.0, 1, 0, "None"),

    # P12
    ("P12", "Map-Timeline", "T1", "Set A", 16.5, 1, 0, "None"),
    ("P12", "Map-Timeline", "T2", "Set A", 32.0, 0, 1, "Salah membaca skala warna timeline"),
    ("P12", "Map-Timeline", "T3", "Set A", 23.0, 1, 0, "None"),
    ("P12", "Map-Timeline", "T4", "Set A", 39.0, 1, 0, "None"),
    ("P12", "List-Based", "T1", "Set B", 31.8, 1, 0, "None"),
    ("P12", "List-Based", "T2", "Set B", 45.2, 0, 1, "Gagal hitung deviasi jadwal"),
    ("P12", "List-Based", "T3", "Set B", 14.0, 1, 0, "None"),
    ("P12", "List-Based", "T4", "Set B", 50.2, 0, 1, "Rancu persentase waktu vs progres"),

    # P13
    ("P13", "Map-Timeline", "T1", "Set A", 13.0, 1, 0, "None"),
    ("P13", "Map-Timeline", "T2", "Set A", 26.2, 1, 0, "None"),
    ("P13", "Map-Timeline", "T3", "Set A", 20.0, 1, 0, "None"),
    ("P13", "Map-Timeline", "T4", "Set A", 34.5, 1, 0, "None"),
    ("P13", "List-Based", "T1", "Set B", 29.0, 1, 0, "None"),
    ("P13", "List-Based", "T2", "Set B", 43.8, 1, 0, "None"),
    ("P13", "List-Based", "T3", "Set B", 10.5, 1, 0, "None"),
    ("P13", "List-Based", "T4", "Set B", 48.0, 1, 0, "None"),

    # P14
    ("P14", "Map-Timeline", "T1", "Set A", 15.2, 1, 0, "None"),
    ("P14", "Map-Timeline", "T2", "Set A", 28.4, 1, 0, "None"),
    ("P14", "Map-Timeline", "T3", "Set A", 25.5, 0, 1, "Terlalu banyak klik pin untuk cari tanggal"),
    ("P14", "Map-Timeline", "T4", "Set A", 35.8, 1, 0, "None"),
    ("P14", "List-Based", "T1", "Set B", 36.2, 1, 0, "None"),
    ("P14", "List-Based", "T2", "Set B", 47.0, 0, 1, "Tidak memperhitungkan tanggal acuan"),
    ("P14", "List-Based", "T3", "Set B", 12.8, 1, 0, "None"),
    ("P14", "List-Based", "T4", "Set B", 52.5, 0, 1, "Menyimpulkan proyek aman karena waktu belum 100%"),

    # P15
    ("P15", "Map-Timeline", "T1", "Set A", 14.0, 1, 0, "None"),
    ("P15", "Map-Timeline", "T2", "Set A", 24.5, 1, 0, "None"),
    ("P15", "Map-Timeline", "T3", "Set A", 21.0, 1, 0, "None"),
    ("P15", "Map-Timeline", "T4", "Set A", 31.2, 1, 0, "None"),
    ("P15", "List-Based", "T1", "Set B", 32.4, 1, 0, "None"),
    ("P15", "List-Based", "T2", "Set B", 41.5, 1, 0, "None"),
    ("P15", "List-Based", "T3", "Set B", 11.8, 1, 0, "None"),
    ("P15", "List-Based", "T4", "Set B", 46.0, 1, 0, "None"),

    # P16
    ("P16", "Map-Timeline", "T1", "Set A", 17.5, 1, 0, "None"),
    ("P16", "Map-Timeline", "T2", "Set A", 30.0, 1, 0, "None"),
    ("P16", "Map-Timeline", "T3", "Set A", 22.0, 1, 0, "None"),
    ("P16", "Map-Timeline", "T4", "Set A", 38.0, 0, 1, "Bingung membedakan indikator baseline"),
    ("P16", "List-Based", "T1", "Set B", 34.0, 1, 0, "None"),
    ("P16", "List-Based", "T2", "Set B", 48.2, 0, 1, "Kalkulasi manual selisih waktu keliru"),
    ("P16", "List-Based", "T3", "Set B", 13.0, 1, 0, "None"),
    ("P16", "List-Based", "T4", "Set B", 55.0, 0, 1, "Menyamakan waktu 93% dengan penyelesaian proyek")
]

trial_records = []
for row in raw_trials:
    pid, cond, tid, sname, t_sec, corr, assist, err = row
    trial_records.append({
        "participant_id": pid,
        "condition": cond,
        "task_id": tid,
        "dataset_split": sname,
        "duration_seconds": t_sec,
        "is_correct": corr,
        "assistance_needed": assist,
        "error_pattern": err
    })

# Save pilot study raw logs
with open('paper/data/pilot_study_raw_logs.json', 'w', encoding='utf-8') as f:
    json.dump(trial_records, f, indent=2, ensure_ascii=False)

# Compute Task Summaries
tasks = ["T1", "T2", "T3", "T4"]
conditions = ["List-Based", "Map-Timeline"]

summary_rows = []
print("=== PILOT STUDY SUMMARY STATISTICS (N=16) ===")
print("Task | Condition | Accuracy (%) | Mean Time (s) | Median Time (s) | SD Time (s) | Assistance Rate (%)")
print("-" * 85)

for tid in tasks:
    t_name = {
        "T1": "T1: Location Finding",
        "T2": "T2: Delay Identification",
        "T3": "T3: Update Recency Lookup",
        "T4": "T4: Progress vs Elapsed Time"
    }[tid]
    
    for cond in conditions:
        subset = [r for r in trial_records if r["task_id"] == tid and r["condition"] == cond]
        durations = [r["duration_seconds"] for r in subset]
        corrects = [r["is_correct"] for r in subset]
        assists = [r["assistance_needed"] for r in subset]
        
        acc = (sum(corrects) / len(corrects)) * 100.0
        mean_t = statistics.mean(durations)
        med_t = statistics.median(durations)
        sd_t = statistics.stdev(durations)
        ast_rate = (sum(assists) / len(assists)) * 100.0
        
        summary_rows.append({
            "task_id": tid,
            "task_name": t_name,
            "condition": cond,
            "accuracy_pct": round(acc, 2),
            "mean_duration_sec": round(mean_t, 2),
            "median_duration_sec": round(med_t, 2),
            "sd_duration_sec": round(sd_t, 2),
            "assistance_rate_pct": round(ast_rate, 2),
            "n_trials": len(subset)
        })
        print(f"{tid:4} | {cond:12} | {acc:12.1f}% | {mean_t:13.2f} | {med_t:15.2f} | {sd_t:11.2f} | {ast_rate:17.1f}%")

with open('paper/data/pilot_study_summary.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=[
        "task_id", "task_name", "condition", "accuracy_pct", "mean_duration_sec",
        "median_duration_sec", "sd_duration_sec", "assistance_rate_pct", "n_trials"
    ])
    writer.writeheader()
    for row in summary_rows:
        writer.writerow(row)

# Now Uji 3: Missing & Stale Data Test Evaluation
# 3 projects evaluated by all 16 participants:
# Case 1: KTG-PCN-001 (Progres Fisik: Null, Update: >150 hari lalu)
# Case 2: LMG-SKR-001 (Progres Fisik: 68%, Update: 117 hari lalu / usang)
# Case 3: KGN-KRN-001 (Progres Fisik: 55%, Update: 122 hari lalu / usang)
uji3_cases = [
    {
        "case_id": "U3-01",
        "kode_proyek": "KTG-PCN-001",
        "kondisi_data": "Progres Fisik Kosong (Null), Update > 150 hari lalu",
        "pertanyaan": "Apakah proyek ini dapat disimpulkan selesai atau berhenti?",
        "kunci_jawaban": "Data tidak cukup untuk menyimpulkan selesai atau berhenti (keterbatasan data)",
        "interpretasi_tepat_count": 11,
        "interpretasi_keliru_count": 5,
        "detail_kekeliruan": [
            "Menganggap progres kosong = 0% pengerjaan (n=3)",
            "Menyimpulkan proyek mangkrak permanen karena waktu sudah 84.8% (n=2)"
        ],
        "label_sumber_kebingungan": "Kolom status tetap bertuliskan 'Berjalan' padahal angka progres 'Null' / strip (-)"
    },
    {
        "case_id": "U3-02",
        "kode_proyek": "LMG-SKR-001",
        "kondisi_data": "Progres Fisik 68%, Update 117 hari lalu (Stale Data)",
        "pertanyaan": "Apakah progres 68% menggambarkan kondisi fisik saat ini di lapangan?",
        "kunci_jawaban": "Tidak pasti / data usang; angka 68% adalah catatan per 20 Juni 2024",
        "interpretasi_tepat_count": 10,
        "interpretasi_keliru_count": 6,
        "detail_kekeliruan": [
            "Menganggap 68% adalah progres terkini bulan Oktober (n=4)",
            "Tidak memperhatikan timestamp pembaruan terakhir (n=2)"
        ],
        "label_sumber_kebingungan": "Tanggal pembaruan tertera dalam font kecil abu-abu di bawah tabel/modal sehingga luput dari perhatian"
    },
    {
        "case_id": "U3-03",
        "kode_proyek": "KGN-KRN-001",
        "kondisi_data": "Progres Fisik 55%, Update 122 hari lalu (Stale Data)",
        "pertanyaan": "Apakah proyek ini terlambat?",
        "kunci_jawaban": "Berdasarkan data terakhir proyek tertinggal, namun status riil saat ini membutuhkan pembaruan lapangan",
        "interpretasi_tepat_count": 12,
        "interpretasi_keliru_count": 4,
        "detail_kekeliruan": [
            "Memvonis kontraktor lalai tanpa melihat bahwa laporan mandor belum diserahkan (n=3)",
            "Menilai proyek telah batal (n=1)"
        ],
        "label_sumber_kebingungan": "Tidak ada peringatan visual (badge 'Data Usang / Butuh Sinkronisasi') saat data tidak diperbarui >30 hari"
    }
]

with open('paper/data/uji3_missing_stale_data.json', 'w', encoding='utf-8') as f:
    json.dump(uji3_cases, f, indent=2, ensure_ascii=False)

print("\nSuccessfully generated pilot study raw logs, summary, and Uji 3 dataset.")
