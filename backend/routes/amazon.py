from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.config import EXPORTS_DIR
from backend.database import get_db
from backend.models import Product, AmazonSubmission, ProductImage
from backend.schemas import BulkExportRequest
from backend.services.amazon_validator import validate_product, build_amazon_payload
from backend.services.bulk_exporter import generate_bulk_export

router = APIRouter(prefix="/api", tags=["Amazon & Export"])


@router.get("/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.updated_at.desc()).all()
    total_products = len(products)
    live_listings = sum(1 for p in products if p.status == "Live")
    drafts = sum(1 for p in products if p.status in ("Draft", "Ready"))
    errors_count = sum(1 for p in products if p.status in ("Error", "Invalid", "Needs Review"))
    images_count = db.query(ProductImage).count()

    submissions = db.query(AmazonSubmission).order_by(AmazonSubmission.submitted_at.desc()).limit(15).all()
    amazon_issues = sum(1 for s in submissions if s.status in ("Invalid", "Error"))

    recent_activity = []
    for s in submissions[:6]:
        if s.status == "Accepted":
            recent_activity.append({
                "sku": s.sku,
                "type": "success",
                "message": f"{s.sku} published successfully to Amazon India",
                "timestamp": s.submitted_at.isoformat() if s.submitted_at else None,
            })
        else:
            recent_activity.append({
                "sku": s.sku,
                "type": "error",
                "message": f"{s.sku} — {s.error_message or 'Amazon validation failed'}",
                "timestamp": s.submitted_at.isoformat() if s.submitted_at else None,
            })

    for p in products:
        val = validate_product(p)
        if not val["valid"] and len(recent_activity) < 8:
            first_err = val["errors"][0]["message"]
            if not any(a["sku"] == p.sku and a["type"] == "error" for a in recent_activity):
                recent_activity.append({
                    "sku": p.sku,
                    "type": "warning",
                    "message": f"{p.sku} — {first_err}",
                    "timestamp": p.updated_at.isoformat() if p.updated_at else None,
                })

    return {
        "total_products": total_products,
        "live_listings": live_listings,
        "drafts": drafts,
        "errors": errors_count,
        "images_processed": images_count,
        "amazon_issues": amazon_issues,
        "recent_activity": recent_activity[:8],
    }


@router.get("/submissions")
def list_submissions(db: Session = Depends(get_db)):
    subs = db.query(AmazonSubmission).order_by(AmazonSubmission.id.desc()).all()
    return [
        {
            "id": s.id,
            "product_id": s.product_id,
            "sku": s.sku,
            "submission_type": s.submission_type,
            "status": s.status,
            "error_code": s.error_code,
            "error_message": s.error_message,
            "affected_field": s.affected_field,
            "suggested_correction": s.suggested_correction,
            "request_payload": s.request_payload,
            "amazon_response": s.amazon_response,
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
        }
        for s in subs
    ]


@router.get("/errors")
def list_product_errors(db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.id.asc()).all()
    error_items = []

    for p in products:
        val = validate_product(p)
        for err in val["errors"]:
            error_items.append({
                "product_id": p.id,
                "sku": p.sku,
                "title": p.title,
                "error_code": err["code"],
                "error_message": err["message"],
                "affected_field": err["field"],
                "suggested_action": err["action"],
                "severity": "error",
            })
        for warn in val["warnings"]:
            error_items.append({
                "product_id": p.id,
                "sku": p.sku,
                "title": p.title,
                "error_code": warn["code"],
                "error_message": warn["message"],
                "affected_field": warn["field"],
                "suggested_action": warn["action"],
                "severity": "warning",
            })

    return error_items


@router.get("/products/{product_id}/amazon-payload")
def preview_amazon_payload(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return {
        "sku": p.sku,
        "marketplace_id": "A21TJRUUN4KGV",
        "validation": validate_product(p),
        "payload": build_amazon_payload(p),
    }


@router.post("/export/amazon-template")
def export_amazon_template(req: BulkExportRequest, db: Session = Depends(get_db)):
    query = db.query(Product)
    if req.product_ids:
        query = query.filter(Product.id.in_(req.product_ids))
    products = query.order_by(Product.id.asc()).all()
    if not products:
        raise HTTPException(status_code=400, detail="No products found to export")

    result = generate_bulk_export(products, req.export_format)
    return result


@router.get("/export/download/{filename}")
def download_export_file(filename: str):
    safe_name = filename.replace("..", "").replace("/", "").replace("\\", "")
    filepath = EXPORTS_DIR / safe_name
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Export file not found")
    return FileResponse(
        path=filepath,
        filename=safe_name,
        media_type="application/octet-stream",
    )
