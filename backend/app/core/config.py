from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "project0-backend"
    DATABASE_URL: str = "postgresql://project0_user:project0_pass@db:5432/project0"


settings = Settings()