
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import User


security_bearer = HTTPBearer(auto_error=False)


def _unauthorized(detail: str = "Invalid or expired authentication token.") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def _get_active_user_from_payload(payload: Optional[dict], db: Session) -> Optional[User]:
    """Return an active user only when the JWT subject is a valid user ID."""
    if not isinstance(payload, dict):
        return None

    user_id = payload.get("sub")

    # Reject missing, non-numeric, zero, negative and malformed IDs.
    if not isinstance(user_id, str) or not user_id.isdigit():
        return None

    try:
        parsed_user_id = int(user_id)
    except (TypeError, ValueError, OverflowError):
        return None

    if parsed_user_id <= 0:
        return None

    return (
        db.query(User)
        .filter(User.id == parsed_user_id, User.is_active.is_(True))
        .first()
    )


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db),
) -> User:
    """Validate JWT token and return the active authenticated user."""
    if credentials is None:
        raise _unauthorized("Authentication required. Please log in.")

    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise _unauthorized()

    user = _get_active_user_from_payload(payload, db)
    if user is None:
        raise _unauthorized("User account not found, inactive, or token subject is invalid.")

    return user


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Return an active authenticated user, or None for guest access."""
    if credentials is None:
        return None

    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        return None

    try:
        return _get_active_user_from_payload(payload, db)
    except Exception:
        # Optional authentication must not break public guest endpoints.
        return None