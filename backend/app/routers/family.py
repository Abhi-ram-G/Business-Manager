from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..models import CategoryBudget, FamilyExpense, FamilyMember, IncomeEntry
from ..schemas import (
    CategoryBudgetCreate,
    CategoryBudgetUpdate,
    FamilyExpenseCreate,
    FamilyExpenseUpdate,
    FamilyMemberCreate,
    FamilyMemberUpdate,
    IncomeEntryCreate,
    IncomeEntryUpdate,
)
from ..utils import serialize_model, update_instance

router = APIRouter(tags=["family"])


# Family Members
@router.get("/api/v1/family-members")
def list_family_members(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(FamilyMember).order_by(FamilyMember.created_at.desc())).scalars()]


@router.post("/api/v1/family-members", status_code=status.HTTP_201_CREATED)
def create_family_member(payload: FamilyMemberCreate, db: Session = Depends(get_db)):
    member = FamilyMember(id=payload.id, name=payload.name, relationship_name=payload.relationship_name)
    db.add(member)
    db.commit()
    db.refresh(member)
    return serialize_model(member)


@router.put("/api/v1/family-members/{member_id}")
def update_family_member(member_id: str, payload: FamilyMemberUpdate, db: Session = Depends(get_db)):
    member = db.get(FamilyMember, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    return serialize_model(update_instance(db, member, payload.model_dump(exclude_unset=True)))


@router.delete("/api/v1/family-members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_family_member(member_id: str, db: Session = Depends(get_db)):
    member = db.get(FamilyMember, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    db.delete(member)
    db.commit()


# Income Entries
@router.get("/api/v1/income")
def list_income(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(IncomeEntry).order_by(IncomeEntry.created_at.desc())).scalars()]


@router.post("/api/v1/income", status_code=status.HTTP_201_CREATED)
def create_income(payload: IncomeEntryCreate, db: Session = Depends(get_db)):
    income = IncomeEntry(**payload.model_dump())
    db.add(income)
    db.commit()
    db.refresh(income)
    return serialize_model(income)


@router.put("/api/v1/income/{income_id}")
def update_income(income_id: str, payload: IncomeEntryUpdate, db: Session = Depends(get_db)):
    income = db.get(IncomeEntry, income_id)
    if not income:
        raise HTTPException(status_code=404, detail="Income entry not found")
    return serialize_model(update_instance(db, income, payload.model_dump(exclude_unset=True)))


@router.delete("/api/v1/income/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income(income_id: str, db: Session = Depends(get_db)):
    income = db.get(IncomeEntry, income_id)
    if not income:
        raise HTTPException(status_code=404, detail="Income entry not found")
    db.delete(income)
    db.commit()


# Family Expenses
@router.get("/api/v1/expenses")
def list_expenses(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(FamilyExpense).order_by(FamilyExpense.created_at.desc())).scalars()]


@router.post("/api/v1/expenses", status_code=status.HTTP_201_CREATED)
def create_expense(payload: FamilyExpenseCreate, db: Session = Depends(get_db)):
    expense = FamilyExpense(**payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return serialize_model(expense)


@router.put("/api/v1/expenses/{expense_id}")
def update_expense(expense_id: str, payload: FamilyExpenseUpdate, db: Session = Depends(get_db)):
    expense = db.get(FamilyExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return serialize_model(update_instance(db, expense, payload.model_dump(exclude_unset=True)))


@router.delete("/api/v1/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: str, db: Session = Depends(get_db)):
    expense = db.get(FamilyExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()


# Category Budgets
@router.get("/api/v1/category-budgets")
def list_category_budgets(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(CategoryBudget)).scalars()]


@router.post("/api/v1/category-budgets", status_code=status.HTTP_201_CREATED)
def create_category_budget(payload: CategoryBudgetCreate, db: Session = Depends(get_db)):
    budget = CategoryBudget(**payload.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return serialize_model(budget)


@router.put("/api/v1/category-budgets/{category}")
def update_category_budget(category: str, payload: CategoryBudgetUpdate, db: Session = Depends(get_db)):
    budget = db.get(CategoryBudget, category)
    if not budget:
        raise HTTPException(status_code=404, detail="Category budget not found")
    return serialize_model(update_instance(db, budget, payload.model_dump(exclude_unset=True)))


@router.delete("/api/v1/category-budgets/{category}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category_budget(category: str, db: Session = Depends(get_db)):
    budget = db.get(CategoryBudget, category)
    if not budget:
        raise HTTPException(status_code=404, detail="Category budget not found")
    db.delete(budget)
    db.commit()
