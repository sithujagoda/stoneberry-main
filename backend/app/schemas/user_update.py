from pydantic import BaseModel
from typing import Optional

class UserUpdate(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    mobilenumber: Optional[str] = None
    seller_type: Optional[str] = None
    business_name: Optional[str] = None
    business_registration_number: Optional[str] = None
    address: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    profile_image_url: Optional[str] = None
