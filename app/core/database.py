from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.core.config import settings

# ---------------------
# Engine & Session
# ---------------------
engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)

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
