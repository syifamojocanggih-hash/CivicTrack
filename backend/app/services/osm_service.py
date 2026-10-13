import os
import json
import time
import logging
from typing import List, Dict, Tuple, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

# Cache file in uploads directory (persisted across restarts)
CACHE_FILE_PATH = os.path.join(settings.UPLOAD_DIR, "osm_street_cache.json")
CACHE_TTL_SECONDS = 14 * 86400  # 14 days TTL

# In-memory cache: {cache_key: (timestamp, [streets])}
_IN_MEMORY_CACHE: Dict[str, Tuple[float, List[str]]] = {}

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter"
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
                    if now - ts < CACHE_TTL_SECONDS:
                        _IN_MEMORY_CACHE[key] = (ts, streets)
    except Exception as e:
        logger.warning(f"Gagal membaca disk cache OSM: {e}")

def _save_disk_cache():
    """Save in-memory cache to disk."""
    try:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        serializable = {
            k: {"timestamp": ts, "streets": streets}
            for k, (ts, streets) in _IN_MEMORY_CACHE.items()
        }
        with open(CACHE_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(serializable, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.warning(f"Gagal menyimpan disk cache OSM: {e}")

# Initialize disk cache on import
_load_disk_cache()

def get_nearby_osm_streets(
    lat: float,
    lon: float,
    radius_deg: float = 0.02,
    timeout_sec: float = 4.0
) -> List[str]:
    """
    Mengambil daftar nama jalan nyata di sekitar koordinat (lat, lon) dari OpenStreetMap
    menggunakan Overpass API dengan Bounding Box Query cepat.
    
    Dilengkapi sistem caching in-memory & disk (TTL 14 hari) untuk mencegah
    pemanggilan berulang ke server publik Overpass.
    """
    cache_key = _get_cache_key(lat, lon)
    now = time.time()

    # 1. Cek cache in-memory
    if cache_key in _IN_MEMORY_CACHE:
        ts, streets = _IN_MEMORY_CACHE[cache_key]
        if now - ts < CACHE_TTL_SECONDS:
            logger.info(f"Menggunakan OSM street cache untuk key {cache_key} ({len(streets)} jalan)")
            return streets

    # 2. Query Overpass API menggunakan Bounding Box (QuadTile index cepat)
    s = lat - radius_deg
    n = lat + radius_deg
    w = lon - radius_deg
    e = lon + radius_deg

    query = f"""
    [out:json][timeout:5];
    way["highway"]["name"]({s},{w},{n},{e});
    out tags;
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
                    for el in elements:
                        name = el.get("tags", {}).get("name", "").strip()
                        if name and len(name) >= 3:
                            names.add(name)

                    sorted_names = sorted(list(names))
                    if sorted_names:
                        # Simpan ke cache
                        _IN_MEMORY_CACHE[cache_key] = (now, sorted_names)
                        _save_disk_cache()
                        logger.info(f"Overpass API ({endpoint}) berhasil mengambil {len(sorted_names)} jalan nyata di sekitar ({lat}, {lon})")
                        return sorted_names
                else:
                    logger.warning(f"Overpass API ({endpoint}) return status HTTP {resp.status_code}")
        except Exception as e:
            logger.warning(f"Overpass query gagal pada {endpoint}: {e}")

    logger.warning(f"Tidak dapat mengambil jalan dari Overpass API untuk ({lat}, {lon}). Fallback ke mode unverified.")
    return []
