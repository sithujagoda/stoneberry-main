from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from backend.app.services.purchase_service import (
    create_purchase_inquiry, get_user_buying_requests,
    get_user_selling_requests, update_purchase_status,
    complete_purchase_order, mark_purchase_read
)
from backend.app.schemas.purchase_request import PurchaseRequestCreate, PurchaseRequestUpdate
from backend.app.models.purchase_request import PurchaseStatus

@patch("backend.app.services.purchase_service.joinedload")
@patch("backend.app.services.purchase_service.Gem")
@patch("backend.app.services.purchase_service.PurchaseRequest")
@patch("backend.app.services.purchase_service.create_notification")
def test_create_purchase_inquiry_success(mock_create_notification, mock_pr, mock_gem, mock_joinedload):
    db = MagicMock()
    fake_gem = MagicMock()
    fake_gem.is_available = True
    fake_gem.seller_id = 2
    
    fake_req = MagicMock()
    
    # 1st query: gem, 2nd: existing req, 3rd: full request
    db.query.return_value.filter.return_value.first.side_effect = [fake_gem, None]
    db.query.return_value.options.return_value.filter.return_value.first.return_value = fake_req

    req_data = PurchaseRequestCreate(gem_id=1, buyer_id=1, seller_id=2)
    result = create_purchase_inquiry(db, req_data)

    assert result == fake_req
    db.add.assert_called_once()
    db.commit.assert_called_once()
    mock_create_notification.assert_called_once()

@patch("backend.app.services.purchase_service.joinedload")
@patch("backend.app.services.purchase_service.Gem")
@patch("backend.app.services.purchase_service.PurchaseRequest")
def test_create_purchase_inquiry_gem_not_found(mock_pr, mock_gem, mock_joinedload):
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    req_data = PurchaseRequestCreate(gem_id=1, buyer_id=1, seller_id=2)
    try:
        create_purchase_inquiry(db, req_data)
        assert False
    except HTTPException as e:
        assert e.status_code == 404

@patch("backend.app.services.purchase_service.joinedload")
@patch("backend.app.services.purchase_service.Gem")
@patch("backend.app.services.purchase_service.PurchaseRequest")
def test_create_purchase_inquiry_not_available(mock_pr, mock_gem, mock_joinedload):
    db = MagicMock()
    fake_gem = MagicMock()
    fake_gem.is_available = False
    db.query.return_value.filter.return_value.first.return_value = fake_gem

    req_data = PurchaseRequestCreate(gem_id=1, buyer_id=1, seller_id=2)
    try:
        create_purchase_inquiry(db, req_data)
        assert False
    except HTTPException as e:
        assert e.status_code == 400

@patch("backend.app.services.purchase_service.joinedload")
@patch("backend.app.services.purchase_service.Gem")
@patch("backend.app.services.purchase_service.PurchaseRequest")
def test_create_purchase_inquiry_self_purchase(mock_pr, mock_gem, mock_joinedload):
    db = MagicMock()
    fake_gem = MagicMock()
    fake_gem.is_available = True
    fake_gem.seller_id = 1
    db.query.return_value.filter.return_value.first.return_value = fake_gem

    req_data = PurchaseRequestCreate(gem_id=1, buyer_id=1, seller_id=1)
    try:
        create_purchase_inquiry(db, req_data)
        assert False
    except HTTPException as e:
        assert e.status_code == 400

@patch("backend.app.services.purchase_service.joinedload")
@patch("backend.app.services.purchase_service.Gem")
@patch("backend.app.services.purchase_service.PurchaseRequest")
def test_get_user_buying_requests(mock_pr, mock_gem, mock_joinedload):
    db = MagicMock()
    fake_req = MagicMock()
    db.query.return_value.options.return_value.filter.return_value.order_by.return_value.all.return_value = [fake_req]
    
    result = get_user_buying_requests(db, 1)
    assert result == [fake_req]

@patch("backend.app.services.purchase_service.joinedload")
@patch("backend.app.services.purchase_service.Gem")
@patch("backend.app.services.purchase_service.PurchaseRequest")
def test_get_user_selling_requests(mock_pr, mock_gem, mock_joinedload):
    db = MagicMock()
    fake_req = MagicMock()
    db.query.return_value.options.return_value.filter.return_value.order_by.return_value.all.return_value = [fake_req]
    
    result = get_user_selling_requests(db, 1)
    assert result == [fake_req]

@patch("backend.app.services.purchase_service.joinedload")
@patch("backend.app.services.purchase_service.Gem")
@patch("backend.app.services.purchase_service.PurchaseRequest")
@patch("backend.app.services.purchase_service.create_notification")
def test_update_purchase_status_success(mock_create_notification, mock_pr, mock_gem, mock_joinedload):
    db = MagicMock()
    fake_req = MagicMock()
    fake_gem = MagicMock()
    fake_req.gem = fake_gem
    
    # Both queries use .options().filter().first()
    db.query.return_value.options.return_value.filter.return_value.first.return_value = fake_req

    update_data = PurchaseRequestUpdate(status=PurchaseStatus.READY_FOR_BUYING)
    result = update_purchase_status(db, 1, update_data)
    
    assert result == fake_req
    assert fake_gem.is_available is False
    assert fake_req.status == PurchaseStatus.READY_FOR_BUYING
    db.commit.assert_called_once()
    mock_create_notification.assert_called_once()

@patch("backend.app.services.purchase_service.joinedload")
@patch("backend.app.services.purchase_service.Gem")
@patch("backend.app.services.purchase_service.PurchaseRequest")
def test_update_purchase_status_not_found(mock_pr, mock_gem, mock_joinedload):
    db = MagicMock()
    db.query.return_value.options.return_value.filter.return_value.first.return_value = None

    update_data = PurchaseRequestUpdate(status=PurchaseStatus.READY_FOR_BUYING)
    try:
        update_purchase_status(db, 1, update_data)
        assert False
    except HTTPException as e:
        assert e.status_code == 404

@patch("backend.app.services.purchase_service.joinedload")
@patch("backend.app.services.purchase_service.Gem")
@patch("backend.app.services.purchase_service.PurchaseRequest")
@patch("backend.app.services.purchase_service.create_notification")
def test_complete_purchase_order_success(mock_create_notification, mock_pr, mock_gem, mock_joinedload):
    db = MagicMock()
    fake_req = MagicMock()
    fake_req.buyer_id = 1
    fake_gem = MagicMock()
    fake_req.gem = fake_gem
    
    # Both queries use .options().filter().first()
    db.query.return_value.options.return_value.filter.return_value.first.return_value = fake_req

    result = complete_purchase_order(db, 1, 1)
    
    assert result == fake_req
    assert fake_req.status == PurchaseStatus.COMPLETED
    assert fake_gem.is_available is False
    db.commit.assert_called_once()
    mock_create_notification.assert_called_once()

@patch("backend.app.services.purchase_service.joinedload")
@patch("backend.app.services.purchase_service.Gem")
@patch("backend.app.services.purchase_service.PurchaseRequest")
def test_complete_purchase_order_not_found(mock_pr, mock_gem, mock_joinedload):
    db = MagicMock()
    db.query.return_value.options.return_value.filter.return_value.first.return_value = None

    try:
        complete_purchase_order(db, 1, 1)
        assert False
    except HTTPException as e:
        assert e.status_code == 404

@patch("backend.app.services.purchase_service.joinedload")
@patch("backend.app.services.purchase_service.Gem")
@patch("backend.app.services.purchase_service.PurchaseRequest")
def test_complete_purchase_order_unauthorized(mock_pr, mock_gem, mock_joinedload):
    db = MagicMock()
    fake_req = MagicMock()
    fake_req.buyer_id = 2
    db.query.return_value.options.return_value.filter.return_value.first.return_value = fake_req

    try:
        complete_purchase_order(db, 1, 1)
        assert False
    except HTTPException as e:
        assert e.status_code == 403

@patch("backend.app.services.purchase_service.joinedload")
@patch("backend.app.services.purchase_service.Gem")
@patch("backend.app.services.purchase_service.PurchaseRequest")
def test_mark_purchase_read_buyer(mock_pr, mock_gem, mock_joinedload):
    db = MagicMock()
    fake_req = MagicMock()
    fake_req.buyer_id = 1
    
    # 1st query: request, 2nd: full request
    db.query.return_value.filter.return_value.first.return_value = fake_req
    db.query.return_value.options.return_value.filter.return_value.first.return_value = fake_req

    result = mark_purchase_read(db, 1, 1)
    
    assert result == fake_req
    assert fake_req.buyer_has_unread_updates is False
    db.commit.assert_called_once()
