"""
Configuration module for the ChainAI backend.
Loads environment variables and provides configuration settings.
"""
from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Server Configuration
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Blockchain Configuration
    WEB3_PROVIDER_URI: str
    CONTRACT_ADDRESS: str
    PRIVATE_KEY: str
    CHAIN_ID: int = 43113  # Avalanche Fuji Testnet
    
    # Docker Configuration
    DOCKER_REGISTRY_URL: str = "https://hub.docker.com"
    DOCKER_TIMEOUT: int = 300
    
    # Job Queue Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # API Configuration
    API_PREFIX: str = "/api/v1"
    API_TITLE: str = "ChainAI Backend API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "Backend API for ChainAI - Decentralized AI Model Registry"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to create a singleton pattern.
    """
    return Settings()
