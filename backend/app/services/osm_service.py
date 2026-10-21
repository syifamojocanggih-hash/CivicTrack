import os
import json
import time
import math
import logging
import re
from typing import List, Dict, Tuple, Optional, Any
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

# Cache file in uploads directory (persisted across restarts)
CACHE_FILE_PATH = os.path.join(settings.UPLOAD_DIR, "osm_street_cache.json")
CACHE_TTL_SECONDS = 14 * 86400  # 14 days TTL

# In-memory cache: {cache_key: (timestamp, [streets], {street_name: [segments]})}
_IN_MEMORY_CACHE: Dict[str, Tuple[float, List[str], Dict[str, List[List[List[float]]]]]] = {}

OVERPASS_ENDPOINTS = [
    "https://overpass.private.coffee/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
]

def _get_cache_key(lat: float, lon: float) -> str:
    """Generate cache key rounded to 2 decimal places (~1.1 km grid resolution)."""
    return f"{round(lat, 2)}_{round(lon, 2)}"

def _load_disk_cache():
    """Load persistent cache from disk into memory."""
    global _IN_MEMORY_CACHE
    if not os.path.exists(CACHE_FILE_PATH):
        return
    try:
        with open(CACHE_FILE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            now = time.time()
            for key, val in data.items():
                if isinstance(val, dict):
                    ts = val.get("timestamp", 0)
                    streets = val.get("streets", [])
                    geometries = val.get("geometries", {})
                    if now - ts < CACHE_TTL_SECONDS and geometries:
                        _IN_MEMORY_CACHE[key] = (ts, streets, geometries)
    except Exception as e:
        logger.warning(f"Gagal membaca disk cache OSM: {e}")

def _save_disk_cache():
    """Save in-memory cache to disk."""
    try:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        serializable = {
            k: {
                "timestamp": ts,
                "streets": streets,
                "geometries": geometries
            }
            for k, (ts, streets, geometries) in _IN_MEMORY_CACHE.items()
        }
        with open(CACHE_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(serializable, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.warning(f"Gagal menyimpan disk cache OSM: {e}")

# Initialize disk cache on import
_load_disk_cache()

def get_nearby_osm_data(
    lat: float,
    lon: float,
    radius_deg: float = 0.02,
    timeout_sec: float = 3.0
) -> Tuple[List[str], Dict[str, List[List[List[float]]]]]:
    """
    Mengambil daftar nama jalan nyata DAN geometri garis koordinat di sekitar (lat, lon)
    dari OpenStreetMap menggunakan Overpass API.
    
    Returns:
        (streets, geometries)
        - streets: list nama jalan terurut unik
        - geometries: dict {nama_jalan: [segment_1, segment_2, ...]} di mana segment adalah list [[lat, lon], ...]
    """
    cache_key = _get_cache_key(lat, lon)
    now = time.time()

    # 1. Cek cache in-memory
    if cache_key in _IN_MEMORY_CACHE:
        entry = _IN_MEMORY_CACHE[cache_key]
        ts = entry[0]
        streets = entry[1]
        geometries = entry[2] if len(entry) > 2 else {}
        if now - ts < CACHE_TTL_SECONDS and geometries:
            logger.info(f"Menggunakan OSM cache untuk key {cache_key} ({len(streets)} jalan, {len(geometries)} geometri)")
            return streets, geometries

    # 2. Query Overpass API menggunakan Bounding Box dan out geom
    s = lat - radius_deg
    n = lat + radius_deg
    w = lon - radius_deg
    e = lon + radius_deg

    query = f"""
    [out:json][timeout:5];
    way["highway"~"primary|secondary|tertiary|residential|unclassified"]["name"]({s},{w},{n},{e});
    out geom;
    """

    headers = {
        "User-Agent": "CivicTrack/1.0 (Public Infrastructure Transparency; contact@civictrack.id)"
    }

    for endpoint in OVERPASS_ENDPOINTS:
        try:
            with httpx.Client(timeout=timeout_sec) as client:
                resp = client.post(endpoint, data={"data": query}, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    elements = data.get("elements", [])
                    names = set()
                    geometries: Dict[str, List[List[List[float]]]] = {}

                    for el in elements:
                        name = el.get("tags", {}).get("name", "").strip()
                        geom_pts = el.get("geometry", [])
                        if name and len(name) >= 3:
                            names.add(name)
                            if geom_pts:
                                coords = [[float(pt["lat"]), float(pt["lon"])] for pt in geom_pts if "lat" in pt and "lon" in pt]
                                if coords:
                                    geometries.setdefault(name, []).append(coords)

                    sorted_names = sorted(list(names))
                    if sorted_names:
                        # Simpan ke cache
                        _IN_MEMORY_CACHE[cache_key] = (now, sorted_names, geometries)
                        _save_disk_cache()
                        logger.info(f"Overpass API ({endpoint}) berhasil mengambil {len(sorted_names)} jalan & {len(geometries)} geometri untuk ({lat}, {lon})")
                        return sorted_names, geometries
                else:
                    logger.warning(f"Overpass API ({endpoint}) return status HTTP {resp.status_code}")
        except Exception as e:
            logger.warning(f"Overpass query gagal pada {endpoint}: {e}")

    logger.warning(f"Tidak dapat mengambil jalan dari Overpass API untuk ({lat}, {lon}). Fallback ke mode unverified.")
    return [], {}

def get_nearby_osm_streets(
    lat: float,
    lon: float,
    radius_deg: float = 0.02,
    timeout_sec: float = 4.0
) -> List[str]:
    """Mengambil daftar nama jalan nyata (kompatibilitas backward)."""
    streets, _ = get_nearby_osm_data(lat, lon, radius_deg, timeout_sec)
    return streets

def _dist_sq(p1: List[float], p2: List[float]) -> float:
    """Kuadrat jarak Euclidean antara dua titik [lat, lon]."""
    return (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2

def chain_road_geometries(
    street_names: List[str],
    geometries: Dict[str, List[List[List[float]]]]
) -> List[List[float]]:
    """
    Algoritma Nearest Endpoint Chaining:
    Menyambungkan segmen-segmen jalan yang disebutkan dalam rute AI menjadi satu
    garis koordinat (polyline) utuh yang kontinu tanpa lompatan atau zigzag.
    
    Jika suatu segmen tercatat dengan arah terbalik (reverse node ordering) di OSM,
    algoritma akan secara otomatis membalik orientasi segmen tersebut agar
    menyambung mulus dengan ujung segmen sebelumnya.
    """
    if not street_names or not geometries:
        return []

    # 1. Kumpulkan seluruh segmen yang cocok dengan urutan street_names
    collected_segments: List[List[List[float]]] = []
    
    # Normalisasi kamus geometri untuk pencarian fleksibel
    geo_lookup: Dict[str, List[List[List[float]]]] = {}
    for g_name, segs in geometries.items():
        clean_key = g_name.lower().strip()
        geo_lookup[clean_key] = segs
        stripped_key = re.sub(r"^(jalan|jl\.|jl|gang|gg\.)\s+", "", clean_key).strip()
        if stripped_key:
            geo_lookup[stripped_key] = segs

    for raw_name in street_names:
        clean = raw_name.lower().strip()
        stripped = re.sub(r"^(jalan|jl\.|jl|gang|gg\.)\s+", "", clean).strip()

        matched_segs = geo_lookup.get(clean) or geo_lookup.get(stripped)
        if not matched_segs:
            # Coba pencarian substring
            for k, segs in geo_lookup.items():
                if len(k) >= 4 and (k in clean or clean in k):
                    matched_segs = segs
                    break

        if matched_segs:
            # Sambungkan segmen dalam jalan yang sama terlebih dahulu jika ada multiple segmen
            if len(matched_segs) == 1:
                collected_segments.append(list(matched_segs[0]))
            else:
                # Chaining internal segmen jalan yang sama
                internal_chain = list(matched_segs[0])
                for next_seg in matched_segs[1:]:
                    if not next_seg:
                        continue
                    end_pt = internal_chain[-1]
                    d_forward = _dist_sq(end_pt, next_seg[0])
                    d_reverse = _dist_sq(end_pt, next_seg[-1])
                    if d_reverse < d_forward:
                        oriented = list(reversed(next_seg))
                    else:
                        oriented = list(next_seg)
                    internal_chain.extend(oriented)
                collected_segments.append(internal_chain)

    if not collected_segments:
        return []

    # 2. Rangkaikan segmen-segmen antar ruas jalan
    if len(collected_segments) == 1:
        return collected_segments[0]

    # Tentukan orientasi awal segmen pertama terhadap segmen kedua
    seg0 = list(collected_segments[0])
    seg1 = collected_segments[1]
    if seg1:
        # Periksa apakah kepala atau ekor seg0 yang lebih dekat ke seg1
        d_tail = min(_dist_sq(seg0[-1], seg1[0]), _dist_sq(seg0[-1], seg1[-1]))
        d_head = min(_dist_sq(seg0[0], seg1[0]), _dist_sq(seg0[0], seg1[-1]))
        if d_head < d_tail:
            seg0 = list(reversed(seg0))

    chained: List[List[float]] = list(seg0)

    for seg in collected_segments[1:]:
        if not seg:
            continue
        current_end = chained[-1]
        dist_forward = _dist_sq(current_end, seg[0])
        dist_reverse = _dist_sq(current_end, seg[-1])

        if dist_reverse < dist_forward:
            oriented_seg = list(reversed(seg))
            min_dist = dist_reverse
        else:
            oriented_seg = list(seg)
            min_dist = dist_forward

        # HANYA sambungkan jika jarak antar ujung segmen wajar (<= 0.00000625 deg² ≈ 250 meter).
        # Jika gap terlalu jauh (> 250m), segmen tidak bersebelahan secara fisik sehingga
        # dilarang menarik garis lurus melompat memotong kota (teleportasi/zigzag).
        if min_dist > 0.00000625:
            continue

        # Hindari duplikasi titik jika sangat dekat (< 1e-7 deg² ≈ 30 meter)
        if min_dist < 1e-7:
            chained.extend(oriented_seg[1:])
        else:
            chained.extend(oriented_seg)

    return chained

def check_route_crosses_closure(
    coordinates: List[List[float]],
    closure_lat: float,
    closure_lon: float,
    radius_meters: float = 280.0
) -> bool:
    """
    Memeriksa apakah koordinat garis rute memotong area radius penutupan proyek.
    Jika start dan finish berada di luar radius penutupan, tetapi ada titik perantara
    yang masuk ke dalam radius penutupan, fungsi mengembalikan True (rute terhalang).
    """
    if not coordinates or len(coordinates) < 2:
        return False

    d_start = math.sqrt(((coordinates[0][0] - closure_lat) * 111000) ** 2 + ((coordinates[0][1] - closure_lon) * 110170) ** 2)
    d_dest = math.sqrt(((coordinates[-1][0] - closure_lat) * 111000) ** 2 + ((coordinates[-1][1] - closure_lon) * 110170) ** 2)

    # Hanya lakukan cek jika start dan finish berada di luar zona penutupan
    if d_start < radius_meters * 0.8 or d_dest < radius_meters * 0.8:
        return False

    for pt in coordinates:
        d = math.sqrt(((pt[0] - closure_lat) * 111000) ** 2 + ((pt[1] - closure_lon) * 110170) ** 2)
        if d < radius_meters:
            return True
    return False

def fetch_osrm_driving_route(
    orig_lat: float,
    orig_lon: float,
    dest_lat: float,
    dest_lon: float,
    via_lat: Optional[float] = None,
    via_lon: Optional[float] = None,
    profile: str = "driving",
    timeout_sec: float = 3.5
) -> Optional[Dict[str, Any]]:
    """
    Mengambil rute jalan berkendara riil dari Open Source Routing Machine (OSRM)
    yang terjamin 100% menempel pada jaringan jalan resmi OpenStreetMap.
    Mendukung profil: 'driving' (mobil/kendaraan umum) dan 'bicycle' (roda dua/sepeda motor).
    """
    try:
        if via_lat is not None and via_lon is not None:
            coords_str = f"{orig_lon},{orig_lat};{via_lon},{via_lat};{dest_lon},{dest_lat}"
        else:
            coords_str = f"{orig_lon},{orig_lat};{dest_lon},{dest_lat}"

        profile_endpoint = "bicycle" if profile == "bicycle" else "driving"
        url = f"https://router.project-osrm.org/route/v1/{profile_endpoint}/{coords_str}?overview=full&geometries=geojson&steps=true"
        headers = {"User-Agent": "CivicTrack/1.0 (Public Infrastructure Transparency; contact@civictrack.id)"}

        with httpx.Client(timeout=timeout_sec) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok" and data.get("routes"):
                    route = data["routes"][0]
                    geojson_coords = route.get("geometry", {}).get("coordinates", [])
                    lat_lon_coords = [[round(pt[1], 6), round(pt[0], 6)] for pt in geojson_coords if len(pt) >= 2]
                    dist_km = round(route.get("distance", 0) / 1000.0, 1)
                    dur_min = max(1, round(route.get("duration", 0) / 60.0))

                    road_names = []
                    for leg in route.get("legs", []):
                        for step in leg.get("steps", []):
                            name = step.get("name", "").strip()
                            if name and name not in road_names:
                                road_names.append(name)

                    return {
                        "coordinates": lat_lon_coords,
                        "distance_km": dist_km,
                        "duration_min": dur_min,
                        "road_names": road_names,
                    }
    except Exception as e:
        logger.warning(f"OSRM {profile} route query error: {e}")
    return None


