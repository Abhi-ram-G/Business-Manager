from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ....core.db import get_db
from ....models import Hammer
from ....schemas import HammerCreate, HammerUpdate
from ....utils import create_or_400, serialize_model, update_instance

router = APIRouter(prefix="/api/v1/business/hammers", tags=["business"])


@router.get("")
def list_hammer_entries(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(Hammer).order_by(Hammer.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_hammer_entry(payload: HammerCreate, db: Session = Depends(get_db)):
    hammer = Hammer(**payload.model_dump())
    return serialize_model(create_or_400(db, Hammer, hammer, "Unable to create hammer entry"))


@router.put("/{hammer_id}")
def update_hammer_entry(hammer_id: str, payload: HammerUpdate, db: Session = Depends(get_db)):
    hammer = db.get(Hammer, hammer_id)
    if not hammer:
        raise HTTPException(status_code=404, detail="Hammer entry not found")
    return serialize_model(update_instance(db, hammer, payload.model_dump(exclude_unset=True)))


@router.delete("/{hammer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hammer_entry(hammer_id: str, db: Session = Depends(get_db)):
    hammer = db.get(Hammer, hammer_id)
    if not hammer:
        raise HTTPException(status_code=404, detail="Hammer entry not found")
    db.delete(hammer)
    db.commit()
