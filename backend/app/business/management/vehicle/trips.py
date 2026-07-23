from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ....core.db import get_db
from ....models import TripRecord
from ....schemas import TripCreate
from ....utils import serialize_model

router = APIRouter(prefix="/api/v1/vehicles/trips", tags=["vehicles"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripCreate, db: Session = Depends(get_db)):
    trip = TripRecord(**payload.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return serialize_model(trip)


@router.get("")
def list_trips(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(TripRecord).order_by(TripRecord.created_at.desc())).scalars()]
