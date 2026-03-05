from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """Registration request body."""
    email: EmailStr
    password: str
    organization_name: str


class UserLogin(BaseModel):
    """Login request body."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
