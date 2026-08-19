"""
Migration script to add ai_confidence and ai_explanation columns to the gems table.
Run this inside the backend container:
    python -m backend.scripts.add_ai_columns
"""
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from backend.app.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        # Check if columns already exist
        result = conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = 'gems' AND column_name IN ('ai_confidence', 'ai_explanation')"
        ))
        existing = {row[0] for row in result}
        
        if 'ai_confidence' not in existing:
            conn.execute(text("ALTER TABLE gems ADD COLUMN ai_confidence FLOAT"))
            print("Added ai_confidence column")
        else:
            print("ai_confidence column already exists")
            
        if 'ai_explanation' not in existing:
            conn.execute(text("ALTER TABLE gems ADD COLUMN ai_explanation VARCHAR"))
            print("Added ai_explanation column")
        else:
            print("ai_explanation column already exists")
        
        conn.commit()
        print("Migration complete!")

if __name__ == "__main__":
    migrate()
