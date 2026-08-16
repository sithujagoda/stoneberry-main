from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from backend.app.services.message_service import (
    create_thread_message, get_thread_messages,
    delete_message, delete_thread
)
from backend.app.schemas.message import MessageCreate

@patch("backend.app.services.message_service.create_notification")
def test_create_thread_message_success(mock_create_notification):
    db = MagicMock()
    fake_purchase = MagicMock()
    fake_purchase.buyer_id = 1
    fake_purchase.seller_id = 2
    
    db.query.return_value.filter.return_value.first.return_value = fake_purchase

    request = MessageCreate(purchase_request_id=1, content="Hello")
    msg = create_thread_message(db, request, sender_id=1)

    assert msg.content == "Hello"
    assert msg.receiver_id == 2
    db.add.assert_called_once()
    db.commit.assert_called_once()
    mock_create_notification.assert_called_once()

def test_create_thread_message_not_found():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    request = MessageCreate(purchase_request_id=1, content="Hello")
    try:
        create_thread_message(db, request, sender_id=1)
        assert False
    except HTTPException as e:
        assert e.status_code == 404

def test_create_thread_message_unauthorized():
    db = MagicMock()
    fake_purchase = MagicMock()
    fake_purchase.buyer_id = 1
    fake_purchase.seller_id = 2
    
    db.query.return_value.filter.return_value.first.return_value = fake_purchase

    request = MessageCreate(purchase_request_id=1, content="Hello")
    try:
        create_thread_message(db, request, sender_id=3)
        assert False
    except HTTPException as e:
        assert e.status_code == 403

def test_get_thread_messages_success():
    db = MagicMock()
    fake_purchase = MagicMock()
    fake_purchase.buyer_id = 1
    fake_purchase.seller_id = 2
    fake_msg = MagicMock()
    
    # 1st query: purchase, 2nd query: update is_read, 3rd query: select msgs
    db.query.return_value.filter.return_value.first.return_value = fake_purchase
    db.query.return_value.filter.return_value.update.return_value = None
    db.query.return_value.filter.return_value.order_by.return_value.all.return_value = [fake_msg]

    result = get_thread_messages(db, 1, 1)

    assert result == [fake_msg]
    db.query.return_value.filter.return_value.update.assert_called_once_with({"is_read": True})
    db.commit.assert_called_once()

def test_get_thread_messages_not_found():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    try:
        get_thread_messages(db, 1, 1)
        assert False
    except HTTPException as e:
        assert e.status_code == 404

def test_get_thread_messages_unauthorized():
    db = MagicMock()
    fake_purchase = MagicMock()
    fake_purchase.buyer_id = 1
    fake_purchase.seller_id = 2
    
    db.query.return_value.filter.return_value.first.return_value = fake_purchase

    try:
        get_thread_messages(db, 1, 3)
        assert False
    except HTTPException as e:
        assert e.status_code == 403

def test_delete_message_success():
    db = MagicMock()
    fake_msg = MagicMock()
    fake_msg.purchase_request_id = 1
    fake_msg.sender_id = 1
    
    fake_purchase = MagicMock()
    
    db.query.return_value.filter.return_value.first.side_effect = [fake_msg, fake_purchase]

    result = delete_message(db, 1, 1)

    assert result is True
    db.delete.assert_called_once_with(fake_msg)
    db.commit.assert_called_once()

def test_delete_message_not_found():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    try:
        delete_message(db, 1, 1)
        assert False
    except HTTPException as e:
        assert e.status_code == 404

def test_delete_message_unauthorized():
    db = MagicMock()
    fake_msg = MagicMock()
    fake_msg.sender_id = 3
    fake_purchase = MagicMock()
    fake_purchase.buyer_id = 1
    fake_purchase.seller_id = 2
    
    db.query.return_value.filter.return_value.first.side_effect = [fake_msg, fake_purchase]

    try:
        delete_message(db, 1, 4)
        assert False
    except HTTPException as e:
        assert e.status_code == 403

def test_delete_thread_success():
    db = MagicMock()
    fake_purchase = MagicMock()
    fake_purchase.buyer_id = 1
    fake_purchase.seller_id = 2
    
    db.query.return_value.filter.return_value.first.return_value = fake_purchase

    result = delete_thread(db, 1, 1)

    assert result is True
    db.delete.assert_called_once_with(fake_purchase)
    db.commit.assert_called_once()

def test_delete_thread_not_found():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    try:
        delete_thread(db, 1, 1)
        assert False
    except HTTPException as e:
        assert e.status_code == 404

def test_delete_thread_unauthorized():
    db = MagicMock()
    fake_purchase = MagicMock()
    fake_purchase.buyer_id = 1
    fake_purchase.seller_id = 2
    
    db.query.return_value.filter.return_value.first.return_value = fake_purchase

    try:
        delete_thread(db, 1, 3)
        assert False
    except HTTPException as e:
        assert e.status_code == 403
