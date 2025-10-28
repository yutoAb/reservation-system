from pydantic import BaseModel
from datetime import datetime

class TimeSlotCreate(BaseModel):
    start_time: datetime
    end_time: datetime
    capacity: int = 1

class TimeSlotResponse(BaseModel):
    id: int
    start_time: datetime
    end_time: datetime
    is_available: bool
    capacity: int
    
    class Config:
        from_attributes = True
