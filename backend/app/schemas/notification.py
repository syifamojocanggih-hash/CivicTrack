from datetime import datetime
from pydantic import BaseModel, ConfigDict

class NotifikasiResponse(BaseModel):
    id: int
    user_id: int
    proyek_id: int
    pesan: str
    is_read: bool
    created_at: datetime
    nama_proyek: str = ""

    model_config = ConfigDict(from_attributes=True)

class SubscriptionStatusResponse(BaseModel):
    proyek_id: int
    is_subscribed: bool
