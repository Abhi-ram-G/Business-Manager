from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ....core.db import get_db
from ....models import MaterialEntry
from ....schemas import MaterialEntryCreate, MaterialEntryUpdate
from ....utils import create_or_400, serialize_model, update_instance

router = APIRouter(prefix="/api/v1/business/materials", tags=["business"])


@router.get("")
def list_material_entries(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(MaterialEntry).order_by(MaterialEntry.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_material_entry(payload: MaterialEntryCreate, db: Session = Depends(get_db)):
    material = MaterialEntry(**payload.model_dump())
    return serialize_model(create_or_400(db, MaterialEntry, material, "Unable to create material entry"))


@router.put("/{mat_id}")
def update_material_entry(mat_id: str, payload: MaterialEntryUpdate, db: Session = Depends(get_db)):
    material = db.get(MaterialEntry, mat_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material entry not found")
    return serialize_model(update_instance(db, material, payload.model_dump(exclude_unset=True)))


@router.delete("/{mat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material_entry(mat_id: str, db: Session = Depends(get_db)):
    material = db.get(MaterialEntry, mat_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material entry not found")
    db.delete(material)
    db.commit()
