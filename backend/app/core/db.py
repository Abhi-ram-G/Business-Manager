from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings


class Base(DeclarativeBase):
    pass


settings = get_settings()

if not settings.effective_database_url:
    raise RuntimeError(
        "Database connection is not configured. Set SUPABASE_POOLER_URL for Render "
        "(recommended for IPv4-only networks) or DATABASE_URL for direct Postgres access."
    )

engine = create_engine(
    settings.effective_database_url,
    pool_pre_ping=True,
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
