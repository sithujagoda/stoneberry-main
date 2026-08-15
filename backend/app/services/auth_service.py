from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from backend.app.models.user import User
from backend.app.models.message import Message
from backend.app.models.purchase_request import PurchaseRequest
from backend.app.models.notification import Notification
from backend.app.schemas.user import UserRegister, UserLogin, SocialLoginRequest, UserOnboardingUpdate
from backend.app.schemas.user_update import UserUpdate
from backend.app.core.security import hash_password, verify_password, create_access_token

def register_user(db: Session, user_in: UserRegister) -> tuple[User, str]:
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    new_user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        provider="credentials",
        is_complete=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token(new_user.id)
    return new_user, token

def login_user(db: Session, user_in: UserLogin) -> tuple[User, str]:
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    if user.provider != "credentials":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This account is configured for {user.provider.capitalize()} login. Please sign in using Google."
        )
    
    if not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    token = create_access_token(user.id)
    return user, token

def social_login_user(db: Session, request: SocialLoginRequest) -> tuple[User, str]:
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        user = User(
            email=request.email,
            provider=request.provider,
            firstname=request.firstname,
            lastname=request.lastname,
            is_complete=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        updated = False
        if not user.provider:
            user.provider = request.provider
            updated = True
        if not user.firstname and request.firstname:
            user.firstname = request.firstname
            updated = True
        if not user.lastname and request.lastname:
            user.lastname = request.lastname
            updated = True
        if updated:
            db.commit()
            db.refresh(user)
            
    token = create_access_token(user.id)
    return user, token

def onboarding_user(db: Session, current_user: User, update_in: UserOnboardingUpdate) -> User:
    current_user.firstname = update_in.firstname
    current_user.lastname = update_in.lastname
    current_user.mobilenumber = update_in.mobilenumber
    current_user.seller_type = update_in.seller_type
    current_user.business_name = update_in.business_name
    current_user.business_registration_number = update_in.business_registration_number
    current_user.address = update_in.address
    current_user.province = update_in.province
    current_user.city = update_in.city
    current_user.is_complete = True
    
    db.commit()
    db.refresh(current_user)
    return current_user

def get_user_notifications(db: Session, user_id: int) -> dict:
    unread_msgs = db.query(Message).filter(
        Message.receiver_id == user_id,
        Message.is_read == False
    ).count()
    
    unread_buying = db.query(PurchaseRequest).filter(
        PurchaseRequest.buyer_id == user_id,
        PurchaseRequest.buyer_has_unread_updates == True
    ).count()
    
    unread_selling = db.query(PurchaseRequest).filter(
        PurchaseRequest.seller_id == user_id,
        PurchaseRequest.seller_has_unread_updates == True
    ).count()
    
    unread_notifs = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()
    
    return {
        "unreadMessages": unread_msgs,
        "unreadOrders": unread_buying + unread_selling,
        "unreadBuying": unread_buying,
        "unreadSelling": unread_selling,
        "unreadNotifications": unread_notifs
    }

def update_user_profile(db: Session, current_user: User, update_in: UserUpdate) -> User:
    update_data = update_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
        
    db.commit()
    db.refresh(current_user)
    return current_user

def update_user_profile_image(db: Session, current_user: User, image_url: str) -> User:
    current_user.profile_image_url = image_url
    db.commit()
    db.refresh(current_user)
    return current_user
