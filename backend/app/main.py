import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from backend.app.core.database import engine, Base
from backend.app.core.exceptions import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)
from backend.app.core.middleware import log_response_time
from backend.app.api.v1.api_router import api_router

# Ensure models are registered in Base.metadata
from backend.app.models.user import User
from backend.app.models.gem import Gem
from backend.app.models.cart import CartItem
from backend.app.models.favorite import Favorite
from backend.app.models.purchase_request import PurchaseRequest
from backend.app.models.message import Message
from backend.app.models.review import Review
from backend.app.models.notification import Notification

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("gem-marketplace")

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    logger.warning(f"Database table check/creation skipped due to connection issue: {e}")

app = FastAPI(
    title="Ceylon Gem Marketplace API",
    description="Backend API for the Sri Lankan Gem Marketplace (Clean Architecture)",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Middleware and Exception Handlers
app.middleware("http")(log_response_time)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include API V1 Router
app.include_router(api_router)

@app.get("/")
def read_root():
    return {
        "success": True,
        "error": None,
        "data": {
            "message": "Welcome to Ceylon Gem Marketplace API",
            "status": "online"
        },
        "resolution": "Api is running normally. Use /docs to view Swagger documentation."
    }
