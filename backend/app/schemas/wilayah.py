import json
from typing import Optional, List, Union, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
try:
    from shapely.geometry import shape
    from shapely.validation import explain_validity
    HAS_SHAPELY = True
except ImportError:
    HAS_SHAPELY = False
    shape = None
    explain_validity = None
from app.models.user import WilayahLevel

def parse_geojson_to_shape(geom_boundary: Union[str, dict, Any]):
    """
    Mengurai GeoJSON (string JSON atau dict Polygon, MultiPolygon, Feature, atau FeatureCollection)
    menjadi objek Shapely geometry. Mengembalikan None jika input kosong, tidak valid, atau jika Shapely tidak terpasang.
    """
    if not HAS_SHAPELY or not shape or not geom_boundary:
        return None

    if isinstance(geom_boundary, str):
        try:
            geom_data = json.loads(geom_boundary)
        except Exception:
            return None
    elif isinstance(geom_boundary, dict):
        geom_data = geom_boundary
    else:
        return None

    if not isinstance(geom_data, dict):
        return None

    gtype = geom_data.get("type")
    target_geom = geom_data
    if gtype == "Feature":
        target_geom = geom_data.get("geometry", {})
    elif gtype == "FeatureCollection":
        features = geom_data.get("features", [])
        if not features:
            return None
        if len(features) == 1:
            target_geom = features[0].get("geometry", {})
        else:
            try:
                from shapely.ops import unary_union
                shapes = [shape(f.get("geometry", {})) for f in features if f.get("geometry")]
                return unary_union(shapes)
            except Exception:
                target_geom = features[0].get("geometry", {})

    try:
        return shape(target_geom)
    except Exception:
        return None

def _segments_intersect(p1, p2, p3, p4):
    def ccw(a, b, c):
        return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0])
    if p1 == p3 or p1 == p4 or p2 == p3 or p2 == p4:
        return False
    return (ccw(p1, p3, p4) != ccw(p2, p3, p4)) and (ccw(p1, p2, p3) != ccw(p1, p2, p4))

def _is_self_intersecting_ring(coords):
    n = len(coords)
    if n < 4:
        return False
    edges = [(coords[i], coords[i+1]) for i in range(n - 1)]
    m = len(edges)
    for i in range(m):
        for j in range(i + 2, m):
            if i == 0 and j == m - 1:
                continue
            if _segments_intersect(edges[i][0], edges[i][1], edges[j][0], edges[j][1]):
                return True
    return False

def _check_geojson_self_intersection(geom_dict):
    gtype = geom_dict.get("type")
    coords = geom_dict.get("coordinates", [])
    if gtype == "Polygon":
        for ring in coords:
            if _is_self_intersecting_ring(ring):
                return True
    elif gtype == "MultiPolygon":
        for poly in coords:
            for ring in poly:
                if _is_self_intersecting_ring(ring):
                    return True
    return False

class WilayahBase(BaseModel):
    kode_wilayah: str = Field(..., max_length=20)
    nama_wilayah: str = Field(..., max_length=150)
    level: WilayahLevel
    parent_id: Optional[int] = None
    geom_boundary: Optional[str] = None

class WilayahCreate(WilayahBase):
    @field_validator('geom_boundary')
    @classmethod
    def validate_geom_boundary(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        try:
            geom_data = json.loads(v)
        except Exception as e:
            raise ValueError(f"Format geom_boundary harus berupa JSON string yang valid: {str(e)}")

        gtype = geom_data.get("type") if isinstance(geom_data, dict) else None
        valid_types = ["Polygon", "MultiPolygon", "Feature", "FeatureCollection"]
        if not gtype or gtype not in valid_types:
            raise ValueError(f"Tipe GeoJSON harus salah satu dari: {', '.join(valid_types)}")

        if HAS_SHAPELY and shape:
            try:
                s = parse_geojson_to_shape(geom_data)
                if s is None or s.is_empty:
                    raise ValueError("Geometri poligon tidak boleh kosong.")
                if not s.is_valid:
                    raise ValueError(f"Geometri poligon tidak valid: {explain_validity(s)}")
            except ValueError:
                raise
            except Exception as e:
                raise ValueError(f"Gagal memvalidasi struktur geometri: {str(e)}")
        else:
            target_geom = geom_data
            if gtype == "Feature":
                target_geom = geom_data.get("geometry", {})
            elif gtype == "FeatureCollection":
                features = geom_data.get("features", [])
                if not features:
                    raise ValueError("FeatureCollection tidak boleh kosong.")
                target_geom = features[0].get("geometry", {})
            
            if _check_geojson_self_intersection(target_geom):
                raise ValueError("Geometri poligon tidak valid: garis menyilang dirinya sendiri (Self-intersection)")

        return v


class WilayahBrief(BaseModel):
    id: int
    kode_wilayah: str
    nama_wilayah: str
    level: WilayahLevel
    parent_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class WilayahResponse(WilayahBase):
    id: int
    created_at: datetime
    sub_wilayah: List[WilayahBrief] = []

    model_config = ConfigDict(from_attributes=True)
