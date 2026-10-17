import json
from shapely.geometry import shape, Point

with open("scratch/generate_civictrack_dataset.py", "r", encoding="utf-8") as f:
    text = f.read()

# load projects_data
locs = {}
end_pos = text.find('print(f"Total projects prepared:')
exec(text[:end_pos], locs)
p_data = locs["projects_data"]

with open("/app/database/seed.sql", "r", encoding="utf-8") as f:
    sql_text = f.read()

import sys
sys.path.insert(0, "/app")
from app.core.database import SessionLocal
from app.models.user import WilayahAdministratif

db = SessionLocal()
kecs = db.query(WilayahAdministratif).filter(WilayahAdministratif.level == 'kecamatan').all()
kec_shapes = {}
for k in kecs:
    geom = json.loads(k.geom_boundary)
    kec_shapes[k.id] = {"shape": shape(geom), "name": k.nama_wilayah, "kec_id": k.id}

print(f"Checking {len(p_data)} projects against GeoJSON boundaries...")
failures = []
for p in p_data:
    pt = Point(p["lng"], p["lat"])
    matched = None
    for kid, kinfo in kec_shapes.items():
        if kinfo["shape"].contains(pt):
            matched = kinfo
            break
    if matched:
        print(f"[PASS] #{p['no']:02d} {p['nama'][:35]:<35} in {matched['name']} ({p['lat']}, {p['lng']})")
    else:
        min_d = 999
        nearest = None
        for kid, kinfo in kec_shapes.items():
            d = kinfo["shape"].distance(pt)
            if d < min_d:
                min_d = d
                nearest = kinfo
        failures.append((p, nearest, min_d))
        print(f"[FAIL] #{p['no']:02d} {p['nama'][:35]:<35} NOT INSIDE! Nearest: {nearest['name']} dist: {min_d:.6f}")

print(f"\nTotal passes: {len(p_data) - len(failures)}, Total fails: {len(failures)}")
