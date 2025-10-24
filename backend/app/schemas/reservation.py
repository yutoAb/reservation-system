from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.reservation import ReservationStatus

class ReservationCreate(BaseModel):
    time_slot_id: int
    notes: Optional[str] = None

class ReservationUpdate(BaseModel):
    status: ReservationStatus
    notes: Optional[str] = None

class ReservationResponse(BaseModel):
    id: int
    user_id: int
    time_slot_id: int
    status: ReservationStatus
    notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
