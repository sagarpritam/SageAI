"""Pytest configuration and fixtures for SageAI tests."""

import uuid

from app.core.rate_limit import limiter

limiter.enabled = False

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.database import Base, get_db
from app.main import app

TEST_DB_URL = "sqlite+aiosqlite:///./test_sageai.db"


@pytest_asyncio.fixture(scope="session")
async def engine():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    import app.core.database
    original_sessionmaker = app.core.database.AsyncSessionLocal
    app.core.database.AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    yield engine

    app.core.database.AsyncSessionLocal = original_sessionmaker
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(engine):
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session):
    """HTTP client with test database injected."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def auth_headers(client):
    """Register a user and return auth headers."""
    test_id = str(uuid.uuid4())[:8]
    email = f"test_{test_id}@sageai.com"
    await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "TestPass123!",
            "organization_name": f"TestOrg_{test_id}",
        },
    )
    r = await client.post(
        "/auth/login",
        json={
            "email": email,
            "password": "TestPass123!",
        },
    )
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
