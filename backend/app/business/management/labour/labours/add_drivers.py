from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .....core.db import get_db
from .....models import Labour
from .....schemas import LabourCreate, LabourUpdate
from .....utils import create_or_400, serialize_model, update_instance

router = APIRouter(prefix="/api/v1/labours", tags=["labours"])


@router.get("")
def list_labours(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(Labour).order_by(Labour.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_labour(payload: LabourCreate, db: Session = Depends(get_db)):
    labour = Labour(**payload.model_dump())
    return serialize_model(create_or_400(db, Labour, labour, "Unable to create labour record"))


@router.put("/{labour_id}")
def update_labour(labour_id: str, payload: LabourUpdate, db: Session = Depends(get_db)):
    labour = db.get(Labour, labour_id)
    if not labour:
        raise HTTPException(status_code=404, detail="Labour not found")
    return serialize_model(update_instance(db, labour, payload.model_dump(exclude_unset=True)))


@router.delete("/{labour_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_labour(labour_id: str, db: Session = Depends(get_db)):
    labour = db.get(Labour, labour_id)
    if not labour:
        raise HTTPException(status_code=404, detail="Labour not found")
    db.delete(labour)
    db.commit()
