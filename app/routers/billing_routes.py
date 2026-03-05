"""Stripe billing service — subscriptions and checkout."""

import os
import logging
from fastapi import APIRouter, HTTPException, Request

logger = logging.getLogger("sageai.billing")
router = APIRouter(prefix="/billing", tags=["Billing"])

STRIPE_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# Plan price IDs from Stripe dashboard
PLAN_PRICES = {
    "pro": os.getenv("STRIPE_PRO_PRICE_ID", "price_pro_placeholder"),
    "enterprise": os.getenv("STRIPE_ENTERPRISE_PRICE_ID", "price_enterprise_placeholder"),
}


def get_stripe():
    """Lazy import stripe to avoid errors when not configured."""
    if not STRIPE_KEY:
        raise HTTPException(status_code=503, detail="Billing not configured")
    import stripe
    stripe.api_key = STRIPE_KEY
    return stripe


@router.post("/checkout")
async def create_checkout_session(plan: str):
    """Create a Stripe checkout session for plan upgrade."""
    stripe = get_stripe()

    if plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan")

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price": PLAN_PRICES[plan], "quantity": 1}],
            mode="subscription",
            success_url=os.getenv("FRONTEND_URL", "http://localhost:5173") + "/plan?success=true",
            cancel_url=os.getenv("FRONTEND_URL", "http://localhost:5173") + "/plan?canceled=true",
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail="Billing error")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    stripe = get_stripe()
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        logger.info(f"Payment succeeded: {session['id']}")
        # TODO: Update organization plan in database

    elif event["type"] == "customer.subscription.deleted":
        logger.info("Subscription canceled — downgrade to free")
        # TODO: Downgrade organization to free plan

    return {"status": "ok"}


@router.get("/portal")
async def create_portal_session(customer_id: str):
    """Create a Stripe customer portal session for managing subscription."""
    stripe = get_stripe()
    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=os.getenv("FRONTEND_URL", "http://localhost:5173") + "/plan",
        )
        return {"portal_url": session.url}
    except Exception as e:
        logger.error(f"Portal error: {e}")
        raise HTTPException(status_code=500, detail="Portal error")
