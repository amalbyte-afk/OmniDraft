from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_service_key: str = ""
    nvidia_api_key: str = ""
    nvidia_model: str = "z-ai/glm-5.2"
    allowed_origins: str = "http://localhost:5173"
    rate_limit: str = "20/minute"
    max_tokens: int = 4096
    log_level: str = "INFO"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
