# Backward compatibility proxy importing cleanly from core/security layer
from backend.app.core.security import hash_password, verify_password, create_access_token, decode_access_token
