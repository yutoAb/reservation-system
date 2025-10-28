from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin_user
from app.models.reservation import Reservation, ReservationStatus
from app.models.time_slot import TimeSlot
from app.models.user import User
from app.schemas.reservation import ReservationCreate, ReservationUpdate, ReservationResponse

router = APIRouter(prefix="/reservations", tags=["reservations"])

@router.post("/", response_model=ReservationResponse)
def create_reservation(
    reservation_data: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    time_slot = db.query(TimeSlot).filter(TimeSlot.id == reservation_data.time_slot_id).first()
    if not time_slot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    
    if not time_slot.is_available:
        raise HTTPException(status_code=400, detail="Time slot is not available")
    
    existing_reservations = db.query(Reservation).filter(
        Reservation.time_slot_id == reservation_data.time_slot_id,
        Reservation.status != ReservationStatus.CANCELLED
    ).count()
    
    if existing_reservations >= time_slot.capacity:
        raise HTTPException(status_code=400, detail="Time slot is fully booked")
    
    new_reservation = Reservation(
        user_id=current_user.id,
        time_slot_id=reservation_data.time_slot_id,
        notes=reservation_data.notes,
        created_at=datetime.utcnow()
    )
    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)
    return new_reservation

@router.get("/", response_model=List[ReservationResponse])
def get_user_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reservations = db.query(Reservation).filter(Reservation.user_id == current_user.id).all()
    return reservations

@router.get("/all", response_model=List[ReservationResponse])
def get_all_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    reservations = db.query(Reservation).all()
    return reservations

@router.get("/{reservation_id}", response_model=ReservationResponse)
def get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if reservation.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view this reservation")
    
    return reservation

@router.patch("/{reservation_id}", response_model=ReservationResponse)
def update_reservation(
    reservation_id: int,
    reservation_data: ReservationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if reservation.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to update this reservation")
    
    reservation.status = reservation_data.status
    if reservation_data.notes is not None:
        reservation.notes = reservation_data.notes
    
    db.commit()
    db.refresh(reservation)
    return reservation

@router.delete("/{reservation_id}")
def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if reservation.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this reservation")
    
    reservation.status = ReservationStatus.CANCELLED
    db.commit()
    return {"message": "Reservation cancelled successfully"}
