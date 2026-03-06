import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.organization import Organization
from app.core.security import hash_password

async def setup():
    async with AsyncSessionLocal() as db:
        # Create org if not exists
        org_res = await db.execute(select(Organization).where(Organization.name == "Demo Org"))
        org = org_res.scalar_one_or_none()
        if not org:
            org = Organization(name="Demo Org", plan="enterprise")
            db.add(org)
            await db.flush()

        # Check user
        user_res = await db.execute(select(User).where(User.email == "admin@test.com"))
        user = user_res.scalar_one_or_none()
        
        if not user:
            user = User(
                email="admin@test.com",
                password_hash=hash_password("Admin@123"),
                role="admin",
                organization_id=org.id
            )
            db.add(user)
            print("Created admin@test.com / Admin@123")
        else:
            user.password_hash = hash_password("Admin@123")
            print("Reset password for admin@test.com / Admin@123")
            
        await db.commit()

asyncio.run(setup())
