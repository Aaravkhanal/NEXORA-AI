from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import settings

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Dependency to validate Clerk JWT tokens.
    In a real app, this should verify against Clerk's JWKS using the clerk-backend-api or pyjwt.
    For this placeholder, we just decode without verification if CLERK_SECRET_KEY is missing,
    or you can plug in your real JWKS URL.
    """
    token = credentials.credentials
    try:
        # Placeholder: you'd use jwt.decode(token, key, algorithms=["RS256"]) with the JWKS key
        # For now, we'll just decode unverified to extract the user ID for testing the flow
        unverified_payload = jwt.decode(token, options={"verify_signature": False})
        user_id = unverified_payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
