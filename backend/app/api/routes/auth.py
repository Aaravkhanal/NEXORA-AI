from fastapi import APIRouter, Request, HTTPException
from app.db.session import AsyncSessionLocal
from app.db.models import UserModel
from sqlalchemy import select
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["auth"])

@router.post("/auth/webhook")
async def clerk_webhook(request: Request):
    """
    Webhook endpoint to sync users from Clerk to PostgreSQL.
    In production, you MUST verify the Svix signature to ensure this request is from Clerk!
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event_type = payload.get("type")
    data = payload.get("data", {})

    if event_type == "user.created":
        user_id = data.get("id")
        email_addresses = data.get("email_addresses", [])
        primary_email = email_addresses[0].get("email_address") if email_addresses else None
        
        async with AsyncSessionLocal() as session:
            # Check if user exists
            result = await session.execute(select(UserModel).where(UserModel.id == user_id))
            if not result.scalar_one_or_none():
                new_user = UserModel(id=user_id, email=primary_email)
                session.add(new_user)
                await session.commit()
                logger.info("Created new user in DB: %s", user_id)
                
    elif event_type == "user.deleted":
        user_id = data.get("id")
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(UserModel).where(UserModel.id == user_id))
            user = result.scalar_one_or_none()
            if user:
                await session.delete(user)
                await session.commit()
                logger.info("Deleted user from DB: %s", user_id)

    return {"status": "success"}
