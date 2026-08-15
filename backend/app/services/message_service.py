from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend.app.models.message import Message
from backend.app.models.purchase_request import PurchaseRequest
from backend.app.models.notification import NotificationType
from backend.app.schemas.message import MessageCreate
from backend.app.services.notification_service import create_notification

def create_thread_message(db: Session, request: MessageCreate, sender_id: int) -> Message:
    purchase = db.query(PurchaseRequest).filter(PurchaseRequest.id == request.purchase_request_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase Request thread not found.")
        
    if sender_id != purchase.buyer_id and sender_id != purchase.seller_id:
        raise HTTPException(status_code=403, detail="You are not authorized to send messages in this thread.")
        
    receiver_id = purchase.seller_id if sender_id == purchase.buyer_id else purchase.buyer_id
    
    new_msg = Message(
        purchase_request_id=request.purchase_request_id,
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=request.content
    )
    
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    
    content_preview = (request.content[:40] + "...") if len(request.content) > 40 else request.content
    create_notification(
        db=db,
        user_id=receiver_id,
        type=NotificationType.NEW_MESSAGE.value,
        title="New Chat Message",
        message=f"Message: {content_preview}",
        link_url=f"/messages?thread={request.purchase_request_id}",
        related_id=new_msg.id
    )
    
    return new_msg

def get_thread_messages(db: Session, purchase_id: int, user_id: int) -> List[Message]:
    purchase = db.query(PurchaseRequest).filter(PurchaseRequest.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    if user_id != purchase.buyer_id and user_id != purchase.seller_id:
        raise HTTPException(status_code=403, detail="You are not authorized to view this thread.")
         
    # Mark unread messages as read
    db.query(Message).filter(
        Message.purchase_request_id == purchase_id,
        Message.receiver_id == user_id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()

    messages = db.query(Message).filter(Message.purchase_request_id == purchase_id).order_by(Message.created_at.asc()).all()
    return messages

def delete_message(db: Session, message_id: int, user_id: int) -> bool:
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    purchase = db.query(PurchaseRequest).filter(PurchaseRequest.id == msg.purchase_request_id).first()
    if not purchase or (user_id != msg.sender_id and user_id != purchase.buyer_id and user_id != purchase.seller_id):
        raise HTTPException(status_code=403, detail="You are not authorized to delete this message")
        
    db.delete(msg)
    db.commit()
    return True

def delete_thread(db: Session, purchase_id: int, user_id: int) -> bool:
    purchase = db.query(PurchaseRequest).filter(PurchaseRequest.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    if user_id != purchase.buyer_id and user_id != purchase.seller_id:
        raise HTTPException(status_code=403, detail="You are not authorized to delete this thread")
        
    db.delete(purchase)
    db.commit()
    return True
