from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from backend.app.core.database import Base

class NotificationType(str, enum.Enum):
    SELLING_OFFER = "SELLING_OFFER"
    BUYING_STATUS = "BUYING_STATUS"
    NEW_MESSAGE = "NEW_MESSAGE"
    REVIEW_RECEIVED = "REVIEW_RECEIVED"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    link_url = Column(String, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    related_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", backref="notifications")
