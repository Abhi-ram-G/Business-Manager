from datetime import date as dt_date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..models import Labour, Attendance, SalaryPayment
from ..schemas import (
    AttendanceBatch,
    LabourCreate,
    LabourUpdate,
    SalaryPaymentCreate,
    SalaryPaymentUpdate,
)
from ..utils import create_or_400, serialize_model, update_instance

router = APIRouter(prefix="/api/v1/labours", tags=["labours"])


@router.get("")
def list_labours(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(Labour).order_by(Labour.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_labour(payload: LabourCreate, db: Session = Depends(get_db)):
    labour = Labour(**payload.model_dump())
    return serialize_model(create_or_400(db, Labour, labour, "Unable to create labour record"))


@router.put("/{labour_id}")
def update_labour(labour_id: str, payload: LabourUpdate, db: Session = Depends(get_db)):
    labour = db.get(Labour, labour_id)
    if not labour:
        raise HTTPException(status_code=404, detail="Labour not found")
    return serialize_model(update_instance(db, labour, payload.model_dump(exclude_unset=True)))


@router.delete("/{labour_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_labour(labour_id: str, db: Session = Depends(get_db)):
    labour = db.get(Labour, labour_id)
    if not labour:
        raise HTTPException(status_code=404, detail="Labour not found")
    db.delete(labour)
    db.commit()


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


@router.get("/salary-payments")
def list_salary_payments(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(SalaryPayment).order_by(SalaryPayment.created_at.desc())).scalars()]


@router.post("/salary-payments", status_code=status.HTTP_201_CREATED)
def create_salary_payment(payload: SalaryPaymentCreate, db: Session = Depends(get_db)):
    payment = SalaryPayment(**payload.model_dump())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return serialize_model(payment)


@router.put("/salary-payments/{payment_id}")
def update_salary_payment(payment_id: str, payload: SalaryPaymentUpdate, db: Session = Depends(get_db)):
    payment = db.get(SalaryPayment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Salary payment not found")
    return serialize_model(update_instance(db, payment, payload.model_dump(exclude_unset=True)))


@router.delete("/salary-payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_salary_payment(payment_id: str, db: Session = Depends(get_db)):
    payment = db.get(SalaryPayment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Salary payment not found")
    db.delete(payment)
    db.commit()


@router.get("/salary-pending")
def salary_pending(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Labour.id, Labour.full_name, Labour.salary_per_month).where(Labour.is_active.is_(True))
    ).all()
    result = []
    for labour_id, full_name, salary_per_month in rows:
        present_days = db.execute(
            select(func.count()).select_from(Attendance).where(Attendance.labour_id == labour_id, Attendance.status == "Present")
        ).scalar_one()
        half_days = db.execute(
            select(func.count()).select_from(Attendance).where(Attendance.labour_id == labour_id, Attendance.status == "Half-Day")
        ).scalar_one()
        wage = float(salary_per_month or 0)
        base_payout = wage
        result.append(
            {
                "labour_id": labour_id,
                "name": full_name,
                "present_days": present_days,
                "half_days": half_days,
                "wage_rate": wage,
                "base_payout": base_payout,
                "advance_deductions": 0.0,
                "net_outstanding": base_payout,
            }
        )
    return result
