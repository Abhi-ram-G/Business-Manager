from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ....core.db import get_db
from ....models import Vehicle
from ....schemas import VehicleCreate, VehicleUpdate
from ....utils import create_or_400, serialize_model, update_instance

router = APIRouter(prefix="/api/v1/vehicles", tags=["vehicles"])


@router.get("")
def list_vehicles(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(Vehicle).order_by(Vehicle.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    vehicle = Vehicle(**payload.model_dump())
    return serialize_model(create_or_400(db, Vehicle, vehicle, "Unable to create vehicle"))


@router.put("/{vehicle_id}")
def update_vehicle(vehicle_id: str, payload: VehicleUpdate, db: Session = Depends(get_db)):
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return serialize_model(update_instance(db, vehicle, payload.model_dump(exclude_unset=True)))


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()
