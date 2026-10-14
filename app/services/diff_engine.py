"""
SageAI Enterprise — Attack Surface Diff Engine
Computes differences between historical asset states or scans to detect drifts,
new open ports, new vulnerabilities, and newly discovered subdomains.
"""

import json
from typing import Any, Dict

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.models.asset_diff import AttackSurfaceDiff
from app.models.finding import Finding
from app.models.scan import Scan


def compute_list_diff(prev_list: list, curr_list: list) -> Dict[str, list]:
    """Helper to compute additions and removals between two lists."""
    prev_set = set(prev_list)
    curr_set = set(curr_list)
    return {
        "added": list(curr_set - prev_set),
        "removed": list(prev_set - curr_set),
    }


def compute_asset_diff(prev_asset: Asset, curr_asset: Asset) -> Dict[str, Any]:
    """Compute the difference between two asset states."""

    # Safely load JSON strings into lists/dicts
    try:
        prev_ports = json.loads(prev_asset.open_ports) if prev_asset.open_ports else []
        curr_ports = json.loads(curr_asset.open_ports) if curr_asset.open_ports else []
    except json.JSONDecodeError:
        prev_ports, curr_ports = [], []

    try:
        prev_tech = (
            json.loads(prev_asset.technologies) if prev_asset.technologies else []
        )
        curr_tech = (
            json.loads(curr_asset.technologies) if curr_asset.technologies else []
        )
    except json.JSONDecodeError:
        prev_tech, curr_tech = [], []

    diffs = {
        "ports": compute_list_diff(prev_ports, curr_ports),
        "technologies": compute_list_diff(prev_tech, curr_tech),
    }

    # Compare Risk
    risk_shift = "nc"
    if curr_asset.risk_score > prev_asset.risk_score:
        risk_shift = "increased"
    elif curr_asset.risk_score < prev_asset.risk_score:
        risk_shift = "decreased"

    diffs["overall_risk_shift"] = risk_shift

    return diffs


async def generate_scan_diff(
    db: Session, org_id: str, asset_value: str, current_scan_id: str
) -> AttackSurfaceDiff:
    """
    Finds the most recent prior scan for an asset, compares it against the current scan,
    and stores the diff in the database to track Attack Surface Drift.
    """

    # 1. Extract the current scan
    stmt_curr_scan = select(Scan).where(Scan.id == current_scan_id)
    curr_scan_res = await db.execute(stmt_curr_scan)
    curr_scan = curr_scan_res.scalars().first()
    if not curr_scan:
        return None

    # 2. Extract the current asset (if exists)
    stmt_curr = select(Asset).where(
        Asset.org_id == org_id,
        Asset.value == asset_value,
    )
    curr_res = await db.execute(stmt_curr)
    curr_asset = curr_res.scalars().first()

    # 3. Find the immediate previous scan for this target
    stmt_prev = (
        select(Scan)
        .where(
            Scan.organization_id == org_id,
            Scan.target == asset_value,
            Scan.id != current_scan_id,
            Scan.status == "completed",
        )
        .order_by(desc(Scan.ended_at))
        .limit(1)
    )
    prev_res = await db.execute(stmt_prev)
    prev_scan = prev_res.scalars().first()

    # If no previous baseline exists, we can't diff vulnerabilities reliably
    if not prev_scan:
        return None

    # 4. Compare vulnerability findings between the two scans for this target
    stmt_curr_findings = select(Finding).where(
        Finding.scan_id == current_scan_id, Finding.target == asset_value
    )
    curr_find_res = await db.execute(stmt_curr_findings)
    curr_findings = curr_find_res.scalars().all()

    stmt_prev_findings = select(Finding).where(
        Finding.scan_id == prev_scan.id, Finding.target == asset_value
    )
    prev_find_res = await db.execute(stmt_prev_findings)
    prev_findings = prev_find_res.scalars().all()

    prev_cves = {f.title for f in prev_findings if "CVE" in f.title.upper()}
    curr_cves = {f.title for f in curr_findings if "CVE" in f.title.upper()}

    vuln_diff = {
        "new_cves": list(curr_cves - prev_cves),
        "resolved_cves": list(prev_cves - curr_cves),
    }

    # Default empty infrastructure diffs for Scan hooks
    empty_diff = {"added": [], "removed": []}

    # 5. Save the AttackSurfaceDiff record
    diff_record = AttackSurfaceDiff(
        org_id=org_id,
        asset_id=curr_asset.id if curr_asset else None,
        previous_scan_id=prev_scan.id,
        current_scan_id=current_scan_id,
        ports_diff=json.dumps(empty_diff),
        vulnerabilities_diff=json.dumps(vuln_diff),
        technologies_diff=json.dumps(empty_diff),
        subdomains_diff=json.dumps(empty_diff),
        overall_risk_shift="nc",
    )

    db.add(diff_record)
    await db.commit()
    await db.refresh(diff_record)

    return diff_record
