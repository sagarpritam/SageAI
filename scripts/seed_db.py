"""
Database Seeding Script for SageAI.
Populates the database with a test admin user, demo organization, and mock assets.
"""
import asyncio
import logging
import os

from sqlalchemy import select

from app.core.database import AsyncSessionLocal, init_db
from app.core.security import hash_password
from app.models.asset import Asset, AssetStatus, AssetType
from app.models.organization import Organization
from app.models.user import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_db")


async def seed():
    # Ensure tables exist
    await init_db()

    async with AsyncSessionLocal() as db:
        # Check if users already exist
        result = await db.execute(select(User).limit(1))
        existing_user = result.scalar_one_or_none()

        if existing_user:
            logger.warning("Database already contains users. Skipping seed.")
            return

        logger.info("Seeding database...")

        # 1. Create Demo Organization
        org = Organization(
            name="SageAI Demo Corp",
            subscription_plan="enterprise",
        )
        db.add(org)
        await db.commit()
        await db.refresh(org)
        logger.info(f"Created organization: {org.name} (ID: {org.id})")

        # 2. Create Admin User
        admin_email = "admin@sageai.com"
        admin_password = "admin"
        admin = User(
            email=admin_email,
            password_hash=hash_password(admin_password),
            organization_id=org.id,
            role="admin",
            is_active=True,
            mfa_enabled=False,
        )
        db.add(admin)
        await db.commit()
        logger.info(f"Created admin user: {admin_email} / pass: '{admin_password}'")

        # 3. Create Sample Assets
        assets = [
            Asset(
                org_id=org.id,
                asset_type=AssetType.domain,
                value="sageai.com",
                risk_level="Low",
                risk_score=1.5,
                status=AssetStatus.active,
                http_status=200,
                http_title="SageAI SecOps",
                technologies='["Tailwind CSS", "React", "Next.js"]',
            ),
            Asset(
                org_id=org.id,
                asset_type=AssetType.subdomain,
                value="api.sageai.com",
                ip_address="192.168.1.100",
                open_ports='[80, 443]',
                risk_level="Medium",
                risk_score=5.0,
                status=AssetStatus.active,
            ),
            Asset(
                org_id=org.id,
                asset_type=AssetType.server,
                value="dev-server-01",
                ip_address="10.0.0.50",
                open_ports='[22, 8080]',
                risk_level="High",
                risk_score=8.5,
                status=AssetStatus.stale,
                technologies='["OpenSSH", "Apache"]',
                risk_summary='{"critical_vulns": 2, "high_vulns": 1, "notes": "Outdated SSH version"}',
            ),
        ]

        db.add_all(assets)
        await db.commit()
        logger.info(f"Created {len(assets)} sample assets")

        logger.info("Database seeding completed successfully! 🎉")


if __name__ == "__main__":
    if os.getenv("ENV", "development") != "development":
        logger.error("Seeding aborted. Only permitted in development environment.")
    else:
        asyncio.run(seed())
