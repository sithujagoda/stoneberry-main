from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    firstname = Column(String, nullable=True)
    lastname = Column(String, nullable=True)
    mobilenumber = Column(String, nullable=True)
    seller_type = Column(String, nullable=True)
    business_name = Column(String, nullable=True)
    business_registration_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
    province = Column(String, nullable=True)
    city = Column(String, nullable=True)
    provider = Column(String, nullable=False, default="credentials")
    profile_image_url = Column(String, nullable=True)
    is_complete = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    gems = relationship("Gem", back_populates="seller")
    
    # Reviews
    reviews_received = relationship("Review", foreign_keys="[Review.target_user_id]", back_populates="target_user")
    reviews_given = relationship("Review", foreign_keys="[Review.reviewer_id]", back_populates="reviewer")

    # Purchases & Sales
    purchases_made = relationship("PurchaseRequest", foreign_keys="[PurchaseRequest.buyer_id]", back_populates="buyer")
    sales_received = relationship("PurchaseRequest", foreign_keys="[PurchaseRequest.seller_id]", back_populates="seller")

    # Messages
    messages_sent = relationship("Message", foreign_keys="[Message.sender_id]", back_populates="sender")
    messages_received = relationship("Message", foreign_keys="[Message.receiver_id]", back_populates="receiver")
