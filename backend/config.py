import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DATA_DIR = BASE_DIR / "data"
EXPORTS_DIR = DATA_DIR / "exports"
DOWNLOADS_DIR = DATA_DIR / "downloads"

for d in [DATA_DIR, EXPORTS_DIR, DOWNLOADS_DIR]:
    d.mkdir(parents=True, exist_ok=True)


class Settings:
    APP_ENV: str = os.getenv("APP_ENV", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "evoxxlaunch_secret")
    DATABASE_URL: str = f"sqlite:///{(DATA_DIR / 'evoxxlaunch.db').as_posix()}"

    GOOGLE_DRIVE_CLIENT_ID: str = os.getenv("GOOGLE_DRIVE_CLIENT_ID", "")
    GOOGLE_DRIVE_CLIENT_SECRET: str = os.getenv("GOOGLE_DRIVE_CLIENT_SECRET", "")
    GOOGLE_DRIVE_REDIRECT_URI: str = os.getenv("GOOGLE_DRIVE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")

    AMAZON_REFRESH_TOKEN: str = os.getenv("AMAZON_REFRESH_TOKEN", "")
    AMAZON_LWA_CLIENT_ID: str = os.getenv("AMAZON_LWA_CLIENT_ID", "")
    AMAZON_LWA_CLIENT_SECRET: str = os.getenv("AMAZON_LWA_CLIENT_SECRET", "")
    AMAZON_SELLER_ID: str = os.getenv("AMAZON_SELLER_ID", "EVOXX_SELLER_IN")
    AMAZON_MARKETPLACE_ID: str = os.getenv("AMAZON_MARKETPLACE_ID", "A21TJRUUN4KGV")
    AMAZON_REGION: str = os.getenv("AMAZON_REGION", "eu-west-1")

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    TEST_MODE: bool = os.getenv("TEST_MODE", "true").lower() == "true"


settings = Settings()
