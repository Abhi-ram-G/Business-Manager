from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..models import CategoryBudget
from ..schemas import CategoryBudgetCreate, CategoryBudgetUpdate
from ..utils import serialize_model, update_instance

router = APIRouter(prefix="/api/v1/category-budgets", tags=["family"])


@router.get("")
def list_category_budgets(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(CategoryBudget)).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_category_budget(payload: CategoryBudgetCreate, db: Session = Depends(get_db)):
    budget = CategoryBudget(**payload.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return serialize_model(budget)


@router.put("/{category}")
def update_category_budget(category: str, payload: CategoryBudgetUpdate, db: Session = Depends(get_db)):
    budget = db.get(CategoryBudget, category)
    if not budget:
        raise HTTPException(status_code=404, detail="Category budget not found")
    return serialize_model(update_instance(db, budget, payload.model_dump(exclude_unset=True)))


@router.delete("/{category}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category_budget(category: str, db: Session = Depends(get_db)):
    budget = db.get(CategoryBudget, category)
    if not budget:
        raise HTTPException(status_code=404, detail="Category budget not found")
    db.delete(budget)
    db.commit()
