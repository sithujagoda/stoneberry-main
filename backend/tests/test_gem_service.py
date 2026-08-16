from unittest.mock import MagicMock, patch

from fastapi import HTTPException

from backend.app.services.gem_service import (
    get_gem_by_id,
    create_gem_listing
)

@patch("backend.app.services.gem_service.joinedload")
def test_get_gem_by_id_success(mock_joinedload):
    # Mock joinedload so SQLAlchemy does not configure the real models
    mock_joinedload.return_value = MagicMock()

    # Fake database session
    db = MagicMock()

    # Fake gemstone
    fake_gem = MagicMock()
    fake_gem.id = 1 

    # Mock database query chain
    db.query.return_value.options.return_value.filter.return_value.first.return_value = fake_gem

    # Call function
    result = get_gem_by_id(db, 1)

    # Verify result
    assert result == fake_gem
    assert result.id == 1


@patch("backend.app.services.gem_service.joinedload")
def test_get_gem_by_id_not_found(mock_joinedload):
    # Mock joinedload
    mock_joinedload.return_value = MagicMock()

    # Fake database session
    db = MagicMock()

    # Simulate gemstone not being found
    db.query.return_value.options.return_value.filter.return_value.first.return_value = None

    # Check that HTTP 404 is raised
    try:
        get_gem_by_id(db, 999)
        assert False, "Expected HTTPException to be raised"
    except HTTPException as e:
        assert e.status_code == 404
        assert e.detail == "Gem not found"

@patch("backend.app.services.gem_service.Gem")
def test_create_gem_listing_success(mock_gem):
    # Fake database session
    db = MagicMock()

    # Fake gemstone
    fake_gem = MagicMock()
    mock_gem.return_value = fake_gem

    # Sample gem data
    gem_data = {
        "name": "Blue Sapphire",
        "gemstone_type": "Sapphire",
        "category": "Precious",
        "color": "Blue",
        "weight_carat": 2.5
    }

    # Call the function
    result = create_gem_listing(db, gem_data)

    # Verify Gem object was created
    mock_gem.assert_called_once_with(**gem_data)

    # Verify database operations
    db.add.assert_called_once_with(fake_gem)
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(fake_gem)

    # Verify returned gem
    assert result == fake_gem

@patch("backend.app.services.gem_service.Gem")
def test_create_gem_listing_failure(mock_gem):
    db = MagicMock()

    db.commit.side_effect = Exception("Database error")

    gem_data = {
        "name": "Blue Sapphire",
        "gemstone_type": "Sapphire",
        "category": "Precious",
        "color": "Blue",
        "weight_carat": 2.5
    }

    try:
        create_gem_listing(db, gem_data)
        assert False, "Expected HTTPException to be raised"
    except HTTPException as e:
        assert e.status_code == 500
        assert e.detail == "Database error"

    db.rollback.assert_called_once()

@patch("backend.app.services.gem_service.joinedload")
def test_get_filtered_gems_success(mock_joinedload):
    mock_joinedload.return_value = MagicMock()
    db = MagicMock()
    fake_gem = MagicMock()
    
    # Mocking query chain
    query_mock = MagicMock()
    db.query.return_value.options.return_value = query_mock
    query_mock.filter.return_value = query_mock
    query_mock.order_by.return_value.all.return_value = [fake_gem]

    from backend.app.services.gem_service import get_filtered_gems
    result = get_filtered_gems(db, type_filter="Ruby", min_carat=1.0, search="test")

    assert result == [fake_gem]
    assert query_mock.filter.called
    assert query_mock.order_by.called

@patch("backend.app.services.gem_service.joinedload")
def test_get_seller_gems_success(mock_joinedload):
    mock_joinedload.return_value = MagicMock()
    db = MagicMock()
    fake_gem = MagicMock()
    
    query_mock = MagicMock()
    db.query.return_value.options.return_value = query_mock
    query_mock.filter.return_value = query_mock
    query_mock.order_by.return_value.all.return_value = [fake_gem]

    from backend.app.services.gem_service import get_seller_gems
    result = get_seller_gems(db, 1)

    assert result == [fake_gem]
    query_mock.filter.assert_called_once()

def test_delete_gem_listing_success():
    db = MagicMock()
    fake_gem = MagicMock()
    fake_gem.seller_id = 1
    
    db.query.return_value.filter.return_value.first.return_value = fake_gem
    # mock delete of dependencies
    db.query.return_value.filter.return_value.delete.return_value = None
    db.query.return_value.filter.return_value.all.return_value = []

    from backend.app.services.gem_service import delete_gem_listing
    result = delete_gem_listing(db, 1, 1)

    assert result is True
    db.delete.assert_called_with(fake_gem)
    db.commit.assert_called_once()

def test_delete_gem_listing_not_found():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    from backend.app.services.gem_service import delete_gem_listing
    
    try:
        delete_gem_listing(db, 1, 1)
        assert False, "Expected HTTPException"
    except HTTPException as e:
        assert e.status_code == 404

def test_delete_gem_listing_unauthorized():
    db = MagicMock()
    fake_gem = MagicMock()
    fake_gem.seller_id = 2
    db.query.return_value.filter.return_value.first.return_value = fake_gem

    from backend.app.services.gem_service import delete_gem_listing
    
    try:
        delete_gem_listing(db, 1, 1)
        assert False, "Expected HTTPException"
    except HTTPException as e:
        assert e.status_code == 403

def test_delete_gem_listing_db_failure():
    db = MagicMock()
    fake_gem = MagicMock()
    fake_gem.seller_id = 1
    db.query.return_value.filter.return_value.first.return_value = fake_gem
    
    db.commit.side_effect = Exception("DB Error")

    from backend.app.services.gem_service import delete_gem_listing
    
    try:
        delete_gem_listing(db, 1, 1)
        assert False, "Expected HTTPException"
    except HTTPException as e:
        assert e.status_code == 500
        
    db.rollback.assert_called_once()

def test_update_gem_listing_success():
    db = MagicMock()
    fake_gem = MagicMock()
    fake_gem.seller_id = 1
    fake_gem.color = "Blue"
    fake_gem.gemstone_type = "Sapphire"
    db.query.return_value.filter.return_value.first.return_value = fake_gem

    from backend.app.services.gem_service import update_gem_listing
    result = update_gem_listing(db, 1, 1, {"color": "Red", "gemstone_type": "Ruby"})

    assert result == fake_gem
    assert fake_gem.color == "Red"
    assert fake_gem.gemstone_type == "Ruby"
    assert fake_gem.name == "Red Ruby"
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(fake_gem)

def test_update_gem_listing_not_found():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    from backend.app.services.gem_service import update_gem_listing
    try:
        update_gem_listing(db, 1, 1, {"color": "Red"})
        assert False
    except HTTPException as e:
        assert e.status_code == 404

def test_update_gem_listing_unauthorized():
    db = MagicMock()
    fake_gem = MagicMock()
    fake_gem.seller_id = 2
    db.query.return_value.filter.return_value.first.return_value = fake_gem

    from backend.app.services.gem_service import update_gem_listing
    try:
        update_gem_listing(db, 1, 1, {"color": "Red"})
        assert False
    except HTTPException as e:
        assert e.status_code == 403

def test_update_gem_listing_db_failure():
    db = MagicMock()
    fake_gem = MagicMock()
    fake_gem.seller_id = 1
    db.query.return_value.filter.return_value.first.return_value = fake_gem
    
    db.commit.side_effect = Exception("DB Error")

    from backend.app.services.gem_service import update_gem_listing
    try:
        update_gem_listing(db, 1, 1, {"color": "Red"})
        assert False
    except HTTPException as e:
        assert e.status_code == 500
        
    db.rollback.assert_called_once()
