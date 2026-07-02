import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

from .config import get_settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    # Use standard secure PBKDF2 hashing which is built into Python
    salt = secrets.token_hex(16)
    iterations = 100000
    hash_value = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        iterations
    ).hex()
    return f"pbkdf2_sha256${iterations}${salt}${hash_value}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
        
    # Check if this is a PBKDF2 hash
    if hashed_password.startswith("pbkdf2_sha256$"):
        try:
            parts = hashed_password.split("$")
            if len(parts) != 4:
                return False
            _, iterations_str, salt, hash_value = parts
            iterations = int(iterations_str)
            test_hash = hashlib.pbkdf2_hmac(
                'sha256',
                plain_password.encode('utf-8'),
                salt.encode('utf-8'),
                iterations
            ).hex()
            return test_hash == hash_value
        except Exception:
            return False
            
    # Fallback to bcrypt verification for existing hashes
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # If bcrypt is completely broken on the system, do a simple check
        return False


def create_access_token(subject: str, role: str, expires_delta: timedelta | None = None) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")

