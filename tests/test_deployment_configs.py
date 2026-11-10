"""Regression tests for deployment manifests, DB URL normalization, and packaging parity."""

import json
import pathlib
import tomllib

import yaml

from app.core.database import build_async_engine_config, normalize_async_db_url

ROOT = pathlib.Path(__file__).resolve().parent.parent


def test_normalize_async_db_url_variants():
    assert (
        normalize_async_db_url("postgres://u:p@host:5432/db")
        == "postgresql+asyncpg://u:p@host:5432/db"
    )
    assert (
        normalize_async_db_url("postgresql://u:p@host:5432/db")
        == "postgresql+asyncpg://u:p@host:5432/db"
    )
    assert (
        normalize_async_db_url("sqlite:///./sageai.db")
        == "sqlite+aiosqlite:///./sageai.db"
    )


def test_build_async_engine_config_supabase_and_ssl_params():
    clean_url, connect_args = build_async_engine_config(
        "postgres://postgres.proj:p%40ss@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
    )
    assert clean_url.startswith("postgresql+asyncpg://")
    assert "sslmode=" not in clean_url
    assert "pgbouncer=" not in clean_url
    assert connect_args["ssl"] == "require"
    assert connect_args["statement_cache_size"] == 0

    direct_url, direct_args = build_async_engine_config(
        "postgresql://user:pass@localhost:5432/sageai"
    )
    assert direct_url == "postgresql+asyncpg://user:pass@localhost:5432/sageai"
    assert direct_args == {}

    disabled_url, disabled_args = build_async_engine_config(
        "postgresql://user:pass@localhost:5432/sageai?sslmode=disable"
    )
    assert disabled_url == "postgresql+asyncpg://user:pass@localhost:5432/sageai"
    assert disabled_args == {"ssl": "disable"}


def test_shell_scripts_use_lf_line_endings():
    for rel_path in (
        "docker-entrypoint.sh",
        "scripts/entrypoint.sh",
        "deploy.sh",
        "scripts/deploy.sh",
    ):
        raw = (ROOT / rel_path).read_bytes()
        assert b"\r\n" not in raw, f"CRLF detected in {rel_path}"


def test_deployment_manifests_and_vercel_monorepo_integrity():
    root_pkg = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    assert "workspaces" not in root_pkg

    root_vercel = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
    assert root_vercel["framework"] == "nextjs"
    assert root_vercel["outputDirectory"] == "sage-web/.next"

    next_cfg = (ROOT / "sage-web" / "next.config.ts").read_text(encoding="utf-8")
    assert 'path.resolve(__dirname, "..")' not in next_cfg

    # Validate Kubernetes manifests
    frontend_docs = list(
        yaml.safe_load_all((ROOT / "k8s" / "frontend.yaml").read_text(encoding="utf-8"))
    )
    dep, svc = frontend_docs[0], frontend_docs[1]
    container = dep["spec"]["template"]["spec"]["containers"][0]
    assert container["ports"][0]["containerPort"] == 3000
    assert container["readinessProbe"]["httpGet"]["port"] == 3000
    assert svc["spec"]["ports"][0]["targetPort"] == 3000

    ingress = yaml.safe_load(
        (ROOT / "k8s" / "ingress.yaml").read_text(encoding="utf-8")
    )
    paths = [p["path"] for p in ingress["spec"]["rules"][0]["http"]["paths"]]
    assert "/scan" not in paths
    assert "/health" in paths

    nginx_conf = (ROOT / "docker" / "nginx.conf").read_text(encoding="utf-8")
    assert "location /scan " not in nginx_conf
    assert (
        "http://backend:8000;"
        not in nginx_conf.split("Content-Security-Policy")[1].splitlines()[0]
    )

    railway_json = json.loads((ROOT / "railway.json").read_text(encoding="utf-8"))
    assert "scripts/migrate.py" in railway_json["deploy"]["startCommand"]
    railway_toml = tomllib.loads((ROOT / "railway.toml").read_text(encoding="utf-8"))
    assert "scripts/migrate.py" in railway_toml["deploy"]["startCommand"]

    render_cfg = yaml.safe_load((ROOT / "render.yaml").read_text(encoding="utf-8"))
    assert "scripts/migrate.py" in render_cfg["services"][0]["startCommand"]

    for compose_rel in (
        "docker-compose.yml",
        "docker-compose.prod.yml",
        "docker/docker-compose.yml",
    ):
        compose_doc = yaml.safe_load((ROOT / compose_rel).read_text(encoding="utf-8"))
        assert "backend" in compose_doc["services"]
        assert "frontend" in compose_doc["services"]

    dockerignore = (ROOT / ".dockerignore").read_text(encoding="utf-8").splitlines()
    assert "sage-web/" not in dockerignore
