from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool

from app.core.config import settings

# ---------------------
# Engine & Session
# ---------------------
# Use NullPool for SQLite (doesn't support connection pooling)
# Use QueuePool (default) for PostgreSQL with configured pool size
engine_kwargs = {"echo": settings.DEBUG}

if "sqlite" in settings.DATABASE_URL:
    engine_kwargs["poolclass"] = NullPool
else:
    engine_kwargs["pool_size"] = settings.DB_POOL_SIZE
    engine_kwargs["max_overflow"] = settings.DB_MAX_OVERFLOW
    engine_kwargs["pool_timeout"] = settings.DB_POOL_TIMEOUT
    engine_kwargs["pool_pre_ping"] = True  # detect stale connections

engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


# ---------------------
# Dependency
# ---------------------
async def get_db():
    """FastAPI dependency — yields an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# ---------------------
# Init helper
# ---------------------
async def init_db():
    """Create all tables. Used on app startup."""
    async with engine.begin() as conn:
        from app.models import Organization, User, Scan  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
