from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..models import FamilyMember
from ..schemas import FamilyMemberCreate, FamilyMemberUpdate
from ..utils import serialize_model, update_instance

router = APIRouter(prefix="/api/v1/family-members", tags=["family"])


@router.get("")
def list_family_members(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(FamilyMember).order_by(FamilyMember.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_family_member(payload: FamilyMemberCreate, db: Session = Depends(get_db)):
    member = FamilyMember(id=payload.id, name=payload.name, relationship_name=payload.relationship_name)
    db.add(member)
    db.commit()
    db.refresh(member)
    return serialize_model(member)


@router.put("/{member_id}")
def update_family_member(member_id: str, payload: FamilyMemberUpdate, db: Session = Depends(get_db)):
    member = db.get(FamilyMember, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    return serialize_model(update_instance(db, member, payload.model_dump(exclude_unset=True)))


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_family_member(member_id: str, db: Session = Depends(get_db)):
    member = db.get(FamilyMember, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    db.delete(member)
    db.commit()
