import json
import logging
from typing import List, Tuple, Optional, Union, Any
from sqlalchemy.orm import Session
from app.models.user import WilayahAdministratif

logger = logging.getLogger(__name__)

def point_in_ring(x: float, y: float, ring: List[Any]) -> bool:
    """
    Ray casting algorithm (Crossing Number) untuk mengecek apakah titik (x, y)
    berada di dalam satu linear ring poligon tertutup.
    
    x: longitude (bujur)
    y: latitude (lintang)
    ring: list koordinat [[lon, lat], ...]
    """
    n = len(ring)
    if n < 3:
        return False

    # Bounding box pre-check untuk efisiensi
    min_x = min(p[0] for p in ring)
    max_x = max(p[0] for p in ring)
    min_y = min(p[1] for p in ring)
    max_y = max(p[1] for p in ring)
    if not (min_x <= x <= max_x and min_y <= y <= max_y):
        return False

    inside = False
    p1x, p1y = float(ring[0][0]), float(ring[0][1])
    for i in range(1, n + 1):
        p2 = ring[i % n]
        p2x, p2y = float(p2[0]), float(p2[1])

        # Cek apakah garis segmen melintasi garis horizontal y
        if (p1y > y) != (p2y > y):
            if p2y != p1y:
                x_inters = (p2x - p1x) * (y - p1y) / (p2y - p1y) + p1x
                if x <= x_inters:
                    inside = not inside
        p1x, p1y = p2x, p2y

    return inside

def point_in_polygon_with_holes(x: float, y: float, rings: List[List[Any]]) -> bool:
    """
    Mengecek apakah titik (x, y) berada di dalam poligon yang memiliki ring eksterior
    dan kemungkinan memiliki satu atau lebih lubang (interior rings).
    """
    if not rings:
        return False

    # Titik harus berada di dalam ring eksterior (ring ke-0)
    exterior = rings[0]
    if not point_in_ring(x, y, exterior):
        return False

    # Titik TIDAK boleh berada di dalam ring lubang (ring ke-1 dst)
    for hole in rings[1:]:
        if point_in_ring(x, y, hole):
            return False

    return True

def point_in_multipolygon(x: float, y: float, multipolygon_coords: List[List[List[Any]]]) -> bool:
    """
    Mengecek apakah titik (x, y) berada di salah satu poligon dari MultiPolygon.
    """
    for polygon_rings in multipolygon_coords:
        if point_in_polygon_with_holes(x, y, polygon_rings):
            return True
    return False

def is_point_in_geojson_geometry(latitude: float, longitude: float, geometry: dict) -> bool:
    """
    Mengecek apakah titik lintang/bujur berada di dalam objek GeoJSON Geometry.
    """
    geom_type = geometry.get("type", "")
    coords = geometry.get("coordinates", [])

    x = float(longitude)
    y = float(latitude)

    if geom_type == "Polygon":
        return point_in_polygon_with_holes(x, y, coords)
    elif geom_type == "MultiPolygon":
        return point_in_multipolygon(x, y, coords)
    elif geom_type == "GeometryCollection":
        geometries = geometry.get("geometries", [])
        return any(is_point_in_geojson_geometry(latitude, longitude, g) for g in geometries)
    
    return False

def is_point_in_geojson(latitude: float, longitude: float, geom_boundary: Union[str, dict]) -> bool:
    """
    Mem-parse string atau dictionary GeoJSON (Geometry, Feature, atau FeatureCollection)
    dan memverifikasi apakah titik (latitude, longitude) berada di dalam batas poligon.
    """
    if not geom_boundary:
        return True

    try:
        data = json.loads(geom_boundary) if isinstance(geom_boundary, str) else geom_boundary
    except Exception as e:
        logger.warning(f"Gagal mem-parse GeoJSON geom_boundary: {e}")
        return False

    if not isinstance(data, dict):
        return False

    # Jika berupa FeatureCollection
    if data.get("type") == "FeatureCollection":
        features = data.get("features", [])
        for f in features:
            geom = f.get("geometry")
            if geom and is_point_in_geojson_geometry(latitude, longitude, geom):
                return True
        return False

    # Jika berupa Feature
    if data.get("type") == "Feature":
        geom = data.get("geometry")
        return is_point_in_geojson_geometry(latitude, longitude, geom) if geom else False

    # Jika berupa Geometry langsung (Polygon / MultiPolygon)
    return is_point_in_geojson_geometry(latitude, longitude, data)

def validate_coordinates_in_wilayah(
    db: Session,
    latitude: float,
    longitude: float,
    wilayah_id: int
) -> Tuple[bool, Optional[str]]:
    """
    Validasi Spasial Point-in-Polygon (PRD 10.1 & PRD 10.4):
    Memastikan koordinat (latitude, longitude) proyek berada di dalam poligon
    wilayah administratif yang dipilih. Jika wilayah belum memiliki batas spesifik,
    pemeriksaan akan menelusuri wilayah induk (hierarki kecamatan/kabupaten).
    """
    wilayah = db.query(WilayahAdministratif).filter(WilayahAdministratif.id == wilayah_id).first()
    if not wilayah:
        return False, "Wilayah administratif tidak ditemukan di sistem."

    current = wilayah
    checked_wilayah_name = wilayah.nama_wilayah

    # Cek poligon pada wilayah saat ini; jika tidak ada, telusuri ke parent
    while current:
        if current.geom_boundary:
            checked_wilayah_name = current.nama_wilayah
            is_inside = is_point_in_geojson(
                latitude=latitude,
                longitude=longitude,
                geom_boundary=current.geom_boundary
            )
            if not is_inside:
                return (
                    False,
                    f"Titik koordinat ({latitude:.6f}, {longitude:.6f}) berada di luar batas poligon "
                    f"wilayah administratif '{checked_wilayah_name}'. "
                    f"Koordinat proyek harus berada di dalam batas wilayah yang terdaftar (point-in-polygon)."
                )
            return True, None

        if current.parent_id:
            current = db.query(WilayahAdministratif).filter(WilayahAdministratif.id == current.parent_id).first()
        else:
            break

    # Jika tidak ada poligon sama sekali di seluruh hierarki, loloskan
    return True, None
