from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from backend.app.schemas.user import UserResponse
from backend.app.schemas.gem import GemResponse

class PurchaseRequestBase(BaseModel):
    gem_id: int
    seller_id: int
    buyer_id: int

class PurchaseRequestCreate(PurchaseRequestBase):
    status: Optional[str] = "PENDING"

class PurchaseRequestUpdate(BaseModel):
    status: str
    rejection_reason: Optional[str] = None

class PurchaseRequestResponse(PurchaseRequestBase):
    id: int
    status: str
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    buyer_has_unread_updates: bool
    seller_has_unread_updates: bool
    
    # Nested data for rich UI
    gem: Optional[GemResponse] = None
    buyer: Optional[UserResponse] = None
    seller: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
