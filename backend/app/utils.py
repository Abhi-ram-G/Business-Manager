from typing import Any, TypeVar
import uuid
from collections import defaultdict
from sqlalchemy import delete, select
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from .models import BusinessBill, Hammer


def serialize_model(obj: Any) -> dict[str, Any]:
    return {key: value for key, value in obj.__dict__.items() if key != "_sa_instance_state"}


ModelT = TypeVar("ModelT")


def create_or_400(db: Session, model_cls: type[ModelT], obj: ModelT, message: str):
    db.add(obj)
    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message) from exc
    db.refresh(obj)
    return obj


def update_instance(db: Session, instance: Any, payload: dict[str, Any]):
    for key, value in payload.items():
        if value is not None:
            setattr(instance, key, value)
    db.commit()
    db.refresh(instance)
    return instance


def generate_bill_invoice_no() -> str:
    return f"I-SRS-TEMP-{uuid.uuid4().hex}"


def resequence_bills_for_month(db: Session, year: int, month: int):
    from sqlalchemy import extract
    
    # Fetch all bills for that year and month, ordered by created_at ascending, then by id ascending
    bills = db.execute(
        select(BusinessBill)
        .where(
            extract("year", BusinessBill.bill_date) == year,
            extract("month", BusinessBill.bill_date) == month
        )
        .order_by(BusinessBill.created_at.asc(), BusinessBill.id.asc())
    ).scalars().all()
    
    # Update to temporary unique invoice numbers first to prevent transient constraint violations
    for bill in bills:
        bill.invoice_no = f"TEMP-{uuid.uuid4().hex}"
        db.add(bill)
    db.flush()
    
    # Assign final formatted sequence invoice numbers
    for idx, bill in enumerate(bills, start=1):
        bill.invoice_no = f"I-SRS-{year}{month:02d}-{idx}"
        db.add(bill)
    db.commit()


def resequence_all_bills(db: Session):
    bills = db.execute(select(BusinessBill)).scalars().all()
    groups = defaultdict(list)
    for bill in bills:
        if bill.bill_date:
            groups[(bill.bill_date.year, bill.bill_date.month)].append(bill)
            
    for (year, month) in groups.keys():
        resequence_bills_for_month(db, year, month)


def purge_legacy_demo_business_bills(db: Session) -> int:
    legacy_ids = {"bill-1", "bill-2"}
    legacy_invoice_nos = {"INV-2026-001", "INV-2026-002"}
    legacy_client_names = {"Senthil Kumar", "Praneeth Heavy Earthmovers"}
    result = db.execute(
        delete(BusinessBill).where(
            (BusinessBill.id.in_(legacy_ids))
            | (BusinessBill.invoice_no.in_(legacy_invoice_nos))
            | (BusinessBill.client_name.in_(legacy_client_names))
        )
    )
    db.commit()
    return int(result.rowcount or 0)
