from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.app.api.deps import get_db
from backend.app.schemas.gem import ApiResponse, GemResponse
from backend.app.services import cart_service

router = APIRouter(prefix="/cart", tags=["Cart"])

class CartAdd(BaseModel):
    user_id: int
    gem_id: int

@router.post("/add", response_model=ApiResponse[bool])
def add_to_cart(req: CartAdd, db: Session = Depends(get_db)):
    result = cart_service.add_item_to_cart(db, req.user_id, req.gem_id)
    return ApiResponse(success=True, data=result)

@router.get("/user/{user_id}", response_model=ApiResponse[List[GemResponse]])
def get_user_cart(user_id: int, db: Session = Depends(get_db)):
    gems = cart_service.get_cart_items_for_user(db, user_id)
    return ApiResponse(success=True, data=gems)

@router.delete("/{user_id}/{gem_id}", response_model=ApiResponse[bool])
def remove_from_cart(user_id: int, gem_id: int, db: Session = Depends(get_db)):
    result = cart_service.remove_item_from_cart(db, user_id, gem_id)
    return ApiResponse(success=True, data=result)

@router.post("/checkout/{user_id}", response_model=ApiResponse[bool])
def checkout_cart(user_id: int, db: Session = Depends(get_db)):
    result = cart_service.checkout_user_cart(db, user_id)
    return ApiResponse(success=True, data=result)
