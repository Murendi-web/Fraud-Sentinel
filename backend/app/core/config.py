from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ANTHROPIC_API_KEY: str = ""
    DATABASE_URL: str = "sqlite+aiosqlite:///./fraud_sentinel.db"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    SIMULATE_TRANSACTIONS: bool = True
    SIMULATION_INTERVAL_SECONDS: int = 3


settings = Settings()
