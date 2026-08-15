from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from backend.app.schemas.user import UserResponse

class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None
    target_user_id: int
    purchase_request_id: int
    review_type: str

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    reviewer_id: int
    created_at: datetime
    
    # We can include the reviewer's basic info so the frontend can display their name
    reviewer: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
