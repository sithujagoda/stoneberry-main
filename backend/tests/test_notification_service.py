from unittest.mock import MagicMock
from fastapi import HTTPException
from backend.app.services.notification_service import (
    create_notification, get_user_notifications_list,
    mark_notification_read, mark_all_notifications_read
)

def test_create_notification_success():
    db = MagicMock()
    
    notif = create_notification(
        db=db,
        user_id=1,
        type="TEST",
        title="Test Title",
        message="Test Message",
        link_url="/test"
    )
    
    assert notif.user_id == 1
    assert notif.type == "TEST"
    assert notif.title == "Test Title"
    assert notif.is_read is False
    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(notif)

def test_get_user_notifications_list_success():
    db = MagicMock()
    fake_notif = MagicMock()
    
    db.query.return_value.filter.return_value.order_by.return_value.limit.return_value.all.return_value = [fake_notif]
    db.query.return_value.filter.return_value.count.return_value = 1
    
    result = get_user_notifications_list(db, 1)
    
    assert result["notifications"] == [fake_notif]
    assert result["unread_count"] == 1

def test_mark_notification_read_success():
    db = MagicMock()
    fake_notif = MagicMock()
    fake_notif.is_read = False
    
    db.query.return_value.filter.return_value.first.return_value = fake_notif
    
    result = mark_notification_read(db, 1, 1)
    
    assert result == fake_notif
    assert fake_notif.is_read is True
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(fake_notif)

def test_mark_notification_read_not_found():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None
    
    try:
        mark_notification_read(db, 1, 1)
        assert False
    except HTTPException as e:
        assert e.status_code == 404

def test_mark_all_notifications_read_success():
    db = MagicMock()
    
    result = mark_all_notifications_read(db, 1)
    
    assert result is True
    db.query.return_value.filter.return_value.update.assert_called_once_with({"is_read": True})
    db.commit.assert_called_once()
