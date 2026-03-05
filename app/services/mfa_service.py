"""Multi-Factor Authentication (TOTP) service.

Provides Google Authenticator compatible TOTP setup, QR codes, and verification.
"""

import pyotp
import qrcode
import io
import base64
import secrets


def generate_totp_secret() -> str:
    """Generate a new TOTP secret key."""
    return pyotp.random_base32()


def get_totp_uri(secret: str, email: str) -> str:
    """Generate the provisioning URI for authenticator apps."""
    return pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name="SageAI")


def generate_qr_code(uri: str) -> str:
    """Generate QR code as base64 PNG for frontend display."""
    qr = qrcode.QRCode(version=1, box_size=8, border=2)
    qr.add_data(uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    b64 = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{b64}"


def verify_totp(secret: str, code: str) -> bool:
    """Verify a TOTP code (allows 1 window tolerance)."""
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)


def generate_backup_codes(count: int = 8) -> list[str]:
    """Generate one-time backup codes."""
    return [secrets.token_hex(4).upper() for _ in range(count)]
