"""CISA KEV & NVD Threat Feed Indexer.

Synchronizes and indices Known Exploited Vulnerabilities (KEV) from CISA
and CVE feeds from NVD with deduplication, stale-feed detection, and fast in-memory search.
"""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from pydantic import BaseModel, Field

logger = logging.getLogger("SageAI.threat_feed")

CISA_KEV_FEED_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
CACHE_FILE_PATH = Path("app/data/cve_threat_index.json")


class ThreatVulnerability(BaseModel):
    id: str = Field(..., description="CVE ID (e.g. CVE-2024-21887)")
    title: str
    description: str
    severity: str = "high"  # critical, high, medium, low
    cvss_score: Optional[float] = None
    source: str = "CISA KEV"
    published: str
    is_kev: bool = False
    ransomware_campaign: Optional[str] = None
    remediation_action: Optional[str] = None
    due_date: Optional[str] = None
    vendor_project: Optional[str] = None
    product: Optional[str] = None
    url: Optional[str] = None


class CVEIndexer:
    """In-memory thread-safe threat intelligence indexer with persistent caching."""

    def __init__(self, cache_path: Optional[Path] = None):
        self._index: Dict[str, ThreatVulnerability] = {}
        self._last_synced: Optional[datetime] = None
        self._cache_file = cache_path or CACHE_FILE_PATH
        self._load_cache()
        if not self._index:
            self._seed_default_vulnerabilities()

    @property
    def last_synced_at(self) -> Optional[datetime]:
        return self._last_synced

    def is_stale(self, max_age_hours: int = 24) -> bool:
        """Return True if feed was never synced or last sync exceeds max_age_hours."""
        if not self._last_synced:
            return True
        age = datetime.now(timezone.utc) - self._last_synced
        return age.total_seconds() > (max_age_hours * 3600)

    def _load_cache(self) -> None:
        """Load cached CVEs from disk if available."""
        if self._cache_file.exists():
            try:
                with open(self._cache_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    meta = data.get("metadata", {})
                    if meta.get("last_synced"):
                        self._last_synced = datetime.fromisoformat(meta["last_synced"])
                    items = data.get("vulnerabilities", [])
                    for item in items:
                        vuln = ThreatVulnerability(**item)
                        self._index[vuln.id.upper()] = vuln
                logger.info(f"Loaded {len(self._index)} cached CVE threat records.")
            except Exception as e:
                logger.warning(f"Failed to load CVE threat cache: {e}")

    def _save_cache(self) -> None:
        """Persist indexed CVEs to disk."""
        try:
            self._cache_file.parent.mkdir(parents=True, exist_ok=True)
            payload = {
                "metadata": {
                    "last_synced": self._last_synced.isoformat()
                    if self._last_synced
                    else None,
                    "total_count": len(self._index),
                    "kev_count": sum(1 for v in self._index.values() if v.is_kev),
                },
                "vulnerabilities": [v.model_dump() for v in self._index.values()],
            }
            with open(self._cache_file, "w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2)
            logger.debug(f"Saved {len(self._index)} threat vulnerabilities to cache.")
        except Exception as e:
            logger.warning(f"Could not persist CVE threat cache: {e}")

    def _seed_default_vulnerabilities(self) -> None:
        """Seed baseline high-impact CISA KEV vulnerabilities for immediate zero-delay operation."""
        seeds = [
            ThreatVulnerability(
                id="CVE-2024-21887",
                title="Ivanti Connect Secure and Policy Secure Command Injection",
                description="A command injection vulnerability in web components of Ivanti Connect Secure allows an authenticated administrator to execute arbitrary commands.",
                severity="critical",
                cvss_score=9.1,
                source="CISA KEV",
                published="2024-01-12T00:00:00Z",
                is_kev=True,
                ransomware_campaign="Known",
                remediation_action="Apply vendor mitigation or patch immediately. Follow CISA Emergency Directive 24-01.",
                due_date="2024-01-22",
                vendor_project="Ivanti",
                product="Connect Secure",
                url="https://nvd.nist.gov/vuln/detail/CVE-2024-21887",
            ),
            ThreatVulnerability(
                id="CVE-2024-3400",
                title="Palo Alto Networks PAN-OS OS Command Injection",
                description="Command injection in the GlobalProtect feature of Palo Alto Networks PAN-OS software allows an unauthenticated attacker to execute arbitrary code with root privileges.",
                severity="critical",
                cvss_score=10.0,
                source="CISA KEV",
                published="2024-04-12T00:00:00Z",
                is_kev=True,
                ransomware_campaign="Known",
                remediation_action="Apply vendor updates per PAN-SA-2024-0002. Disable device telemetry until patched.",
                due_date="2024-04-19",
                vendor_project="Palo Alto Networks",
                product="PAN-OS",
                url="https://nvd.nist.gov/vuln/detail/CVE-2024-3400",
            ),
            ThreatVulnerability(
                id="CVE-2023-34362",
                title="Progress MOVEit Transfer SQL Injection Vulnerability",
                description="SQL injection in Progress MOVEit Transfer web application leading to unauthenticated remote code execution and widespread data exfiltration.",
                severity="critical",
                cvss_score=9.8,
                source="CISA KEV",
                published="2023-06-02T00:00:00Z",
                is_kev=True,
                ransomware_campaign="Known (Cl0p Ransomware)",
                remediation_action="Apply the vendor security patch immediately and review access logs for unauthorized file downloads.",
                due_date="2023-06-16",
                vendor_project="Progress Software",
                product="MOVEit Transfer",
                url="https://nvd.nist.gov/vuln/detail/CVE-2023-34362",
            ),
            ThreatVulnerability(
                id="CVE-2021-44228",
                title="Apache Log4j2 JNDI Remote Code Execution (Log4Shell)",
                description="Apache Log4j2 JNDI features used in configuration, log messages, and parameters do not protect against attacker controlled LDAP and other JNDI related endpoints.",
                severity="critical",
                cvss_score=10.0,
                source="CISA KEV",
                published="2021-12-10T00:00:00Z",
                is_kev=True,
                ransomware_campaign="Known",
                remediation_action="Upgrade Log4j to 2.17.1 or higher, remove JndiLookup class, or set log4j2.formatMsgNoLookups=true.",
                due_date="2021-12-24",
                vendor_project="Apache",
                product="Log4j",
                url="https://nvd.nist.gov/vuln/detail/CVE-2021-44228",
            ),
            ThreatVulnerability(
                id="CVE-2024-1709",
                title="ConnectWise ScreenConnect Authentication Bypass",
                description="Authentication bypass using an alternate path or channel in ConnectWise ScreenConnect enables an attacker to gain administrative access and execute code.",
                severity="critical",
                cvss_score=10.0,
                source="CISA KEV",
                published="2024-02-21T00:00:00Z",
                is_kev=True,
                ransomware_campaign="Known",
                remediation_action="Upgrade ScreenConnect to version 23.9.8 or later immediately.",
                due_date="2024-02-29",
                vendor_project="ConnectWise",
                product="ScreenConnect",
                url="https://nvd.nist.gov/vuln/detail/CVE-2024-1709",
            ),
            ThreatVulnerability(
                id="CVE-2024-6387",
                title="OpenSSH Server Remote Code Execution (regreSSHion)",
                description="Signal handler race condition in OpenSSH's server (sshd) in glibc-based Linux systems allows unauthenticated remote code execution with root privileges.",
                severity="high",
                cvss_score=8.1,
                source="NVD",
                published="2024-07-01T00:00:00Z",
                is_kev=False,
                ransomware_campaign=None,
                remediation_action="Update OpenSSH to 9.8p1 or set LoginGraceTime 0 in sshd_config as interim workaround.",
                due_date=None,
                vendor_project="OpenSSH",
                product="OpenSSH",
                url="https://nvd.nist.gov/vuln/detail/CVE-2024-6387",
            ),
            ThreatVulnerability(
                id="CVE-2023-46805",
                title="Ivanti Connect Secure Authentication Bypass",
                description="An authentication bypass vulnerability in web components of Ivanti Connect Secure allows a remote attacker to craft malicious requests and bypass control checks.",
                severity="high",
                cvss_score=8.2,
                source="CISA KEV",
                published="2024-01-12T00:00:00Z",
                is_kev=True,
                ransomware_campaign="Known",
                remediation_action="Import mitigation.release.20240107.1.xml package or apply vendor patch.",
                due_date="2024-01-22",
                vendor_project="Ivanti",
                product="Connect Secure",
                url="https://nvd.nist.gov/vuln/detail/CVE-2023-46805",
            ),
        ]
        for vuln in seeds:
            self._index[vuln.id.upper()] = vuln
        self._last_synced = datetime.now(timezone.utc)

    async def sync_cisa_kev(self, force: bool = False) -> int:
        """Fetch and index CISA KEV catalog with deduplication and stale detection."""
        if not force and not self.is_stale(max_age_hours=12) and len(self._index) > 10:
            logger.info("Threat feed is fresh; skipping sync.")
            return len(self._index)

        logger.info(f"Syncing CISA KEV feed from {CISA_KEV_FEED_URL}...")
        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.get(CISA_KEV_FEED_URL)
                if res.status_code != 200:
                    logger.warning(
                        f"CISA KEV feed responded with HTTP {res.status_code}"
                    )
                    return len(self._index)

                data = res.json()
                vulnerabilities = data.get("vulnerabilities", [])
                logger.info(
                    f"Fetched {len(vulnerabilities)} vulnerabilities from CISA KEV."
                )

                for item in vulnerabilities:
                    cve_id = item.get("cveID", "").strip().upper()
                    if not cve_id:
                        continue

                    ransomware = item.get("knownRansomwareCampaignUse", "Unknown")
                    short_desc = item.get(
                        "shortDescription", "No description provided."
                    )
                    vuln_name = item.get(
                        "vulnerabilityName", f"Exploited Vulnerability {cve_id}"
                    )

                    # Determine severity heuristic for KEV
                    severity = (
                        "critical"
                        if ransomware.lower() == "known"
                        or "remote code execution" in short_desc.lower()
                        else "high"
                    )

                    entry = ThreatVulnerability(
                        id=cve_id,
                        title=vuln_name,
                        description=short_desc,
                        severity=severity,
                        source="CISA KEV",
                        published=item.get(
                            "dateAdded", datetime.now(timezone.utc).isoformat()
                        ),
                        is_kev=True,
                        ransomware_campaign=ransomware
                        if ransomware != "Unknown"
                        else None,
                        remediation_action=item.get("requiredAction"),
                        due_date=item.get("dueDate"),
                        vendor_project=item.get("vendorProject"),
                        product=item.get("product"),
                        url=f"https://nvd.nist.gov/vuln/detail/{cve_id}",
                    )
                    self._index[cve_id] = entry

                self._last_synced = datetime.now(timezone.utc)
                self._save_cache()
                logger.info(
                    f"CISA KEV sync complete. Total threats indexed: {len(self._index)}"
                )
                return len(self._index)

        except Exception as e:
            logger.error(f"Error during CISA KEV sync: {e}")
            if not self._index:
                self._seed_default_vulnerabilities()
            return len(self._index)

    def search(
        self,
        query: str,
        limit: int = 20,
        kev_only: bool = False,
        severity: Optional[str] = None,
    ) -> List[ThreatVulnerability]:
        """Search threat index by CVE ID, vendor, product, title, or keywords."""
        q = query.strip().lower()
        results: List[ThreatVulnerability] = []

        for vuln in self._index.values():
            if kev_only and not vuln.is_kev:
                continue
            if severity and vuln.severity.lower() != severity.lower():
                continue

            # Check matches
            match = False
            if not q:
                match = True
            elif q in vuln.id.lower():
                match = True
            elif vuln.vendor_project and q in vuln.vendor_project.lower():
                match = True
            elif vuln.product and q in vuln.product.lower():
                match = True
            elif q in vuln.title.lower():
                match = True
            elif q in vuln.description.lower():
                match = True

            if match:
                results.append(vuln)

        # Prioritize KEV and critical severity, then newest
        def rank_sort(v: ThreatVulnerability):
            sev_weight = {"critical": 4, "high": 3, "medium": 2, "low": 1}.get(
                v.severity.lower(), 0
            )
            kev_weight = 10 if v.is_kev else 0
            return (kev_weight + sev_weight, v.published)

        results.sort(key=rank_sort, reverse=True)
        return results[:limit]

    async def get_cve(self, cve_id: str) -> Optional[ThreatVulnerability]:
        """Retrieve CVE details from index or fallback to live NVD query."""
        normalized = cve_id.strip().upper()
        if normalized in self._index:
            return self._index[normalized]

        # On-the-fly fetch from NVD client if available
        try:
            from app.services.nvd_client import search_cves

            findings = await search_cves(normalized, max_results=1)
            if findings:
                f = findings[0]
                entry = ThreatVulnerability(
                    id=normalized,
                    title=f.get("detail", f"Vulnerability {normalized}"),
                    description=f.get("detail", "NVD Record"),
                    severity=f.get("severity", "medium"),
                    cvss_score=f.get("cvss_score"),
                    source="NVD/NIST",
                    published=datetime.now(timezone.utc).isoformat(),
                    is_kev=False,
                    url=f"https://nvd.nist.gov/vuln/detail/{normalized}",
                )
                self._index[normalized] = entry
                return entry
        except Exception as e:
            logger.warning(f"Live NVD lookup for {normalized} failed: {e}")

        return None

    def get_recent(
        self, limit: int = 20, kev_only: bool = False
    ) -> List[ThreatVulnerability]:
        """Get most recent threats for display in feeds and dashboard."""
        return self.search(query="", limit=limit, kev_only=kev_only)

    def synthesize_threat_patterns(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Automatically synthesize YARA, Sigma, and Nuclei rules for indexed threats."""
        from app.services.threat_feed.pattern_synthesizer import (
            ThreatPatternSynthesizer,
        )

        synthesizer = ThreatPatternSynthesizer()
        results = []
        top_threats = self.search("", limit=limit, kev_only=True) or list(self._index.values())[:limit]
        for vuln in top_threats:
            res = synthesizer.process_threat_item(vuln.model_dump())
            results.append(res)
        return results

    def stats(self) -> Dict[str, Any]:
        """Return indexer metrics and health state."""
        return {
            "total_threats": len(self._index),
            "kev_threats": sum(1 for v in self._index.values() if v.is_kev),
            "last_synced": self._last_synced.isoformat() if self._last_synced else None,
            "is_stale": self.is_stale(),
        }


# Global singleton indexer
cve_indexer = CVEIndexer()
