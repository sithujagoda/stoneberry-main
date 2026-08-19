from sqlalchemy import Column, Integer, String, Float, DateTime, func, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Gem(Base):
    __tablename__ = "gems"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True, default="Unknown Gem") # Fallback since we don't have a direct name input anymore
    gemstone_type = Column(String, nullable=True) # Sapphire, Ruby etc
    category = Column(String, nullable=True)
    cut_style = Column(String, nullable=True)
    treatment = Column(String, nullable=True)
    shape = Column(String, nullable=True)
    color = Column(String, nullable=True)
    clarity = Column(String, nullable=True)
    month = Column(String, nullable=True)
    origin = Column(String, nullable=True)
    intensity = Column(String, nullable=True)
    length = Column(Float, nullable=True)
    width = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    weight_carat = Column(Float, nullable=True)
    price_usd = Column(Float, nullable=True, default=0.0) # We don't have a price input on the UI yet, default to 0
    mined = Column(String, nullable=True)
    cut_by = Column(String, nullable=True)
    cut_location = Column(String, nullable=True)
    certified_by = Column(String, nullable=True)
    certified_location = Column(String, nullable=True)
    
    # Media URLs
    sunlight_image_url = Column(String, nullable=True)
    studio_image_url = Column(String, nullable=True)
    extra_media_url = Column(String, nullable=True)
    certificate_url = Column(String, nullable=True)
    
    # AI verification results (stored at listing time)
    ai_confidence = Column(Float, nullable=True)
    ai_explanation = Column(String, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)

    seller_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    seller = relationship("User", back_populates="gems")
