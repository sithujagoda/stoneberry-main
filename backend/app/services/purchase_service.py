from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from backend.app.models.purchase_request import PurchaseRequest, PurchaseStatus
from backend.app.models.gem import Gem
from backend.app.models.notification import NotificationType
from backend.app.schemas.purchase_request import PurchaseRequestCreate, PurchaseRequestUpdate
from backend.app.services.notification_service import create_notification

def create_purchase_inquiry(db: Session, request: PurchaseRequestCreate) -> PurchaseRequest:
    gem = db.query(Gem).filter(Gem.id == request.gem_id).first()
    if not gem:
        raise HTTPException(status_code=404, detail="Gem not found")
        
    if not gem.is_available:
        raise HTTPException(status_code=400, detail="Gem is no longer available for purchase requests")

    if request.buyer_id == request.seller_id or request.buyer_id == gem.seller_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot initiate a purchase request or message thread on your own gemstone listing."
        )

    existing = db.query(PurchaseRequest).filter(
        PurchaseRequest.gem_id == request.gem_id,
        PurchaseRequest.buyer_id == request.buyer_id,
        PurchaseRequest.status.in_([PurchaseStatus.PENDING, PurchaseStatus.READY_FOR_BUYING, PurchaseStatus.INQUIRY])
    ).first()
    
    if existing:
        return existing

    db_request = PurchaseRequest(
        gem_id=request.gem_id,
        buyer_id=request.buyer_id,
        seller_id=request.seller_id,
        status=request.status or PurchaseStatus.PENDING,
        seller_has_unread_updates=True
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)

    db_request = db.query(PurchaseRequest).options(
        joinedload(PurchaseRequest.gem),
        joinedload(PurchaseRequest.buyer),
        joinedload(PurchaseRequest.seller)
    ).filter(PurchaseRequest.id == db_request.id).first()
    
    if db_request and db_request.gem:
        create_notification(
            db=db,
            user_id=db_request.seller_id,
            type=NotificationType.SELLING_OFFER.value,
            title="New Offer / Inquiry Received",
            message=f"Buyer submitted a request for {db_request.gem.name}.",
            link_url="/profile/selling",
            related_id=db_request.id
        )
    
    return db_request

def get_user_buying_requests(db: Session, user_id: int) -> List[PurchaseRequest]:
    return db.query(PurchaseRequest).options(
        joinedload(PurchaseRequest.gem),
        joinedload(PurchaseRequest.buyer),
        joinedload(PurchaseRequest.seller)
    ).filter(PurchaseRequest.buyer_id == user_id).order_by(PurchaseRequest.created_at.desc()).all()

def get_user_selling_requests(db: Session, user_id: int) -> List[PurchaseRequest]:
    return db.query(PurchaseRequest).options(
        joinedload(PurchaseRequest.gem),
        joinedload(PurchaseRequest.buyer),
        joinedload(PurchaseRequest.seller)
    ).filter(PurchaseRequest.seller_id == user_id).order_by(PurchaseRequest.created_at.desc()).all()

def update_purchase_status(db: Session, request_id: int, update: PurchaseRequestUpdate) -> PurchaseRequest:
    db_request = db.query(PurchaseRequest).options(
        joinedload(PurchaseRequest.gem)
    ).filter(PurchaseRequest.id == request_id).first()
    
    if not db_request:
        raise HTTPException(status_code=404, detail="Purchase request not found")

    gem = db_request.gem
    new_status = update.status
    
    if new_status == PurchaseStatus.READY_FOR_BUYING:
        gem.is_available = False
    elif new_status == PurchaseStatus.BUYER_REJECTED:
        gem.is_available = True
    elif new_status == PurchaseStatus.COMPLETED:
        gem.is_available = False
    elif new_status == PurchaseStatus.SELLER_REJECTED:
        gem.is_available = True

    if new_status in [PurchaseStatus.READY_FOR_BUYING, PurchaseStatus.SELLER_REJECTED]:
        db_request.buyer_has_unread_updates = True
    else:
        db_request.seller_has_unread_updates = True

    db_request.status = new_status
    if update.rejection_reason is not None:
        db_request.rejection_reason = update.rejection_reason
        
    db.commit()
    db.refresh(db_request)
    
    full_request = db.query(PurchaseRequest).options(
        joinedload(PurchaseRequest.gem),
        joinedload(PurchaseRequest.buyer),
        joinedload(PurchaseRequest.seller)
    ).filter(PurchaseRequest.id == request_id).first()
    
    if full_request and full_request.gem:
        status_val = new_status.value if hasattr(new_status, "value") else str(new_status)
        if new_status in [PurchaseStatus.READY_FOR_BUYING, PurchaseStatus.SELLER_REJECTED]:
            create_notification(
                db=db,
                user_id=full_request.buyer_id,
                type=NotificationType.BUYING_STATUS.value,
                title=f"Order Status Updated: {status_val}",
                message=f"Status for {full_request.gem.name} is now {status_val}.",
                link_url="/profile/orders",
                related_id=full_request.id
            )
        else:
            create_notification(
                db=db,
                user_id=full_request.seller_id,
                type=NotificationType.SELLING_OFFER.value,
                title=f"Offer Status Updated: {status_val}",
                message=f"Status for {full_request.gem.name} is now {status_val}.",
                link_url="/profile/selling",
                related_id=full_request.id
            )
    
    return full_request

def complete_purchase_order(db: Session, request_id: int, user_id: int) -> PurchaseRequest:
    db_request = db.query(PurchaseRequest).options(
        joinedload(PurchaseRequest.gem)
    ).filter(PurchaseRequest.id == request_id).first()
    
    if not db_request:
        raise HTTPException(status_code=404, detail="Purchase request not found")
        
    if db_request.buyer_id != user_id:
        raise HTTPException(status_code=403, detail="Only the buyer can complete the purchase")

    db_request.status = PurchaseStatus.COMPLETED
    db_request.seller_has_unread_updates = True
    db_request.gem.is_available = False
    
    db.commit()
    db.refresh(db_request)
    
    full_request = db.query(PurchaseRequest).options(
        joinedload(PurchaseRequest.gem),
        joinedload(PurchaseRequest.buyer),
        joinedload(PurchaseRequest.seller)
    ).filter(PurchaseRequest.id == request_id).first()
    
    if full_request and full_request.gem:
        create_notification(
            db=db,
            user_id=full_request.seller_id,
            type=NotificationType.SELLING_OFFER.value,
            title="Order Completed",
            message=f"Buyer has completed the purchase for {full_request.gem.name}.",
            link_url="/profile/selling",
            related_id=full_request.id
        )
    
    return full_request

def mark_purchase_read(db: Session, request_id: int, user_id: int) -> PurchaseRequest:
    db_request = db.query(PurchaseRequest).filter(PurchaseRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Purchase request not found")
        
    if db_request.buyer_id == user_id:
        db_request.buyer_has_unread_updates = False
    elif db_request.seller_id == user_id:
        db_request.seller_has_unread_updates = False
        
    db.commit()
    
    full_request = db.query(PurchaseRequest).options(
        joinedload(PurchaseRequest.gem),
        joinedload(PurchaseRequest.buyer),
        joinedload(PurchaseRequest.seller)
    ).filter(PurchaseRequest.id == request_id).first()
    
    return full_request
