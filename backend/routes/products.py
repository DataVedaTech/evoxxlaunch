import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Product, ProductImage
from backend.schemas import (
    ProductCreate,
    ProductUpdate,
    AIContentRequest,
    PublishRequest,
    ImageCreate,
)
from backend.services.sku_generator import generate_base_sku
from backend.services.content_generator import generate_amazon_content
from backend.services.amazon_validator import validate_product
from backend.services.amazon_publisher import publish_product_to_amazon

router = APIRouter(prefix="/api/products", tags=["Products"])


def serialize_product(p: Product) -> Dict[str, Any]:
    bullets = []
    if p.bullet_points:
        try:
            bullets = json.loads(p.bullet_points) if isinstance(p.bullet_points, str) else p.bullet_points
        except Exception:
            bullets = []

    images = sorted(p.images or [], key=lambda x: (not x.is_main_image, x.sort_order, x.id))
    main_img = images[0].image_url if images else None

    return {
        "id": p.id,
        "sku": p.sku,
        "parent_sku": p.parent_sku,
        "title": p.title,
        "brand": p.brand,
        "manufacturer": p.manufacturer,
        "country_of_origin": p.country_of_origin,
        "product_type": p.product_type,
        "colour": p.colour,
        "size": p.size,
        "fabric": p.fabric,
        "fit": p.fit,
        "neck_type": p.neck_type,
        "sleeve_type": p.sleeve_type,
        "gender": p.gender,
        "mrp": p.mrp,
        "selling_price": p.selling_price,
        "stock": p.stock,
        "barcode": p.barcode,
        "fulfilment_channel": p.fulfilment_channel,
        "description": p.description,
        "bullet_points": bullets,
        "backend_keywords": p.backend_keywords,
        "size_chart_text": p.size_chart_text,
        "ai_draft": p.ai_draft,
        "status": p.status,
        "amazon_asin": p.amazon_asin,
        "main_image_url": main_img,
        "images": [
            {
                "id": img.id,
                "product_id": img.product_id,
                "drive_file_id": img.drive_file_id,
                "filename": img.filename,
                "image_url": img.image_url,
                "image_role": img.image_role,
                "is_main_image": img.is_main_image,
                "sort_order": img.sort_order,
                "width": img.width,
                "height": img.height,
                "file_size": img.file_size,
                "checksum": img.checksum,
                "white_bg_detected": img.white_bg_detected,
                "is_blurry": img.is_blurry,
                "has_watermark": img.has_watermark,
                "alt_text": img.alt_text,
            }
            for img in images
        ],
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }


@router.get("")
def list_products(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if status and status.lower() != "all":
        query = query.filter(Product.status.ilike(status))
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Product.sku.ilike(s)) | (Product.title.ilike(s)) | (Product.colour.ilike(s)))
    items = query.order_by(Product.id.desc()).all()
    return [serialize_product(p) for p in items]


@router.get("/next-sku")
def get_next_sku(
    product_type: str = "T-Shirt",
    detailed: bool = False,
    colour: Optional[str] = None,
    size: Optional[str] = None,
    db: Session = Depends(get_db),
):
    sku = generate_base_sku(db, product_type=product_type, detailed=detailed, colour=colour, size=size)
    return {"sku": sku}


@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_product(p)


@router.post("")
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.sku == payload.sku.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"SKU '{payload.sku}' already exists. Zero SKU duplication rule enforced.")

    p = Product(
        sku=payload.sku.strip(),
        parent_sku=payload.parent_sku,
        title=payload.title.strip(),
        brand=payload.brand,
        manufacturer=payload.manufacturer,
        country_of_origin=payload.country_of_origin,
        product_type=payload.product_type,
        colour=payload.colour,
        size=payload.size,
        fabric=payload.fabric,
        fit=payload.fit,
        neck_type=payload.neck_type,
        sleeve_type=payload.sleeve_type,
        gender=payload.gender,
        mrp=payload.mrp,
        selling_price=payload.selling_price,
        stock=payload.stock,
        barcode=payload.barcode,
        fulfilment_channel=payload.fulfilment_channel,
        description=payload.description,
        bullet_points=json.dumps(payload.bullet_points or []),
        backend_keywords=payload.backend_keywords,
        size_chart_text=payload.size_chart_text,
        ai_draft=payload.ai_draft,
        status=payload.status or "Draft",
    )
    db.add(p)
    db.commit()
    db.refresh(p)

    if payload.main_image_url:
        img = ProductImage(
            product_id=p.id,
            filename=payload.main_image_filename or f"{p.sku.lower()}-main.jpg",
            image_url=payload.main_image_url,
            image_role="Main",
            is_main_image=True,
            width=payload.main_image_width or 2000,
            height=payload.main_image_height or 2000,
        )
        db.add(img)
        db.commit()
        db.refresh(p)

    return serialize_product(p)


@router.patch("/{product_id}")
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "sku" in update_data and update_data["sku"] != p.sku:
        dup = db.query(Product).filter(Product.sku == update_data["sku"]).first()
        if dup:
            raise HTTPException(status_code=400, detail=f"SKU '{update_data['sku']}' already exists.")

    if "bullet_points" in update_data and update_data["bullet_points"] is not None:
        update_data["bullet_points"] = json.dumps(update_data["bullet_points"])

    for k, v in update_data.items():
        setattr(p, k, v)

    db.commit()
    db.refresh(p)
    return serialize_product(p)


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(p)
    db.commit()
    return {"deleted": True, "id": product_id}


@router.post("/{product_id}/generate-content")
def generate_product_ai_content(
    product_id: int,
    req: AIContentRequest,
    save_to_product: bool = False,
    db: Session = Depends(get_db),
):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    generated = generate_amazon_content(p, req)

    if save_to_product:
        p.title = generated["title"]
        p.bullet_points = json.dumps(generated["bullet_points"])
        p.description = generated["description"]
        p.backend_keywords = generated["backend_keywords"]
        p.size_chart_text = generated["size_chart_text"]
        p.ai_draft = True
        db.commit()
        db.refresh(p)

    return {
        "product_id": p.id,
        "sku": p.sku,
        "saved": save_to_product,
        "generated": generated,
        "product": serialize_product(p),
    }


@router.post("/{product_id}/validate")
def validate_product_endpoint(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    res = validate_product(p)
    if p.status != "Live":
        p.status = res["status"]
        db.commit()
        db.refresh(p)

    return {
        **res,
        "product": serialize_product(p),
    }


@router.post("/{product_id}/publish")
async def publish_product_endpoint(
    product_id: int,
    req: PublishRequest,
    db: Session = Depends(get_db),
):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    result = await publish_product_to_amazon(db, p, confirmed=req.confirmed, mode=req.mode)
    db.refresh(p)
    return {
        **result,
        "product": serialize_product(p),
    }


@router.post("/{product_id}/images")
def attach_product_image(product_id: int, req: ImageCreate, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")

    if req.is_main_image or req.image_role.lower() == "main":
        for existing in p.images:
            existing.is_main_image = False
            if existing.image_role == "Main":
                existing.image_role = "Front"

    img = ProductImage(
        product_id=p.id,
        drive_file_id=req.drive_file_id,
        filename=req.filename or f"{p.sku.lower()}-{req.image_role.lower()}.jpg",
        image_url=req.image_url,
        image_role=req.image_role,
        is_main_image=req.is_main_image or (req.image_role.lower() == "main") or len(p.images) == 0,
        sort_order=len(p.images),
        width=req.width,
        height=req.height,
        file_size=req.file_size,
        checksum=req.checksum,
        white_bg_detected=req.white_bg_detected,
    )
    db.add(img)
    db.commit()
    db.refresh(p)
    return serialize_product(p)
