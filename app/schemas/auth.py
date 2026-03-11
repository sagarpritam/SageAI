import re
from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    """Registration request body."""

    email: EmailStr
    password: str
    organization_name: str

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r'[^a-zA-Z0-9]', v):
            raise ValueError("Password must contain at least one special character")
        return v


class UserLogin(BaseModel):
    """Login request body."""

    email: EmailStr
    password: str
    mfa_code: str | None = None


class TokenResponse(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"
