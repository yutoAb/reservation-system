from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user, get_current_user
from app.models.time_slot import TimeSlot
from app.models.user import User
from app.schemas.time_slot import TimeSlotCreate, TimeSlotResponse

router = APIRouter(prefix="/time-slots", tags=["time-slots"])

@router.post("/", response_model=TimeSlotResponse)
def create_time_slot(
    time_slot_data: TimeSlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    new_time_slot = TimeSlot(
        start_time=time_slot_data.start_time,
        end_time=time_slot_data.end_time,
        capacity=time_slot_data.capacity
    )
    db.add(new_time_slot)
    db.commit()
    db.refresh(new_time_slot)
    return new_time_slot

@router.get("/", response_model=List[TimeSlotResponse])
def get_available_time_slots(
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(TimeSlot).filter(TimeSlot.is_available == True)
    
    if start_date:
        query = query.filter(TimeSlot.start_time >= start_date)
    if end_date:
        query = query.filter(TimeSlot.end_time <= end_date)
    
    time_slots = query.order_by(TimeSlot.start_time).all()
    return time_slots

@router.get("/{time_slot_id}", response_model=TimeSlotResponse)
def get_time_slot(
    time_slot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    time_slot = db.query(TimeSlot).filter(TimeSlot.id == time_slot_id).first()
    if not time_slot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    return time_slot

@router.delete("/{time_slot_id}")
def delete_time_slot(
    time_slot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    time_slot = db.query(TimeSlot).filter(TimeSlot.id == time_slot_id).first()
    if not time_slot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    
    db.delete(time_slot)
    db.commit()
    return {"message": "Time slot deleted successfully"}
