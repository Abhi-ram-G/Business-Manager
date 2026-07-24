from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from ...core.db import get_db
from ...models import BusinessBill, Hammer, BitEntry
from ...schemas import BusinessBillCreate, BusinessBillUpdate
from ...utils import (
    create_or_400,
    generate_bill_invoice_no,
    resequence_bills_for_month,
    serialize_model,
    update_instance,
)

router = APIRouter(prefix="/api/v1/business/bills", tags=["business"])


@router.get("")
def list_business_bills(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(BusinessBill).order_by(BusinessBill.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_business_bill(payload: BusinessBillCreate, db: Session = Depends(get_db)):
    payload_data = payload.model_dump()
    if not payload_data.get("invoice_no"):
        payload_data["invoice_no"] = generate_bill_invoice_no()
    bill = BusinessBill(**payload_data)
    created_bill = create_or_400(db, BusinessBill, bill, "Unable to create business bill")
    
    if created_bill.bill_date:
        resequence_bills_for_month(db, created_bill.bill_date.year, created_bill.bill_date.month)
        db.refresh(created_bill)
        
    return serialize_model(created_bill)


@router.put("/{bill_id}")
def update_business_bill(bill_id: str, payload: BusinessBillUpdate, db: Session = Depends(get_db)):
    bill = db.get(BusinessBill, bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Business bill not found")
    
    old_date = bill.bill_date
    updated_data = payload.model_dump(exclude_unset=True)
    bill = update_instance(db, bill, updated_data)
    new_date = bill.bill_date
    
    if old_date and new_date and (old_date.year != new_date.year or old_date.month != new_date.month):
        resequence_bills_for_month(db, old_date.year, old_date.month)
        resequence_bills_for_month(db, new_date.year, new_date.month)
    elif new_date:
        resequence_bills_for_month(db, new_date.year, new_date.month)
        
    db.refresh(bill)
    return serialize_model(bill)


@router.delete("/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_business_bill(bill_id: str, db: Session = Depends(get_db)):
    bill = db.get(BusinessBill, bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Business bill not found")
    
    year = bill.bill_date.year if bill.bill_date else None
    month = bill.bill_date.month if bill.bill_date else None
    
    # Clean up hammer usage history records that refer to this bill_id
    hammers = db.execute(select(Hammer)).scalars().all()
    for hammer in hammers:
        modified = False
        
        # Clean usage_history
        if hammer.usage_history:
            filtered_history = [
                record for record in hammer.usage_history
                if record.get("billId") != bill_id and record.get("bill_id") != bill_id
            ]
            if len(filtered_history) != len(hammer.usage_history):
                hammer.usage_history = filtered_history
                modified = True
                
        # Clean casing_usage_history
        if hammer.casing_usage_history:
            filtered_casing_history = [
                record for record in hammer.casing_usage_history
                if record.get("billId") != bill_id and record.get("bill_id") != bill_id
            ]
            if len(filtered_casing_history) != len(hammer.casing_usage_history):
                hammer.casing_usage_history = filtered_casing_history
                modified = True
                
        if modified:
            flag_modified(hammer, "usage_history")
            flag_modified(hammer, "casing_usage_history")
            
            # Check capacity to revert to drilling hammer
            total_drilling = sum(float(r.get("calculatedFeet", 0) or r.get("calculated_feet", 0)) for r in (hammer.usage_history or []))
            total_casing = sum(float(r.get("calculatedFeet", 0) or r.get("calculated_feet", 0)) for r in (hammer.casing_usage_history or []))
            total_feet = total_drilling + total_casing
            
            if total_feet < hammer.capable_feet_depth:
                hammer.casing_type = None
                if hammer.status != "sold":
                    hammer.status = "active"
            
            db.add(hammer)

    # Clean up bit usage history records that refer to this bill_id
    bits = db.execute(select(BitEntry)).scalars().all()
    for bit in bits:
        modified = False
        if bit.usage_history:
            filtered_history = [
                record for record in bit.usage_history
                if record.get("billId") != bill_id and record.get("bill_id") != bill_id
            ]
            if len(filtered_history) != len(bit.usage_history):
                bit.usage_history = filtered_history
                modified = True
        if modified:
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(bit, "usage_history")
            total_feet = sum(float(r.get("calculatedFeet", 0) or r.get("calculated_feet", 0)) for r in (bit.usage_history or []))
            if total_feet < (bit.capable_feet_depth or 950):
                if bit.status != "sold":
                    bit.status = "active"
            db.add(bit)

    db.delete(bill)
    db.commit()
    
    if year and month:
        resequence_bills_for_month(db, year, month)
