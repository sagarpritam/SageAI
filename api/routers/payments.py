import os
import jwt
import stripe
from fastapi import APIRouter, Header, HTTPException

router = APIRouter(prefix="/payments", tags=["Payments"])
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@router.post("/checkout")
async def create_checkout_session(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.split(" ")[1]
    try:
        # Decode the Clerk JWT payload solely to extract the user ID
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("No user ID found")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")

    try:
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'inr',
                    'product_data': {
                        'name': 'SageAI Founder Mode',
                        'description': 'Unlimited AI pentests, comprehensive reporting, and priority support.',
                    },
                    'unit_amount': 99900,  # 99900 paise = ₹999.00
                },
                'quantity': 1,
            }],
            mode='payment',
            client_reference_id=user_id,
            success_url=f"{frontend_url}/pricing?success=true",
            cancel_url=f"{frontend_url}/pricing?canceled=true",
        )
        return {"url": session.url}
    except Exception as e:
        print(f"Checkout Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
