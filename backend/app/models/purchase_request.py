from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from backend.app.database import Base
import enum

class PurchaseStatus(str, enum.Enum):
    PENDING = "PENDING"
    INQUIRY = "INQUIRY"
    READY_FOR_BUYING = "READY_FOR_BUYING"
    COMPLETED = "COMPLETED"
    SELLER_REJECTED = "SELLER_REJECTED"
    BUYER_REJECTED = "BUYER_REJECTED"

class PurchaseRequest(Base):
    __tablename__ = "purchase_requests"

    id = Column(Integer, primary_key=True, index=True)
    gem_id = Column(Integer, ForeignKey("gems.id"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    status = Column(String, default=PurchaseStatus.PENDING, nullable=False)
    rejection_reason = Column(Text, nullable=True)
    
    buyer_has_unread_updates = Column(Boolean, default=False, nullable=False)
    seller_has_unread_updates = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    gem = relationship("Gem", backref="purchase_requests")
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="purchases_made")
    seller = relationship("User", foreign_keys=[seller_id], back_populates="sales_received")
    messages = relationship("Message", back_populates="purchase_request", cascade="all, delete-orphan")
