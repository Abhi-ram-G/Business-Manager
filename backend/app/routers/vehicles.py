from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..models import Vehicle, FuelEntry, TripRecord
from ..schemas import (
    VehicleCreate,
    VehicleUpdate,
    FuelEntryCreate,
    FuelEntryUpdate,
    TripCreate,
)
from ..utils import create_or_400, serialize_model, update_instance

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


@router.post("/fuel", status_code=status.HTTP_201_CREATED)
def create_fuel_entry(payload: FuelEntryCreate, db: Session = Depends(get_db)):
    payload_data = payload.model_dump()
    date_time_value = payload_data.pop("date_time", None)
    entry = FuelEntry(**payload_data)
    if date_time_value:
        entry.date_time = datetime.fromisoformat(str(date_time_value))
    elif entry.date is not None:
        entry.date_time = datetime.combine(entry.date, datetime.min.time()).replace(tzinfo=timezone.utc)
    if entry.liters is not None and entry.per_liter_cost is not None and entry.cost is None:
        entry.cost = float(entry.liters) * float(entry.per_liter_cost)
    if entry.cost is not None and entry.liters is not None and entry.per_liter_cost is None and entry.liters != 0:
        entry.per_liter_cost = float(entry.cost) / float(entry.liters)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return serialize_model(entry)


@router.get("/fuel")
def list_fuel_entries(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(FuelEntry).order_by(FuelEntry.created_at.desc())).scalars()]


@router.put("/fuel/{fuel_id}")
def update_fuel_entry(fuel_id: str, payload: FuelEntryUpdate, db: Session = Depends(get_db)):
    entry = db.get(FuelEntry, fuel_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Fuel entry not found")
    payload_data = payload.model_dump(exclude_unset=True)
    date_time_value = payload_data.pop("date_time", None)
    if date_time_value is not None:
        payload_data["date_time"] = datetime.fromisoformat(str(date_time_value))
    if "liters" in payload_data or "per_liter_cost" in payload_data or "cost" in payload_data:
        liters = payload_data.get("liters", entry.liters)
        per_liter_cost = payload_data.get("per_liter_cost", entry.per_liter_cost)
        cost = payload_data.get("cost", entry.cost)
        if cost is None and liters is not None and per_liter_cost is not None:
            payload_data["cost"] = float(liters) * float(per_liter_cost)
        elif per_liter_cost is None and liters is not None and cost is not None and liters != 0:
            payload_data["per_liter_cost"] = float(cost) / float(liters)
    return serialize_model(update_instance(db, entry, payload_data))


@router.delete("/fuel/{fuel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fuel_entry(fuel_id: str, db: Session = Depends(get_db)):
    entry = db.get(FuelEntry, fuel_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Fuel entry not found")
    db.delete(entry)
    db.commit()


@router.post("/trips", status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripCreate, db: Session = Depends(get_db)):
    trip = TripRecord(**payload.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return serialize_model(trip)


@router.get("/trips")
def list_trips(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(TripRecord).order_by(TripRecord.created_at.desc())).scalars()]
