import os
import sys
from sqlalchemy import create_engine, inspect

# Parse env file manually to be safe
env_dict = {}
env_path = ".env" if os.path.exists(".env") else os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if line and "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            env_dict[k] = v.strip('"\'')

db_url = env_dict.get("DATABASE_URL")
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

print(f"Connecting to: {db_url}")
engine = create_engine(db_url)
inspector = inspect(engine)

try:
    columns = inspector.get_columns("gems")
    print("Columns in 'gems' table:")
    for col in columns:
        print(f"- {col['name']} ({col['type']})")
except Exception as e:
    print(f"Error: {e}")
