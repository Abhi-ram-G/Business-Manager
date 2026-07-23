from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...core.db import get_db
from ...models import LoanReceived
from ...schemas import LoanReceivedCreate, LoanReceivedUpdate
from ...utils import serialize_model, update_instance

router = APIRouter(prefix="/api/v1/loans/received", tags=["loans"])


@router.get("")
def list_loans_received(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(LoanReceived).order_by(LoanReceived.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_loan_received(payload: LoanReceivedCreate, db: Session = Depends(get_db)):
    loan = LoanReceived(**payload.model_dump())
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return serialize_model(loan)


@router.put("/{loan_id}")
def update_loan_received(loan_id: str, payload: LoanReceivedUpdate, db: Session = Depends(get_db)):
    loan = db.get(LoanReceived, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return serialize_model(update_instance(db, loan, payload.model_dump(exclude_unset=True)))


@router.delete("/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_loan_received(loan_id: str, db: Session = Depends(get_db)):
    loan = db.get(LoanReceived, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    db.delete(loan)
    db.commit()
