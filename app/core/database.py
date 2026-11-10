from typing import Any
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings


def normalize_async_db_url(raw_url: str) -> str:
    """Normalize sync Postgres/SQLite URLs to async drivers required by SQLAlchemy async."""
    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
    if raw_url.startswith("postgresql://") and "+asyncpg" not in raw_url:
        return raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if raw_url.startswith("sqlite://") and "+aiosqlite" not in raw_url:
        return raw_url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    return raw_url


def build_async_engine_config(raw_url: str) -> tuple[str, dict[str, Any]]:
    """Strip unsupported asyncpg query args and map TLS/PgBouncer flags into connect_args."""
    url = normalize_async_db_url(raw_url)
    if "sqlite" in url:
        return url, {}

    parsed = urlparse(url)
    query = parse_qs(parsed.query, keep_blank_values=True)
    connect_args: dict[str, Any] = {}

    sslmode_vals = query.pop("sslmode", None)
    sslmode = sslmode_vals[0].lower() if sslmode_vals else ""
    query.pop("channel_binding", None)
    pgbouncer_vals = query.pop("pgbouncer", None)
    pgbouncer = pgbouncer_vals[0].lower() if pgbouncer_vals else ""
    query.pop("supa", None)
    stmt_cache_vals = query.pop(
        "statement_cache_size", query.pop("prepared_statement_cache_size", None)
    )
    query.pop("prepared_statement_cache_size", None)

    host = (parsed.hostname or "").lower()
    is_managed_tls_host = any(
        suffix in host
        for suffix in (".supabase.co", ".supabase.com", ".neon.tech", ".render.com")
    )
    if sslmode and sslmode != "disable":
        connect_args["ssl"] = sslmode
    elif sslmode == "disable":
        connect_args["ssl"] = "disable"
    elif is_managed_tls_host:
        connect_args["ssl"] = "require"

    is_pgbouncer = (
        pgbouncer == "true" or parsed.port == 6543 or ".pooler.supabase." in host
    )
    if stmt_cache_vals:
        connect_args["statement_cache_size"] = int(stmt_cache_vals[0])
    elif is_pgbouncer:
        connect_args["statement_cache_size"] = 0

    clean_query = urlencode(query, doseq=True)
    clean_url = urlunparse(parsed._replace(query=clean_query))
    return clean_url, connect_args


# ---------------------
# Engine & Session
# ---------------------
# Use NullPool for SQLite (doesn't support connection pooling)
# Use QueuePool (default) for PostgreSQL with configured pool size
clean_db_url, _db_connect_args = build_async_engine_config(settings.DATABASE_URL)
engine_kwargs: dict[str, Any] = {"echo": settings.DEBUG}

if "sqlite" in clean_db_url:
    engine_kwargs["poolclass"] = NullPool
else:
    engine_kwargs["pool_size"] = settings.DB_POOL_SIZE
    engine_kwargs["max_overflow"] = settings.DB_MAX_OVERFLOW
    engine_kwargs["pool_timeout"] = settings.DB_POOL_TIMEOUT
    engine_kwargs["pool_pre_ping"] = True  # detect stale connections
    if _db_connect_args:
        engine_kwargs["connect_args"] = _db_connect_args

engine = create_async_engine(clean_db_url, **engine_kwargs)

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
    """Create all tables safely. Uses PostgreSQL advisory lock when initializing Postgres."""
    import app.models  # noqa: F401

    if engine.dialect.name == "postgresql":
        async with engine.begin() as conn:
            res = await conn.execute(text("SELECT to_regclass('public.users')"))
            if res.scalar() is not None:
                return
            await conn.execute(text("SELECT pg_advisory_xact_lock(7423901)"))
            await conn.run_sync(Base.metadata.create_all)
        return

    async with engine.begin() as conn:
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
