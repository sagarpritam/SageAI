"""
SageAI 2.0 — Asset Discovery Service
Core orchestrator for Attack Surface Management.

Pipeline:
  1. crt.sh → enumerate subdomains from certificate transparency logs
  2. DNS → resolve each subdomain to IP
  3. Shodan → enriched service/port/vuln data per IP
  4. Port Scanner → verify open ports
  5. HTTP probe → fetch title, status, headers for tech fingerprinting
  6. Risk Engine → score each discovered asset
  7. Persist to Asset DB (upsert — update if seen before, create if new)
  8. Return summary + new/changed asset list for alerting
"""

import asyncio
import json
import logging
import socket
from datetime import datetime, timedelta, timezone
from typing import Any, List, Tuple

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.asm_event import ASMEvent, ASMEventSeverity, ASMEventType
from app.models.asset import Asset, AssetStatus, AssetType
from app.services import crtsh_client, dns_scanner, shodan_client
from app.utils.http_client import get_http_client

logger = logging.getLogger("sageai.asset_discovery")

# Ports that indicate specific high-risk services
HIGH_RISK_PORTS = {
    22: "SSH",
    23: "Telnet",
    3389: "RDP",
    5900: "VNC",
    8080: "HTTP-Alt (often dev/admin)",
    8443: "HTTPS-Alt",
    9200: "Elasticsearch",
    27017: "MongoDB",
    6379: "Redis",
    5432: "PostgreSQL",
    3306: "MySQL",
    2375: "Docker API",
    4848: "GlassFish Admin",
    8500: "Consul",
    9090: "Prometheus",
}

SENSITIVE_KEYWORDS = [
    "admin",
    "staging",
    "dev",
    "test",
    "internal",
    "vpn",
    "api-dev",
    "debug",
    "qa",
    "uat",
    "beta",
    "demo",
    "legacy",
    "old",
    "backup",
    "jenkins",
    "jira",
    "gitlab",
    "confluence",
]


async def _probe_http(subdomain: str) -> Tuple[int | None, str | None, List[str]]:
    """HTTP HEAD/GET probe — returns (status, title, technologies)."""
    techs = []
    for scheme in ["https", "http"]:
        url = f"{scheme}://{subdomain}"
        try:
            async with get_http_client(follow_redirects=True, timeout=8) as client:
                resp = await client.get(url)
                status = resp.status_code

                # Technology fingerprinting via headers
                server = resp.headers.get("server", "")
                powered_by = resp.headers.get("x-powered-by", "")
                if server:
                    techs.append(server)
                if powered_by:
                    techs.append(powered_by)

                # Extract page title
                title = None
                if b"<title" in resp.content[:4096]:
                    raw = resp.text[:4096]
                    start = raw.lower().find("<title>")
                    end = raw.lower().find("</title>")
                    if start != -1 and end != -1:
                        title = raw[start + 7 : end].strip()[:120]

                return status, title, list(set(techs))
        except Exception:
            continue
    return None, None, techs


def _compute_risk(asset: dict) -> Tuple[float, str]:
    """Simple risk scoring for a discovered asset."""
    score = 0.0

    # High-risk ports found
    risky_ports = [p for p in asset.get("open_ports", []) if p in HIGH_RISK_PORTS]
    score += len(risky_ports) * 15

    # Sensitive subdomain keyword
    value = asset.get("value", "").lower()
    if any(kw in value for kw in SENSITIVE_KEYWORDS):
        score += 25

    # HTTP exposed
    if asset.get("http_status") and asset["http_status"] < 400:
        score += 10

    score = min(score, 100)

    if score >= 70:
        level = "Critical"
    elif score >= 45:
        level = "High"
    elif score >= 20:
        level = "Medium"
    else:
        level = "Low"

    return round(score, 1), level


async def discover_assets(
    org_id: str,
    target: str,
    db: AsyncSession,
    scan_id: str | None = None,
) -> dict:
    """
    Full asset discovery pipeline for a root domain.
    Returns a summary dict with counts + lists of new/changed/high-risk assets.
    """
    target = target.replace("https://", "").replace("http://", "").split("/")[0].strip()
    logger.info(f"[ASM] Starting asset discovery for {target} (org={org_id})")

    new_assets = []
    updated_assets = []
    all_subdomains = set()
    all_subdomains.add(target)  # Always include root domain

    # ── Step 1: crt.sh subdomain enumeration ─────────────────────────────
    try:
        crt_findings = await crtsh_client.search_certificates(target)
        for f in crt_findings:
            for sub in f.get("subdomains", []):
                sub = sub.strip().lstrip("*.")
                if sub.endswith(f".{target}") or sub == target:
                    all_subdomains.add(sub)
    except Exception as e:
        logger.warning(f"[ASM] crt.sh error: {e}")

    # ── Step 2: DNS scanner for additional subdomains ─────────────────────
    try:
        dns_findings = await asyncio.to_thread(dns_scanner.scan_dns, target)
        for f in dns_findings:
            for sub in f.get("subdomains", []):
                all_subdomains.add(sub)
    except Exception as e:
        logger.warning(f"[ASM] DNS error: {e}")

    logger.info(f"[ASM] Discovered {len(all_subdomains)} subdomains for {target}")

    # ── Step 3: Enrich each subdomain ────────────────────────────────────
    # Process subdomains concurrently (max 10 at a time to be polite)
    semaphore = asyncio.Semaphore(10)

    async def enrich_subdomain(sub: str) -> dict[str, Any]:
        async with semaphore:
            asset_data: dict[str, Any] = {
                "value": sub,
                "asset_type": AssetType.domain
                if sub == target
                else AssetType.subdomain,
                "org_id": org_id,
            }

            # Resolve IP
            try:
                ip = socket.gethostbyname(sub)
                asset_data["ip_address"] = ip
            except Exception:
                ip = None

            # HTTP probe
            status, title, techs = await _probe_http(sub)
            asset_data["http_status"] = status
            asset_data["http_title"] = title
            asset_data["technologies"] = techs

            # Shodan enrichment (if IP resolved)
            open_ports = []
            shodan_data = {}
            if ip:
                try:
                    shodan_findings = await shodan_client.lookup_ip(sub)
                    for f in shodan_findings:
                        if f.get("type") == "shodan_ports":
                            open_ports = f.get("ports", [])
                        if not techs:
                            for f2 in shodan_findings:
                                if f2.get("type") == "shodan_cpes":
                                    for cpe in f2.get("cpes", []):
                                        parts = cpe.split(":")
                                        if len(parts) >= 5:
                                            techs.append(f"{parts[3]}/{parts[4]}")
                    shodan_data = {f.get("type"): f for f in shodan_findings}
                except Exception:
                    pass

            asset_data["open_ports"] = open_ports
            asset_data["shodan_data"] = json.dumps(shodan_data)

            # Risk score
            risk_score, risk_level = _compute_risk(asset_data)
            asset_data["risk_score"] = risk_score
            asset_data["risk_level"] = risk_level

            return asset_data

    tasks = [enrich_subdomain(sub) for sub in list(all_subdomains)[:50]]  # cap at 50
    enriched = await asyncio.gather(*tasks, return_exceptions=True)

    # ── Step 4: Persist to DB (upsert) ────────────────────────────────────
    now = datetime.now(timezone.utc)

    for item in enriched:
        if not isinstance(item, dict):
            continue

        # Check existing
        result = await db.execute(
            select(Asset).where(
                and_(Asset.org_id == org_id, Asset.value == item["value"])
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            # Update existing asset
            prev_ports = json.loads(str(existing.open_ports or "[]"))
            curr_ports = item.get("open_ports", [])
            prev_ip = existing.ip_address
            curr_ip = item.get("ip_address")
            prev_tech = json.loads(str(existing.technologies or "[]"))
            curr_tech = item.get("technologies", [])
            prev_status = existing.http_status
            curr_status = item.get("http_status")
            prev_title = existing.http_title
            curr_title = item.get("http_title")

            # Parse Shodan CVEs
            prev_shodan = {}
            try:
                prev_shodan = json.loads(str(existing.shodan_data or "{}"))
            except Exception:
                prev_shodan = {}
            curr_shodan = {}
            try:
                curr_shodan = json.loads(item.get("shodan_data", "{}"))
            except Exception:
                curr_shodan = {}

            prev_cves = set(prev_shodan.get("shodan_vulns", {}).get("cve_ids", []))
            curr_cves = set(curr_shodan.get("shodan_vulns", {}).get("cve_ids", []))
            new_cves = list(curr_cves - prev_cves)

            new_ports = list(set(curr_ports) - set(prev_ports))
            closed_ports = list(set(prev_ports) - set(curr_ports))
            dns_changed = bool(prev_ip and curr_ip and prev_ip != curr_ip)
            new_tech = list(set(curr_tech) - set(prev_tech))
            status_changed = (
                prev_status is not None
                and curr_status is not None
                and prev_status != curr_status
            )
            title_changed = (
                prev_title is not None
                and curr_title is not None
                and prev_title != curr_title
            )
            service_changed = bool(new_tech or status_changed or title_changed)

            changed = (
                bool(new_ports)
                or bool(closed_ports)
                or dns_changed
                or service_changed
                or bool(new_cves)
                or existing.risk_level != item["risk_level"]
            )

            existing.ip_address = curr_ip
            existing.open_ports = json.dumps(curr_ports)
            existing.technologies = json.dumps(curr_tech)
            existing.http_status = curr_status
            existing.http_title = curr_title
            existing.risk_score = item["risk_score"]
            existing.risk_level = item["risk_level"]
            existing.shodan_data = item.get("shodan_data", "{}")
            existing.last_seen = now
            existing.last_scanned = now
            existing.status = AssetStatus.active
            existing.discovered_in_scan = scan_id

            if changed:
                updated_assets.append(existing.value)

                # 1. New open ports
                if new_ports:
                    has_high_risk = any(p in HIGH_RISK_PORTS for p in new_ports)
                    evt = ASMEvent(
                        org_id=org_id,
                        asset_id=existing.id,
                        scan_id=scan_id,
                        event_type=ASMEventType.new_port,
                        severity=ASMEventSeverity.high
                        if has_high_risk
                        else ASMEventSeverity.medium,
                        title=f"New open ports discovered on {item['value']}",
                        description=f"Detected new ports: {', '.join(map(str, sorted(new_ports)))}",
                        details=json.dumps(
                            {
                                "new_ports": sorted(new_ports),
                                "all_ports": sorted(curr_ports),
                            }
                        ),
                    )
                    db.add(evt)

                # 2. Closed ports
                if closed_ports:
                    evt = ASMEvent(
                        org_id=org_id,
                        asset_id=existing.id,
                        scan_id=scan_id,
                        event_type=ASMEventType.port_closed,
                        severity=ASMEventSeverity.info,
                        title=f"Port(s) closed on {item['value']}",
                        description=f"Ports no longer open: {', '.join(map(str, sorted(closed_ports)))}",
                        details=json.dumps(
                            {
                                "closed_ports": sorted(closed_ports),
                                "all_ports": sorted(curr_ports),
                            }
                        ),
                    )
                    db.add(evt)

                # 3. DNS / IP changed
                if dns_changed:
                    evt = ASMEvent(
                        org_id=org_id,
                        asset_id=existing.id,
                        scan_id=scan_id,
                        event_type=ASMEventType.dns_changed,
                        severity=ASMEventSeverity.medium,
                        title=f"DNS / IP resolution changed for {item['value']}",
                        description=f"IP address moved from {prev_ip} to {curr_ip}",
                        details=json.dumps({"previous_ip": prev_ip, "new_ip": curr_ip}),
                    )
                    db.add(evt)

                # 4. Service / HTTP fingerprint changed
                if service_changed:
                    desc_parts = []
                    if new_tech:
                        desc_parts.append(f"New tech: {', '.join(new_tech)}")
                    if status_changed:
                        desc_parts.append(
                            f"HTTP status changed ({prev_status} -> {curr_status})"
                        )
                    if title_changed:
                        desc_parts.append(f"Title changed to '{curr_title}'")

                    evt = ASMEvent(
                        org_id=org_id,
                        asset_id=existing.id,
                        scan_id=scan_id,
                        event_type=ASMEventType.service_changed,
                        severity=ASMEventSeverity.low,
                        title=f"Service / HTTP change detected on {item['value']}",
                        description="; ".join(desc_parts)
                        if desc_parts
                        else "HTTP service fingerprint changed.",
                        details=json.dumps(
                            {
                                "previous_status": prev_status,
                                "new_status": curr_status,
                                "previous_title": prev_title,
                                "new_title": curr_title,
                                "new_technologies": new_tech,
                                "all_technologies": curr_tech,
                            }
                        ),
                    )
                    db.add(evt)

                # 5. New vulnerabilities (CVEs)
                if new_cves:
                    evt = ASMEvent(
                        org_id=org_id,
                        asset_id=existing.id,
                        scan_id=scan_id,
                        event_type=ASMEventType.new_vulnerability,
                        severity=ASMEventSeverity.critical
                        if item["risk_level"] == "Critical"
                        else ASMEventSeverity.high,
                        title=f"New CVE(s) detected on {item['value']}",
                        description=f"Detected {len(new_cves)} new CVE(s): {', '.join(sorted(new_cves)[:5])}",
                        details=json.dumps(
                            {
                                "new_cves": sorted(new_cves),
                                "all_cves": sorted(curr_cves),
                            }
                        ),
                    )
                    db.add(evt)
        else:
            # Create new asset
            new_asset = Asset(
                org_id=org_id,
                asset_type=item["asset_type"],
                value=item["value"],
                ip_address=item.get("ip_address"),
                open_ports=json.dumps(item.get("open_ports", [])),
                technologies=json.dumps(item.get("technologies", [])),
                http_status=item.get("http_status"),
                http_title=item.get("http_title"),
                risk_score=item["risk_score"],
                risk_level=item["risk_level"],
                shodan_data=item.get("shodan_data", "{}"),
                first_seen=now,
                last_seen=now,
                last_scanned=now,
                status=AssetStatus.active,
                discovered_in_scan=scan_id,
            )
            db.add(new_asset)
            new_assets.append(item["value"])
            await db.flush()  # ensure new_asset.id is populated

            # Emit ASM new asset record event
            raw_asset_type = item["asset_type"]
            evt_type = (
                ASMEventType.new_subdomain
                if raw_asset_type == AssetType.subdomain
                else ASMEventType.new_ip
                if raw_asset_type == AssetType.ip
                else ASMEventType.new_service
            )

            type_name = (
                raw_asset_type.value
                if hasattr(raw_asset_type, "value")
                else str(raw_asset_type)
            )
            evt_title = f"New {type_name} discovered: {item['value']}"

            evt = ASMEvent(
                org_id=org_id,
                asset_id=new_asset.id,
                scan_id=scan_id,
                event_type=evt_type,
                severity=ASMEventSeverity.info,
                title=evt_title,
                description=f"A new {type_name} was found during continuous enumeration.",
                details=json.dumps(
                    {
                        "value": item["value"],
                        "ip": item.get("ip_address"),
                        "ports": item.get("open_ports", []),
                    }
                ),
            )
            db.add(evt)

            # If new asset has CVEs, emit new_vulnerability event immediately
            curr_shodan = {}
            try:
                curr_shodan = json.loads(item.get("shodan_data", "{}"))
            except Exception:
                curr_shodan = {}
            new_asset_cves = curr_shodan.get("shodan_vulns", {}).get("cve_ids", [])
            if new_asset_cves:
                vuln_evt = ASMEvent(
                    org_id=org_id,
                    asset_id=new_asset.id,
                    scan_id=scan_id,
                    event_type=ASMEventType.new_vulnerability,
                    severity=ASMEventSeverity.critical
                    if item["risk_level"] == "Critical"
                    else ASMEventSeverity.high,
                    title=f"Vulnerabilities detected on new asset {item['value']}",
                    description=f"Shodan reported {len(new_asset_cves)} known CVE(s): {', '.join(sorted(new_asset_cves)[:5])}",
                    details=json.dumps({"cve_ids": sorted(new_asset_cves)}),
                )
                db.add(vuln_evt)

    await db.commit()

    # ── Step 5: Mark stale assets ─────────────────────────────────────────
    stale_result = await db.execute(
        select(Asset).where(
            and_(
                Asset.org_id == org_id,
                Asset.last_seen < (now - timedelta(days=30)),
                Asset.status == AssetStatus.active,
            )
        )
    )
    stale_assets = stale_result.scalars().all()
    for a in stale_assets:
        a.status = AssetStatus.stale
    await db.commit()

    # ── Step 6: Build summary ─────────────────────────────────────────────
    all_result = await db.execute(select(Asset).where(Asset.org_id == org_id))
    all_assets = all_result.scalars().all()

    summary = {
        "total": len(all_assets),
        "domains": sum(1 for a in all_assets if a.asset_type == AssetType.domain),
        "subdomains": sum(1 for a in all_assets if a.asset_type == AssetType.subdomain),
        "ips": sum(1 for a in all_assets if a.asset_type == AssetType.ip),
        "servers": sum(1 for a in all_assets if a.asset_type == AssetType.server),
        "apis": sum(1 for a in all_assets if a.asset_type == AssetType.api),
        "high_risk": sum(1 for a in all_assets if a.risk_level in ("High", "Critical")),
        "critical": sum(1 for a in all_assets if a.risk_level == "Critical"),
        "active": sum(1 for a in all_assets if a.status == AssetStatus.active),
        "stale": sum(1 for a in all_assets if a.status == AssetStatus.stale),
        "new_last_24h": len(new_assets),
        "new_assets": new_assets[:20],
        "updated_assets": updated_assets[:20],
        "target": target,
        "scanned_at": now.isoformat(),
    }

    logger.info(
        f"[ASM] Discovery complete for {target}: {summary['total']} total assets, {len(new_assets)} new"
    )
    return summary
