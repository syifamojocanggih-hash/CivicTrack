import json
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
from shapely.geometry import shape
from shapely.validation import explain_validity
from app.models.user import WilayahLevel

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

        try:
            target_geom = geom_data
            if gtype == "Feature":
                target_geom = geom_data.get("geometry", {})
            elif gtype == "FeatureCollection":
                features = geom_data.get("features", [])
                if not features:
                    raise ValueError("FeatureCollection tidak boleh kosong.")
                target_geom = features[0].get("geometry", {})
            
            s = shape(target_geom)
            if s.is_empty:
                raise ValueError("Geometri poligon tidak boleh kosong.")
            if not s.is_valid:
                raise ValueError(f"Geometri poligon tidak valid: {explain_validity(s)}")
        except ValueError:
            raise
        except Exception as e:
            raise ValueError(f"Gagal memvalidasi struktur geometri: {str(e)}")

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
