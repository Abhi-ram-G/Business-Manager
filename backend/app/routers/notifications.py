from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..models import AppNotification
from ..schemas import NotificationCreate, NotificationUpdate
from ..utils import serialize_model, update_instance

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.get("")
def list_notifications(db: Session = Depends(get_db)):
    return [serialize_model(item) for item in db.execute(select(AppNotification).order_by(AppNotification.created_at.desc())).scalars()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_notification(payload: NotificationCreate, db: Session = Depends(get_db)):
    notification = AppNotification(**payload.model_dump())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return serialize_model(notification)


@router.put("/{notification_id}")
def update_notification(notification_id: str, payload: NotificationUpdate, db: Session = Depends(get_db)):
    notification = db.get(AppNotification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return serialize_model(update_instance(db, notification, payload.model_dump(exclude_unset=True)))


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: str, db: Session = Depends(get_db)):
    notification = db.get(AppNotification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notification)
    db.commit()
