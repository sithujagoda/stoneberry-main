from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend.app.models.notification import Notification

def create_notification(
    db: Session,
    user_id: int,
    type: str,
    title: str,
    message: str,
    link_url: str,
    related_id: Optional[int] = None
) -> Notification:
    notif = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        link_url=link_url,
        related_id=related_id,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

def get_user_notifications_list(db: Session, user_id: int, limit: int = 50) -> dict:
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).limit(limit).all()
    
    unread_count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()
    
    return {
        "notifications": notifications,
        "unread_count": unread_count
    }

def mark_notification_read(db: Session, notification_id: int, user_id: int) -> Notification:
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif

def mark_all_notifications_read(db: Session, user_id: int) -> bool:
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return True
