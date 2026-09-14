from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.user import WilayahLevel

class WilayahBase(BaseModel):
    kode_wilayah: str = Field(..., max_length=20)
    nama_wilayah: str = Field(..., max_length=150)
    level: WilayahLevel
    parent_id: Optional[int] = None
    geom_boundary: Optional[str] = None

class WilayahCreate(WilayahBase):
    pass

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
