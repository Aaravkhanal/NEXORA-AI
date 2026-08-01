import stripe
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy import select

from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.db.models import UserModel
from app.api.dependencies import get_current_user
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["billing"])

if settings.stripe_api_key:
    stripe.api_key = settings.stripe_api_key

@router.post("/billing/create-checkout-session")
async def create_checkout_session(user_id: str = Depends(get_current_user)):
    """
    Creates a Stripe Checkout session for a subscription upgrade.
    """
    try:
        if not settings.stripe_pro_price_id:
            raise HTTPException(status_code=500, detail="Stripe price ID not configured")

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': settings.stripe_pro_price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{settings.frontend_url}/dashboard?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.frontend_url}/dashboard",
            client_reference_id=user_id,
        )
        return {"checkout_url": session.url}
    except Exception as e:
        logger.error("Stripe error: %s", str(e))
        raise HTTPException(status_code=500, detail="Could not create checkout session")

@router.post("/billing/webhook")
async def stripe_webhook(request: Request):
    """
    Webhook to handle Stripe events (e.g. checkout.session.completed).
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=500, detail="Stripe webhook secret not configured")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Stripe signature verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('client_reference_id')
        customer_id = session.get('customer')

        if user_id:
            async with AsyncSessionLocal() as db_session:
                result = await db_session.execute(select(UserModel).where(UserModel.id == user_id))
                user = result.scalar_one_or_none()
                if user:
                    user.stripe_customer_id = customer_id
                    user.subscription_tier = "pro"
                    await db_session.commit()
                    logger.info("Upgraded user %s to PRO tier", user_id)

    return {"status": "success"}
