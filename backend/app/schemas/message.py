from pydantic import BaseModel, ConfigDict
from datetime import datetime

class MessageBase(BaseModel):
    purchase_request_id: int
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    sender_id: int
    receiver_id: int
    created_at: datetime
    is_read: bool

    model_config = ConfigDict(from_attributes=True)
