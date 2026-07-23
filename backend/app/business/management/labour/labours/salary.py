from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .....core.db import get_db
from .....models import Labour, Attendance, SalaryPayment
from .....schemas import SalaryPaymentCreate, SalaryPaymentUpdate
from .....utils import serialize_model, update_instance

router = APIRouter(prefix="/api/v1/labours", tags=["labours"])


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
