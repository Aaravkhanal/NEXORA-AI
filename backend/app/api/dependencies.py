import json
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import settings
import httpx

security = HTTPBearer()

# Cache the JWKS so we don't fetch it every request
_jwks_client = None

def get_jwks_client():
    global _jwks_client
    if _jwks_client is None and settings.clerk_jwks_url:
        _jwks_client = jwt.PyJWKClient(settings.clerk_jwks_url)
    return _jwks_client

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Dependency to validate Clerk JWT tokens securely.
    """
    token = credentials.credentials
    try:
        if settings.clerk_secret_key:
            # For testing with symmetric keys (if used)
            payload = jwt.decode(token, settings.clerk_secret_key, algorithms=["HS256"])
        else:
            jwks_client = get_jwks_client()
            if jwks_client:
                signing_key = jwks_client.get_signing_key_from_jwt(token)
                payload = jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=["RS256"],
                    audience=settings.frontend_url,
                    options={"verify_exp": True}
                )
            else:
                # Fallback to unverified for local development if explicitly allowed
                if settings.app_env == "production":
                    raise HTTPException(status_code=401, detail="JWKS URL not configured in production")
                payload = jwt.decode(token, options={"verify_signature": False})
                
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
