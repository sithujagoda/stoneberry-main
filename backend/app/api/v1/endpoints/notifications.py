from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db, get_current_user
from backend.app.models.user import User
from backend.app.schemas.gem import ApiResponse
from backend.app.schemas.notification import NotificationListResponse, NotificationResponse
from backend.app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=ApiResponse[NotificationListResponse])
def get_notifications(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = notification_service.get_user_notifications_list(db, current_user.id, limit=limit)
    return ApiResponse(
        success=True,
        data=NotificationListResponse(
            notifications=[NotificationResponse.model_validate(n) for n in data["notifications"]],
            unread_count=data["unread_count"]
        )
    )

@router.post("/{notification_id}/read", response_model=ApiResponse[NotificationResponse])
def read_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = notification_service.mark_notification_read(db, notification_id, current_user.id)
    return ApiResponse(success=True, data=NotificationResponse.model_validate(notif))

@router.post("/read-all", response_model=ApiResponse[dict])
def read_all_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification_service.mark_all_notifications_read(db, current_user.id)
    return ApiResponse(success=True, data={"message": "All notifications marked as read"})
