from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from backend.app.models.cart import CartItem
from backend.app.models.gem import Gem
from backend.app.models.purchase_request import PurchaseRequest, PurchaseStatus

def add_item_to_cart(db: Session, user_id: int, gem_id: int) -> bool:
    gem = db.query(Gem).filter(Gem.id == gem_id).first()
    if not gem:
        raise HTTPException(status_code=404, detail="Gem not found")
        
    if user_id == gem.seller_id:
        raise HTTPException(status_code=400, detail="Cannot add your own gem to cart")

    existing = db.query(CartItem).filter(CartItem.user_id == user_id, CartItem.gem_id == gem_id).first()
    if existing:
        return True # Already in cart

    new_item = CartItem(user_id=user_id, gem_id=gem_id)
    db.add(new_item)
    db.commit()
    return True

def get_cart_items_for_user(db: Session, user_id: int) -> List[Gem]:
    cart_items = db.query(CartItem).options(
        joinedload(CartItem.gem).joinedload(Gem.seller)
    ).filter(CartItem.user_id == user_id).order_by(CartItem.created_at.desc()).all()
    
    gems = [item.gem for item in cart_items if item.gem]
    return gems

def remove_item_from_cart(db: Session, user_id: int, gem_id: int) -> bool:
    existing = db.query(CartItem).filter(CartItem.user_id == user_id, CartItem.gem_id == gem_id).first()
    if existing:
        db.delete(existing)
        db.commit()
    return True

def checkout_user_cart(db: Session, user_id: int) -> bool:
    cart_items = db.query(CartItem).options(joinedload(CartItem.gem)).filter(CartItem.user_id == user_id).all()
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    for item in cart_items:
        gem = item.gem
        if not gem or not gem.is_available:
            continue
            
        existing_req = db.query(PurchaseRequest).filter(
            PurchaseRequest.gem_id == gem.id,
            PurchaseRequest.buyer_id == user_id,
            PurchaseRequest.status.in_([PurchaseStatus.PENDING, PurchaseStatus.READY_FOR_BUYING])
        ).first()
        
        if not existing_req:
            new_req = PurchaseRequest(
                gem_id=gem.id,
                buyer_id=user_id,
                seller_id=gem.seller_id,
                status=PurchaseStatus.PENDING
            )
            db.add(new_req)
            
        db.delete(item)

    db.commit()
    return True
