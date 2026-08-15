from typing import Generic, TypeVar, Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")

# Unified API Response Envelope
class ApiResponse(BaseModel, Generic[T]):
    success: bool
    error: Optional[str] = None
    data: Optional[T] = None
    resolution: Optional[str] = None

    model_config = ConfigDict(arbitrary_types_allowed=True)

class SellerResponse(BaseModel):
    id: int
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Gem schemas
class GemBase(BaseModel):
    name: Optional[str] = "Unknown Gem"
    gemstone_type: Optional[str] = None
    category: Optional[str] = None
    cut_style: Optional[str] = None
    treatment: Optional[str] = None
    shape: Optional[str] = None
    color: Optional[str] = None
    clarity: Optional[str] = None
    month: Optional[str] = None
    origin: Optional[str] = None
    intensity: Optional[str] = None
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    weight_carat: Optional[float] = None
    price_usd: Optional[float] = 0.0
    mined: Optional[str] = None
    cut_by: Optional[str] = None
    cut_location: Optional[str] = None
    certified_by: Optional[str] = None
    certified_location: Optional[str] = None
    
    sunlight_image_url: Optional[str] = None
    studio_image_url: Optional[str] = None
    extra_media_url: Optional[str] = None
    certificate_url: Optional[str] = None
    seller_id: Optional[int] = None
    is_available: Optional[bool] = True

class GemCreate(GemBase):
    pass

class GemUpdate(GemBase):
    pass

class GemResponse(GemBase):
    id: int
    created_at: datetime
    seller: Optional[SellerResponse] = None

    model_config = ConfigDict(from_attributes=True)
