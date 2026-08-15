# Backward compatibility proxy importing cleanly from core layer
from backend.app.core.database import engine, SessionLocal, Base, get_db
from backend.app.core.config import settings
