import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    APP_NAME: str = "SageAI Security Scanner"
    ENV: str = "development"
    DEBUG: bool = True

    # Database — defaults to SQLite for local dev, switch to PostgreSQL for production
    DATABASE_URL: str = "sqlite+aiosqlite:///./sageai.db"

    # JWT
    SECRET_KEY: str = "change-me-in-production-use-a-real-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Rate limiting
    RATE_LIMIT: str = "60/minute"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
