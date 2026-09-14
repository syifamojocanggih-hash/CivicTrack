from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class DinasBase(BaseModel):
    nama_dinas: str = Field(..., min_length=3, max_length=150)
    wilayah_id: Optional[int] = None

class DinasCreate(DinasBase):
    pass

class DinasResponse(DinasBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
