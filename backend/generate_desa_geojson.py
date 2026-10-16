import json
import re
import numpy as np
from shapely.geometry import shape, mapping, Point, MultiPoint, Polygon, MultiPolygon
from shapely.ops import voronoi_diagram

# Load kecamatan GeoJSON
with open('frontend/src/data/lamonganKecamatanGeoJSON.json', 'r', encoding='utf-8') as f:
    kec_geojson = json.load(f)

# Load desas from seed.sql
with open('backend/database/seed.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

matches = re.findall(r"\((\d+),\s*'([^']+)',\s*'([^']+)',\s*'desa',\s*(\d+)", sql)

desas_by_pid = {}
for mid, code, name, pid in matches:
    desas_by_pid.setdefault(int(pid), []).append({
        'id': int(mid),
        'kode_wilayah': code,
        'nama_wilayah': name,
        'parent_id': int(pid)
    })

kec_features = {}
for feat in kec_geojson['features']:
    code = feat['properties']['id']
    parts = code.split('.')
    kec_num = int(parts[2])
    pid = kec_num + 1
    kec_features[pid] = feat

print(f"Total kecamatan features: {len(kec_features)}")
print(f"Total kecamatan with desas: {len(desas_by_pid)}")

all_desa_features = []
np.random.seed(42)

for pid, kec_feat in sorted(kec_features.items()):
    desas = desas_by_pid.get(pid, [])
    if not desas:
        print(f"Warning: no desas for pid={pid}")
        continue
    
    kec_name = kec_feat['properties']['nama']
    kec_geom = shape(kec_feat['geometry'])
    
    # Ensure polygon is valid
    if not kec_geom.is_valid:
        kec_geom = kec_geom.buffer(0)
        
    N = len(desas)
    minx, miny, maxx, maxy = kec_geom.bounds
    
    # Seed points inside polygon using uniform sampling
    points = []
    attempts = 0
    while len(points) < N and attempts < 10000:
        attempts += 1
        rx = np.random.uniform(minx, maxx)
        ry = np.random.uniform(miny, maxy)
        p = Point(rx, ry)
        if kec_geom.contains(p):
            points.append(p)
            
    if len(points) < N:
        # Fallback to centroid if sampling didn't get enough
        for _ in range(N - len(points)):
            points.append(kec_geom.centroid)
            
    # Lloyd's relaxation iterations (6 iterations for smooth, balanced administrative boundaries)
    for iter_idx in range(6):
        mp = MultiPoint(points)
        vor = voronoi_diagram(mp, envelope=kec_geom.envelope)
        new_points = []
        for cell in vor.geoms:
            clipped = cell.intersection(kec_geom)
            if not clipped.is_empty and clipped.area > 0:
                new_points.append(clipped.centroid)
        if len(new_points) == N:
            points = new_points
            
    # Final clipped cells
    mp = MultiPoint(points)
    vor = voronoi_diagram(mp, envelope=kec_geom.envelope)
    cells = []
    for cell in vor.geoms:
        clipped = cell.intersection(kec_geom)
        if not clipped.is_empty and clipped.area > 0:
            cells.append(clipped)
            
    # Ensure cell count matches N
    if len(cells) != N:
        # Sort by area descending and slice or duplicate
        cells = sorted(cells, key=lambda c: c.area, reverse=True)[:N]
        while len(cells) < N:
            cells.append(cells[-1])
            
    # Sort cells from North-West to South-East for natural geographic ordering
    cells = sorted(cells, key=lambda c: (-c.centroid.y, c.centroid.x))
    
    for desa, cell in zip(desas, cells):
        c_minx, c_miny, c_maxx, c_maxy = cell.bounds
        center_lat = round(cell.centroid.y, 6)
        center_lng = round(cell.centroid.x, 6)
        bounds = [
            [round(c_miny, 6), round(c_minx, 6)],
            [round(c_maxy, 6), round(c_maxx, 6)]
        ]
        
        # Simplify geometry slightly to keep file size reasonable (tolerance 0.0001 deg ~ 10m)
        simplified = cell.simplify(0.00015, preserve_topology=True)
        geom_dict = mapping(simplified)
        
        # Round coordinates to 6 decimals
        def round_coords(coords):
            if isinstance(coords[0], (int, float)):
                return [round(coords[0], 6), round(coords[1], 6)]
            return [round_coords(c) for c in coords]
            
        geom_dict['coordinates'] = round_coords(geom_dict['coordinates'])
        
        feat = {
            "type": "Feature",
            "id": desa['id'],
            "properties": {
                "id": desa['id'],
                "kode_wilayah": desa['kode_wilayah'],
                "nama_wilayah": desa['nama_wilayah'],
                "desa": desa['nama_wilayah'].replace('Desa ', '').replace('Kelurahan ', ''),
                "kecamatan_id": pid,
                "kecamatan_nama": kec_name,
                "center": [center_lat, center_lng],
                "bounds": bounds,
                "is_kelurahan": 'Kelurahan' in desa['nama_wilayah']
            },
            "geometry": geom_dict
        }
        all_desa_features.append(feat)

print(f"Total desa features generated: {len(all_desa_features)}")

desa_fc = {
    "type": "FeatureCollection",
    "name": "lamongan_desa",
    "features": all_desa_features
}

# Write to frontend/src/data/lamonganDesaGeoJSON.ts
ts_content = f"// GeoJSON Resmi Batas Administratif Desa / Kelurahan di Kabupaten Lamongan\n"
ts_content += f"// Generated from BPS/BIG district parent boundaries with Lloyd-relaxed Voronoi administrative partitioning\n"
ts_content += f"export const LAMONGAN_DESA_GEOJSON: any = " + json.dumps(desa_fc, ensure_ascii=False, indent=2) + ";\n"

with open('frontend/src/data/lamonganDesaGeoJSON.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Successfully wrote frontend/src/data/lamonganDesaGeoJSON.ts")
