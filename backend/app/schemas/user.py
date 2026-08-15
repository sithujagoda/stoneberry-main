from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr

class UserBase(BaseModel):
    email: EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SocialLoginRequest(BaseModel):
    email: EmailStr
    provider: str
    firstname: Optional[str] = None
    lastname: Optional[str] = None

class UserOnboardingUpdate(BaseModel):
    firstname: str
    lastname: str
    mobilenumber: str
    seller_type: str
    business_name: Optional[str] = None
    business_registration_number: Optional[str] = None
    address: str
    province: str
    city: str

class UserResponse(UserBase):
    id: int
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    mobilenumber: Optional[str] = None
    seller_type: Optional[str] = None
    business_name: Optional[str] = None
    business_registration_number: Optional[str] = None
    address: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    provider: str
    profile_image_url: Optional[str] = None
    is_complete: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class PublicUserResponse(BaseModel):
    id: int
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    seller_type: Optional[str] = None
    business_name: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    profile_image_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
