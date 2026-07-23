from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ....core.db import get_db
from ....models import PipeEntry
from ....schemas import PipeEntryCreate, PipeEntryUpdate
from ....utils import create_or_400, serialize_model, update_instance

router = APIRouter(prefix="/api/v1/business/pipes", tags=["business"])


@router.get("")
def list_pipe_entries(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(PipeEntry).order_by(PipeEntry.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_pipe_entry(payload: PipeEntryCreate, db: Session = Depends(get_db)):
    pipe = PipeEntry(**payload.model_dump())
    return serialize_model(create_or_400(db, PipeEntry, pipe, "Unable to create pipe entry"))


@router.put("/{pipe_id}")
def update_pipe_entry(pipe_id: str, payload: PipeEntryUpdate, db: Session = Depends(get_db)):
    pipe = db.get(PipeEntry, pipe_id)
    if not pipe:
        raise HTTPException(status_code=404, detail="Pipe entry not found")
    return serialize_model(update_instance(db, pipe, payload.model_dump(exclude_unset=True)))


@router.delete("/{pipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pipe_entry(pipe_id: str, db: Session = Depends(get_db)):
    pipe = db.get(PipeEntry, pipe_id)
    if not pipe:
        raise HTTPException(status_code=404, detail="Pipe entry not found")
    db.delete(pipe)
    db.commit()
