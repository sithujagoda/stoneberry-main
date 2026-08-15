import json
from typing import List, Optional, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from backend.app.models.gem import Gem
from backend.app.models.cart import CartItem
from backend.app.models.favorite import Favorite
from backend.app.models.purchase_request import PurchaseRequest
from backend.app.models.message import Message
from backend.app.models.review import Review

def get_filtered_gems(
    db: Session,
    type_filter: Optional[str] = None,
    category_filter: Optional[str] = None,
    cut_filter: Optional[str] = None,
    treatment_filter: Optional[str] = None,
    shape_filter: Optional[str] = None,
    color_filter: Optional[str] = None,
    intensity_filter: Optional[str] = None,
    clarity_filter: Optional[str] = None,
    month_filter: Optional[str] = None,
    origin_filter: Optional[str] = None,
    min_carat: Optional[float] = None,
    max_carat: Optional[float] = None,
    length_filter: Optional[float] = None,
    width_filter: Optional[float] = None,
    height_filter: Optional[float] = None,
    search: Optional[str] = None
) -> List[Gem]:
    query = db.query(Gem).options(joinedload(Gem.seller))
    
    if type_filter and type_filter not in ("All", "Any"):
        query = query.filter(Gem.gemstone_type.ilike(f"%{type_filter}%"))
    if category_filter and category_filter not in ("All", "Any"):
        query = query.filter(Gem.category.ilike(f"%{category_filter}%"))
    if cut_filter and cut_filter not in ("All", "Any"):
        query = query.filter(Gem.cut_style.ilike(f"%{cut_filter}%"))
    if treatment_filter and treatment_filter not in ("All", "Any"):
        query = query.filter(Gem.treatment.ilike(f"%{treatment_filter}%"))
    if shape_filter and shape_filter not in ("All", "Any"):
        query = query.filter(Gem.shape.ilike(f"%{shape_filter}%"))
    if color_filter and color_filter not in ("All", "Any"):
        query = query.filter(Gem.color.ilike(f"%{color_filter}%"))
    if intensity_filter and intensity_filter not in ("All", "Any"):
        query = query.filter(Gem.intensity.ilike(f"%{intensity_filter}%"))
    if clarity_filter and clarity_filter not in ("All", "Any"):
        query = query.filter(Gem.clarity.ilike(f"%{clarity_filter}%"))
    if month_filter and month_filter not in ("All", "Any"):
        query = query.filter(Gem.month.ilike(f"%{month_filter}%"))
    if origin_filter and origin_filter not in ("All", "Any"):
        query = query.filter(Gem.origin.ilike(f"%{origin_filter}%"))
        
    if min_carat is not None and min_carat > 0:
        query = query.filter(Gem.weight_carat >= min_carat)
    if max_carat is not None and max_carat < 20:
        query = query.filter(Gem.weight_carat <= max_carat)
        
    if length_filter is not None and length_filter > 0:
        query = query.filter(Gem.length >= length_filter)
    if width_filter is not None and width_filter > 0:
        query = query.filter(Gem.width >= width_filter)
    if height_filter is not None and height_filter > 0:
        query = query.filter(Gem.height >= height_filter)
        
    if search and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Gem.name.ilike(search_term)) |
            (Gem.gemstone_type.ilike(search_term)) |
            (Gem.color.ilike(search_term)) |
            (Gem.origin.ilike(search_term)) |
            (Gem.category.ilike(search_term))
        )
        
    return query.order_by(Gem.created_at.desc()).all()

def get_gem_by_id(db: Session, gem_id: int) -> Gem:
    gem = db.query(Gem).options(joinedload(Gem.seller)).filter(Gem.id == gem_id).first()
    if not gem:
        raise HTTPException(status_code=404, detail="Gem not found")
    return gem

def get_seller_gems(db: Session, seller_id: int) -> List[Gem]:
    return db.query(Gem).options(joinedload(Gem.seller)).filter(Gem.seller_id == seller_id).order_by(Gem.created_at.desc()).all()

def create_gem_listing(
    db: Session,
    gem_data: dict
) -> Gem:
    try:
        db_gem = Gem(**gem_data)
        db.add(db_gem)
        db.commit()
        db.refresh(db_gem)
        return db_gem
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def delete_gem_listing(db: Session, gem_id: int, seller_id: int) -> bool:
    gem = db.query(Gem).filter(Gem.id == gem_id).first()
    if not gem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gem with ID {gem_id} cannot be deleted as it does not exist."
        )
    if gem.seller_id != seller_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this gem."
        )
    try:
        # 1. Delete associated cart items and favorites
        db.query(CartItem).filter(CartItem.gem_id == gem_id).delete(synchronize_session=False)
        db.query(Favorite).filter(Favorite.gem_id == gem_id).delete(synchronize_session=False)

        # 2. Delete associated purchase requests and their child messages/reviews
        requests = db.query(PurchaseRequest).filter(PurchaseRequest.gem_id == gem_id).all()
        for req in requests:
            db.query(Message).filter(Message.purchase_request_id == req.id).delete(synchronize_session=False)
            db.query(Review).filter(Review.purchase_request_id == req.id).delete(synchronize_session=False)
            db.delete(req)

        db.delete(gem)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete gem listing: {str(e)}"
        )

def update_gem_listing(db: Session, gem_id: int, seller_id: int, update_fields: dict) -> Gem:
    try:
        gem = db.query(Gem).filter(Gem.id == gem_id).first()
        if not gem:
            raise HTTPException(status_code=404, detail="Gem not found")
            
        if gem.seller_id != seller_id:
            raise HTTPException(status_code=403, detail="Not authorized to edit this gem")

        for key, value in update_fields.items():
            if value is not None:
                setattr(gem, key, value)

        # Regenerate name if type or color changed
        if "color" in update_fields or "gemstone_type" in update_fields:
            gem.name = f"{gem.color or ''} {gem.gemstone_type or 'Gemstone'}".strip()

        db.commit()
        db.refresh(gem)
        return gem
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
