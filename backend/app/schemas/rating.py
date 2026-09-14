from typing import Optional, Dict
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class RatingCreate(BaseModel):
    skor: int = Field(..., ge=1, le=5, description="Skor kepuasan bintang 1 sampai 5")
    komentar: Optional[str] = Field(None, max_length=1000)

class RatingResponse(BaseModel):
    id: int
    proyek_id: int
    user_id: int
    skor: int
    komentar: Optional[str] = None
    created_at: datetime
    nama_user: str = ""

    model_config = ConfigDict(from_attributes=True)

class RatingSummaryResponse(BaseModel):
    proyek_id: int
    rata_rata: float
    total_ulasan: int
    sebaran: Dict[str, int]
