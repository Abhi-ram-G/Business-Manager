from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from ..core.db import get_db
from ..models import (
    BitEntry,
    BusinessBill,
    Hammer,
    MaterialEntry,
    PipeEntry,
    ServiceEntry,
)
from ..schemas import (
    BitEntryCreate,
    BitEntryUpdate,
    BusinessBillCreate,
    BusinessBillUpdate,
    HammerCreate,
    HammerUpdate,
    MaterialEntryCreate,
    MaterialEntryUpdate,
    PipeEntryCreate,
    PipeEntryUpdate,
    ServiceEntryCreate,
    ServiceEntryUpdate,
)
from ..utils import (
    create_or_400,
    generate_bill_invoice_no,
    resequence_bills_for_month,
    serialize_model,
    update_instance,
)

router = APIRouter(prefix="/api/v1/business", tags=["business"])


# Bits
@router.get("/bits")
def list_bit_entries(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(BitEntry).order_by(BitEntry.created_at.desc())).scalars()]


@router.post("/bits", status_code=status.HTTP_201_CREATED)
def create_bit_entry(payload: BitEntryCreate, db: Session = Depends(get_db)):
    bit = BitEntry(**payload.model_dump())
    return serialize_model(create_or_400(db, BitEntry, bit, "Unable to create bit entry"))


@router.put("/bits/{bit_id}")
def update_bit_entry(bit_id: str, payload: BitEntryUpdate, db: Session = Depends(get_db)):
    bit = db.get(BitEntry, bit_id)
    if not bit:
        raise HTTPException(status_code=404, detail="Bit entry not found")
    return serialize_model(update_instance(db, bit, payload.model_dump(exclude_unset=True)))


@router.delete("/bits/{bit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bit_entry(bit_id: str, db: Session = Depends(get_db)):
    bit = db.get(BitEntry, bit_id)
    if not bit:
        raise HTTPException(status_code=404, detail="Bit entry not found")
    db.delete(bit)
    db.commit()


# Hammers
@router.get("/hammers")
def list_hammer_entries(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(Hammer).order_by(Hammer.created_at.desc())).scalars()]


@router.post("/hammers", status_code=status.HTTP_201_CREATED)
def create_hammer_entry(payload: HammerCreate, db: Session = Depends(get_db)):
    hammer = Hammer(**payload.model_dump())
    return serialize_model(create_or_400(db, Hammer, hammer, "Unable to create hammer entry"))


@router.put("/hammers/{hammer_id}")
def update_hammer_entry(hammer_id: str, payload: HammerUpdate, db: Session = Depends(get_db)):
    hammer = db.get(Hammer, hammer_id)
    if not hammer:
        raise HTTPException(status_code=404, detail="Hammer entry not found")
    return serialize_model(update_instance(db, hammer, payload.model_dump(exclude_unset=True)))


@router.delete("/hammers/{hammer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hammer_entry(hammer_id: str, db: Session = Depends(get_db)):
    hammer = db.get(Hammer, hammer_id)
    if not hammer:
        raise HTTPException(status_code=404, detail="Hammer entry not found")
    db.delete(hammer)
    db.commit()


# Pipes
@router.get("/pipes")
def list_pipe_entries(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(PipeEntry).order_by(PipeEntry.created_at.desc())).scalars()]


@router.post("/pipes", status_code=status.HTTP_201_CREATED)
def create_pipe_entry(payload: PipeEntryCreate, db: Session = Depends(get_db)):
    pipe = PipeEntry(**payload.model_dump())
    return serialize_model(create_or_400(db, PipeEntry, pipe, "Unable to create pipe entry"))


@router.put("/pipes/{pipe_id}")
def update_pipe_entry(pipe_id: str, payload: PipeEntryUpdate, db: Session = Depends(get_db)):
    pipe = db.get(PipeEntry, pipe_id)
    if not pipe:
        raise HTTPException(status_code=404, detail="Pipe entry not found")
    return serialize_model(update_instance(db, pipe, payload.model_dump(exclude_unset=True)))


@router.delete("/pipes/{pipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pipe_entry(pipe_id: str, db: Session = Depends(get_db)):
    pipe = db.get(PipeEntry, pipe_id)
    if not pipe:
        raise HTTPException(status_code=404, detail="Pipe entry not found")
    db.delete(pipe)
    db.commit()


# Service Log Entries
@router.get("/services")
def list_service_entries(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(ServiceEntry).order_by(ServiceEntry.created_at.desc())).scalars()]


@router.post("/services", status_code=status.HTTP_201_CREATED)
def create_service_entry(payload: ServiceEntryCreate, db: Session = Depends(get_db)):
    service = ServiceEntry(**payload.model_dump())
    return serialize_model(create_or_400(db, ServiceEntry, service, "Unable to create service entry"))


@router.put("/services/{service_id}")
def update_service_entry(service_id: str, payload: ServiceEntryUpdate, db: Session = Depends(get_db)):
    service = db.get(ServiceEntry, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service entry not found")
    return serialize_model(update_instance(db, service, payload.model_dump(exclude_unset=True)))


@router.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service_entry(service_id: str, db: Session = Depends(get_db)):
    service = db.get(ServiceEntry, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service entry not found")
    db.delete(service)
    db.commit()


# Materials Purchased Entries
@router.get("/materials")
def list_material_entries(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(MaterialEntry).order_by(MaterialEntry.created_at.desc())).scalars()]


@router.post("/materials", status_code=status.HTTP_201_CREATED)
def create_material_entry(payload: MaterialEntryCreate, db: Session = Depends(get_db)):
    material = MaterialEntry(**payload.model_dump())
    return serialize_model(create_or_400(db, MaterialEntry, material, "Unable to create material entry"))


@router.put("/materials/{mat_id}")
def update_material_entry(mat_id: str, payload: MaterialEntryUpdate, db: Session = Depends(get_db)):
    material = db.get(MaterialEntry, mat_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material entry not found")
    return serialize_model(update_instance(db, material, payload.model_dump(exclude_unset=True)))


@router.delete("/materials/{mat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material_entry(mat_id: str, db: Session = Depends(get_db)):
    material = db.get(MaterialEntry, mat_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material entry not found")
    db.delete(material)
    db.commit()


# Business Bills
@router.get("/bills")
def list_business_bills(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(BusinessBill).order_by(BusinessBill.created_at.desc())).scalars()]


@router.post("/bills", status_code=status.HTTP_201_CREATED)
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


@router.put("/bills/{bill_id}")
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


@router.delete("/bills/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
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

    db.delete(bill)
    db.commit()
    
    if year and month:
        resequence_bills_for_month(db, year, month)
