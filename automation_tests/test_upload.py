import sys
import os
import asyncio

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.utils.storage import upload_file_to_supabase

def test_upload():
    try:
        url = upload_file_to_supabase("gems", b"test content", "test.jpg", "image/jpeg")
        print(f"Upload success! URL: {url}")
    except Exception as e:
        print(f"Upload failed: {e}")

if __name__ == "__main__":
    test_upload()
