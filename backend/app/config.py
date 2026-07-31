import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent


class Config:
    """Base application configuration."""

    SECRET_KEY = os.getenv("SECRET_KEY", "development-secret-key")

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'historical_research.db'}",
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    FRONTEND_ORIGIN = os.getenv(
        "FRONTEND_ORIGIN",
        "http://localhost:5173",
    )


class TestingConfig(Config):
    """Configuration used by automated tests."""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"