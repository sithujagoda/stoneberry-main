import os
import uuid
from supabase import create_client, Client
from backend.app.core.config import settings

supabase: Client | None = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def upload_file_to_supabase(bucket: str, file_bytes: bytes, filename: str, content_type: str) -> str:
    """
    Uploads a file to a Supabase Storage bucket and returns the public URL.
    Falls back to a fake URL if Supabase credentials are not provided.
    """
    if not supabase:
        print("Warning: SUPABASE_URL or SUPABASE_KEY not set in .env. Returning fake URL.")
        return f"https://fake.supabase.co/storage/v1/object/public/{bucket}/{uuid.uuid4().hex}_{filename}"
        
    # Generate unique filename to avoid collisions
    ext = filename.split('.')[-1] if '.' in filename else ''
    unique_filename = f"{uuid.uuid4().hex}.{ext}" if ext else uuid.uuid4().hex
    
    try:
        # Upload file
        res = supabase.storage.from_(bucket).upload(
            unique_filename,
            file_bytes,
            file_options={"content-type": content_type}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(bucket).get_public_url(unique_filename)
        return public_url
    except Exception as e:
        print(f"Error uploading to Supabase: {e}")
        raise e
