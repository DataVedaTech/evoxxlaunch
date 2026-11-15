import re
from typing import Optional
from sqlalchemy.orm import Session
from backend.models import Product

COLOUR_CODES = {
    "black": "BLK",
    "white": "WHT",
    "navy": "NVY",
    "navy blue": "NVY",
    "blue": "BLU",
    "red": "RED",
    "maroon": "MRN",
    "olive": "OLV",
    "green": "GRN",
    "grey": "GRY",
    "gray": "GRY",
    "charcoal": "CHR",
    "yellow": "YLW",
    "mustard": "MST",
    "beige": "BGE",
    "brown": "BRN",
    "purple": "PRP",
    "lavender": "LAV",
    "orange": "ORG",
    "teal": "TEL",
}

PRODUCT_TYPE_CODES = {
    "t-shirt": "TS",
    "tshirt": "TS",
    "polo": "PL",
    "hoodie": "HD",
    "sweatshirt": "SW",
    "oversized t-shirt": "OTS",
}


def get_colour_code(colour: str) -> str:
    clean = (colour or "Black").strip().lower()
    if clean in COLOUR_CODES:
        return COLOUR_CODES[clean]
    return clean[:3].upper()


def get_product_type_code(product_type: str) -> str:
    clean = (product_type or "T-Shirt").strip().lower()
    return PRODUCT_TYPE_CODES.get(clean, "TS")


def get_next_design_number(db: Session, prefix: str = "EVOXX-TS-") -> int:
    products = db.query(Product.sku).filter(Product.sku.like(f"{prefix}%")).all()
    max_num = 0
    for (sku,) in products:
        match = re.match(r"^EVOXX-[A-Z]+-(\d{3})", sku)
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num
    return max_num + 1


def generate_base_sku(
    db: Session,
    product_type: str = "T-Shirt",
    design_number: Optional[int] = None,
    detailed: bool = False,
    colour: Optional[str] = None,
    size: Optional[str] = None,
) -> str:
    pt_code = get_product_type_code(product_type)
    prefix = f"EVOXX-{pt_code}-"
    if design_number is None:
        design_number = get_next_design_number(db, prefix)
    base = f"{prefix}{design_number:03d}"
    if detailed and colour and size:
        c_code = get_colour_code(colour)
        s_code = size.strip().upper()
        return f"{base}-{c_code}-{s_code}"
    return base


def generate_variation_sku(parent_sku: str, colour: str, size: str) -> str:
    # Extract base EVOXX-TS-XXX from parent_sku if it already has suffixes
    match = re.match(r"^(EVOXX-[A-Z]+-\d{3})", parent_sku.strip().upper())
    base = match.group(1) if match else parent_sku.strip().upper()
    c_code = get_colour_code(colour)
    s_code = size.strip().upper()
    return f"{base}-{c_code}-{s_code}"
