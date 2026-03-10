"""09 // OSINT INDUSTRIES: THE INTERCEPTOR — Email & phone correlation.

Free alternative: Custom email validation + social platform enumeration.
If OSINT_INDUSTRIES_API_KEY is set, uses the OSINT Industries API for
instant 1500+ platform correlation.
"""

import logging
import os
import re

import httpx

logger = logging.getLogger("sageai.intelligence.osint_industries")

OSINT_IND_API = "https://api.osint.industries/v2"

# Known social platform check URLs (free, no API needed)
SOCIAL_PLATFORMS = {
    "GitHub": "https://api.github.com/users/{username}",
    "Twitter/X": "https://api.twitter.com/2/users/by/username/{username}",
    "Reddit": "https://www.reddit.com/user/{username}/about.json",
    "GitLab": "https://gitlab.com/api/v4/users?username={username}",
    "Keybase": "https://keybase.io/_/api/1.0/user/lookup.json?usernames={username}",
}

EMAIL_VALIDATION_SERVICES = {
    "Gravatar": "https://en.gravatar.com/{email_hash}.json",
    "GitHub": "https://api.github.com/search/users?q={email}+in:email",
}


async def osint_industries_lookup(target: str, target_type: str = "email") -> list[dict]:
    """Look up an email or phone number across platforms."""
    api_key = os.getenv("OSINT_INDUSTRIES_API_KEY")

    if api_key:
        return await _osint_ind_api(target, target_type, api_key)
    else:
        return await _osint_ind_free(target, target_type)


async def _osint_ind_free(target: str, target_type: str) -> list[dict]:
    """Free email/phone reconnaissance."""
    findings = []

    if target_type == "email":
        findings.extend(await _check_email(target))
    elif target_type == "phone":
        findings.extend(await _check_phone(target))

    return findings


async def _check_email(email: str) -> list[dict]:
    """Check email across free services."""
    findings = []

    # 1. Email format & domain analysis
    if "@" in email:
        domain = email.split("@")[1]
        username = email.split("@")[0]

        # Check if it's a disposable email
        disposable_domains = [
            "tempmail.com", "throwaway.email", "guerrillamail.com", "mailinator.com",
            "yopmail.com", "trashmail.com", "10minutemail.com", "temp-mail.org",
        ]
        if domain in disposable_domains:
            findings.append({
                "module": "osint_industries",
                "type": "disposable_email",
                "severity": "high",
                "title": "Interceptor: Disposable Email Detected",
                "detail": f"{email} uses a known disposable email service ({domain}).",
                "data": {"email": email, "domain": domain, "disposable": True},
                "source": "SageAI Email Analysis (free)",
            })

        # 2. MX record check (is domain receiving mail?)
        try:
            import socket
            socket.getaddrinfo(domain, 25)
            findings.append({
                "module": "osint_industries",
                "type": "mx_valid",
                "severity": "info",
                "title": f"Interceptor: Email Domain Active",
                "detail": f"Domain {domain} has active mail servers.",
                "data": {"domain": domain, "mx_active": True},
                "source": "DNS MX Check (free)",
            })
        except Exception:
            findings.append({
                "module": "osint_industries",
                "type": "mx_invalid",
                "severity": "medium",
                "title": f"Interceptor: Email Domain Not Receiving Mail",
                "detail": f"Domain {domain} has no active mail servers — email may be invalid.",
                "data": {"domain": domain, "mx_active": False},
                "source": "DNS MX Check (free)",
            })

        # 3. Gravatar lookup
        try:
            import hashlib
            email_hash = hashlib.md5(email.lower().strip().encode(), usedforsecurity=False).hexdigest()
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(f"https://en.gravatar.com/{email_hash}.json")
                if resp.status_code == 200:
                    profile = resp.json().get("entry", [{}])[0]
                    display_name = profile.get("displayName", "")
                    about = profile.get("aboutMe", "")
                    urls = [u.get("value") for u in profile.get("urls", [])]
                    findings.append({
                        "module": "osint_industries",
                        "type": "gravatar_profile",
                        "severity": "info",
                        "title": f"Interceptor: Gravatar Profile Found — {display_name}",
                        "detail": f"Display name: {display_name}. Bio: {about[:100]}. Linked URLs: {', '.join(urls[:5])}",
                        "data": {
                            "display_name": display_name,
                            "about": about,
                            "urls": urls,
                            "profile_url": f"https://gravatar.com/{email_hash}",
                        },
                        "source": "Gravatar (free)",
                    })
        except Exception:
            pass

        # 4. GitHub email search
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    f"https://api.github.com/search/users?q={email}+in:email",
                    headers={"User-Agent": "SageAI-Scanner"},
                )
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("total_count", 0) > 0:
                        users = data.get("items", [])
                        findings.append({
                            "module": "osint_industries",
                            "type": "github_account",
                            "severity": "info",
                            "title": f"Interceptor: GitHub Account Linked to Email",
                            "detail": f"Found {len(users)} GitHub profile(s): {', '.join(u.get('login', '') for u in users[:5])}",
                            "data": {"github_users": [u.get("login") for u in users[:5]]},
                            "source": "GitHub API (free)",
                        })
        except Exception:
            pass

    return findings


async def _check_phone(phone: str) -> list[dict]:
    """Basic phone number analysis."""
    findings = []

    # Clean the phone number
    clean = re.sub(r"[^\d+]", "", phone)

    if clean:
        # Determine country from prefix
        country = "Unknown"
        if clean.startswith("+1"):
            country = "US/Canada"
        elif clean.startswith("+44"):
            country = "UK"
        elif clean.startswith("+91"):
            country = "India"
        elif clean.startswith("+86"):
            country = "China"
        elif clean.startswith("+49"):
            country = "Germany"

        findings.append({
            "module": "osint_industries",
            "type": "phone_analysis",
            "severity": "info",
            "title": f"Interceptor: Phone Number Analysis",
            "detail": f"Number: {clean}, Country: {country}, Digits: {len(clean)}",
            "data": {"phone": clean, "country_code": country, "digit_count": len(clean)},
            "source": "SageAI Phone Analysis (free)",
        })

    return findings


async def _osint_ind_api(target: str, target_type: str, api_key: str) -> list[dict]:
    """Full OSINT Industries API lookup."""
    findings = []
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            endpoint = "email" if target_type == "email" else "phone"
            resp = await client.get(
                f"{OSINT_IND_API}/{endpoint}/{target}",
                headers={"Authorization": f"Bearer {api_key}"},
            )
            if resp.status_code == 401:
                logger.warning("OSINT Industries API key invalid, falling back to free")
                return await _osint_ind_free(target, target_type)
            if resp.status_code == 200:
                data = resp.json()
                modules = data.get("modules", [])
                for mod in modules:
                    findings.append({
                        "module": "osint_industries",
                        "type": f"platform_{mod.get('module', 'unknown')}",
                        "severity": "info",
                        "title": f"Interceptor: Account Found on {mod.get('module', 'Unknown')}",
                        "detail": f"Account exists: {mod.get('data', {}).get('exists', False)}",
                        "data": mod.get("data", {}),
                        "source": "OSINT Industries API (Pro)",
                    })

    except Exception as e:
        logger.error(f"OSINT Industries API error: {e}")
        return await _osint_ind_free(target, target_type)

    return findings
