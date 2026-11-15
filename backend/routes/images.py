from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import ProductImage, Product
from backend.schemas import ImageUpdate
from backend.routes.products import serialize_product

router = APIRouter(prefix="/api/images", tags=["Images"])


@router.get("")
def list_all_images(db: Session = Depends(get_db)):
    imgs = db.query(ProductImage).order_by(ProductImage.id.desc()).all()
    return [
        {
            "id": i.id,
            "product_id": i.product_id,
            "sku": i.product.sku if i.product else None,
            "filename": i.filename,
            "image_url": i.image_url,
            "image_role": i.image_role,
            "is_main_image": i.is_main_image,
            "width": i.width,
            "height": i.height,
            "file_size": i.file_size,
            "white_bg_detected": i.white_bg_detected,
            "is_blurry": i.is_blurry,
            "has_watermark": i.has_watermark,
        }
        for i in imgs
    ]


@router.patch("/{image_id}")
def update_image(image_id: int, req: ImageUpdate, db: Session = Depends(get_db)):
    img = db.query(ProductImage).filter(ProductImage.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    if req.is_main_image or (req.image_role and req.image_role.lower() == "main"):
        if img.product_id:
            siblings = db.query(ProductImage).filter(ProductImage.product_id == img.product_id).all()
            for s in siblings:
                s.is_main_image = False
                if s.image_role == "Main" and s.id != img.id:
                    s.image_role = "Front"
        img.is_main_image = True
        img.image_role = "Main"
    elif req.image_role is not None:
        img.image_role = req.image_role
        if req.is_main_image is False:
            img.is_main_image = False

    if req.sort_order is not None:
        img.sort_order = req.sort_order
    if req.alt_text is not None:
        img.alt_text = req.alt_text

    db.commit()
    db.refresh(img)

    if img.product_id:
        p = db.query(Product).filter(Product.id == img.product_id).first()
        return serialize_product(p)
    return {"updated": True, "id": img.id}


@router.delete("/{image_id}")
def delete_image(image_id: int, db: Session = Depends(get_db)):
    img = db.query(ProductImage).filter(ProductImage.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    prod_id = img.product_id
    db.delete(img)
    db.commit()
    if prod_id:
        p = db.query(Product).filter(Product.id == prod_id).first()
        if p:
            return serialize_product(p)
    return {"deleted": True, "id": image_id}
