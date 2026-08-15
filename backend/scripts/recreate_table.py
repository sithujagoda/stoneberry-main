import sys
import os

# Add the project root to python path so we can import backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.database import engine, Base
from backend.app.models.gem import Gem
from backend.app.models.user import User
from backend.app.models.review import Review
from backend.app.models.purchase_request import PurchaseRequest
from backend.app.models.message import Message

def main():
    print("Dropping all tables...")
    try:
        Base.metadata.drop_all(engine)
        print("All tables dropped successfully.")
    except Exception as e:
        print(f"Error dropping tables: {e}")

    print("Re-creating all tables with the new schema...")
    try:
        Base.metadata.create_all(engine)
        print("All tables created successfully!")
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    main()
