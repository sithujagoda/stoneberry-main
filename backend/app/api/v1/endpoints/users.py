from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db
from backend.app.models.user import User
from backend.app.schemas.gem import ApiResponse
from backend.app.schemas.user import PublicUserResponse

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/{user_id}", response_model=ApiResponse[PublicUserResponse])
def get_user_public_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    return ApiResponse(success=True, data=PublicUserResponse.model_validate(user))
