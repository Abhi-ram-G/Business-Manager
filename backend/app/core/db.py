from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings


class Base(DeclarativeBase):
    pass


settings = get_settings()

if not settings.effective_database_url:
    raise RuntimeError(
        "Database connection URL is missing. Please configure at least one of the "
        "following environment variables in your environment or .env file (listed in priority order):\n"
        "  1. SUPABASE_POOLER_URL (Recommended for Render/IPv4 hosts)\n"
        "  2. DATABASE_URL\n"
        "  3. POSTGRES_URL"
    )

engine = create_engine(
    settings.effective_database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
    connect_args={"sslmode": "require"} if settings.effective_database_url.startswith("postgresql") else {},
)


SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
