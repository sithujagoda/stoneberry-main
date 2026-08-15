from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

import enum

class ReviewType(str, enum.Enum):
    BUYER_REVIEWING_SELLER = "BUYER_REVIEWING_SELLER"
    SELLER_REVIEWING_BUYER = "SELLER_REVIEWING_BUYER"

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    purchase_request_id = Column(Integer, ForeignKey("purchase_requests.id"), nullable=False, index=True)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    review_type = Column(String, nullable=False)
    
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    target_user = relationship("User", foreign_keys=[target_user_id], back_populates="reviews_received")
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reviews_given")
    purchase_request = relationship("PurchaseRequest", backref="reviews")
