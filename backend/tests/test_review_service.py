from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from backend.app.services.review_service import create_user_review, get_reviews_for_user
from backend.app.models.review import ReviewType
from backend.app.models.purchase_request import PurchaseStatus

@patch("backend.app.services.review_service.create_notification")
def test_create_user_review_success(mock_create_notification):
    db = MagicMock()
    fake_purchase = MagicMock()
    fake_purchase.status = PurchaseStatus.COMPLETED
    fake_purchase.buyer_id = 1
    fake_purchase.seller_id = 2
    
    fake_review = MagicMock()
    
    # queries: 1) purchase, 2) existing review, 3) fetch review
    db.query.return_value.filter.return_value.first.side_effect = [fake_purchase, None]
    db.query.return_value.options.return_value.filter.return_value.first.return_value = fake_review

    result = create_user_review(
        db, target_user_id=2, reviewer_id=1,
        purchase_request_id=1, review_type=ReviewType.BUYER_REVIEWING_SELLER,
        rating=5, comment="Great"
    )
    
    assert result == fake_review
    db.add.assert_called_once()
    db.commit.assert_called_once()
    mock_create_notification.assert_called_once()

def test_create_user_review_self():
    db = MagicMock()
    try:
        create_user_review(db, target_user_id=1, reviewer_id=1, purchase_request_id=1, review_type="x", rating=5)
        assert False
    except HTTPException as e:
        assert e.status_code == 400

def test_create_user_review_not_found():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None
    
    try:
        create_user_review(db, target_user_id=2, reviewer_id=1, purchase_request_id=1, review_type="x", rating=5)
        assert False
    except HTTPException as e:
        assert e.status_code == 404

def test_create_user_review_not_completed():
    db = MagicMock()
    fake_purchase = MagicMock()
    fake_purchase.status = PurchaseStatus.PENDING
    db.query.return_value.filter.return_value.first.return_value = fake_purchase
    
    try:
        create_user_review(db, target_user_id=2, reviewer_id=1, purchase_request_id=1, review_type="x", rating=5)
        assert False
    except HTTPException as e:
        assert e.status_code == 400

def test_create_user_review_role_mismatch():
    db = MagicMock()
    fake_purchase = MagicMock()
    fake_purchase.status = PurchaseStatus.COMPLETED
    fake_purchase.buyer_id = 3
    fake_purchase.seller_id = 2
    db.query.return_value.filter.return_value.first.return_value = fake_purchase
    
    try:
        create_user_review(
            db, target_user_id=2, reviewer_id=1,
            purchase_request_id=1, review_type=ReviewType.BUYER_REVIEWING_SELLER, rating=5
        )
        assert False
    except HTTPException as e:
        assert e.status_code == 403

def test_create_user_review_already_reviewed():
    db = MagicMock()
    fake_purchase = MagicMock()
    fake_purchase.status = PurchaseStatus.COMPLETED
    fake_purchase.buyer_id = 1
    fake_purchase.seller_id = 2
    
    fake_existing = MagicMock()
    db.query.return_value.filter.return_value.first.side_effect = [fake_purchase, fake_existing]
    
    try:
        create_user_review(
            db, target_user_id=2, reviewer_id=1,
            purchase_request_id=1, review_type=ReviewType.BUYER_REVIEWING_SELLER, rating=5
        )
        assert False
    except HTTPException as e:
        assert e.status_code == 400

def test_get_reviews_for_user():
    db = MagicMock()
    fake_review = MagicMock()
    db.query.return_value.options.return_value.filter.return_value.order_by.return_value.all.return_value = [fake_review]
    
    result = get_reviews_for_user(db, 1)
    
    assert result == [fake_review]
