"""
SageAI 4.0 — Continuous ASM Diff Engine
"""

import logging

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.asset import Asset, AssetType
from app.models.organization import Organization
from app.services.asset_inventory.asset_discovery_service import discover_assets

logger = logging.getLogger("sageai.asm")


async def run_asm_diff():
    """
    Orchestrates the periodic Continuous ASM recon.
    Fetches active organizations, finds target domains, and runs discovery.
    """
    logger.info("[ASM] Starting continuous scheduled recon...")
    try:
        async with AsyncSessionLocal() as db:
            # Get all organizations
            org_result = await db.execute(select(Organization))
            orgs = org_result.scalars().all()

            for org in orgs:
                # Find root domains for the organization
                asset_result = await db.execute(
                    select(Asset).where(
                        Asset.org_id == org.id, Asset.asset_type == AssetType.domain
                    )
                )
                domains = asset_result.scalars().all()
                if not domains:
                    logger.info(
                        f"[ASM] No root domains found for organization {org.name}"
                    )
                    continue

                for domain in domains:
                    try:
                        logger.info(
                            f"[ASM] Dispatching scheduled recon on {domain.value} (org: {org.name})"
                        )
                        await discover_assets(org.id, domain.value, db)
                    except Exception as e:
                        logger.error(
                            f"[ASM] Error conducting recon for {domain.value}: {e}"
                        )

            logger.info(
                f"[ASM] Scheduled recon finished for {len(orgs)} organizations."
            )
    except Exception as e:
        logger.error(f"[ASM] Fatal error in scheduled recon: {e}")
