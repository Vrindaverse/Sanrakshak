from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = ""
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    gemini_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
