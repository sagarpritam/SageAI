import base64
import os
from cryptography.fernet import Fernet
from app.core.config import settings

def _get_encryption_key() -> bytes:
    """Gets a valid 32-url-safe-base64-encoded bytes key from settings.SECRET_KEY.
    Pad or truncate the SECRET_KEY to 32 bytes and base64 encode it so Fernet accepts it.
    """
    secret = settings.SECRET_KEY.encode("utf-8")
    # Truncate or pad to exactly 32 bytes
    if len(secret) < 32:
        secret = secret.ljust(32, b"0")
    else:
        secret = secret[:32]
    return base64.urlsafe_b64encode(secret)

_cipher = Fernet(_get_encryption_key())

def encrypt(data: str) -> str:
    """Encrypts a plaintext string to an encrypted string."""
    if not data:
        return ""
    return _cipher.encrypt(data.encode("utf-8")).decode("utf-8")

def decrypt(token_encrypted: str) -> str:
    """Decrypts an encrypted string back to plaintext."""
    if not token_encrypted:
        return ""
    try:
        return _cipher.decrypt(token_encrypted.encode("utf-8")).decode("utf-8")
    except Exception as e:
        # Avoid crashing completely, return empty string if decryption fails
        # e.g., if SECRET_KEY was rotated
        import logging
        logging.getLogger("SageAI.encryption").error(f"Failed to decrypt token: {e}")
        return ""
