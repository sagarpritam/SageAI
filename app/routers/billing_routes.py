"""Stripe billing service — subscriptions and checkout."""

import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.organization import Organization

logger = logging.getLogger("sageai.billing")
router = APIRouter(prefix="/billing", tags=["Billing"])

from app.core.rate_limit import limiter

# Hardcoded for now, or from env vars
PLAN_PRICES = {
    "starter": settings.STRIPE_STARTER_PRICE_ID,
    "pro": settings.STRIPE_PRO_PRICE_ID,
    "enterprise": settings.STRIPE_ENTERPRISE_PRICE_ID,
}


def get_stripe():
    """Lazy import stripe to avoid errors when not configured."""
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=503, detail="Billing not configured. Stripe keys missing."
        )
    import stripe

    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


@router.post("/checkout")
@limiter.limit("60/minute")
async def create_checkout_session(
    request: Request,
    plan: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe checkout session for plan upgrade."""
    stripe = get_stripe()

    if plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan")

    org_id = current_user.get("org")
    if not org_id:
        raise HTTPException(status_code=400, detail="User not part of an organization")

    # Check if org already has a customer ID
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    customer_id = org.stripe_customer_id

    try:
        session_params = {
            "payment_method_types": ["card"],
            "line_items": [{"price": PLAN_PRICES[plan], "quantity": 1}],
            "mode": "subscription",
            "success_url": settings.FRONTEND_URL + "/plan?success=true",
            "cancel_url": settings.FRONTEND_URL + "/plan?canceled=true",
            "client_reference_id": org_id,  # Link session to internal org
            "metadata": {"org_id": org_id, "plan": plan},
        }
        if customer_id:
            session_params["customer"] = customer_id

        session = stripe.checkout.Session.create(**session_params)
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail=f"Billing error: {e}")


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Handle Stripe webhook events asynchronously."""
    stripe = get_stripe()

    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        logger.warning(f"Webhook signature verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    event_type = event["type"]

    try:
        if event_type == "checkout.session.completed":
            session = event["data"]["object"]
            org_id = session.get("client_reference_id") or session.get(
                "metadata", {}
            ).get("org_id")
            customer_id = session.get("customer")
            subscription_id = session.get("subscription")
            plan_name = session.get("metadata", {}).get("plan", "pro")

            if org_id:
                logger.info(
                    f"Payment succeeded for org {org_id}: upgrading to {plan_name}"
                )
                result = await db.execute(
                    select(Organization).where(Organization.id == org_id)
                )
                org = result.scalar_one_or_none()
                if org:
                    org.plan = plan_name
                    org.stripe_customer_id = customer_id
                    org.stripe_subscription_id = subscription_id
                    await db.commit()
                else:
                    logger.error(f"Webhook error: Org {org_id} not found in DB")

        elif event_type == "customer.subscription.deleted":
            subscription = event["data"]["object"]
            sub_id = subscription.get("id")

            logger.info(f"Subscription canceled: {sub_id} — downgrading to free")
            result = await db.execute(
                select(Organization).where(
                    Organization.stripe_subscription_id == sub_id
                )
            )
            org = result.scalar_one_or_none()
            if org:
                org.plan = "free"
                org.stripe_subscription_id = None
                await db.commit()
            else:
                logger.warning(
                    f"Could not find org with subscription ID {sub_id} to downgrade"
                )

        elif event_type == "customer.subscription.updated":
            subscription = event["data"]["object"]
            sub_id = subscription.get("id")
            status = subscription.get("status")

            # If payment fails and subscription becomes past_due or unpaid, we could downgrade or suspend here
            logger.info(f"Subscription updated: {sub_id} status is now {status}")
            if status in ["past_due", "unpaid", "canceled"]:
                result = await db.execute(
                    select(Organization).where(
                        Organization.stripe_subscription_id == sub_id
                    )
                )
                org = result.scalar_one_or_none()
                if org:
                    org.plan = "free"
                    await db.commit()
                    logger.info(f"Downgraded org {org.id} due to non-payment")

    except Exception as e:
        logger.error(f"Error processing webhook event: {e}", exc_info=True)
        # We don't raise 500 here because we want to acknowledge the webhook to Stripe,
        # unless it's a critical DB connection error. For now, we'll swallow logical errors.

    return {"status": "ok"}


@router.get("/portal")
@limiter.limit("60/minute")
async def create_portal_session(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe customer portal session for managing subscription."""
    stripe = get_stripe()

    org_id = current_user.get("org")
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()

    if not org or not org.stripe_customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription found to manage",
        )

    try:
        session = stripe.billing_portal.Session.create(
            customer=org.stripe_customer_id,
            return_url=settings.FRONTEND_URL + "/plan",
        )
        return {"portal_url": session.url}
    except Exception as e:
        logger.error(f"Portal error: {e}")
        raise HTTPException(status_code=500, detail="Portal error")
