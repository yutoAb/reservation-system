from sqlalchemy import Column, Integer, DateTime, Boolean
from app.core.database import Base

class TimeSlot(Base):
    __tablename__ = "time_slots"
    
    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    is_available = Column(Boolean, default=True)
    capacity = Column(Integer, default=1)
