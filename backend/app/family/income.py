from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..models import IncomeEntry
from ..schemas import IncomeEntryCreate, IncomeEntryUpdate
from ..utils import serialize_model, update_instance

router = APIRouter(prefix="/api/v1/income", tags=["family"])


@router.get("")
def list_income(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(IncomeEntry).order_by(IncomeEntry.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_income(payload: IncomeEntryCreate, db: Session = Depends(get_db)):
    income = IncomeEntry(**payload.model_dump())
    db.add(income)
    db.commit()
    db.refresh(income)
    return serialize_model(income)


@router.put("/{income_id}")
def update_income(income_id: str, payload: IncomeEntryUpdate, db: Session = Depends(get_db)):
    income = db.get(IncomeEntry, income_id)
    if not income:
        raise HTTPException(status_code=404, detail="Income entry not found")
    return serialize_model(update_instance(db, income, payload.model_dump(exclude_unset=True)))


@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income(income_id: str, db: Session = Depends(get_db)):
    income = db.get(IncomeEntry, income_id)
    if not income:
        raise HTTPException(status_code=404, detail="Income entry not found")
    db.delete(income)
    db.commit()
