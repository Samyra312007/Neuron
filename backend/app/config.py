from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://neuron:neuron_pass@localhost:5432/neuron"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "neuron-dev-secret-key-change-in-production"
    environment: str = "development"

    nvidia_nim_api_key: str = ""
    nvidia_nim_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_nim_model: str = "meta/llama-3.3-70b-instruct"

    mock_ai: bool = False

    @property
    def mock_ai_enabled(self) -> bool:
        return self.mock_ai or not self.nvidia_nim_api_key

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
