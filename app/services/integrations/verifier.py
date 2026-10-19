"""API Key Verification & Automation Service.

Tests candidate credentials against live provider APIs (NVIDIA NIM, Censys, Shodan,
VirusTotal, GitHub) and updates runtime settings and .env automatically.
"""

import logging
import os
import re
import time
from pathlib import Path
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger("SageAI.integrations.verifier")


def _mask_key(key: str | None) -> str:
    """Safely mask an API key for status display (e.g., 'nvapi-abc...xyz')."""
    if not key or len(key) < 8:
        return ""
    return f"{key[:6]}...{key[-4:]}"


async def verify_nvidia_key(api_key: str) -> dict[str, Any]:
    """Test NVIDIA API key against live chat completions endpoint with Llama 3.3 70B."""
    api_key = api_key.strip()
    if not api_key:
        return {"valid": False, "error": "API key cannot be empty."}

    start = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "meta/llama-3.3-70b-instruct",
                    "messages": [{"role": "user", "content": "ping"}],
                    "max_tokens": 5,
                    "temperature": 0.1,
                },
            )
            latency = int((time.perf_counter() - start) * 1000)

            if resp.status_code == 200:
                return {
                    "valid": True,
                    "provider": "nvidia",
                    "message": "NVIDIA NIM verified: Meta Llama 3.3 70B active",
                    "model": "meta/llama-3.3-70b-instruct",
                    "latency_ms": latency,
                }
            elif resp.status_code in (401, 403):
                return {
                    "valid": False,
                    "provider": "nvidia",
                    "error": "Invalid API key or unauthorized access on NVIDIA Build.",
                    "status_code": resp.status_code,
                }
            elif resp.status_code == 429:
                return {
                    "valid": True,
                    "provider": "nvidia",
                    "message": "Key is valid but current rate limit reached.",
                    "latency_ms": latency,
                }
            else:
                return {
                    "valid": False,
                    "provider": "nvidia",
                    "error": f"NVIDIA API responded with status {resp.status_code}: {resp.text[:120]}",
                }
    except Exception as e:
        return {
            "valid": False,
            "provider": "nvidia",
            "error": f"Connection failed: {str(e)}",
        }


async def verify_censys_credentials(api_id: str, api_secret: str) -> dict[str, Any]:
    """Test Censys Search API ID & Secret against hosts search endpoint."""
    api_id = api_id.strip()
    api_secret = api_secret.strip()
    if not api_id or not api_secret:
        return {
            "valid": False,
            "error": "Both CENSYS_API_ID and CENSYS_API_SECRET are required.",
        }

    start = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://search.censys.io/api/v2/hosts/search",
                params={"q": "example.com", "per_page": 1},
                auth=(api_id, api_secret),
            )
            latency = int((time.perf_counter() - start) * 1000)

            if resp.status_code == 200:
                return {
                    "valid": True,
                    "provider": "censys",
                    "message": "Censys Search API v2 connected successfully",
                    "latency_ms": latency,
                }
            elif resp.status_code in (401, 403):
                return {
                    "valid": False,
                    "provider": "censys",
                    "error": "Invalid Censys API ID or Secret. Verify credentials at search.censys.io/account/api",
                }
            else:
                return {
                    "valid": False,
                    "provider": "censys",
                    "error": f"Censys API returned HTTP {resp.status_code}",
                }
    except Exception as e:
        return {
            "valid": False,
            "provider": "censys",
            "error": f"Connection error: {str(e)}",
        }


async def verify_shodan_key(api_key: str) -> dict[str, Any]:
    """Test Shodan API key against api-info endpoint."""
    api_key = api_key.strip()
    if not api_key:
        return {"valid": False, "error": "Shodan API key cannot be empty."}

    start = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(f"https://api.shodan.io/api-info?key={api_key}")
            latency = int((time.perf_counter() - start) * 1000)

            if resp.status_code == 200:
                data = resp.json()
                scan_credits = data.get("scan_credits", 0)
                query_credits = data.get("query_credits", 0)
                return {
                    "valid": True,
                    "provider": "shodan",
                    "message": f"Shodan Pro active (Query credits: {query_credits}, Scan credits: {scan_credits})",
                    "latency_ms": latency,
                }
            elif resp.status_code in (401, 403):
                return {
                    "valid": False,
                    "provider": "shodan",
                    "error": "Invalid Shodan API Key.",
                }
            else:
                return {
                    "valid": False,
                    "provider": "shodan",
                    "error": f"Shodan returned HTTP {resp.status_code}",
                }
    except Exception as e:
        return {
            "valid": False,
            "provider": "shodan",
            "error": f"Connection error: {str(e)}",
        }


async def verify_virustotal_key(api_key: str) -> dict[str, Any]:
    """Test VirusTotal v3 API key."""
    api_key = api_key.strip()
    if not api_key:
        return {"valid": False, "error": "VirusTotal API key cannot be empty."}

    start = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://www.virustotal.com/api/v3/metadata",
                headers={"x-apikey": api_key},
            )
            latency = int((time.perf_counter() - start) * 1000)

            if resp.status_code == 200:
                return {
                    "valid": True,
                    "provider": "virustotal",
                    "message": "VirusTotal v3 API connected successfully",
                    "latency_ms": latency,
                }
            elif resp.status_code in (401, 403):
                return {
                    "valid": False,
                    "provider": "virustotal",
                    "error": "Invalid VirusTotal API Key.",
                }
            else:
                return {
                    "valid": False,
                    "provider": "virustotal",
                    "error": f"VirusTotal returned HTTP {resp.status_code}",
                }
    except Exception as e:
        return {
            "valid": False,
            "provider": "virustotal",
            "error": f"Connection error: {str(e)}",
        }


async def verify_github_pat(token: str) -> dict[str, Any]:
    """Test GitHub Personal Access Token."""
    token = token.strip()
    if not token:
        return {"valid": False, "error": "GitHub token cannot be empty."}

    start = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github+json",
                    "User-Agent": "SageAI-Integration-Setup",
                },
            )
            latency = int((time.perf_counter() - start) * 1000)

            if resp.status_code == 200:
                user_data = resp.json()
                scopes = resp.headers.get("x-oauth-scopes", "")
                has_repo = (
                    "repo" in scopes or not scopes
                )  # Fine-grained PATs might not send x-oauth-scopes
                return {
                    "valid": True,
                    "provider": "github",
                    "username": user_data.get("login"),
                    "has_repo_scope": has_repo,
                    "message": f"GitHub connected as @{user_data.get('login')}",
                    "latency_ms": latency,
                }
            else:
                return {
                    "valid": False,
                    "provider": "github",
                    "error": "Invalid GitHub Personal Access Token.",
                }
    except Exception as e:
        return {
            "valid": False,
            "provider": "github",
            "error": f"Connection error: {str(e)}",
        }


def get_all_integrations_status() -> dict[str, Any]:
    """Return consolidated status of all AI and OSINT integrations."""
    has_nvidia = bool(settings.NVIDIA_API_KEY)
    has_censys_pro = bool(settings.CENSYS_API_ID and settings.CENSYS_API_SECRET)
    has_shodan_pro = bool(settings.SHODAN_API_KEY)
    has_vt = bool(settings.VIRUSTOTAL_API_KEY)

    return {
        "nvidia": {
            "configured": has_nvidia,
            "masked_key": _mask_key(settings.NVIDIA_API_KEY),
            "model": "meta/llama-3.3-70b-instruct",
            "tier": "NVIDIA NIM Cloud" if has_nvidia else "Not configured",
            "free_credits_url": "https://build.nvidia.com",
        },
        "censys": {
            "configured": has_censys_pro,
            "mode": "censys_pro" if has_censys_pro else "free_certspotter",
            "description": "Censys Search API v2"
            if has_censys_pro
            else "Free Community Tier (Certspotter CT + Direct TLS)",
            "masked_id": _mask_key(settings.CENSYS_API_ID),
            "free_registration_url": "https://search.censys.io/register",
        },
        "shodan": {
            "configured": has_shodan_pro,
            "mode": "shodan_pro" if has_shodan_pro else "free_internetdb",
            "description": "Full Shodan REST API"
            if has_shodan_pro
            else "Free Community Tier (Shodan InternetDB)",
            "masked_key": _mask_key(settings.SHODAN_API_KEY),
            "registration_url": "https://account.shodan.io/register",
        },
        "virustotal": {
            "configured": has_vt,
            "masked_key": _mask_key(settings.VIRUSTOTAL_API_KEY),
            "registration_url": "https://www.virustotal.com/gui/join-us",
        },
    }


def update_env_file(key_values: dict[str, str], env_path: str = ".env") -> bool:
    """Safely update keys in .env file, adding them if not found."""
    path = Path(env_path)
    if not path.exists():
        # Fallback to current directory or create
        path.touch()

    content = path.read_text(encoding="utf-8")

    for key, value in key_values.items():
        # Update in-memory settings & os.environ immediately
        os.environ[key] = value
        if hasattr(settings, key):
            setattr(settings, key, value)

        pattern = rf"^{key}=.*$"
        if re.search(pattern, content, flags=re.MULTILINE):
            content = re.sub(pattern, f"{key}={value}", content, flags=re.MULTILINE)
        else:
            content += f"\n{key}={value}\n"

    path.write_text(content.strip() + "\n", encoding="utf-8")
    logger.info(f"Updated .env with keys: {list(key_values.keys())}")
    return True
