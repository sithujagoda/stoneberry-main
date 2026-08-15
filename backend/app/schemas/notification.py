from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class NotificationBase(BaseModel):
    type: str
    title: str
    message: str
    link_url: str
    related_id: Optional[int] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    unread_count: int
