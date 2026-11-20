from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class NotifikasiResponse(BaseModel):
    id: int
    user_id: int
    proyek_id: int
    pesan: str
    is_read: bool
    created_at: datetime
    nama_proyek: str = ""
    target_type: str = "radius"
    is_high_priority: bool = False

    model_config = ConfigDict(from_attributes=True)

class SubscriptionStatusResponse(BaseModel):
    proyek_id: int
    is_subscribed: bool
