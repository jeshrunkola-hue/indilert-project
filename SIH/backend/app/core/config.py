"""Application configuration and settings."""
import os
from typing import Dict, List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NER-SAFE: AI-Powered Landslide Early Warning & Monitoring Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ner-safe-disaster-resilience-key-2026-secret-jwt")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ner_safe.db").replace("postgres://", "postgresql://", 1)
    
    # Media Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_UPLOAD_SIZE_MB: int = 50
    
    # Dynamic Risk Factor Weights (Configurable by admin)
    DEFAULT_RISK_WEIGHTS: Dict[str, float] = {
        "rainfall": 0.30,
        "soil_moisture": 0.20,
        "slope": 0.15,
        "terrain": 0.10,
        "history": 0.15,
        "field_reports": 0.10,
    }
    
    # Supported Languages
    SUPPORTED_LANGUAGES: List[str] = [
        "en",  # English
        "hi",  # Hindi
        "as",  # Assamese
        "bn",  # Bengali
        "brx", # Bodo
        "kha", # Khasi
        "grt", # Garo
        "lus", # Mizo
        "mni", # Manipuri
        "nag", # Nagamese
        "ne"   # Nepali
    ]
    
    # Public URLs for Cloud Hosting
    BACKEND_PUBLIC_URL: str = os.getenv("BACKEND_PUBLIC_URL", "")
    INDILERT_PRODUCTION_URL: str = os.getenv("INDILERT_URL", os.getenv("INDILERT_PRODUCTION_URL", "https://idyllic-daifuku-aa8d13.netlify.app"))

    # CORS Origins: Configured via CORS_ORIGINS comma-separated list without unrestricted wildcard
    BACKEND_CORS_ORIGINS: List[str] = [
        origin.strip() for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:3000,https://idyllic-daifuku-aa8d13.netlify.app"
        ).split(",") if origin.strip()
    ]
    
    # Web Push VAPID Keys for Indilert Citizen Alerts
    VAPID_PUBLIC_KEY: str = os.getenv(
        "VAPID_PUBLIC_KEY",
        "BKAjIB-FoW07V4aqTK2X7_zcGb6geRxZmfOOfk9lNJP3-rYoz9Z0fdupcntc6aHA7N5nE2tN6gRk_kwZGOq_qIQ"
    )
    VAPID_PRIVATE_KEY: str = os.getenv(
        "VAPID_PRIVATE_KEY",
        "NIrUIOhTEwSpx-ZpSEZ0xTLHPruE9HW7u1h_e3X_IEc"
    )
    VAPID_CLAIMS_EMAIL: str = os.getenv("VAPID_CLAIMS_EMAIL", "mailto:alerts@nersafe.gov.in")

    # Demo Mode Simulation settings
    DEMO_MODE_ACTIVE: bool = True

    class Config:
        case_sensitive = True

settings = Settings()
