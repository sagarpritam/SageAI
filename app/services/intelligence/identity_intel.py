"""05 // SOCIAL LINKS: NEURAL DE-MASKING — Identity resolution.

Free alternative: Uses Sherlock-style username enumeration across platforms,
plus email-to-identity correlation via public APIs.
If SOCIAL_LINKS_API_KEY is set, uses the Social Links enterprise API.
"""

import logging

import httpx

logger = logging.getLogger("sageai.intelligence.identity")

# Platforms to check for username existence (free, no API key)
USERNAME_PLATFORMS = {
    "GitHub": {"url": "https://api.github.com/users/{username}", "check": "status_200"},
    "Reddit": {
        "url": "https://www.reddit.com/user/{username}/about.json",
        "check": "status_200",
    },
    "GitLab": {
        "url": "https://gitlab.com/api/v4/users?username={username}",
        "check": "non_empty_json",
    },
    "Keybase": {"url": "https://keybase.io/{username}", "check": "status_200"},
    "HackerOne": {"url": "https://hackerone.com/{username}", "check": "status_200"},
    "Medium": {"url": "https://medium.com/@{username}", "check": "status_200"},
    "Dev.to": {
        "url": "https://dev.to/api/users/by_username?url={username}",
        "check": "status_200",
    },
    "Pinterest": {
        "url": "https://www.pinterest.com/{username}/",
        "check": "status_200",
    },
    "Twitch": {"url": "https://www.twitch.tv/{username}", "check": "status_200"},
    "Steam": {"url": "https://steamcommunity.com/id/{username}", "check": "status_200"},
    "Imgur": {
        "url": "https://api.imgur.com/account/v1/accounts/{username}?client_id=546c25a59c58ad7",
        "check": "status_200",
    },
}


async def identity_resolve(target: str, target_type: str = "username") -> list[dict]:
    """Resolve a username or email to linked identities across platforms."""
    from app.core.config import settings
    api_key = settings.SOCIAL_LINKS_API_KEY

    if api_key:
        return await _social_links_api(target, target_type, api_key)

    if target_type == "email" and "@" in target:
        username = target.split("@")[0]
    else:
        username = target

    return await _sherlock_scan(username)


async def _sherlock_scan(username: str) -> list[dict]:
    """Free Sherlock-style username enumeration."""
    findings = []
    found_platforms = []
    not_found = []

    async with httpx.AsyncClient(timeout=8, follow_redirects=False) as client:
        for platform, config in USERNAME_PLATFORMS.items():
            try:
                url = config["url"].format(username=username)
                resp = await client.get(
                    url,
                    headers={"User-Agent": "SageAI-Scanner/3.0"},
                )

                exists = False
                if config["check"] == "status_200":
                    exists = resp.status_code == 200
                elif config["check"] == "non_empty_json":
                    try:
                        data = resp.json()
                        exists = bool(data) and (
                            isinstance(data, list) and len(data) > 0
                        )
                    except Exception:
                        exists = False

                if exists:
                    found_platforms.append(
                        {
                            "platform": platform,
                            "url": url.replace("{username}", username),
                            "status": "found",
                        }
                    )
                else:
                    not_found.append(platform)

            except httpx.TimeoutException:
                not_found.append(f"{platform} (timeout)")
            except Exception:
                not_found.append(f"{platform} (error)")

    if found_platforms:
        findings.append(
            {
                "module": "identity",
                "type": "username_enumeration",
                "severity": "medium" if len(found_platforms) > 3 else "info",
                "title": f"Neural De-Mask: Username '{username}' Found on {len(found_platforms)} Platforms",
                "detail": f"Platforms: {', '.join(p['platform'] for p in found_platforms)}",
                "data": {
                    "username": username,
                    "found_count": len(found_platforms),
                    "platforms": found_platforms,
                    "not_found": not_found,
                },
                "source": "SageAI Sherlock Scanner (free)",
            }
        )
    else:
        findings.append(
            {
                "module": "identity",
                "type": "username_not_found",
                "severity": "info",
                "title": f"Neural De-Mask: Username '{username}' Not Found on Checked Platforms",
                "detail": f"Checked {len(USERNAME_PLATFORMS)} platforms — no matches found.",
                "data": {
                    "username": username,
                    "platforms_checked": len(USERNAME_PLATFORMS),
                },
                "source": "SageAI Sherlock Scanner (free)",
            }
        )

    # Behavioral analysis (username patterns)
    patterns = _analyze_username_patterns(username)
    if patterns:
        findings.append(
            {
                "module": "identity",
                "type": "username_patterns",
                "severity": "info",
                "title": "Neural De-Mask: Username Pattern Analysis",
                "detail": f"Patterns: {', '.join(patterns)}",
                "data": {"username": username, "patterns": patterns},
                "source": "SageAI Behavioral Analysis (free)",
            }
        )

    return findings


def _analyze_username_patterns(username: str) -> list[str]:
    """Analyze username for common patterns that reveal identity info."""
    import re

    patterns = []

    # Check for year patterns (birth year, etc.)
    years = re.findall(r"(19[5-9]\d|20[0-2]\d)", username)
    if years:
        patterns.append(f"Contains year(s): {', '.join(years)} (possible birth year)")

    # Check for name patterns
    if re.match(r"^[a-z]+[._-]?[a-z]+$", username.lower()):
        patterns.append("Follows firstname.lastname pattern")

    # Check for leet speak
    leet_chars = {"0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t"}
    leet_count = sum(1 for c in username if c in leet_chars)
    if leet_count >= 2:
        patterns.append(f"Uses leetspeak ({leet_count} substitutions)")

    # Number suffix
    if re.search(r"\d{2,4}$", username):
        patterns.append("Has numeric suffix (common pattern)")

    return patterns


async def _social_links_api(target: str, target_type: str, api_key: str) -> list[dict]:
    """Full Social Links enterprise API."""
    findings = []
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.sociallinks.io/v4/search",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "query": target,
                    "type": target_type,
                    "modules": [
                        "social_media",
                        "forums",
                        "darknet",
                        "facial_recognition",
                    ],
                },
            )
            if resp.status_code == 401:
                logger.warning("Social Links API key invalid, falling back to free")
                username = target.split("@")[0] if "@" in target else target
                return await _sherlock_scan(username)

            if resp.status_code == 200:
                data = resp.json()
                profiles = data.get("profiles", [])
                for profile in profiles[:20]:
                    findings.append(
                        {
                            "module": "identity",
                            "type": f"social_links_{profile.get('source', 'unknown')}",
                            "severity": "medium",
                            "title": f"Neural De-Mask: Profile on {profile.get('platform', 'Unknown')}",
                            "detail": f"Name: {profile.get('name', 'N/A')} | Bio: {profile.get('bio', '')[:100]}",
                            "data": profile,
                            "source": "Social Links API (Enterprise)",
                        }
                    )

    except Exception as e:
        logger.error(f"Social Links API error: {e}")
        username = target.split("@")[0] if "@" in target else target
        return await _sherlock_scan(username)

    return findings
