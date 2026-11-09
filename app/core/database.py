from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings

# ---------------------
# Engine & Session
# ---------------------
# Use NullPool for SQLite (doesn't support connection pooling)
# Use QueuePool (default) for PostgreSQL with configured pool size
engine_kwargs: dict[str, Any] = {"echo": settings.DEBUG}

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


class Base(DeclarativeBase):
    pass


# ---------------------
# Dependency
# ---------------------
async def get_db():
    """FastAPI dependency — yields an async database session with auto-commit/rollback."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ---------------------
# Init helper
# ---------------------
async def init_db():
    """Create all tables. Used on app startup."""
    async with engine.begin() as conn:
        import app.models  # noqa: F401

        await conn.run_sync(Base.metadata.create_all)


# ---------------------
# Observability & Health
# ---------------------
def get_db_pool_status() -> dict[str, Any]:
    """Retrieve connection pool telemetry and runtime health metrics."""
    pool = engine.pool
    is_null_pool = isinstance(pool, NullPool)

    if is_null_pool:
        return {
            "pool_type": "NullPool",
            "dialect": engine.dialect.name,
            "driver": engine.dialect.driver,
            "status": "active",
            "pooling_enabled": False,
        }

    return {
        "pool_type": pool.__class__.__name__,
        "dialect": engine.dialect.name,
        "driver": engine.dialect.driver,
        "status": "active",
        "pooling_enabled": True,
        "size": getattr(pool, "size", lambda: 0)(),
        "checked_in": getattr(pool, "checkedin", lambda: 0)(),
        "checked_out": getattr(pool, "checkedout", lambda: 0)(),
        "overflow": getattr(pool, "overflow", lambda: 0)(),
        "max_overflow": getattr(pool, "_max_overflow", settings.DB_MAX_OVERFLOW),
        "timeout": getattr(pool, "_timeout", settings.DB_POOL_TIMEOUT),
    }


async def check_db_connectivity() -> dict[str, Any]:
    """Execute a low-overhead probe against the database and measure round-trip latency in ms."""
    import time

    from sqlalchemy import text

    start_time = time.perf_counter()
    ok = True
    error_msg = None
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
    except Exception as exc:
        ok = False
        error_msg = str(exc)

    latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
    pool_stats = get_db_pool_status()

    return {
        "database": "connected" if ok else "unreachable",
        "status": "healthy" if ok else "unhealthy",
        "latency_ms": latency_ms,
        "pool": pool_stats,
        "error": error_msg,
    }
