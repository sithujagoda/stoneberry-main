import os
import sys

# Add backend to path so we can import easily
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.database import engine, Base, SessionLocal
from backend.app.models.gem import Gem
from backend.app.models.user import User
from backend.app.models.review import Review, ReviewType
from backend.app.models.purchase_request import PurchaseRequest, PurchaseStatus
from backend.app.models.message import Message
from backend.app.utils.auth import hash_password


def seed_database():
    print("Connecting to database and verifying tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if database is already seeded
        count = db.query(Gem).count()
        if count > 0:
            print(f"Database already contains {count} gems. Seeding skipped.")
            return

        print("Creating mock seller and reviewer users...")
        seller = db.query(User).filter(User.email == "seller@example.com").first()
        if not seller:
            seller = User(
                email="seller@example.com",
                hashed_password=hash_password("password123"),
                firstname="Anura",
                lastname="Rathnayake",
                profile_image_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200",
                is_complete=True
            )
            db.add(seller)
            db.commit()
            db.refresh(seller)
            
        reviewer1 = db.query(User).filter(User.email == "buyer1@example.com").first()
        if not reviewer1:
            reviewer1 = User(
                email="buyer1@example.com",
                hashed_password=hash_password("password123"),
                firstname="David",
                lastname="Chen",
                profile_image_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
                is_complete=True
            )
            db.add(reviewer1)
            
        reviewer2 = db.query(User).filter(User.email == "buyer2@example.com").first()
        if not reviewer2:
            reviewer2 = User(
                email="buyer2@example.com",
                hashed_password=hash_password("password123"),
                firstname="Sarah",
                lastname="Williams",
                profile_image_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
                is_complete=True
            )
            db.add(reviewer2)
            
        db.commit()
        db.refresh(reviewer1)
        db.refresh(reviewer2)

        print("Seeding database with premium Sri Lankan gemstones...")
        gems_data = [
            {
                "name": "Ceylon Royal Blue Sapphire",
                "category": "Blue Sapphire",
                "weight_carat": 4.82,
                "price_usd": 12500.00,
                "origin": "Ratnapura",
                "clarity": "VVS1",
                "cut_style": "Cushion",
                "certificate_url": "NGJA-2026-9812",
                "sunlight_image_url": "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600"
            },
            {
                "name": "Ratnapura Padparadscha Sapphire",
                "category": "Padparadscha",
                "weight_carat": 2.35,
                "price_usd": 8900.00,
                "origin": "Ratnapura",
                "clarity": "VS1",
                "cut_style": "Oval",
                "certificate_url": "NGJA-2026-1049",
                "sunlight_image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600"
            },
            {
                "name": "Elahera Star Ruby",
                "category": "Ruby",
                "weight_carat": 3.50,
                "price_usd": 9500.00,
                "origin": "Elahera",
                "clarity": "VS2",
                "cut_style": "Cabochon",
                "certificate_url": "GIA-64829104",
                "sunlight_image_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600"
            },
            {
                "name": "Golden Yellow Sapphire",
                "category": "Yellow Sapphire",
                "weight_carat": 5.10,
                "price_usd": 6200.00,
                "origin": "Balangoda",
                "clarity": "VVS2",
                "cut_style": "Round",
                "certificate_url": "NGJA-2026-0394",
                "sunlight_image_url": "https://images.unsplash.com/photo-1615655404745-a10c243f1015?q=80&w=600"
            },
            {
                "name": "Ceylon Chrysoberyl Cat's Eye",
                "category": "Cat's Eye",
                "weight_carat": 6.20,
                "price_usd": 14500.00,
                "origin": "Ratnapura",
                "clarity": "IF",
                "cut_style": "Cabochon",
                "certificate_url": "NGJA-2026-8877",
                "sunlight_image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600"
            },
            {
                "name": "Pelmadulla Alexandrite",
                "category": "Alexandrite",
                "weight_carat": 1.85,
                "price_usd": 18000.00,
                "origin": "Ratnapura",
                "clarity": "VS1",
                "cut_style": "Emerald",
                "certificate_url": "GIA-55910234",
                "sunlight_image_url": "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600"
            }
        ]

        for item in gems_data:
            gem = Gem(**item, seller_id=seller.id)
            db.add(gem)
        
        db.commit()

        print("Adding mock purchase requests, messages, and reviews...")
        # Get a couple of gems for the mock transactions
        gem1 = db.query(Gem).filter(Gem.name == "Ceylon Royal Blue Sapphire").first()
        gem2 = db.query(Gem).filter(Gem.name == "Golden Yellow Sapphire").first()

        # 1. COMPLETED Purchase (Buyer 1) -> Leads to Reviews
        if gem1:
            req1 = PurchaseRequest(
                gem_id=gem1.id,
                buyer_id=reviewer1.id,
                seller_id=seller.id,
                status=PurchaseStatus.COMPLETED
            )
            db.add(req1)
            db.commit()
            db.refresh(req1)
            
            # Message history for req1
            db.add_all([
                Message(purchase_request_id=req1.id, sender_id=reviewer1.id, receiver_id=seller.id, content="Hi, is this sapphire still available?"),
                Message(purchase_request_id=req1.id, sender_id=seller.id, receiver_id=reviewer1.id, content="Yes it is, David! It's a beautiful piece."),
                Message(purchase_request_id=req1.id, sender_id=reviewer1.id, receiver_id=seller.id, content="Great, I will purchase it now.")
            ])

            # Buyer reviewing Seller
            db.add(Review(
                purchase_request_id=req1.id,
                target_user_id=seller.id,
                reviewer_id=reviewer1.id,
                review_type=ReviewType.BUYER_REVIEWING_SELLER,
                rating=5,
                comment="Absolutely stunning gemstone. The color is exactly as described and shipping was incredibly secure."
            ))
            # Seller reviewing Buyer
            db.add(Review(
                purchase_request_id=req1.id,
                target_user_id=reviewer1.id,
                reviewer_id=seller.id,
                review_type=ReviewType.SELLER_REVIEWING_BUYER,
                rating=5,
                comment="Great buyer, fast payment. Highly recommended!"
            ))

        # 2. PENDING Purchase (Buyer 2) -> Active negotiation
        if gem2:
            req2 = PurchaseRequest(
                gem_id=gem2.id,
                buyer_id=reviewer2.id,
                seller_id=seller.id,
                status=PurchaseStatus.PENDING
            )
            db.add(req2)
            db.commit()
            db.refresh(req2)
            
            db.add_all([
                Message(purchase_request_id=req2.id, sender_id=reviewer2.id, receiver_id=seller.id, content="Could you do $6000 for this Yellow Sapphire?"),
                Message(purchase_request_id=req2.id, sender_id=seller.id, receiver_id=reviewer2.id, content="I can do $6100, Sarah. Let me know.")
            ])

        db.commit()
        print("Successfully seeded database with 6 gems, 2 purchase requests, messages, and 2 reviews.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
