"""Application configuration settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    PROJECT_NAME: str = "GTD Task Management"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://gtd:gtd_dev@postgres:5432/gtd"
    DATABASE_TEST_URL: str = "postgresql://gtd_test:gtd_test@postgres-test:5432/gtd_test"

    # API
    API_V1_PREFIX: str = "/api/v1"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")


settings = Settings()
