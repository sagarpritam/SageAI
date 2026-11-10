"""Regression tests ensuring Alembic migrations work cleanly from an empty database."""

import os
import subprocess
import sys
from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory


def _run_alembic(db_url: str, *args: str) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    env["DATABASE_URL"] = db_url
    return subprocess.run(
        [sys.executable, "-m", "alembic", *args],
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )


def test_alembic_single_head():
    """Verify the Alembic migration graph has a single deterministic head revision."""
    cfg = Config("alembic.ini")
    script = ScriptDirectory.from_config(cfg)
    heads = script.get_heads()
    assert len(heads) == 1, f"Expected 1 Alembic head, found: {heads}"


def test_alembic_upgrade_head_and_check_from_empty_db(tmp_path: Path):
    """Ensure upgrading from a brand-new empty DB reaches head with zero ORM drift."""
    db_file = tmp_path / "fresh_alembic.db"
    # Deliberately use sync sqlite:/// URL to verify env.py normalizes to +aiosqlite
    sync_db_url = f"sqlite:///{db_file.as_posix()}"

    up_res = _run_alembic(sync_db_url, "upgrade", "head")
    assert up_res.returncode == 0, (
        f"alembic upgrade head failed:\n{up_res.stderr}\n{up_res.stdout}"
    )

    check_res = _run_alembic(sync_db_url, "check")
    assert check_res.returncode == 0, (
        f"alembic check failed:\n{check_res.stderr}\n{check_res.stdout}"
    )

    # Verify latest head downgrade & re-upgrade round-trip stays clean
    down_res = _run_alembic(sync_db_url, "downgrade", "-1")
    assert down_res.returncode == 0, (
        f"alembic downgrade -1 failed:\n{down_res.stderr}\n{down_res.stdout}"
    )

    reup_res = _run_alembic(sync_db_url, "upgrade", "head")
    assert reup_res.returncode == 0, (
        f"alembic re-upgrade head failed:\n{reup_res.stderr}\n{reup_res.stdout}"
    )

    recheck_res = _run_alembic(sync_db_url, "check")
    assert recheck_res.returncode == 0, (
        f"alembic re-check failed:\n{recheck_res.stderr}\n{recheck_res.stdout}"
    )
