import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.organization import Organization

router = APIRouter(prefix="/payments", tags=["Payments"])

stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/checkout")
async def create_checkout_session(current_user: dict = Depends(get_current_user)):
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=500, detail="Stripe integration is not configured"
        )

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": "SageAI Pro",
                            "description": "Unlimited Scans & Autonomous Response Engine",
                        },
                        "unit_amount": 4900,  # $49.00
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            metadata={"org_id": str(current_user.get("org") or "")},
            success_url=f"{settings.FRONTEND_URL}/history?payment=success",
            cancel_url=f"{settings.FRONTEND_URL}/pricing?payment=cancelled",
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return {"error": "Invalid payload"}
    except stripe.error.SignatureVerificationError:
        return {"error": "Invalid signature"}

    # Handle the checkout.session.completed event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        org_id = session.get("metadata", {}).get("org_id")

        if org_id:
            # Upgrade org plan to pro
            result = await db.execute(
                select(Organization).where(Organization.id == org_id)
            )
            org = result.scalar_one_or_none()
            if org:
                org.plan = "pro"
                db.add(org)
                await db.commit()

    return {"status": "success"}
