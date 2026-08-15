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