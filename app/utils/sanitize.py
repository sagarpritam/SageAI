"""Input sanitization utilities.

Prevents XSS and injection attacks by sanitizing user input.
"""

import re
import html


def sanitize_html(text: str) -> str:
    """Escape HTML entities to prevent XSS."""
    if not text:
        return text
    return html.escape(text, quote=True)


def sanitize_url(url: str) -> str:
    """Validate and sanitize URL input."""
    if not url:
        return url

    # Must start with http:// or https://
    if not re.match(r'^https?://', url, re.IGNORECASE):
        raise ValueError("URL must start with http:// or https://")

    # Remove potentially dangerous characters
    url = url.strip()
    url = re.sub(r'[<>"\'`;]', '', url)

    # Block local/internal addresses
    blocked_patterns = [
        r'localhost', r'127\.0\.0\.1', r'0\.0\.0\.0',
        r'10\.\d+\.\d+\.\d+', r'172\.(1[6-9]|2\d|3[01])\.\d+\.\d+',
        r'192\.168\.\d+\.\d+', r'\[::1\]', r'169\.254\.\d+\.\d+',
    ]
    for pattern in blocked_patterns:
        if re.search(pattern, url, re.IGNORECASE):
            raise ValueError("Scanning internal or private addresses is not allowed")

    return url


def sanitize_email(email: str) -> str:
    """Basic email sanitization."""
    if not email:
        return email

    email = email.strip().lower()
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        raise ValueError("Invalid email format")

    return email


def sanitize_string(text: str, max_length: int = 500) -> str:
    """Sanitize generic string input."""
    if not text:
        return text

    text = text.strip()
    text = sanitize_html(text)

    if len(text) > max_length:
        text = text[:max_length]

    return text
