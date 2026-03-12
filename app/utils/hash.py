"""
Utility helpers for deterministic hashing.
"""

import hashlib

def deterministic_sha256(text: str, length: int = 12) -> str:
    """
    Return the first *length* hexadecimal characters of a SHA‑256 digest.
    Used as a safe replacement for MD5 where a short, deterministic identifier
    is required.
    """
    return hashlib.sha256(text.encode()).hexdigest()[:length]
