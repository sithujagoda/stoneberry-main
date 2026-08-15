from typing import List
from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from backend.app.models.favorite import Favorite
from backend.app.models.gem import Gem

def toggle_favorite_item(db: Session, user_id: int, gem_id: int) -> bool:
    gem = db.query(Gem).filter(Gem.id == gem_id).first()
    if not gem:
        raise HTTPException(status_code=404, detail="Gem not found")

    existing = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.gem_id == gem_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return False # Removed from favorites
    else:
        new_fav = Favorite(user_id=user_id, gem_id=gem_id)
        db.add(new_fav)
        db.commit()
        return True # Added to favorites

def get_favorites_for_user(db: Session, user_id: int) -> List[Gem]:
    favorites = db.query(Favorite).options(
        joinedload(Favorite.gem).joinedload(Gem.seller)
    ).filter(Favorite.user_id == user_id).order_by(Favorite.created_at.desc()).all()
    
    gems = [f.gem for f in favorites if f.gem]
    return gems
