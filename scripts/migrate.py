"""Production-safe database readiness wait & Alembic migration runner for SageAI."""

import asyncio
import os
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.core.config import settings  # noqa: E402
from app.core.database import build_async_engine_config  # noqa: E402


def _masked_url(raw_url: str) -> str:
    parsed = urlparse(raw_url)
    host = parsed.hostname or "local"
    port = f":{parsed.port}" if parsed.port else ""
    return f"{parsed.scheme}://{host}{port}{parsed.path}"


async def wait_for_database(max_attempts: int = 5) -> None:
    raw_url = os.environ.get("DATABASE_URL") or settings.DATABASE_URL
    clean_url, connect_args = build_async_engine_config(raw_url)
    safe_target = _masked_url(clean_url)

    last_err: Exception | None = None
    for attempt in range(1, max_attempts + 1):
        engine = create_async_engine(
            clean_url,
            poolclass=NullPool,
            connect_args=connect_args,
        )
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            print(f"Database connectivity verified ({safe_target})")
            return
        except Exception as exc:
            last_err = exc
            delay = min(attempt * 2, 10)
            print(
                f"Database connection attempt {attempt}/{max_attempts} failed "
                f"({safe_target}): {exc}. Retrying in {delay}s...",
                file=sys.stderr,
            )
            await asyncio.sleep(delay)
        finally:
            await engine.dispose()

    raise RuntimeError(
        f"Database unavailable after {max_attempts} attempts: {last_err}"
    )


def main() -> int:
    asyncio.run(wait_for_database())
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=ROOT_DIR,
        check=False,
    )
    if result.returncode != 0:
        print(
            f"ERROR: 'alembic upgrade head' failed with exit code {result.returncode}",
            file=sys.stderr,
        )
        return result.returncode
    print("Alembic schema migration to head complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
