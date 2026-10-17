import sys
sys.path.insert(0, '/app')
from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    res = conn.execute(text("SHOW COLUMNS FROM proyek LIKE 'kode_proyek'")).fetchall()
    if not res:
        conn.execute(text("ALTER TABLE proyek ADD COLUMN kode_proyek VARCHAR(50) NULL UNIQUE AFTER id"))
        print("Added kode_proyek column")
    else:
        print("kode_proyek column already exists")

    res2 = conn.execute(text("SHOW COLUMNS FROM proyek LIKE 'kode_akses'")).fetchall()
    if not res2:
        conn.execute(text("ALTER TABLE proyek ADD COLUMN kode_akses VARCHAR(100) NULL AFTER kode_proyek"))
        print("Added kode_akses column")
    else:
        print("kode_akses column already exists")
    conn.commit()

print("Database columns ready!")
