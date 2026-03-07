import os
import logging
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("SageAI.config")


def _fetch_vault_secret(key: str) -> str | None:
    """Attempt to fetch a secret from an external vault.

    Supports AWS Secrets Manager, Azure Key Vault, and HashiCorp Vault
    based on environment variables. Returns None if no vault is configured.
    """
    # AWS Secrets Manager
    aws_secret_name = os.getenv("AWS_SECRET_NAME")
    if aws_secret_name:
        try:
            import boto3
            client = boto3.client("secretsmanager", region_name=os.getenv("AWS_REGION", "us-east-1"))
            resp = client.get_secret_value(SecretId=aws_secret_name)
            import json
            secrets = json.loads(resp["SecretString"])
            return secrets.get(key)
        except Exception as e:
            logger.warning(f"AWS Secrets Manager lookup failed for '{key}': {e}")

    # Azure Key Vault
    azure_vault_url = os.getenv("AZURE_VAULT_URL")
    if azure_vault_url:
        try:
            from azure.identity import DefaultAzureCredential
            from azure.keyvault.secrets import SecretClient
            client = SecretClient(vault_url=azure_vault_url, credential=DefaultAzureCredential())
            return client.get_secret(key).value
        except Exception as e:
            logger.warning(f"Azure Key Vault lookup failed for '{key}': {e}")

    # HashiCorp Vault
    vault_addr = os.getenv("VAULT_ADDR")
    vault_token = os.getenv("VAULT_TOKEN")
    if vault_addr and vault_token:
        try:
            import httpx
            resp = httpx.get(
                f"{vault_addr}/v1/secret/data/sageai",
                headers={"X-Vault-Token": vault_token},
            )
            data = resp.json().get("data", {}).get("data", {})
            return data.get(key)
        except Exception as e:
            logger.warning(f"HashiCorp Vault lookup failed for '{key}': {e}")

    return None


def _get_secret(key: str, default: str = "") -> str:
    """Get a secret: env var → vault → default."""
    value = os.getenv(key)
    if value:
        return value
    vault_value = _fetch_vault_secret(key)
    if vault_value:
        return vault_value
    return default


class Settings(BaseSettings):
    """Application settings loaded from environment variables or secret vaults."""

    APP_NAME: str = "SageAI Security Scanner"
    ENV: str = "development"
    DEBUG: bool = True

    # Database — SQLite for dev, PostgreSQL for production
    DATABASE_URL: str = "sqlite+aiosqlite:///./sageai.db"

    # JWT
    SECRET_KEY: str = "change-me-in-production-use-a-real-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Rate limiting
    RATE_LIMIT: str = "60/minute"

    # CORS — comma-separated origins
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    FRONTEND_URL: str = "http://localhost:5173"

    # Database connection pool (PostgreSQL only)
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30

    @property
    def is_production(self) -> bool:
        return self.ENV == "production"

    @property
    def cors_origins_list(self) -> list[str]:
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    def validate_production(self) -> list[str]:
        """Validate that production-critical settings are configured. Returns list of errors."""
        errors = []
        if self.is_production:
            if "sqlite" in self.DATABASE_URL:
                errors.append("CRITICAL: SQLite is not supported in production. Set DATABASE_URL to PostgreSQL")
            if self.SECRET_KEY == "change-me-in-production-use-a-real-secret-key":
                errors.append("CRITICAL: SECRET_KEY must be changed for production")
            if self.CORS_ORIGINS == "*":
                errors.append("WARNING: CORS_ORIGINS='*' is unsafe for production")
            if not self.DEBUG:
                pass  # Good
            else:
                errors.append("WARNING: DEBUG=True in production")
        return errors

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# ── Railway DATABASE_URL fix ──────────────────────
# Railway injects `postgresql://` but SQLAlchemy async needs `postgresql+asyncpg://`
if settings.DATABASE_URL.startswith("postgresql://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace(
        "postgresql://", "postgresql+asyncpg://", 1
    )
    logger.info("🔄 Auto-converted DATABASE_URL to use asyncpg driver")
elif settings.DATABASE_URL.startswith("postgres://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace(
        "postgres://", "postgresql+asyncpg://", 1
    )
    logger.info("🔄 Auto-converted DATABASE_URL to use asyncpg driver")

# Load secrets from vault if available (override .env defaults)
_vault_secret_key = _get_secret("SECRET_KEY")
if _vault_secret_key and _vault_secret_key != settings.SECRET_KEY:
    settings.SECRET_KEY = _vault_secret_key
