from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db
from backend.app.schemas.gem import ApiResponse
from backend.app.schemas.purchase_request import PurchaseRequestCreate, PurchaseRequestResponse, PurchaseRequestUpdate
from backend.app.services import purchase_service

router = APIRouter(prefix="/purchases", tags=["Purchases"])

@router.post("", response_model=ApiResponse[PurchaseRequestResponse], status_code=status.HTTP_201_CREATED)
def create_purchase_request(request: PurchaseRequestCreate, db: Session = Depends(get_db)):
    db_req = purchase_service.create_purchase_inquiry(db, request)
    return ApiResponse(success=True, data=db_req)

@router.get("/buying/{user_id}", response_model=ApiResponse[List[PurchaseRequestResponse]])
def get_buying_requests(user_id: int, db: Session = Depends(get_db)):
    requests = purchase_service.get_user_buying_requests(db, user_id)
    return ApiResponse(success=True, data=requests)

@router.get("/selling/{user_id}", response_model=ApiResponse[List[PurchaseRequestResponse]])
def get_selling_requests(user_id: int, db: Session = Depends(get_db)):
    requests = purchase_service.get_user_selling_requests(db, user_id)
    return ApiResponse(success=True, data=requests)

@router.patch("/{request_id}/status", response_model=ApiResponse[PurchaseRequestResponse])
def update_status(request_id: int, update: PurchaseRequestUpdate, db: Session = Depends(get_db)):
    updated_req = purchase_service.update_purchase_status(db, request_id, update)
    return ApiResponse(success=True, data=updated_req)

@router.post("/{request_id}/complete", response_model=ApiResponse[PurchaseRequestResponse])
def complete_purchase(request_id: int, user_id: int, db: Session = Depends(get_db)):
    completed_req = purchase_service.complete_purchase_order(db, request_id, user_id)
    return ApiResponse(success=True, data=completed_req)

@router.put("/{request_id}/read", response_model=ApiResponse[PurchaseRequestResponse])
def mark_request_read(request_id: int, user_id: int, db: Session = Depends(get_db)):
    read_req = purchase_service.mark_purchase_read(db, request_id, user_id)
    return ApiResponse(success=True, data=read_req)
