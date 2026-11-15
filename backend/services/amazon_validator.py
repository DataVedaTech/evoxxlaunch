import json
from typing import Dict, Any, List
from backend.models import Product

AMAZON_SHIRT_SCHEMA = {
    "productType": "SHIRT",
    "marketplaceId": "A21TJRUUN4KGV",
    "required": [
        "item_name",
        "brand",
        "color",
        "size",
        "fabric_type",
        "fit_type",
        "neck_style",
        "sleeve_length",
        "target_gender",
        "country_of_origin",
        "purchasable_offer",
        "fulfillment_availability",
        "main_product_image_locator",
    ],
}


def get_main_image(product: Product):
    if not product.images:
        return None
    for img in product.images:
        if img.is_main_image or img.image_role.lower() == "main":
            return img
    return product.images[0]


def validate_product(product: Product) -> Dict[str, Any]:
    errors: List[Dict[str, str]] = []
    warnings: List[Dict[str, str]] = []
    checklist: List[Dict[str, Any]] = []

    def add_check(label: str, status: str, field: str, message: str = "", action: str = ""):
        checklist.append({
            "label": label,
            "status": status,  # pass, warn, fail
            "field": field,
            "message": message,
            "action": action,
        })
        if status == "fail":
            errors.append({
                "code": f"MISSING_{field.upper()}",
                "field": field,
                "message": message or f"{label} is missing or invalid",
                "action": action or f"Update {field} in Product Details",
            })
        elif status == "warn":
            warnings.append({
                "code": f"WARN_{field.upper()}",
                "field": field,
                "message": message,
                "action": action,
            })

    # 1. SKU
    if product.sku and len(product.sku.strip()) >= 5:
        add_check("SKU present", "pass", "sku")
    else:
        add_check("SKU present", "fail", "sku", "SKU is required", "Enter a valid EVOXX SKU")

    # 2. Title
    if product.title and len(product.title.strip()) >= 15:
        add_check("Title present", "pass", "title")
    else:
        add_check("Title present", "fail", "title", "Product title is required (min 15 chars)", "Enter or generate an Amazon title")

    # 3. Brand
    if product.brand and product.brand.strip():
        add_check("Brand present", "pass", "brand")
    else:
        add_check("Brand present", "fail", "brand", "Brand is required", "Set Brand to Evoxx")

    # 4. Main image & resolution
    main_img = get_main_image(product)
    if not main_img:
        add_check("Main image selected", "fail", "main_image", "Main image is required", "Attach a Main Image in Image Manager")
    elif main_img.width < 1000 or main_img.height < 1000:
        add_check(
            "Main image resolution",
            "fail",
            "main_image",
            f"Main image resolution too low ({main_img.width}×{main_img.height}, min 1000×1000 required for Amazon zoom)",
            "Replace with a higher-resolution image (≥1000×1000 px)",
        )
    else:
        add_check("Main image selected", "pass", "main_image")

    # 5. Price and MRP
    if product.selling_price and product.selling_price > 0 and product.mrp and product.mrp >= product.selling_price:
        add_check("Price and MRP entered", "pass", "selling_price")
    elif not product.selling_price or product.selling_price <= 0:
        add_check("Price and MRP entered", "fail", "selling_price", "Selling price is required", "Enter selling price in INR")
    else:
        add_check(
            "Price and MRP entered",
            "fail",
            "mrp",
            "Selling price cannot exceed MRP",
            "Ensure MRP is greater than or equal to Selling Price",
        )

    # 6. Stock
    if product.stock is not None and product.stock >= 0:
        add_check("Stock entered", "pass", "stock")
    else:
        add_check("Stock entered", "fail", "stock", "Stock quantity is required", "Enter available inventory count")

    # 7. Fabric
    if product.fabric and product.fabric.strip():
        add_check("Fabric selected", "pass", "fabric_type")
    else:
        add_check("Fabric selected", "fail", "fabric_type", "Missing required attribute: fabric_type", "Select fabric in Product Details")

    # 8. Size & Colour
    if product.size and product.colour:
        add_check("Colour & Size selected", "pass", "size")
    else:
        add_check("Colour & Size selected", "fail", "size", "Size and Colour are required", "Select Size and Colour")

    # 9. Barcode / GTIN (Warning if missing — GTIN exemption allowed for Evoxx brand)
    if product.barcode and len(product.barcode.strip()) >= 8:
        add_check("Barcode/GTIN added", "pass", "barcode")
    else:
        add_check(
            "Barcode/GTIN not added (GTIN Exemption mode)",
            "warn",
            "barcode",
            "No EAN/UPC provided — will submit under Brand GTIN Exemption for Evoxx",
            "Add EAN/UPC if available, or proceed with GTIN exemption",
        )

    # 10. Size chart image or text
    has_size_chart_img = any(img.image_role.lower() == "size chart" for img in (product.images or []))
    if has_size_chart_img or (product.size_chart_text and len(product.size_chart_text.strip()) > 10):
        add_check("Size chart present", "pass", "size_chart")
    else:
        add_check(
            "Size chart missing",
            "warn",
            "size_chart",
            "Size chart is strongly recommended for Amazon India apparel to reduce returns",
            "Generate AI Content or upload a Size Chart image",
        )

    is_valid = len(errors) == 0
    return {
        "valid": is_valid,
        "status": "Ready" if is_valid else "Error",
        "errors": errors,
        "warnings": warnings,
        "checklist": checklist,
    }


def build_amazon_payload(product: Product) -> Dict[str, Any]:
    main_img = get_main_image(product)
    bullets = []
    if product.bullet_points:
        try:
            parsed = json.loads(product.bullet_points) if isinstance(product.bullet_points, str) else product.bullet_points
            bullets = [{"value": b, "language_tag": "en_IN"} for b in parsed if b]
        except Exception:
            pass

    attributes: Dict[str, Any] = {
        "item_name": [{"value": product.title, "language_tag": "en_IN", "marketplace_id": "A21TJRUUN4KGV"}],
        "brand": [{"value": product.brand or "Evoxx", "marketplace_id": "A21TJRUUN4KGV"}],
        "manufacturer": [{"value": product.manufacturer or "Evoxx", "marketplace_id": "A21TJRUUN4KGV"}],
        "country_of_origin": [{"value": "IN", "marketplace_id": "A21TJRUUN4KGV"}],
        "color": [{"value": product.colour, "language_tag": "en_IN", "marketplace_id": "A21TJRUUN4KGV"}],
        "size": [{"value": product.size, "language_tag": "en_IN", "marketplace_id": "A21TJRUUN4KGV"}],
        "fabric_type": [{"value": product.fabric, "language_tag": "en_IN", "marketplace_id": "A21TJRUUN4KGV"}],
        "fit_type": [{"value": product.fit, "language_tag": "en_IN", "marketplace_id": "A21TJRUUN4KGV"}],
        "neck_style": [{"value": product.neck_type, "language_tag": "en_IN", "marketplace_id": "A21TJRUUN4KGV"}],
        "sleeve_length": [{"value": product.sleeve_type, "language_tag": "en_IN", "marketplace_id": "A21TJRUUN4KGV"}],
        "target_gender": [{"value": (product.gender or "Men").lower(), "marketplace_id": "A21TJRUUN4KGV"}],
        "purchasable_offer": [
            {
                "marketplace_id": "A21TJRUUN4KGV",
                "currency": "INR",
                "our_price": [{"schedule": [{"value_with_tax": product.selling_price}]}],
                "maximum_retail_price": [{"schedule": [{"value_with_tax": product.mrp}]}],
            }
        ],
        "fulfillment_availability": [
            {
                "fulfillment_channel_code": "DEFAULT" if product.fulfilment_channel == "FBM" else "AMAZON_IN",
                "quantity": product.stock,
            }
        ],
    }

    if main_img:
        attributes["main_product_image_locator"] = [
            {"media_location": main_img.image_url, "marketplace_id": "A21TJRUUN4KGV"}
        ]

    if product.description:
        attributes["product_description"] = [{"value": product.description, "language_tag": "en_IN"}]

    if bullets:
        attributes["bullet_point"] = bullets

    if product.backend_keywords:
        attributes["generic_keyword"] = [{"value": product.backend_keywords, "language_tag": "en_IN"}]

    if product.barcode:
        attributes["externally_assigned_product_identifier"] = [
            {"type": "ean", "value": product.barcode, "marketplace_id": "A21TJRUUN4KGV"}
        ]
    else:
        attributes["supplier_declared_has_product_identifier_exemption"] = [
            {"value": True, "marketplace_id": "A21TJRUUN4KGV"}
        ]

    return {
        "productType": "SHIRT",
        "requirements": "LISTING",
        "attributes": attributes,
    }


def validate_against_schema(payload: Dict[str, Any]) -> List[Dict[str, str]]:
    attrs = payload.get("attributes", {})
    schema_errors = []
    for req_field in AMAZON_SHIRT_SCHEMA["required"]:
        if req_field not in attrs or not attrs[req_field]:
            schema_errors.append({
                "code": "AMAZON_SCHEMA_90215",
                "field": req_field,
                "message": f"Missing required Amazon SHIRT schema attribute: {req_field}",
                "action": f"Provide valid {req_field} in Product Details",
            })
    return schema_errors
