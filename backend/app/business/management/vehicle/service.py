from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ....core.db import get_db
from ....models import ServiceEntry
from ....schemas import ServiceEntryCreate, ServiceEntryUpdate
from ....utils import create_or_400, serialize_model, update_instance

router = APIRouter(prefix="/api/v1/business/services", tags=["business"])


@router.get("")
def list_service_entries(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(ServiceEntry).order_by(ServiceEntry.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_service_entry(payload: ServiceEntryCreate, db: Session = Depends(get_db)):
    service = ServiceEntry(**payload.model_dump())
    return serialize_model(create_or_400(db, ServiceEntry, service, "Unable to create service entry"))


@router.put("/{service_id}")
def update_service_entry(service_id: str, payload: ServiceEntryUpdate, db: Session = Depends(get_db)):
    service = db.get(ServiceEntry, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service entry not found")
    return serialize_model(update_instance(db, service, payload.model_dump(exclude_unset=True)))


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service_entry(service_id: str, db: Session = Depends(get_db)):
    service = db.get(ServiceEntry, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service entry not found")
    db.delete(service)
    db.commit()
