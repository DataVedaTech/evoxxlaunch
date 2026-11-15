import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Product, ProductImage
from backend.schemas import VariationGenerateRequest
from backend.services.sku_generator import generate_variation_sku
from backend.services.amazon_validator import get_main_image
from backend.routes.products import serialize_product

router = APIRouter(prefix="/api/variations", tags=["Variations"])


@router.get("/{parent_id}")
def get_variations(parent_id: int, db: Session = Depends(get_db)):
    parent = db.query(Product).filter(Product.id == parent_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent product not found")

    children = db.query(Product).filter(Product.parent_sku == parent.sku).order_by(Product.id.asc()).all()
    return {
        "parent": serialize_product(parent),
        "variations": [serialize_product(c) for c in children],
    }


@router.post("/generate")
def generate_variations(req: VariationGenerateRequest, db: Session = Depends(get_db)):
    parent = db.query(Product).filter(Product.id == req.parent_product_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent product not found")

    created = []
    skipped = []
    main_img = get_main_image(parent)

    for colour in req.colours:
        for size in req.sizes:
            child_sku = generate_variation_sku(parent.sku, colour, size)
            existing = db.query(Product).filter(Product.sku == child_sku).first()
            if existing:
                skipped.append(child_sku)
                continue

            child_title = f"{parent.title} - {colour} ({size})"
            child = Product(
                sku=child_sku,
                parent_sku=parent.sku,
                title=child_title,
                brand=parent.brand,
                manufacturer=parent.manufacturer,
                country_of_origin=parent.country_of_origin,
                product_type=parent.product_type,
                colour=colour,
                size=size,
                fabric=parent.fabric,
                fit=parent.fit,
                neck_type=parent.neck_type,
                sleeve_type=parent.sleeve_type,
                gender=parent.gender,
                mrp=req.mrp if req.mrp is not None else parent.mrp,
                selling_price=req.selling_price if req.selling_price is not None else parent.selling_price,
                stock=req.default_stock,
                fulfilment_channel=parent.fulfilment_channel,
                description=parent.description,
                bullet_points=parent.bullet_points if isinstance(parent.bullet_points, str) else json.dumps(parent.bullet_points or []),
                backend_keywords=parent.backend_keywords,
                size_chart_text=parent.size_chart_text,
                status="Ready",
            )
            db.add(child)
            db.commit()
            db.refresh(child)

            if main_img:
                c_img = ProductImage(
                    product_id=child.id,
                    drive_file_id=main_img.drive_file_id,
                    filename=f"{child_sku.lower()}-main.jpg",
                    image_url=main_img.image_url,
                    image_role="Main",
                    is_main_image=True,
                    width=main_img.width,
                    height=main_img.height,
                    file_size=main_img.file_size,
                )
                db.add(c_img)
                db.commit()
                db.refresh(child)

            created.append(serialize_product(child))

    all_children = db.query(Product).filter(Product.parent_sku == parent.sku).order_by(Product.id.asc()).all()
    return {
        "parent_sku": parent.sku,
        "created_count": len(created),
        "skipped_skus": skipped,
        "created": created,
        "all_variations": [serialize_product(c) for c in all_children],
    }
