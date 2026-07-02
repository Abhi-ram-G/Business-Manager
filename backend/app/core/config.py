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
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 1440
    supabase_project_url: str = "https://vwtjogybncekikjyqgur.supabase.co"
    supabase_publishable_key: str = ""
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    @field_validator("allowed_origins")
    @classmethod
    def normalize_allowed_origins(cls, value: str) -> str:
        return value.strip()

    @field_validator("database_url")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        return value.strip()

    @property
    def allowed_origin_list(self) -> List[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
