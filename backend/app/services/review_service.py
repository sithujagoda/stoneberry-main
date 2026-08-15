from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from backend.app.models.review import Review, ReviewType
from backend.app.models.purchase_request import PurchaseRequest, PurchaseStatus
from backend.app.models.notification import NotificationType
from backend.app.services.notification_service import create_notification

def create_user_review(
    db: Session,
    target_user_id: int,
    reviewer_id: int,
    purchase_request_id: int,
    review_type: str,
    rating: int,
    comment: Optional[str] = None
) -> Review:
    if target_user_id == reviewer_id:
        raise HTTPException(status_code=400, detail="You cannot review yourself")

    purchase = db.query(PurchaseRequest).filter(PurchaseRequest.id == purchase_request_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase transaction not found")
        
    if purchase.status != PurchaseStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="You can only review users after a transaction is COMPLETED.")

    if review_type == ReviewType.BUYER_REVIEWING_SELLER:
        if purchase.buyer_id != reviewer_id or purchase.seller_id != target_user_id:
            raise HTTPException(status_code=403, detail="Role mismatch for this transaction.")
    elif review_type == ReviewType.SELLER_REVIEWING_BUYER:
        if purchase.seller_id != reviewer_id or purchase.buyer_id != target_user_id:
            raise HTTPException(status_code=403, detail="Role mismatch for this transaction.")
    else:
        raise HTTPException(status_code=400, detail="Invalid review type")

    existing = db.query(Review).filter(
        Review.purchase_request_id == purchase_request_id,
        Review.reviewer_id == reviewer_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this user for this transaction.")

    new_review = Review(
        target_user_id=target_user_id,
        reviewer_id=reviewer_id,
        purchase_request_id=purchase_request_id,
        review_type=review_type,
        rating=rating,
        comment=comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    create_notification(
        db=db,
        user_id=target_user_id,
        type=NotificationType.REVIEW_RECEIVED.value,
        title="New Review Received",
        message=f"You received a {rating}-star rating from your transaction partner.",
        link_url="/profile",
        related_id=new_review.id
    )

    fetched_review = db.query(Review).options(joinedload(Review.reviewer)).filter(Review.id == new_review.id).first()
    return fetched_review

def get_reviews_for_user(db: Session, user_id: int) -> List[Review]:
    reviews = db.query(Review).options(joinedload(Review.reviewer)).filter(Review.target_user_id == user_id).order_by(Review.created_at.desc()).all()
    return reviews
