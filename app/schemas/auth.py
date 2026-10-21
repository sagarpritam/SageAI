import re

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


def validate_password_complexity(v: str) -> str:
    """Validate that password meets complexity standards."""
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", v):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", v):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"\d", v):
        raise ValueError("Password must contain at least one digit")
    if not re.search(r"[^a-zA-Z0-9]", v):
        raise ValueError("Password must contain at least one special character")
    return v


class UserCreate(BaseModel):
    """Registration request body."""

    email: EmailStr
    password: str
    organization_name: str

    model_config = ConfigDict(extra="forbid")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        return validate_password_complexity(v)


class UserLogin(BaseModel):
    """Login request body."""

    email: EmailStr
    password: str
    mfa_code: str | None = None

    model_config = ConfigDict(extra="forbid")


class ForgotPasswordRequest(BaseModel):
    """Forgot password request body."""

    email: EmailStr

    model_config = ConfigDict(extra="forbid")


class ResetPasswordRequest(BaseModel):
    """Reset password request body."""

    token: str
    new_password: str

    model_config = ConfigDict(extra="forbid")

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, v: str) -> str:
        return validate_password_complexity(v)


class MFACodeRequest(BaseModel):
    """MFA code verification request body."""

    code: str

    model_config = ConfigDict(extra="forbid")


class TokenResponse(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"
