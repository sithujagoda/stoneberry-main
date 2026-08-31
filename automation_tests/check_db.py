import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.app.db.session import SessionLocal
from backend.app.models.user import User

db = SessionLocal()
seller = db.query(User).filter(User.email == "seller@example.com").first()
print(f"seller@example.com exists: {seller is not None}")
buyer = db.query(User).filter(User.email == "buyer1@example.com").first()
print(f"buyer1@example.com exists: {buyer is not None}")
db.close()
