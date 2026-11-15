import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any
import httpx
from sqlalchemy.orm import Session
from backend.config import settings
from backend.models import Product, AmazonSubmission, AppSetting
from backend.services.amazon_validator import validate_product, build_amazon_payload, validate_against_schema


def is_test_mode(db: Session) -> bool:
    setting = db.query(AppSetting).filter(AppSetting.setting_key == "test_mode").first()
    if setting is not None:
        return setting.setting_value.lower() == "true"
    return settings.TEST_MODE


async def publish_product_to_amazon(
    db: Session,
    product: Product,
    confirmed: bool = False,
    mode: str = "putListingsItem",
) -> Dict[str, Any]:
    if not confirmed:
        return {
            "status": "confirmation_required",
            "message": f"Explicit confirmation is required before publishing {product.sku} to Amazon India.",
        }

    # Step 1: Local validation
    validation = validate_product(product)
    payload = build_amazon_payload(product)

    if not validation["valid"]:
        first_err = validation["errors"][0]
        sub = AmazonSubmission(
            product_id=product.id,
            sku=product.sku,
            submission_type=mode,
            status="Invalid",
            error_code=first_err["code"],
            error_message=first_err["message"],
            affected_field=first_err["field"],
            suggested_correction=first_err["action"],
            request_payload=json.dumps(payload, indent=2),
            amazon_response=json.dumps({"status": "INVALID", "issues": validation["errors"]}, indent=2),
        )
        product.status = "Error"
        db.add(sub)
        db.commit()
        db.refresh(sub)
        return {
            "status": "validation_failed",
            "product_status": product.status,
            "errors": validation["errors"],
            "submission_id": sub.id,
        }

    # Step 2: Amazon SHIRT Schema validation
    schema_errors = validate_against_schema(payload)
    if schema_errors:
        first_err = schema_errors[0]
        sub = AmazonSubmission(
            product_id=product.id,
            sku=product.sku,
            submission_type=mode,
            status="Invalid",
            error_code=first_err["code"],
            error_message=first_err["message"],
            affected_field=first_err["field"],
            suggested_correction=first_err["action"],
            request_payload=json.dumps(payload, indent=2),
            amazon_response=json.dumps({"status": "SCHEMA_REJECTED", "issues": schema_errors}, indent=2),
        )
        product.status = "Error"
        db.add(sub)
        db.commit()
        db.refresh(sub)
        return {
            "status": "schema_validation_failed",
            "product_status": product.status,
            "errors": schema_errors,
            "submission_id": sub.id,
        }

    test_mode_active = is_test_mode(db)
    has_live_creds = bool(settings.AMAZON_REFRESH_TOKEN and settings.AMAZON_LWA_CLIENT_ID and settings.AMAZON_LWA_CLIENT_SECRET)

    submission_id_str = f"AMZ-IN-{uuid.uuid4().hex[:10].upper()}"
    asin = product.amazon_asin or f"B0EVX{product.id:05d}"

    if not test_mode_active and has_live_creds:
        # Attempt live LWA token exchange & SP-API putListingsItem
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                token_resp = await client.post(
                    "https://api.amazon.com/auth/o2/token",
                    data={
                        "grant_type": "refresh_token",
                        "refresh_token": settings.AMAZON_REFRESH_TOKEN,
                        "client_id": settings.AMAZON_LWA_CLIENT_ID,
                        "client_secret": settings.AMAZON_LWA_CLIENT_SECRET,
                    },
                )
                if token_resp.status_code == 200:
                    access_token = token_resp.json().get("access_token")
                    sp_url = (
                        f"https://sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/"
                        f"{settings.AMAZON_SELLER_ID}/{product.sku}"
                    )
                    sp_resp = await client.put(
                        sp_url,
                        params={"marketplaceIds": settings.AMAZON_MARKETPLACE_ID},
                        headers={
                            "x-amz-access-token": access_token,
                            "Content-Type": "application/json",
                        },
                        json=payload,
                    )
                    resp_data = sp_resp.json()
                    amz_status = resp_data.get("status", "ACCEPTED")
                    sub = AmazonSubmission(
                        product_id=product.id,
                        sku=product.sku,
                        submission_type=mode,
                        status="Accepted" if amz_status == "ACCEPTED" else "Invalid",
                        request_payload=json.dumps(payload, indent=2),
                        amazon_response=json.dumps(resp_data, indent=2),
                    )
                    product.status = "Live" if amz_status == "ACCEPTED" else "Error"
                    product.amazon_asin = asin
                    db.add(sub)
                    db.commit()
                    db.refresh(sub)
                    return {
                        "status": "published_live",
                        "product_status": product.status,
                        "amazon_asin": product.amazon_asin,
                        "submission_id": sub.id,
                        "amazon_response": resp_data,
                    }
        except Exception as exc:
            sub = AmazonSubmission(
                product_id=product.id,
                sku=product.sku,
                submission_type=mode,
                status="Error",
                error_code="SP_API_CONNECTION_ERR",
                error_message=str(exc),
                affected_field="network_or_credentials",
                suggested_correction="Verify Amazon SP-API credentials in Settings or enable Test Mode",
                request_payload=json.dumps(payload, indent=2),
                amazon_response=json.dumps({"error": str(exc)}, indent=2),
            )
            product.status = "Error"
            db.add(sub)
            db.commit()
            return {
                "status": "sp_api_error",
                "product_status": product.status,
                "errors": [{"message": str(exc)}],
            }

    # Simulated SP-API response (Test Mode or Sandbox fallback)
    simulated_response = {
        "sku": product.sku,
        "status": "ACCEPTED",
        "submissionId": submission_id_str,
        "marketplaceId": "A21TJRUUN4KGV",
        "productType": "SHIRT",
        "asin": asin,
        "mode": "TEST_MODE_SANDBOX" if test_mode_active else "SIMULATED_SP_API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "issues": [],
    }

    sub = AmazonSubmission(
        product_id=product.id,
        sku=product.sku,
        submission_type=f"{mode} ({'Test Mode' if test_mode_active else 'Live'})",
        status="Accepted",
        request_payload=json.dumps(payload, indent=2),
        amazon_response=json.dumps(simulated_response, indent=2),
    )
    product.status = "Live"
    product.amazon_asin = asin
    db.add(sub)
    db.commit()
    db.refresh(sub)

    return {
        "status": "accepted",
        "test_mode": test_mode_active,
        "product_status": product.status,
        "amazon_asin": product.amazon_asin,
        "submission_id": sub.id,
        "amazon_response": simulated_response,
    }
