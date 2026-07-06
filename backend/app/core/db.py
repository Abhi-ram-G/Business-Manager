from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings


class Base(DeclarativeBase):
    pass


settings = get_settings()

db_url = settings.effective_database_url

if not db_url:
    raise RuntimeError(
        "Database connection URL is missing. Please configure at least one of the "
        "following environment variables in your environment or .env file (listed in priority order):\n"
        "  1. SUPABASE_POOLER_URL (Recommended for Render/IPv4 hosts)\n"
        "  2. DATABASE_URL\n"
        "  3. POSTGRES_URL"
    )

# Validate and auto-correct parsed SQLAlchemy connection string
from urllib.parse import urlparse
try:
    parsed = urlparse(db_url)
    if not parsed.scheme or not parsed.hostname or not parsed.username:
        raise ValueError("Scheme, Hostname, or Username is missing in database URL.")
    if parsed.scheme not in ["postgresql", "postgresql+psycopg2"]:
        raise ValueError(f"Invalid scheme '{parsed.scheme}'. Only 'postgresql' is supported.")
    
    # Auto-correct host if it's pointing to non-Tokyo poolers
    host = parsed.hostname
    if "pooler.supabase.com" in host and host != "aws-0-ap-northeast-1.pooler.supabase.com":
        print(f"[WARNING] Overriding incorrect pooler host '{host}' with Tokyo region host 'aws-0-ap-northeast-1.pooler.supabase.com'")
        port_part = f":{parsed.port}" if parsed.port else ""
        pass_part = f":{parsed.password}" if parsed.password else ""
        query_part = f"?{parsed.query}" if parsed.query else ""
        db_url = f"postgresql://{parsed.username}{pass_part}@aws-0-ap-northeast-1.pooler.supabase.com{port_part}{parsed.path}{query_part}"
        parsed = urlparse(db_url)
        host = parsed.hostname

    # Auto-correct username for poolers
    username = parsed.username
    if "pooler.supabase.com" in host and username != "postgres.vwtjogybncekikjyqgur":
        print(f"[WARNING] Incorrect username '{username}' for pooler. Expected 'postgres.vwtjogybncekikjyqgur'. Fixing it.")
        pass_part = f":{parsed.password}" if parsed.password else ""
        port_part = f":{parsed.port}" if parsed.port else ""
        query_part = f"?{parsed.query}" if parsed.query else ""
        db_url = f"postgresql://postgres.vwtjogybncekikjyqgur{pass_part}@{host}{port_part}{parsed.path}{query_part}"
        parsed = urlparse(db_url)
        username = parsed.username

except Exception as err:
    raise ValueError(f"Database connection URL validation failed: {err}")

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
    connect_args={"sslmode": "require"} if db_url.startswith("postgresql") else {},
)


SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
