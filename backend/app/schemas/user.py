from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import UserRole

class UserResponse(BaseModel):
    id: int
    nama: str
    email: EmailStr
    role: UserRole
    dinas_id: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    nama: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
