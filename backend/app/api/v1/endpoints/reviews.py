from typing import List, Optional
from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.app.api.deps import get_db
from backend.app.schemas.review import ReviewResponse
from backend.app.services import review_service

router = APIRouter(prefix="/reviews", tags=["Reviews"])

class ReviewResponseWrapper(BaseModel):
    success: bool
    data: Optional[List[ReviewResponse]] = None
    error: Optional[str] = None

class SingleReviewResponseWrapper(BaseModel):
    success: bool
    data: Optional[ReviewResponse] = None
    error: Optional[str] = None

@router.post("/", response_model=SingleReviewResponseWrapper)
def create_review(
    target_user_id: int = Form(...),
    reviewer_id: int = Form(...),
    purchase_request_id: int = Form(...),
    review_type: str = Form(...),
    rating: int = Form(...),
    comment: str = Form(None),
    db: Session = Depends(get_db)
):
    review = review_service.create_user_review(
        db=db,
        target_user_id=target_user_id,
        reviewer_id=reviewer_id,
        purchase_request_id=purchase_request_id,
        review_type=review_type,
        rating=rating,
        comment=comment
    )
    return {"success": True, "data": review}

@router.get("/user/{user_id}", response_model=ReviewResponseWrapper)
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = review_service.get_reviews_for_user(db, user_id)
    return {"success": True, "data": reviews}
