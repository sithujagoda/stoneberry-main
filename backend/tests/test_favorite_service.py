from unittest.mock import MagicMock
from fastapi import HTTPException
from backend.app.services.favorite_service import toggle_favorite_item, get_favorites_for_user

def test_toggle_favorite_item_add():
    db = MagicMock()
    fake_gem = MagicMock()
    
    # 1st query: gem, 2nd query: favorite existing
    db.query.return_value.filter.return_value.first.side_effect = [fake_gem, None]

    result = toggle_favorite_item(db, 1, 1)
    
    assert result is True
    db.add.assert_called_once()
    db.commit.assert_called_once()

def test_toggle_favorite_item_remove():
    db = MagicMock()
    fake_gem = MagicMock()
    fake_fav = MagicMock()
    
    db.query.return_value.filter.return_value.first.side_effect = [fake_gem, fake_fav]

    result = toggle_favorite_item(db, 1, 1)
    
    assert result is False
    db.delete.assert_called_once_with(fake_fav)
    db.commit.assert_called_once()

def test_toggle_favorite_item_not_found():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    try:
        toggle_favorite_item(db, 1, 1)
        assert False
    except HTTPException as e:
        assert e.status_code == 404

def test_get_favorites_for_user_success():
    db = MagicMock()
    fake_fav = MagicMock()
    fake_gem = MagicMock()
    fake_fav.gem = fake_gem
    
    db.query.return_value.options.return_value.filter.return_value.order_by.return_value.all.return_value = [fake_fav]

    result = get_favorites_for_user(db, 1)
    
    assert result == [fake_gem]
