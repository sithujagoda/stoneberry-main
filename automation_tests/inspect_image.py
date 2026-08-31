import sys
import os
import requests

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.review import Review
from backend.app.models.gem import Gem

def inspect():
    db = SessionLocal()
    gem = db.query(Gem).filter(Gem.sunlight_image_url != None).order_by(Gem.id.desc()).first()
    if not gem:
        print("No gem with sunlight_image_url found.")
        return

    url = gem.sunlight_image_url
    print(f"Stored URL: {url}")
    
    # Try to access it directly
    try:
        resp = requests.get(url)
        print(f"HTTP Status: {resp.status_code}")
        print(f"Content-Type: {resp.headers.get('Content-Type')}")
        if resp.status_code != 200:
            print(f"Response snippet: {resp.text[:200]}")
    except Exception as e:
        print(f"Error requesting URL: {e}")

if __name__ == "__main__":
    inspect()
