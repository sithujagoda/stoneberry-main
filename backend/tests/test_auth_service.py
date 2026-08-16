from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from backend.app.services.auth_service import (
    register_user, login_user, social_login_user, 
    onboarding_user, get_user_notifications, 
    update_user_profile, update_user_profile_image
)
from backend.app.schemas.user import UserRegister, UserLogin, SocialLoginRequest, UserOnboardingUpdate
from backend.app.schemas.user_update import UserUpdate

@patch("backend.app.services.auth_service.hash_password")
@patch("backend.app.services.auth_service.create_access_token")
def test_register_user_success(mock_create_access_token, mock_hash_password):
    mock_hash_password.return_value = "hashed_pw"
    mock_create_access_token.return_value = "token123"
    
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    fake_user = MagicMock()
    fake_user.email = "test@test.com"
    fake_user.hashed_password = "hashed_pw"
    fake_user.provider = "credentials"
    fake_user.id = 1

    with patch("backend.app.services.auth_service.User", return_value=fake_user) as mock_user_class:
        user_in = UserRegister(email="test@test.com", password="password")
        user, token = register_user(db, user_in)
        
        assert user.email == "test@test.com"
        assert user.hashed_password == "hashed_pw"
        assert user.provider == "credentials"
        assert token == "token123"
        db.add.assert_called_once_with(fake_user)
        db.commit.assert_called_once()

def test_register_user_already_exists():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = MagicMock()

    user_in = UserRegister(email="test@test.com", password="password")
    
    try:
        register_user(db, user_in)
        assert False
    except HTTPException as e:
        assert e.status_code == 400
        assert "already exists" in e.detail

@patch("backend.app.services.auth_service.verify_password")
@patch("backend.app.services.auth_service.create_access_token")
def test_login_user_success(mock_create_access_token, mock_verify_password):
    mock_verify_password.return_value = True
    mock_create_access_token.return_value = "token123"
    
    db = MagicMock()
    fake_user = MagicMock()
    fake_user.provider = "credentials"
    fake_user.hashed_password = "hashed_pw"
    db.query.return_value.filter.return_value.first.return_value = fake_user

    user_in = UserLogin(email="test@test.com", password="password")
    user, token = login_user(db, user_in)
    
    assert user == fake_user
    assert token == "token123"

def test_login_user_not_found():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    user_in = UserLogin(email="test@test.com", password="password")
    try:
        login_user(db, user_in)
        assert False
    except HTTPException as e:
        assert e.status_code == 401
        assert "Incorrect email or password" in e.detail

def test_login_user_wrong_provider():
    db = MagicMock()
    fake_user = MagicMock()
    fake_user.provider = "google"
    db.query.return_value.filter.return_value.first.return_value = fake_user

    user_in = UserLogin(email="test@test.com", password="password")
    try:
        login_user(db, user_in)
        assert False
    except HTTPException as e:
        assert e.status_code == 400
        assert "configured for Google login" in e.detail

@patch("backend.app.services.auth_service.verify_password")
def test_login_user_wrong_password(mock_verify_password):
    mock_verify_password.return_value = False
    
    db = MagicMock()
    fake_user = MagicMock()
    fake_user.provider = "credentials"
    db.query.return_value.filter.return_value.first.return_value = fake_user

    user_in = UserLogin(email="test@test.com", password="password")
    try:
        login_user(db, user_in)
        assert False
    except HTTPException as e:
        assert e.status_code == 401

@patch("backend.app.services.auth_service.create_access_token")
def test_social_login_user_new(mock_create_access_token):
    mock_create_access_token.return_value = "token123"
    
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    fake_user = MagicMock()
    fake_user.email = "test@test.com"
    fake_user.id = 1

    with patch("backend.app.services.auth_service.User", return_value=fake_user) as mock_user_class:
        request = SocialLoginRequest(email="test@test.com", provider="google", firstname="John", lastname="Doe")
        user, token = social_login_user(db, request)

        assert user.email == "test@test.com"
        assert token == "token123"
        db.add.assert_called_once_with(fake_user)
        db.commit.assert_called_once()

@patch("backend.app.services.auth_service.create_access_token")
def test_social_login_user_existing(mock_create_access_token):
    mock_create_access_token.return_value = "token123"
    db = MagicMock()
    fake_user = MagicMock()
    fake_user.provider = None
    fake_user.firstname = None
    fake_user.lastname = None
    db.query.return_value.filter.return_value.first.return_value = fake_user

    request = SocialLoginRequest(email="test@test.com", provider="google", firstname="John", lastname="Doe")
    user, token = social_login_user(db, request)

    assert user == fake_user
    assert fake_user.provider == "google"
    assert fake_user.firstname == "John"
    db.commit.assert_called_once()

def test_onboarding_user_success():
    db = MagicMock()
    current_user = MagicMock()
    update_in = UserOnboardingUpdate(
        firstname="John",
        lastname="Doe",
        mobilenumber="1234567890",
        seller_type="Individual",
        business_name="John's Gems",
        business_registration_number="123",
        address="123 Street",
        province="WP",
        city="Colombo"
    )

    user = onboarding_user(db, current_user, update_in)
    
    assert user.firstname == "John"
    assert user.is_complete is True
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(user)

def test_get_user_notifications_success():
    db = MagicMock()
    db.query.return_value.filter.return_value.count.side_effect = [1, 2, 3, 4]
    
    res = get_user_notifications(db, 1)
    
    assert res["unreadMessages"] == 1
    assert res["unreadBuying"] == 2
    assert res["unreadSelling"] == 3
    assert res["unreadOrders"] == 5
    assert res["unreadNotifications"] == 4

def test_update_user_profile_success():
    db = MagicMock()
    current_user = MagicMock()
    update_in = UserUpdate(firstname="John")

    user = update_user_profile(db, current_user, update_in)
    
    assert current_user.firstname == "John"
    db.commit.assert_called_once()

def test_update_user_profile_image_success():
    db = MagicMock()
    current_user = MagicMock()
    
    user = update_user_profile_image(db, current_user, "http://image.com/img.jpg")
    
    assert current_user.profile_image_url == "http://image.com/img.jpg"
    db.commit.assert_called_once()
