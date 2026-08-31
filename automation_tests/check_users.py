import os
import sys
import bcrypt

# Add project root to Python path
PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)
sys.path.insert(0, PROJECT_ROOT)

# Load all models first so SQLAlchemy relationships work correctly
from backend.app.models.user import User
from backend.app.models.gem import Gem
from backend.app.models.purchase_request import PurchaseRequest
from backend.app.models.review import Review
from backend.app.models.message import Message
from backend.app.models.cart import CartItem
from backend.app.models.favorite import Favorite
from backend.app.models.notification import Notification

from backend.app.core.database import SessionLocal


def check_seller_password():
    db = SessionLocal()

    try:
        seller = (
            db.query(User)
            .filter(User.email == "jagodasewmini@gmail.com")
            .first()
        )

        if seller is None:
            print("SELLER NOT FOUND")
            return

        print("=" * 60)
        print("SELLER ACCOUNT CHECK")
        print("=" * 60)

        print(f"ID:       {seller.id}")
        print(f"Email:    {seller.email}")
        print(f"Name:     {seller.firstname} {seller.lastname}")

        password = "123456"

        # Check the password against the stored bcrypt hash
        if bcrypt.checkpw(
            password.encode("utf-8"),
            seller.hashed_password.encode("utf-8")
        ):
            print("Password check: PASS")
            print("password123 is correct.")
        else:
            print("Password check: FAIL")
            print("password123 is NOT the password for this account.")

        print("=" * 60)

    finally:
        db.close()


if __name__ == "__main__":
    check_seller_password()