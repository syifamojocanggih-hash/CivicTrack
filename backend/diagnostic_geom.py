import json
import os
import re
from shapely.geometry import shape, Polygon, MultiPolygon
from shapely.validation import explain_validity

def test_seed_sql():
    print("=== 1. DIAGNOSIS SEED.SQL (DATABASE) ===")
    seed_path = os.path.join("backend", "database", "seed.sql")
    with open(seed_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # find INSERT INTO wilayah_administratif
    rows = re.findall(r"\(\s*(\d+)\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*([^,]+)\s*,\s*'([^']+)'\s*\)", content)
    for r in rows:
        id_w, kode, nama, level, parent, geom_json = r
        data = json.loads(geom_json)
        s = shape(data)
        coords = data.get("coordinates", [])
        pts = sum(len(ring) for ring in coords) if data["type"] == "Polygon" else 0
        print(f"ID {id_w}: {nama:30s} | Level: {level:10s} | Tipe: {data['type']:10s} | Titik: {pts:2d} | Valid: {s.is_valid} | Bounds: {[round(b,4) for b in s.bounds]}")
        print(f"   Koordinat: {coords[0] if coords else []}")

def test_lamongan_geojson():
    print("\n=== 2. DIAGNOSIS LAMONGAN_KECAMATAN_GEOJSON.JSON ===")
    geojson_path = os.path.join("frontend", "src", "data", "lamonganKecamatanGeoJSON.json")
    with open(geojson_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    features = data.get("features", [])
    print(f"Total Features: {len(features)}")
    
    shapes = []
    invalid_count = 0
    for i, feat in enumerate(features):
        props = feat.get("properties", {})
        geom = feat.get("geometry", {})
        name = props.get("nama", "Unknown")
        gtype = geom.get("type", "Unknown")
        coords = geom.get("coordinates", [])

        pts = 0
        if gtype == "Polygon":
            pts = sum(len(r) for r in coords)
        elif gtype == "MultiPolygon":
            pts = sum(len(r) for poly in coords for r in poly)

        s = shape(geom)
        shapes.append((name, s))
        valid = s.is_valid
        if not valid:
            invalid_count += 1
            print(f"  [INVALID!] [{i+1:02d}] {name} ({gtype}): {explain_validity(s)}")
        else:
            # check point count
            if pts <= 15:
                print(f"  [SANGAT KASAR] [{i+1:02d}] {name} ({gtype}) hanya {pts} titik!")
            
    print(f"Hasil Validitas Shapely: {len(features) - invalid_count} Valid, {invalid_count} Tidak Valid.")
    
    # Check self intersection or overlap
    print("\nPemeriksaan Overlap Signifikan Antar Kecamatan:")
    overlap_found = False
    for i in range(len(shapes)):
        n1, s1 = shapes[i]
        for j in range(i + 1, len(shapes)):
            n2, s2 = shapes[j]
            if s1.intersects(s2):
                inter = s1.intersection(s2)
                if inter.area > 0.0001:  # significant area in deg^2 (~ > 1 km^2)
                    overlap_found = True
                    print(f"  Overlap: {n1} <-> {n2} -> Luas: {inter.area:.6f} deg^2")
    if not overlap_found:
        print("  Tidak ada overlap area luas (>0.0001 deg^2).")

def test_geo_wilayah_data_ts():
    print("\n=== 3. DIAGNOSIS WILAYAH_DATA DALAM GEOWILAYAHDATA.TS ===")
    ts_path = os.path.join("frontend", "src", "data", "geoWilayahData.ts")
    with open(ts_path, "r", encoding="utf-8") as f:
        text = f.read()

    # Split by kecamatan entries
    entries = re.split(r"\{\s*nama:\s*", text)[1:]
    print(f"Jumlah entri kecamatan di WILAYAH_DATA: {len(entries)}")
    for e in entries:
        name_m = re.match(r"['\"]([^'\"]+)['\"]", e)
        if not name_m:
            continue
        name = name_m.group(1)
        poly_m = re.search(r"polygon:\s*\[([\s\S]*?)\n\s*\],", e)
        if poly_m:
            raw_pts = re.findall(r"\[\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\]", poly_m.group(1))
            pts = [(float(lat), float(lng)) for lat, lng in raw_pts]
            # In geoWilayahData.ts, coords are [lat, lng]
            # Convert to [lng, lat] for Shapely
            geom = Polygon([(lng, lat) for lat, lng in pts]) if len(pts) >= 3 else None
            valid = geom.is_valid if geom else False
            expl = explain_validity(geom) if geom else "N/A"
            bounds = [round(b, 4) for b in geom.bounds] if geom else []
            print(f"  {name:30s} | Titik: {len(pts):2d} | Valid: {str(valid):5s} | Bounds: {bounds} | Format: [lat, lng] buatan manual")
            if pts:
                print(f"     Koordinat: {pts[:2]} ... {pts[-1:]}")

def test_deep_overlap_and_crossing():
    print("\n=== 4. ANALISIS GEOMETRI LAMONGAN_KECAMATAN_GEOJSON ===")
    geojson_path = os.path.join("frontend", "src", "data", "lamonganKecamatanGeoJSON.json")
    with open(geojson_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for i, feat in enumerate(data["features"]):
        props = feat["properties"]
        geom = feat["geometry"]
        s = shape(geom)
        nama = props["nama"]
        gtype = geom["type"]
        
        # Check boundary simplification / vertex density
        bounds = s.bounds  # minx, miny, maxx, maxy
        width_km = (bounds[2] - bounds[0]) * 111.32
        height_km = (bounds[3] - bounds[1]) * 110.57
        
        # Count points
        if gtype == "Polygon":
            pts = len(geom["coordinates"][0])
        else:
            pts = sum(len(p[0]) for p in geom["coordinates"])
            
        print(f"[{i+1:02d}] {nama:25s} | {gtype:12s} | Titik: {pts:2d} | Dimensi: {width_km:.1f}x{height_km:.1f} km | Valid: {s.is_valid}")
        
        # Check bounds property in properties
        b_prop = props.get("bounds")
        if b_prop:
            # check if bounding box is stored
            pass

def test_fetch_sources():
    print("\n=== 5. CHECKING OPEN DATASETS FOR IDN ADM3 ===")
    import urllib.request
    for adm in ['ADM2', 'ADM3']:
        url = f"https://www.geoboundaries.org/api/current/gbOpen/IDN/{adm}/"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode())
                print(f"geoBoundaries {adm}: gjDownloadURL = {data.get('gjDownloadURL')}")
        except Exception as e:
            print(f"geoBoundaries {adm}: {e}")

def test_clean_lamongan():
    print("\n=== 6. VALIDASI CLEAN GADM LAMONGAN GEOJSON ===")
    clean_path = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\760c4b50-dfc7-4a7d-9ae4-bbc5f149de6e\scratch\clean_lamongan_geojson.json"
    if not os.path.exists(clean_path):
        print("clean_lamongan_geojson.json not found!")
        return

    with open(clean_path, "r", encoding="utf-8") as f:
        d = json.load(f)

    shapes = []
    for i, feat in enumerate(d["features"]):
        props = feat["properties"]
        geom = feat["geometry"]
        s = shape(geom)
        shapes.append((props["nama"], s))
        gtype = geom["type"]
        pts = sum(len(r) for r in geom["coordinates"]) if gtype == "Polygon" else sum(len(r) for poly in geom["coordinates"] for r in poly)
        print(f"[{i+1:02d}] {props['nama']:<30} | {gtype:<12} | Titik: {pts:3d} | Valid: {s.is_valid}")
        assert s.is_valid, f"Invalid geometry for {props['nama']}"

    print(f"\nSemua {len(shapes)} fitur GADM 100% VALID secara topologi Shapely.")
    
    # Overlap check
    overlaps = []
    for i in range(len(shapes)):
        n1, s1 = shapes[i]
        for j in range(i + 1, len(shapes)):
            n2, s2 = shapes[j]
            if s1.intersects(s2):
                inter = s1.intersection(s2)
                if inter.area > 0.00001:
                    overlaps.append((n1, n2, inter.area))
    print(f"Jumlah tumpang tindih (>0.00001 deg^2): {len(overlaps)}")
    for n1, n2, a in overlaps:
        print(f"  Overlap: {n1} <-> {n2}: {a:.6f} deg^2")

if __name__ == "__main__":
    test_clean_lamongan()


