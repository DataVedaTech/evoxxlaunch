import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Product, ProductImage
from backend.schemas import DriveScanRequest, DriveImportRequest, AIContentRequest
from backend.services.drive_service import scan_drive_folder
from backend.services.sku_generator import generate_base_sku
from backend.services.content_generator import generate_amazon_content
from backend.routes.products import serialize_product

router = APIRouter(prefix="/api/drive", tags=["Google Drive"])


@router.post("/scan")
async def scan_drive(req: DriveScanRequest, db: Session = Depends(get_db)):
    return await scan_drive_folder(db, req.folder_link)


@router.post("/import")
def import_drive_images(req: DriveImportRequest, db: Session = Depends(get_db)):
    imported_products = []
    for item in req.items:
        sku = item.sku.strip().upper()
        # Prevent SKU collision
        if db.query(Product).filter(Product.sku == sku).first():
            sku = generate_base_sku(db, "T-Shirt")

        title = f"Evoxx Men’s Cotton Regular Fit Round Neck Half Sleeve T-Shirt ({item.colour})"
        p = Product(
            sku=sku,
            title=title,
            brand="Evoxx",
            manufacturer="Evoxx",
            country_of_origin="India",
            product_type="T-Shirt",
            colour=item.colour or "Black",
            size="M",
            fabric="Cotton",
            fit="Regular",
            neck_type="Round Neck",
            sleeve_type="Half Sleeve",
            gender="Men",
            mrp=999.0,
            selling_price=499.0,
            stock=50,
            status="Draft" if (item.width >= 1000 and item.height >= 1000) else "Error",
        )
        # Pre-generate AI draft content so new products are immediately rich
        ai_data = generate_amazon_content(p, AIContentRequest())
        p.title = ai_data["title"]
        p.description = ai_data["description"]
        p.bullet_points = json.dumps(ai_data["bullet_points"])
        p.backend_keywords = ai_data["backend_keywords"]
        p.size_chart_text = ai_data["size_chart_text"]
        p.ai_draft = True

        db.add(p)
        db.commit()
        db.refresh(p)

        img = ProductImage(
            product_id=p.id,
            drive_file_id=item.drive_file_id,
            filename=item.filename,
            image_url=item.image_url,
            image_role="Main",
            is_main_image=True,
            width=item.width,
            height=item.height,
            file_size=item.file_size,
            checksum=item.checksum,
            white_bg_detected=True,
        )
        db.add(img)
        db.commit()
        db.refresh(p)
        imported_products.append(serialize_product(p))

    return {
        "imported_count": len(imported_products),
        "products": imported_products,
    }
