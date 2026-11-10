"""Alembic async migration environment for SageAI."""

import asyncio
import os
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context
from app.core.database import build_async_engine_config, normalize_async_db_url

if env_db_url := os.environ.get("DATABASE_URL"):
    os.environ["DATABASE_URL"] = normalize_async_db_url(env_db_url)

import app.models  # noqa: F401, E402
from app.core.config import settings  # noqa: E402
from app.core.database import Base  # noqa: E402

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Resolve effective DATABASE_URL without triggering ConfigParser % interpolation failures
raw_db_url = os.environ.get("DATABASE_URL") or settings.DATABASE_URL
clean_db_url, db_connect_args = build_async_engine_config(raw_db_url)
if clean_db_url:
    config.set_main_option("sqlalchemy.url", clean_db_url.replace("%", "%%"))

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (SQL script output)."""
    context.configure(
        url=clean_db_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        render_as_batch=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations():
    """Run migrations in 'online' mode with async engine."""
    connectable = create_async_engine(
        clean_db_url,
        poolclass=pool.NullPool,
        connect_args=db_connect_args,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    """Entry point for online migrations."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
