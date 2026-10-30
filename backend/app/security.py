import time
import threading
from collections import defaultdict
from fastapi import HTTPException, Request, status


class RateLimiter:
    """Token-bucket style in-memory rate limiter (per key). Not for multi-process deployments."""

    def __init__(self, max_calls: int, window_seconds: int):
        self.max_calls = max_calls
        self.window_seconds = window_seconds
        self._calls: dict[str, list[float]] = defaultdict(list)
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = time.time()
        with self._lock:
            window = self._calls[key]
            cutoff = now - self.window_seconds
            self._calls[key] = [t for t in window if t > cutoff]
            if len(self._calls[key]) >= self.max_calls:
                return False
            self._calls[key].append(now)
            return True


rate_limiter = RateLimiter(max_calls=30, window_seconds=60)
scan_rate_limiter = RateLimiter(max_calls=10, window_seconds=60)
auth_rate_limiter = RateLimiter(max_calls=20, window_seconds=60)


# Revoked access tokens (keyed by raw token string). In production replace with Redis.
REVOKED_TOKENS: set[str] = set()


def revoke_token(token: str) -> None:
    REVOKED_TOKENS.add(token)


def is_token_revoked(token: str) -> bool:
    return token in REVOKED_TOKENS


def clear_revoked_tokens() -> None:
    REVOKED_TOKENS.clear()


def rate_limit(limiter: RateLimiter):
    def dependency(request: Request) -> None:
        key = request.client.host if request.client else "unknown"
        if not limiter.allow(key):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Try again later.",
            )
    return dependency
