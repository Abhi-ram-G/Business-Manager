from datetime import date as dt_date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .....core.db import get_db
from .....models import Attendance
from .....schemas import AttendanceBatch
from .....utils import serialize_model

router = APIRouter(prefix="/api/v1/labours", tags=["labours"])


@router.post("/attendance")
def mark_attendance(payload: AttendanceBatch, db: Session = Depends(get_db)):
    saved = []
    for record in payload.records:
        existing = db.execute(
            select(Attendance).where(Attendance.labour_id == record.labour_id, Attendance.date == payload.date)
        ).scalar_one_or_none()
        if existing:
            existing.status = record.status
            existing.reason = record.reason
            saved.append(existing)
        else:
            saved.append(Attendance(labour_id=record.labour_id, date=payload.date, status=record.status, reason=record.reason))
            db.add(saved[-1])
    db.commit()
    return {"message": "Attendance marked successfully", "total_records": len(saved), "date": payload.date}


@router.get("/attendance")
def list_attendance(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(Attendance).order_by(Attendance.date.desc())).scalars()]


@router.delete("/attendance/{labour_id}/{attendance_date}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(labour_id: str, attendance_date: dt_date, db: Session = Depends(get_db)):
    attendance = db.execute(
        select(Attendance).where(Attendance.labour_id == labour_id, Attendance.date == attendance_date)
    ).scalar_one_or_none()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    db.delete(attendance)
    db.commit()
