import json
import re
import numpy as np
from shapely.geometry import shape, mapping, Point, MultiPoint, Polygon, MultiPolygon
from shapely.ops import voronoi_diagram, unary_union

# Load kecamatan GeoJSON
with open('frontend/src/data/lamonganKecamatanGeoJSON.json', 'r', encoding='utf-8') as f:
    kec_geojson = json.load(f)

# Load desas from seed.sql
with open('backend/database/seed.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

matches = re.findall(r"\((\d+),\s*'([^']+)',\s*'([^']+)',\s*'desa',\s*(\d+)", sql)

# Group by parent_id
desas_by_pid = {}
for mid, code, name, pid in matches:
    desas_by_pid.setdefault(int(pid), []).append({
        'id': int(mid),
        'kode_wilayah': code,
        'nama_wilayah': name,
        'parent_id': int(pid)
    })

# Map kecamatan id to feature
# In seed.sql:
# Sukorame is id=2, code='35.24.01'
# In geojson: id is '35.24.01' -> kecId = 2
kec_features = {}
for feat in kec_geojson['features']:
    code = feat['properties']['id']
    parts = code.split('.')
    kec_num = int(parts[2])
    pid = kec_num + 1
    kec_features[pid] = feat

print(f'Matched {len(kec_features)} kecamatan features.')

# Test Voronoi on Kecamatan Mantup (pid = 17)
mantup_feat = kec_features[17]
mantup_poly = shape(mantup_feat['geometry'])
mantup_desas = desas_by_pid[17]

print(f"Kecamatan Mantup: area={mantup_poly.area}, desas={len(mantup_desas)}")

# Seed points using grid inside polygon
minx, miny, maxx, maxy = mantup_poly.bounds
np.random.seed(42)
N = len(mantup_desas)

# Generate candidate points
points = []
while len(points) < N:
    rx = np.random.uniform(minx, maxx)
    ry = np.random.uniform(miny, maxy)
    p = Point(rx, ry)
    if mantup_poly.contains(p):
        points.append(p)

# Lloyd's relaxation iterations for natural boundaries
for iter_idx in range(8):
    mp = MultiPoint(points)
    vor = voronoi_diagram(mp, envelope=mantup_poly.envelope)
    new_points = []
    cells = []
    for cell in vor.geoms:
        clipped = cell.intersection(mantup_poly)
        if not clipped.is_empty and clipped.area > 0:
            cells.append(clipped)
            new_points.append(clipped.centroid)
    if len(new_points) == N:
        points = new_points

# Final clipped cells
mp = MultiPoint(points)
vor = voronoi_diagram(mp, envelope=mantup_poly.envelope)
final_cells = []
for cell in vor.geoms:
    clipped = cell.intersection(mantup_poly)
    if not clipped.is_empty and clipped.area > 0:
        final_cells.append(clipped)

print(f"Generated {len(final_cells)} final cells for Mantup.")
# Sort cells from north to south (max y to min y)
final_cells = sorted(final_cells, key=lambda c: (-c.centroid.y, c.centroid.x))

for d, cell in zip(mantup_desas, final_cells):
    print(f"Desa: {d['nama_wilayah']}, Center:({cell.centroid.y:.4f}, {cell.centroid.x:.4f}), Area: {cell.area:.6f}")
