"""Configuration and security tests."""

import pytest
from app.core.config import Settings


class TestProductionValidation:
    def test_dev_mode_passes(self):
        s = Settings(ENV="development")
        errors = s.validate_production()
        assert len(errors) == 0

    def test_production_rejects_sqlite(self):
        s = Settings(ENV="production", DATABASE_URL="sqlite+aiosqlite:///./test.db")
        errors = s.validate_production()
        assert any("SQLite" in e for e in errors)

    def test_production_rejects_default_secret(self):
        s = Settings(ENV="production", DATABASE_URL="postgresql+asyncpg://x:x@localhost/db")
        errors = s.validate_production()
        assert any("SECRET_KEY" in e for e in errors)

    def test_production_warns_wildcard_cors(self):
        s = Settings(
            ENV="production",
            DATABASE_URL="postgresql+asyncpg://x:x@localhost/db",
            SECRET_KEY="real-production-secret-key-here",
            CORS_ORIGINS="*",
        )
        errors = s.validate_production()
        assert any("CORS" in e for e in errors)

    def test_production_passes_with_good_config(self):
        s = Settings(
            ENV="production",
            DATABASE_URL="postgresql+asyncpg://sageai:pass@db:5432/sageai",
            SECRET_KEY="a-real-secret-key-for-production-use",
            CORS_ORIGINS="https://app.sageai.io",
            DEBUG=False,
        )
        errors = s.validate_production()
        critical = [e for e in errors if "CRITICAL" in e]
        assert len(critical) == 0


class TestCorsOrigins:
    def test_single_origin(self):
        s = Settings(CORS_ORIGINS="https://example.com")
        assert s.cors_origins_list == ["https://example.com"]

    def test_multiple_origins(self):
        s = Settings(CORS_ORIGINS="http://localhost:3000,http://localhost:5173")
        assert len(s.cors_origins_list) == 2

    def test_wildcard(self):
        s = Settings(CORS_ORIGINS="*")
        assert s.cors_origins_list == ["*"]

    def test_strips_whitespace(self):
        s = Settings(CORS_ORIGINS=" http://a.com , http://b.com ")
        assert s.cors_origins_list == ["http://a.com", "http://b.com"]


class TestIsProduction:
    def test_dev(self):
        assert not Settings(ENV="development").is_production

    def test_prod(self):
        assert Settings(ENV="production").is_production
