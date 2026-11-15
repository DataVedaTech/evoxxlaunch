from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.config import settings
from backend.database import get_db
from backend.models import AppSetting

router = APIRouter(prefix="/api/settings", tags=["Settings"])

DEFAULT_SETTINGS = {
    "brand_name": "Evoxx",
    "sku_prefix": "EVOXX-TS-",
    "marketplace_id": "A21TJRUUN4KGV",
    "marketplace_name": "Amazon India",
    "seller_id": settings.AMAZON_SELLER_ID or "A3EVOXXINSELLER",
    "default_mrp": "999",
    "default_selling_price": "499",
    "default_stock": "50",
    "default_fabric": "Cotton",
    "default_fit": "Regular",
    "default_neck": "Round Neck",
    "default_sleeve": "Half Sleeve",
    "default_fulfilment": "FBM",
    "test_mode": "true" if settings.TEST_MODE else "false",
    "google_drive_connected": "true" if settings.GOOGLE_API_KEY else "demo_mode",
    "sp_api_configured": "true" if settings.AMAZON_REFRESH_TOKEN else "sandbox_mode",
}


@router.get("")
def get_settings(db: Session = Depends(get_db)):
    rows = db.query(AppSetting).all()
    stored = {r.setting_key: r.setting_value for r in rows}
    merged = {**DEFAULT_SETTINGS, **stored}
    return merged


@router.patch("")
def update_settings(payload: Dict[str, Any], db: Session = Depends(get_db)):
    for k, v in payload.items():
        val_str = str(v).lower() if isinstance(v, bool) else str(v)
        existing = db.query(AppSetting).filter(AppSetting.setting_key == k).first()
        if existing:
            existing.setting_value = val_str
        else:
            db.add(AppSetting(setting_key=k, setting_value=val_str))
    db.commit()
    return get_settings(db)
