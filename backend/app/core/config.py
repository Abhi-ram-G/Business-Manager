from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = ""
    supabase_pooler_url: str = ""
    postgres_url: str = ""
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 1440
    supabase_project_url: str = "https://vwtjogybncekikjyqgur.supabase.co"
    supabase_publishable_key: str = ""
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
    allowed_origin_regex: str = r"^(https://.*\.vercel\.app|https://.*\.netlify\.app)$"

    @field_validator("allowed_origins")
    @classmethod
    def normalize_allowed_origins(cls, value: str) -> str:
        return value.strip()

    @field_validator("database_url")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        return value.strip()

    @field_validator("supabase_pooler_url")
    @classmethod
    def normalize_supabase_pooler_url(cls, value: str) -> str:
        return value.strip()

    @field_validator("postgres_url")
    @classmethod
    def normalize_postgres_url(cls, value: str) -> str:
        return value.strip()

    @property
    def allowed_origin_list(self) -> List[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]

    @property
    def selected_db_env_var(self) -> str:
        if self.supabase_pooler_url:
            return "SUPABASE_POOLER_URL"
        if self.database_url:
            return "DATABASE_URL"
        if self.postgres_url:
            return "POSTGRES_URL"
        return "None"

    @property
    def effective_database_url(self) -> str:
        # Priority:
        # 1. SUPABASE_POOLER_URL
        # 2. DATABASE_URL
        # 3. POSTGRES_URL
        url = self.supabase_pooler_url or self.database_url or self.postgres_url
        
        # If the pooler URL is set, and the chosen database URL points to a direct connection
        # (e.g., db.<project>.supabase.co), replace it with the pooler connection string.
        if self.supabase_pooler_url and ("db." in url and ".supabase.co" in url):
            return self.supabase_pooler_url
            
        return url




@lru_cache
def get_settings() -> Settings:
    return Settings()
