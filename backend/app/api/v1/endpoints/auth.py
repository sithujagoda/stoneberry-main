from fastapi import APIRouter, Depends, status, UploadFile, File
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db, get_current_user
from backend.app.models.user import User
from backend.app.schemas.gem import ApiResponse
from backend.app.schemas.user import (
    UserRegister,
    UserLogin,
    SocialLoginRequest,
    UserOnboardingUpdate,
    UserResponse,
    TokenResponse
)
from backend.app.schemas.user_update import UserUpdate
from backend.app.services import auth_service
from backend.app.utils.storage import upload_file_to_supabase

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=ApiResponse[TokenResponse], status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    user, token = auth_service.register_user(db, user_in)
    user_resp = UserResponse.model_validate(user)
    token_resp = TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_resp
    )
    return ApiResponse(success=True, data=token_resp)

@router.post("/login", response_model=ApiResponse[TokenResponse])
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user, token = auth_service.login_user(db, user_in)
    user_resp = UserResponse.model_validate(user)
    token_resp = TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_resp
    )
    return ApiResponse(success=True, data=token_resp)

@router.post("/social-login", response_model=ApiResponse[TokenResponse])
def social_login(request: SocialLoginRequest, db: Session = Depends(get_db)):
    user, token = auth_service.social_login_user(db, request)
    user_resp = UserResponse.model_validate(user)
    token_resp = TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_resp
    )
    return ApiResponse(success=True, data=token_resp)

@router.put("/onboarding", response_model=ApiResponse[UserResponse])
def onboarding(
    update_in: UserOnboardingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = auth_service.onboarding_user(db, current_user, update_in)
    user_resp = UserResponse.model_validate(user)
    return ApiResponse(success=True, data=user_resp)

@router.get("/me", response_model=ApiResponse[UserResponse])
def get_me(current_user: User = Depends(get_current_user)):
    user_resp = UserResponse.model_validate(current_user)
    return ApiResponse(success=True, data=user_resp)

@router.get("/notifications", response_model=ApiResponse[dict])
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notif_data = auth_service.get_user_notifications(db, current_user.id)
    return ApiResponse(success=True, data=notif_data)

@router.put("/me", response_model=ApiResponse[UserResponse])
def update_me(
    update_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = auth_service.update_user_profile(db, current_user, update_in)
    user_resp = UserResponse.model_validate(user)
    return ApiResponse(success=True, data=user_resp)

@router.post("/profile-image", response_model=ApiResponse[UserResponse])
async def upload_profile_image(
    profileImage: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image_url = upload_file_to_supabase("gems", await profileImage.read(), profileImage.filename, profileImage.content_type)
    user = auth_service.update_user_profile_image(db, current_user, image_url)
    user_resp = UserResponse.model_validate(user)
    return ApiResponse(success=True, data=user_resp)
