from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ....core.db import get_db
from ....models import BitEntry
from ....schemas import BitEntryCreate, BitEntryUpdate
from ....utils import create_or_400, serialize_model, update_instance

router = APIRouter(prefix="/api/v1/business/bits", tags=["business"])


@router.get("")
def list_bit_entries(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(BitEntry).order_by(BitEntry.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_bit_entry(payload: BitEntryCreate, db: Session = Depends(get_db)):
    bit = BitEntry(**payload.model_dump())
    return serialize_model(create_or_400(db, BitEntry, bit, "Unable to create bit entry"))


@router.put("/{bit_id}")
def update_bit_entry(bit_id: str, payload: BitEntryUpdate, db: Session = Depends(get_db)):
    bit = db.get(BitEntry, bit_id)
    if not bit:
        raise HTTPException(status_code=404, detail="Bit entry not found")
    return serialize_model(update_instance(db, bit, payload.model_dump(exclude_unset=True)))


@router.delete("/{bit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bit_entry(bit_id: str, db: Session = Depends(get_db)):
    bit = db.get(BitEntry, bit_id)
    if not bit:
        raise HTTPException(status_code=404, detail="Bit entry not found")
    db.delete(bit)
    db.commit()
