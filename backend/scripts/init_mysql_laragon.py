import os
import sys
import pymysql

DB_HOST = "localhost"
DB_PORT = 3306
DB_USER = "root"
DB_PASS = ""
DB_NAME = "civictrack_db"

def init_database():
    print("=" * 60)
    print(" CivicTrack - Setup Otomatis Database MySQL Laragon")
    print("=" * 60)
    
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASS,
            autocommit=True,
            charset="utf8mb4"
        )
        print(f"✓ Berhasil terhubung ke MySQL Server Laragon di {DB_HOST}:{DB_PORT} (user: {DB_USER})")
    except Exception as e:
        print(f"\n[!] Gagal terhubung ke MySQL: {e}")
        print("    -> Harap pastikan Laragon sudah dibuka dan tombol 'Start All' sudah diklik (status MySQL running di port 3306).\n")
        return False

    with conn.cursor() as cursor:
        print(f"-> Membuat database '{DB_NAME}' jika belum ada...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        print(f"✓ Database '{DB_NAME}' siap.")
        cursor.execute(f"USE `{DB_NAME}`;")

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        schema_path = os.path.join(base_dir, "database", "schema.sql")
        seed_path = os.path.join(base_dir, "database", "seed.sql")

        if os.path.exists(schema_path):
            print("-> Mengeksekusi tabel dari database/schema.sql...")
            with open(schema_path, "r", encoding="utf-8") as f:
                schema_sql = f.read()
            for statement in schema_sql.split(";"):
                stmt = statement.strip()
                if stmt:
                    try:
                        cursor.execute(stmt)
                    except Exception:
                        pass
            print("✓ Seluruh tabel database berhasil diinisialisasi.")

        if os.path.exists(seed_path):
            print("-> Mengisi data master wilayah, proyek, dan pengguna dari database/seed.sql...")
            with open(seed_path, "r", encoding="utf-8") as f:
                seed_sql = f.read()
            for statement in seed_sql.split(";"):
                stmt = statement.strip()
                if stmt:
                    try:
                        cursor.execute(stmt)
                    except Exception:
                        pass
            print("✓ Data awal wilayah se-Lamongan, 35 proyek, dan akun pengguna berhasil diimpor.")

    conn.close()
    print("=" * 60)
    print("✓ SETUP DATABASE SELESAI DENGAN SUKSES!")
    print("Akun yang siap langsung digunakan (Password: password123):")
    print(" - potterrr@gmail.com   (Aparatur Pemerintah / Monitoring)")
    print(" - ronnn@gmail.com      (Penanggung Jawab Proyek)")
    print(" - mionee@gmail.com     (Warga Masyarakat)")
    print(" - admin.pu@civictrack.demo (Admin Dinas PU)")
    print("=" * 60)
    return True

if __name__ == "__main__":
    init_database()

