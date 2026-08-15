from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    auth,
    gems,
    cart,
    favorites,
    purchases,
    messages,
    reviews,
    notifications,
    users
)

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(gems.router)
api_router.include_router(cart.router)
api_router.include_router(favorites.router)
api_router.include_router(purchases.router)
api_router.include_router(messages.router)
api_router.include_router(reviews.router)
api_router.include_router(notifications.router)
api_router.include_router(users.router)
