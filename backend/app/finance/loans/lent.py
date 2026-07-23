from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...core.db import get_db
from ...models import LoanGiven
from ...schemas import EMICollectRequest, LoanGivenCreate, LoanGivenUpdate
from ...utils import serialize_model, update_instance

router = APIRouter(prefix="/api/v1/loans/given", tags=["loans"])


@router.get("")
def list_loans_given(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(LoanGiven).order_by(LoanGiven.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_loan_given(payload: LoanGivenCreate, db: Session = Depends(get_db)):
    loan = LoanGiven(**payload.model_dump())
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return serialize_model(loan)


@router.put("/{loan_id}")
def update_loan_given(loan_id: str, payload: LoanGivenUpdate, db: Session = Depends(get_db)):
    loan = db.get(LoanGiven, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return serialize_model(update_instance(db, loan, payload.model_dump(exclude_unset=True)))


@router.delete("/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_loan_given(loan_id: str, db: Session = Depends(get_db)):
    loan = db.get(LoanGiven, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    db.delete(loan)
    db.commit()


@router.post("/collect-emi")
def collect_emi(payload: EMICollectRequest, db: Session = Depends(get_db)):
    loan = db.get(LoanGiven, payload.borrower_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    loan.total_paid = float(loan.total_paid or 0) + float(payload.amount_paid)
    loan.is_defaulter = False
    db.commit()
    db.refresh(loan)
    return {
        "borrower_name": loan.borrower_name or loan.person_name,
        "emi_amount": payload.amount_paid,
        "remaining_loan_balance": max(float(loan.loan_amount or loan.amount_given or 0) - float(loan.total_paid or 0), 0),
        "repayment_status": "Paid-On-Time",
        "defaulter_flag_cleared": True,
    }
