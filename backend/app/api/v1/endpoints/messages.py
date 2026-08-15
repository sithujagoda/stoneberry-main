from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db
from backend.app.schemas.gem import ApiResponse
from backend.app.schemas.message import MessageCreate, MessageResponse
from backend.app.services import message_service

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.post("", response_model=ApiResponse[MessageResponse], status_code=status.HTTP_201_CREATED)
def create_message(request: MessageCreate, sender_id: int, db: Session = Depends(get_db)):
    msg = message_service.create_thread_message(db, request, sender_id)
    return ApiResponse(success=True, data=msg)

@router.get("/request/{purchase_id}", response_model=ApiResponse[List[MessageResponse]])
def get_thread(purchase_id: int, user_id: int, db: Session = Depends(get_db)):
    messages = message_service.get_thread_messages(db, purchase_id, user_id)
    return ApiResponse(success=True, data=messages)

@router.delete("/thread/{purchase_id}", response_model=ApiResponse[bool])
def delete_thread(purchase_id: int, user_id: int, db: Session = Depends(get_db)):
    message_service.delete_thread(db, purchase_id, user_id)
    return ApiResponse(success=True, message="Thread deleted successfully", data=True)

@router.delete("/{message_id}", response_model=ApiResponse[bool])
def delete_message(message_id: int, user_id: int, db: Session = Depends(get_db)):
    message_service.delete_message(db, message_id, user_id)
    return ApiResponse(success=True, message="Message deleted successfully", data=True)
