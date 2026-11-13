import os
import sys
import subprocess

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath('backend'))

from app.core.database import engine
from sqlalchemy import text

print("1. Truncating existing tables...")
tables_to_truncate = [
    "evaluasi_status_log",
    "dokumentasi_evaluasi",
    "evaluasi_pembangunan",
    "rating_kepuasan",
    "laporan_masyarakat",
    "notifikasi",
    "subscription_notifikasi",
    "rekomendasi_rute",
    "dokumentasi_proyek",
    "tahapan_progres",
    "proyek",
    "users",
    "dinas",
    "wilayah_administratif",
]

with engine.connect() as conn:
    conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
    for t in tables_to_truncate:
        try:
            conn.execute(text(f"TRUNCATE TABLE `{t}`;"))
            print(f"  Truncated {t}")
        except Exception as e:
            print(f"  Could not truncate {t}: {e}")
    conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
    conn.commit()

print("2. Importing seed.sql...")
mysql_bin = r"C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe"
seed_path = os.path.abspath("backend/database/seed.sql")

res = subprocess.run([mysql_bin, "-u", "root", "civictrack_db", "-e", f"source {seed_path}"], capture_output=True, text=True)
if res.returncode == 0:
    print("Seed imported successfully!")
else:
    print(f"Error importing seed: {res.stderr}")

# Check counts
with engine.connect() as conn:
    w_cnt = conn.execute(text("SELECT COUNT(*) FROM wilayah_administratif")).scalar()
    p_cnt = conn.execute(text("SELECT COUNT(*) FROM proyek")).scalar()
    u_cnt = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
    print(f"Post-seed check: Wilayah={w_cnt}, Proyek={p_cnt}, Users={u_cnt}")

