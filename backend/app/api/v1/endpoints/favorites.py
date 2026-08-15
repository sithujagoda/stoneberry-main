from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.app.api.deps import get_db
from backend.app.schemas.gem import ApiResponse, GemResponse
from backend.app.services import favorite_service

router = APIRouter(prefix="/favorites", tags=["Favorites"])

class FavoriteToggle(BaseModel):
    user_id: int
    gem_id: int

@router.post("/toggle", response_model=ApiResponse[bool])
def toggle_favorite(req: FavoriteToggle, db: Session = Depends(get_db)):
    result = favorite_service.toggle_favorite_item(db, req.user_id, req.gem_id)
    return ApiResponse(success=True, data=result)

@router.get("/user/{user_id}", response_model=ApiResponse[List[GemResponse]])
def get_user_favorites(user_id: int, db: Session = Depends(get_db)):
    gems = favorite_service.get_favorites_for_user(db, user_id)
    return ApiResponse(success=True, data=gems)
