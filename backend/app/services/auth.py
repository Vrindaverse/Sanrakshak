import uuid
import bcrypt
import logging
from datetime import datetime, timedelta, timezone
from jose import jwt
from app.config import settings
from app.logging import get_logger
from app.security import revoke_token

logger = get_logger("sanrakshak.auth")

MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_BYTES = 72  # bcrypt limit


def validate_password(password: str) -> None:
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
    if len(password.encode("utf-8")) > MAX_PASSWORD_BYTES:
        raise ValueError("Password is too long (bcrypt 72-byte limit)")


def hash_password(password: str) -> str:
    validate_password(password)
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception as exc:
        logger.warning("Password verification raised: %s", exc)
        return False


def create_access_token(user_id: uuid.UUID) -> str:
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(user_id), "jti": jti, "exp": int(expire.timestamp())}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def revoke_access_token(token: str) -> None:
    revoke_token(token)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except Exception as exc:
        logger.warning("Token decode failed: %s", exc)
        return None
