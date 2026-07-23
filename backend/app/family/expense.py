from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..models import FamilyExpense
from ..schemas import FamilyExpenseCreate, FamilyExpenseUpdate
from ..utils import serialize_model, update_instance

router = APIRouter(prefix="/api/v1/expenses", tags=["family"])


@router.get("")
def list_expenses(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(FamilyExpense).order_by(FamilyExpense.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_expense(payload: FamilyExpenseCreate, db: Session = Depends(get_db)):
    expense = FamilyExpense(**payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return serialize_model(expense)


@router.put("/{expense_id}")
def update_expense(expense_id: str, payload: FamilyExpenseUpdate, db: Session = Depends(get_db)):
    expense = db.get(FamilyExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return serialize_model(update_instance(db, expense, payload.model_dump(exclude_unset=True)))


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: str, db: Session = Depends(get_db)):
    expense = db.get(FamilyExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
