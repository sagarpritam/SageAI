import logging
import os

from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

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

            client = boto3.client(
                "secretsmanager", region_name=os.getenv("AWS_REGION", "us-east-1")
            )
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

            client = SecretClient(
                vault_url=azure_vault_url, credential=DefaultAzureCredential()
            )
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
    DEBUG: bool = False

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, v: object) -> bool:
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes", "debug", "dev", "development")
        return bool(v)

    # Internal service communication
    INTERNAL_SERVICE_KEY: str = ""  # Shared secret for Next.js → FastAPI service JWTs
    INTERNAL_ALLOWED_IPS: str = ""  # Comma-separated IPs/CIDRs for internal service allowlist (empty = default private ranges)

    # LLM Keys
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    NVIDIA_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""
    AI_GATEWAY_API_KEY: str = ""
    AI_GATEWAY_URL: str = "https://ai-gateway.vercel.sh/v1"
    RESEND_API_KEY: str = ""
    AUDITOR_BASE_URL: str = "http://localhost:8081"

    # Intelligence & OSINT API Keys
    VIRUSTOTAL_API_KEY: str = ""
    BREACH_API_KEY: str = ""
    BABELX_API_KEY: str = ""
    SOCIAL_LINKS_API_KEY: str = ""
    INTELX_API_KEY: str = ""
    HIBP_API_KEY: str = ""
    OSINT_INDUSTRIES_API_KEY: str = ""
    SHODAN_API_KEY: str = ""
    CENSYS_API_ID: str = ""
    CENSYS_API_SECRET: str = ""

    # War Room / Distributed Events
    KAFKA_BROKERS: str = "localhost:9092"
    REDIS_URL: str = "redis://localhost:6379/1"

    # LLM Configuration
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_MAX_RETRIES: int = 3
    LLM_TIMEOUT: int = 30

    # Tool binary paths (override if not on $PATH)
    SUBFINDER_BIN: str = "subfinder"
    NMAP_BIN: str = "nmap"
    NUCLEI_BIN: str = "nuclei"
    SUBFINDER_TIMEOUT: int = 60
    NMAP_TIMEOUT: int = 120
    NUCLEI_TIMEOUT: int = 180

    # Database — SQLite for dev, PostgreSQL for production
    DATABASE_URL: str = "sqlite+aiosqlite:///./sageai.db"

    # JWT
    SECRET_KEY: str = "change-me-in-production-use-a-real-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Rate limiting (Elevated for enterprise workloads, CI testing, and microservice traffic)
    RATE_LIMIT: str = "1200/minute"
    RATE_LIMIT_BURST: str = "600/minute"
    RATE_LIMIT_SCAN: str = "120/minute"
    RATE_LIMIT_AUTH: str = "60/minute"

    # CORS — comma-separated origins
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    FRONTEND_URL: str = "http://localhost:3000"

    # Payments
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_STARTER_PRICE_ID: str = ""
    STRIPE_PRO_PRICE_ID: str = ""
    STRIPE_ENTERPRISE_PRICE_ID: str = ""

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
                errors.append(
                    "WARNING: SQLite is active in production. For distributed persistence, set DATABASE_URL to PostgreSQL"
                )
            if self.SECRET_KEY == "change-me-in-production-use-a-real-secret-key":
                import secrets

                self.SECRET_KEY = secrets.token_hex(32)
                errors.append(
                    "WARNING: Default SECRET_KEY was auto-rotated with an ephemeral production key"
                )
            if self.CORS_ORIGINS == "*":
                errors.append("WARNING: CORS_ORIGINS='*' is unsafe for production")
            if not self.INTERNAL_SERVICE_KEY or len(self.INTERNAL_SERVICE_KEY) < 32:
                import secrets

                self.INTERNAL_SERVICE_KEY = secrets.token_hex(32)
            if "localhost" in self.FRONTEND_URL:
                errors.append(
                    "WARNING: FRONTEND_URL contains 'localhost' — should be production URL"
                )
            if not self.DEBUG:
                pass  # Good
            else:
                errors.append("WARNING: DEBUG=True in production")
        return errors

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

# Ensure strong internal service key is populated
if not settings.INTERNAL_SERVICE_KEY or len(settings.INTERNAL_SERVICE_KEY) < 32:
    import secrets

    settings.INTERNAL_SERVICE_KEY = secrets.token_hex(32)

# ── Render & Railway DATABASE_URL fix ──────────────
# Render injects `postgres://` and Railway injects `postgresql://`
# SQLAlchemy async needs `postgresql+asyncpg://`
if settings.DATABASE_URL.startswith("postgres://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace(
        "postgres://", "postgresql+asyncpg://", 1
    )
    logger.info(
        "🔄 Auto-converted Render postgres:// DATABASE_URL to use asyncpg driver"
    )
elif (
    settings.DATABASE_URL.startswith("postgresql://")
    and "+asyncpg" not in settings.DATABASE_URL
):
    settings.DATABASE_URL = settings.DATABASE_URL.replace(
        "postgresql://", "postgresql+asyncpg://", 1
    )
    logger.info("🔄 Auto-converted DATABASE_URL to use asyncpg driver")

# Load secrets from vault if available (override .env defaults)
_vault_secret_key = _get_secret("SECRET_KEY")
if _vault_secret_key and _vault_secret_key != settings.SECRET_KEY:
    settings.SECRET_KEY = _vault_secret_key
