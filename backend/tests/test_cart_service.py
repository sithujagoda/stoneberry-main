from unittest.mock import MagicMock
from fastapi import HTTPException
from backend.app.services.cart_service import (
    add_item_to_cart, get_cart_items_for_user,
    remove_item_from_cart, checkout_user_cart
)

def test_add_item_to_cart_success():
    db = MagicMock()
    fake_gem = MagicMock()
    fake_gem.seller_id = 2
    
    # query chain for gem
    db.query.return_value.filter.return_value.first.side_effect = [fake_gem, None]

    result = add_item_to_cart(db, user_id=1, gem_id=1)
    
    assert result is True
    db.add.assert_called_once()
    db.commit.assert_called_once()

def test_add_item_to_cart_gem_not_found():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    try:
        add_item_to_cart(db, user_id=1, gem_id=1)
        assert False
    except HTTPException as e:
        assert e.status_code == 404

def test_add_item_to_cart_own_gem():
    db = MagicMock()
    fake_gem = MagicMock()
    fake_gem.seller_id = 1
    db.query.return_value.filter.return_value.first.return_value = fake_gem

    try:
        add_item_to_cart(db, user_id=1, gem_id=1)
        assert False
    except HTTPException as e:
        assert e.status_code == 400

def test_add_item_to_cart_already_exists():
    db = MagicMock()
    fake_gem = MagicMock()
    fake_gem.seller_id = 2
    
    fake_cart_item = MagicMock()
    db.query.return_value.filter.return_value.first.side_effect = [fake_gem, fake_cart_item]

    result = add_item_to_cart(db, user_id=1, gem_id=1)
    
    assert result is True
    db.add.assert_not_called()
    db.commit.assert_not_called()

def test_get_cart_items_for_user_success():
    db = MagicMock()
    fake_cart_item = MagicMock()
    fake_gem = MagicMock()
    fake_cart_item.gem = fake_gem
    
    db.query.return_value.options.return_value.filter.return_value.order_by.return_value.all.return_value = [fake_cart_item]

    result = get_cart_items_for_user(db, 1)
    
    assert result == [fake_gem]

def test_remove_item_from_cart_success():
    db = MagicMock()
    fake_cart_item = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = fake_cart_item

    result = remove_item_from_cart(db, 1, 1)
    
    assert result is True
    db.delete.assert_called_once_with(fake_cart_item)
    db.commit.assert_called_once()

def test_remove_item_from_cart_not_found():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    result = remove_item_from_cart(db, 1, 1)
    
    assert result is True
    db.delete.assert_not_called()
    db.commit.assert_not_called()

def test_checkout_user_cart_success():
    db = MagicMock()
    fake_cart_item = MagicMock()
    fake_gem = MagicMock()
    fake_gem.id = 1
    fake_gem.seller_id = 2
    fake_gem.is_available = True
    fake_cart_item.gem = fake_gem
    
    # return cart items
    db.query.return_value.options.return_value.filter.return_value.all.return_value = [fake_cart_item]
    # return existing purchase request (None)
    db.query.return_value.filter.return_value.first.return_value = None

    result = checkout_user_cart(db, 1)
    
    assert result is True
    db.add.assert_called_once()
    db.delete.assert_called_once_with(fake_cart_item)
    db.commit.assert_called_once()

def test_checkout_user_cart_empty():
    db = MagicMock()
    db.query.return_value.options.return_value.filter.return_value.all.return_value = []

    try:
        checkout_user_cart(db, 1)
        assert False
    except HTTPException as e:
        assert e.status_code == 400
