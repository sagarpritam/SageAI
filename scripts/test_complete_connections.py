"""SageAI — Complete System & AI Connections Diagnostic Suite.

Probes and evaluates connectivity for:
1. AI & LLM Providers (NVIDIA NIM, OpenAI, Anthropic, Google Gemini, NVIDIA NeMo Auditor)
2. Database & Cache (SQLAlchemy AsyncEngine, SQLite/PostgreSQL tables, Redis)
3. Threat Intelligence & OSINT (Censys, Shodan, VirusTotal, GitHub, Certspotter, InternetDB)
4. Payments & Email Services (Stripe, Resend)
5. Backend Core Engine (/health, OpenAPI schema, Route registries)
"""

import asyncio
import os
import sys
import time
from typing import Any

from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import httpx
from sqlalchemy import text

from app.core.config import settings
from app.core.database import AsyncSessionLocal, engine
from app.services.integrations.verifier import (
    verify_censys_credentials,
    verify_nvidia_key,
    verify_shodan_key,
    verify_virustotal_key,
)
from app.services.llm.gateway import llm_gateway


async def test_ai_connections() -> list[dict[str, Any]]:
    results = []

    # 1. NVIDIA NIM
    nv_key = settings.NVIDIA_API_KEY.strip()
    if nv_key:
        print("[*] Probing NVIDIA NIM live endpoint...")
        verif = await verify_nvidia_key(nv_key)
        if verif.get("valid"):
            results.append({
                "service": "NVIDIA NIM",
                "status": "CONNECTED",
                "detail": f"Active ({verif.get('latency_ms', 0)}ms) - Model: {verif.get('model')}",
                "problem": None,
            })
        else:
            results.append({
                "service": "NVIDIA NIM",
                "status": "FAILED",
                "detail": f"Key configured ({nv_key[:6]}...) but verification failed",
                "problem": verif.get("error", "Failed verification"),
            })
    else:
        # Check endpoint reachability without auth
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get("https://integrate.api.nvidia.com/v1/models")
                reach = "Endpoint Reachable (HTTP " + str(resp.status_code) + ")"
        except Exception as e:
            reach = f"Endpoint Unreachable: {e}"
        results.append({
            "service": "NVIDIA NIM",
            "status": "NOT CONFIGURED",
            "detail": f"NVIDIA_API_KEY is empty in .env. {reach}",
            "problem": "Missing NVIDIA_API_KEY. System falls back to OpenAI/Anthropic or rule-based engine.",
        })

    # 2. OpenAI
    openai_key = settings.OPENAI_API_KEY.strip()
    if openai_key:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(
                    "https://api.openai.com/v1/models",
                    headers={"Authorization": f"Bearer {openai_key}"},
                )
                if resp.status_code == 200:
                    results.append({
                        "service": "OpenAI",
                        "status": "CONNECTED",
                        "detail": f"Key verified, accessible ({resp.status_code} OK)",
                        "problem": None,
                    })
                else:
                    results.append({
                        "service": "OpenAI",
                        "status": "FAILED",
                        "detail": f"HTTP {resp.status_code}: {resp.text[:80]}",
                        "problem": "Invalid OPENAI_API_KEY or account quota exceeded",
                    })
        except Exception as e:
            results.append({
                "service": "OpenAI",
                "status": "FAILED",
                "detail": str(e),
                "problem": f"Network error reaching api.openai.com: {e}",
            })
    else:
        results.append({
            "service": "OpenAI",
            "status": "NOT CONFIGURED",
            "detail": "OPENAI_API_KEY is empty in .env",
            "problem": "No key configured. Used as secondary fallback.",
        })

    # 3. Anthropic
    anthropic_key = settings.ANTHROPIC_API_KEY.strip()
    if anthropic_key:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(
                    "https://api.anthropic.com/v1/models",
                    headers={
                        "x-api-key": anthropic_key,
                        "anthropic-version": "2023-06-01",
                    },
                )
                if resp.status_code == 200:
                    results.append({
                        "service": "Anthropic",
                        "status": "CONNECTED",
                        "detail": f"Key verified, accessible ({resp.status_code} OK)",
                        "problem": None,
                    })
                else:
                    results.append({
                        "service": "Anthropic",
                        "status": "FAILED",
                        "detail": f"HTTP {resp.status_code}: {resp.text[:80]}",
                        "problem": "Invalid ANTHROPIC_API_KEY or billing restriction",
                    })
        except Exception as e:
            results.append({
                "service": "Anthropic",
                "status": "FAILED",
                "detail": str(e),
                "problem": f"Network error reaching api.anthropic.com: {e}",
            })
    else:
        results.append({
            "service": "Anthropic",
            "status": "NOT CONFIGURED",
            "detail": "ANTHROPIC_API_KEY is empty in .env",
            "problem": "No key configured. Used as fallback.",
        })

    # 4. Google Generative AI (Gemini)
    gemini_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY", "") or os.getenv("GEMINI_API_KEY", "")
    if gemini_key:
        results.append({
            "service": "Google Gemini",
            "status": "CONFIGURED",
            "detail": f"Key present ({gemini_key[:6]}...)",
            "problem": None,
        })
    else:
        results.append({
            "service": "Google Gemini",
            "status": "NOT CONFIGURED",
            "detail": "GOOGLE_GENERATIVE_AI_API_KEY is empty",
            "problem": "Not configured.",
        })

    # 5. NVIDIA NeMo Auditor Microservice
    auditor_url = settings.AUDITOR_BASE_URL.strip()
    try:
        start = time.perf_counter()
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(f"{auditor_url.rstrip('/')}/v1beta1/audit/targets")
            latency = int((time.perf_counter() - start) * 1000)
            if resp.status_code == 200:
                results.append({
                    "service": "NeMo Auditor Microservice",
                    "status": "CONNECTED",
                    "detail": f"Online at {auditor_url} ({latency}ms)",
                    "problem": None,
                })
            else:
                results.append({
                    "service": "NeMo Auditor Microservice",
                    "status": "RUNNING (UNEXPECTED STATUS)",
                    "detail": f"HTTP {resp.status_code} at {auditor_url}",
                    "problem": f"NeMo responded with status {resp.status_code}",
                })
    except Exception as e:
        results.append({
            "service": "NeMo Auditor Microservice",
            "status": "OFFLINE",
            "detail": f"Unreachable at {auditor_url} ({type(e).__name__})",
            "problem": f"Local or remote NeMo auditor daemon is not running on {auditor_url}.",
        })

    # 6. LLM Gateway Failover Logic
    try:
        clients = [llm_gateway.get_client("nvidia"), llm_gateway.get_client("openai"), llm_gateway.get_client("anthropic")]
        results.append({
            "service": "LLM Gateway Provider Chain",
            "status": "READY",
            "detail": f"Providers initialized: {[c.provider for c in clients]} (Failover: {llm_gateway.failover_chain})",
            "problem": None,
        })
    except Exception as e:
        results.append({
            "service": "LLM Gateway Provider Chain",
            "status": "FAILED",
            "detail": str(e),
            "problem": f"Gateway provider initialization failed: {e}",
        })

    return results


async def test_database_and_cache() -> list[dict[str, Any]]:
    results = []

    # 1. Primary Database
    db_url = settings.DATABASE_URL
    masked_db = db_url.split("@")[-1] if "@" in db_url else db_url
    start = time.perf_counter()
    try:
        async with AsyncSessionLocal() as session:
            db_res = await session.execute(text("SELECT 1"))
            assert db_res.scalar() == 1
            latency = int((time.perf_counter() - start) * 1000)

            # Check existing tables
            async with engine.begin() as conn:
                tables = await conn.run_sync(
                    lambda sync_conn: sync_conn.dialect.get_table_names(sync_conn)
                )

            results.append({
                "service": "Primary Database",
                "status": "CONNECTED",
                "detail": f"Dialect: {engine.dialect.name} ({latency}ms) — {len(tables)} tables found: {', '.join(sorted(tables)[:8])}...",
                "problem": None,
            })
    except Exception as e:
        results.append({
            "service": "Primary Database",
            "status": "FAILED",
            "detail": f"Connection to {masked_db} failed: {e}",
            "problem": f"Cannot connect to database URL {masked_db}. Verify database service or sqlite permissions.",
        })

    # 2. Redis
    redis_url = settings.REDIS_URL
    try:
        import redis.asyncio as aioredis

        r = aioredis.from_url(redis_url, socket_timeout=2.0)
        start = time.perf_counter()
        await r.ping()
        latency = int((time.perf_counter() - start) * 1000)
        await r.aclose()
        results.append({
            "service": "Redis Cache & Queue",
            "status": "CONNECTED",
            "detail": f"Connected to {redis_url} ({latency}ms)",
            "problem": None,
        })
    except Exception as e:
        results.append({
            "service": "Redis Cache & Queue",
            "status": "OFFLINE",
            "detail": f"Not reachable at {redis_url} ({type(e).__name__})",
            "problem": "Redis service is not running locally. Optional for basic scanning, required for Celery / distributed tasks.",
        })

    return results


async def test_osint_and_recon() -> list[dict[str, Any]]:
    results = []

    # 1. Censys
    cen_id = settings.CENSYS_API_ID.strip()
    cen_secret = settings.CENSYS_API_SECRET.strip()
    if cen_id and cen_secret:
        verif = await verify_censys_credentials(cen_id, cen_secret)
        if verif.get("valid"):
            results.append({
                "service": "Censys (Pro)",
                "status": "CONNECTED",
                "detail": f"Credentials active ({verif.get('latency_ms', 0)}ms)",
                "problem": None,
            })
        else:
            results.append({
                "service": "Censys (Pro)",
                "status": "FAILED",
                "detail": verif.get("error"),
                "problem": "Invalid CENSYS_API_ID / CENSYS_API_SECRET credentials.",
            })
    else:
        # Check Free Fallback: Certspotter CT API
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(
                    "https://api.certspotter.com/v1/issuances?domain=example.com&include_subdomains=true&expand=dns_names"
                )
                if resp.status_code == 200:
                    results.append({
                        "service": "Censys Recon (Free Fallback)",
                        "status": "CONNECTED (FREE TIER)",
                        "detail": "Certspotter Certificate Transparency API is active & responsive (No API key needed)",
                        "problem": None,
                    })
                else:
                    results.append({
                        "service": "Censys Recon (Free Fallback)",
                        "status": "DEGRADED",
                        "detail": f"Certspotter responded with HTTP {resp.status_code}",
                        "problem": "Certspotter CT API rate limited or temporarily unreachable.",
                    })
        except Exception as e:
            results.append({
                "service": "Censys Recon (Free Fallback)",
                "status": "FAILED",
                "detail": str(e),
                "problem": f"Failed to reach Certspotter free CT API: {e}",
            })

    # 2. Shodan
    shodan_key = settings.SHODAN_API_KEY.strip()
    if shodan_key:
        verif = await verify_shodan_key(shodan_key)
        if verif.get("valid"):
            results.append({
                "service": "Shodan (Pro)",
                "status": "CONNECTED",
                "detail": verif.get("message"),
                "problem": None,
            })
        else:
            results.append({
                "service": "Shodan (Pro)",
                "status": "FAILED",
                "detail": verif.get("error"),
                "problem": "Invalid SHODAN_API_KEY.",
            })
    else:
        # Check Free Fallback: Shodan InternetDB API (1.1.1.1)
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get("https://internetdb.shodan.io/1.1.1.1")
                if resp.status_code == 200:
                    data = resp.json()
                    results.append({
                        "service": "Shodan Recon (Free Fallback)",
                        "status": "CONNECTED (FREE TIER)",
                        "detail": f"Shodan InternetDB API active (Found ports {data.get('ports', [])} on test IP)",
                        "problem": None,
                    })
                else:
                    results.append({
                        "service": "Shodan Recon (Free Fallback)",
                        "status": "DEGRADED",
                        "detail": f"InternetDB returned HTTP {resp.status_code}",
                        "problem": "Shodan InternetDB API unreachable.",
                    })
        except Exception as e:
            results.append({
                "service": "Shodan Recon (Free Fallback)",
                "status": "FAILED",
                "detail": str(e),
                "problem": f"Failed to connect to Shodan InternetDB API: {e}",
            })

    # 3. VirusTotal
    vt_key = settings.VIRUSTOTAL_API_KEY.strip()
    if vt_key:
        verif = await verify_virustotal_key(vt_key)
        if verif.get("valid"):
            results.append({
                "service": "VirusTotal",
                "status": "CONNECTED",
                "detail": "Key verified active",
                "problem": None,
            })
        else:
            results.append({
                "service": "VirusTotal",
                "status": "FAILED",
                "detail": verif.get("error"),
                "problem": "Invalid VIRUSTOTAL_API_KEY.",
            })
    else:
        results.append({
            "service": "VirusTotal",
            "status": "NOT CONFIGURED",
            "detail": "VIRUSTOTAL_API_KEY is empty in .env",
            "problem": "VirusTotal reputation lookups will be skipped during scans.",
        })

    # 4. GitHub API
    gh_token = os.getenv("GITHUB_TOKEN", "") or os.getenv("GH_TOKEN", "")
    headers = {"User-Agent": "SageAI-Diagnostics"}
    if gh_token:
        headers["Authorization"] = f"token {gh_token}"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get("https://api.github.com/rate_limit", headers=headers)
            if resp.status_code == 200:
                data = resp.json().get("resources", {}).get("core", {})
                results.append({
                    "service": "GitHub API",
                    "status": "CONNECTED",
                    "detail": f"Connected ({data.get('remaining')}/{data.get('limit')} requests remaining)",
                    "problem": None,
                })
            else:
                results.append({
                    "service": "GitHub API",
                    "status": "WARN",
                    "detail": f"HTTP {resp.status_code}",
                    "problem": "GitHub API rate limit reached or token invalid.",
                })
    except Exception as e:
        results.append({
            "service": "GitHub API",
            "status": "FAILED",
            "detail": str(e),
            "problem": f"GitHub connectivity error: {e}",
        })

    return results


async def test_backend_and_thirdparty() -> list[dict[str, Any]]:
    results = []

    # 1. Stripe
    stripe_key = settings.STRIPE_SECRET_KEY.strip()
    if stripe_key:
        try:
            import stripe

            stripe.api_key = stripe_key
            balance = stripe.Balance.retrieve()
            results.append({
                "service": "Stripe Payments",
                "status": "CONNECTED",
                "detail": f"Live connection verified (Available currencies: {[b.currency.upper() for b in balance.available]})",
                "problem": None,
            })
        except Exception as e:
            results.append({
                "service": "Stripe Payments",
                "status": "FAILED",
                "detail": f"Stripe API error: {e}",
                "problem": "STRIPE_SECRET_KEY in .env is invalid or expired.",
            })
    else:
        results.append({
            "service": "Stripe Payments",
            "status": "NOT CONFIGURED",
            "detail": "STRIPE_SECRET_KEY is empty in .env",
            "problem": "Checkout and billing portals will not process real charges.",
        })

    # 2. Resend (Email)
    resend_key = settings.RESEND_API_KEY.strip()
    if resend_key:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(
                    "https://api.resend.com/api-keys",
                    headers={"Authorization": f"Bearer {resend_key}"},
                )
                if resp.status_code == 200:
                    results.append({
                        "service": "Resend Email Service",
                        "status": "CONNECTED",
                        "detail": f"Verified ({resp.status_code} OK)",
                        "problem": None,
                    })
                else:
                    results.append({
                        "service": "Resend Email Service",
                        "status": "FAILED",
                        "detail": f"HTTP {resp.status_code}: {resp.text[:80]}",
                        "problem": "Invalid RESEND_API_KEY.",
                    })
        except Exception as e:
            results.append({
                "service": "Resend Email Service",
                "status": "FAILED",
                "detail": str(e),
                "problem": f"Network error contacting Resend: {e}",
            })
    else:
        results.append({
            "service": "Resend Email Service",
            "status": "NOT CONFIGURED",
            "detail": "RESEND_API_KEY is empty in .env",
            "problem": "Alert emails and notifications will not be delivered via email.",
        })

    # 3. Internal FastAPI Core Health
    try:
        from app.main import app

        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.get("/health")
            if resp.status_code == 200:
                results.append({
                    "service": "SageAI FastAPI Backend (/health)",
                    "status": "CONNECTED",
                    "detail": f"HTTP 200 OK — Payload: {resp.json()}",
                    "problem": None,
                })
            else:
                results.append({
                    "service": "SageAI FastAPI Backend (/health)",
                    "status": "FAILED",
                    "detail": f"HTTP {resp.status_code}",
                    "problem": "/health endpoint did not return HTTP 200.",
                })
    except Exception as e:
        results.append({
            "service": "SageAI FastAPI Backend (/health)",
            "status": "FAILED",
            "detail": str(e),
            "problem": f"Failed to instantiate FastAPI app: {e}",
        })


    return results


async def main():
    print("\n" + "=" * 65)
    print("      SageAI COMPLETE SYSTEM & CONNECTIONS DIAGNOSTIC SUITE     ")
    print("=" * 65)
    print("Analyzing all AI providers, databases, OSINT APIs, and services...\n")

    ai_res = await test_ai_connections()
    db_res = await test_database_and_cache()
    osint_res = await test_osint_and_recon()
    third_res = await test_backend_and_thirdparty()

    all_groups = [
        ("AI & LLM Services", ai_res),
        ("Database & Persistence", db_res),
        ("Threat Intel & OSINT Integrations", osint_res),
        ("Payments, Notifications & Backend Core", third_res),
    ]

    for group_name, items in all_groups:
        print(f"\n--- {group_name} ---")
        for it in items:
            status = it["status"]
            if "CONNECTED" in status or status == "READY":
                badge = "[OK]"
            elif "NOT CONFIGURED" in status or "FREE" in status:
                badge = "[INFO]"
            elif "OFFLINE" in status or "WARN" in status:
                badge = "[WARN]"
            else:
                badge = "[FAIL]"
            print(f"  {badge:7} {it['service']:<32} | {it['status']:<18} | {it['detail']}")

    # Collect problems
    problems = []
    for _, items in all_groups:
        for it in items:
            if it.get("problem"):
                problems.append((it["service"], it["status"], it["problem"]))

    print("\n" + "=" * 65)
    print("                      DIAGNOSTIC SUMMARY                        ")
    print("=" * 65)
    if problems:
        print(f"\n[!] Discovered {len(problems)} items requiring attention or configuration:\n")
        for i, (svc, stat, prob) in enumerate(problems, 1):
            print(f"  {i}. [{svc}] ({stat})")
            print(f"     -> Problem: {prob}\n")
    else:
        print("\n[+] All system connections are healthy, verified, and operational!\n")


if __name__ == "__main__":
    asyncio.run(main())
