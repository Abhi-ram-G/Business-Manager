from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..models import ManagedDocument
from ..schemas import DocumentCreate, DocumentUpdate
from ..utils import serialize_model, update_instance

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])


@router.get("")
def list_documents(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(ManagedDocument).order_by(ManagedDocument.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_document(payload: DocumentCreate, db: Session = Depends(get_db)):
    document = ManagedDocument(**payload.model_dump())
    db.add(document)
    db.commit()
    db.refresh(document)
    return serialize_model(document)


@router.put("/{document_id}")
def update_document(document_id: str, payload: DocumentUpdate, db: Session = Depends(get_db)):
    document = db.get(ManagedDocument, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return serialize_model(update_instance(db, document, payload.model_dump(exclude_unset=True)))


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str, db: Session = Depends(get_db)):
    document = db.get(ManagedDocument, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(document)
    db.commit()
