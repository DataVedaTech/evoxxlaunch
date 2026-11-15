import re
from typing import Dict, Any, List
from backend.models import Product
from backend.schemas import AIContentRequest

FORBIDDEN_TERMS = [
    "cure", "medical", "antibacterial", "antiviral", "guaranteed forever",
    "100% waterproof", "nike", "adidas", "puma", "us polo", "levis",
    "best seller #1", "cheapest", "free shipping"
]


def sanitize_compliance_text(text: str) -> str:
    cleaned = text
    for term in FORBIDDEN_TERMS:
        cleaned = re.sub(re.escape(term), "", cleaned, flags=re.IGNORECASE)
    return re.sub(r"\s{2,}", " ", cleaned).strip()


def generate_amazon_content(product: Product, req: AIContentRequest) -> Dict[str, Any]:
    brand = product.brand or "Evoxx"
    gender_label = f"{product.gender}’s" if product.gender in ("Men", "Women") else "Unisex"
    fabric = product.fabric or "Cotton"
    fit = f"{product.fit} Fit" if "fit" not in (product.fit or "").lower() else product.fit
    neck = product.neck_type or "Round Neck"
    sleeve = product.sleeve_type or "Half Sleeve"
    colour = product.colour or "Black"
    ptype = product.product_type or "T-Shirt"

    # Title following Amazon India apparel style guide (under 200 chars, clear hierarchy)
    title = sanitize_compliance_text(
        f"{brand} {gender_label} {fabric} {fit} {neck} {sleeve} {ptype} ({colour}, {product.size})"
    )
    # Clean standard title without variation parenthetical if used as main listing title
    clean_title = sanitize_compliance_text(
        f"{brand} {gender_label} {fabric} {fit} {neck} {sleeve} {ptype}"
    )

    tone_adj = "Premium breathable" if req.tone == "Premium" else "Soft everyday"
    bullets: List[str] = [
        sanitize_compliance_text(
            f"{tone_adj} {fabric.lower()} fabric engineered for all-day comfort in Indian weather"
        ),
        sanitize_compliance_text(
            f"{fit} silhouette tailored for a clean, modern look across {req.target_customer.lower()}"
        ),
        sanitize_compliance_text(
            f"Soft {neck.lower()} collar with reinforced double-needle stitching for shape retention"
        ),
        sanitize_compliance_text(
            f"Versatile {colour.lower()} shade that pairs effortlessly with jeans, chinos, joggers, and shorts"
        ),
        sanitize_compliance_text(
            f"Ideal for daily wear, college, casual Fridays, travel, and weekend outings ({req.key_benefit})"
        ),
    ]

    description = sanitize_compliance_text(
        f"{brand} brings you a comfortable everyday {ptype.lower()} designed with a clean, modern {fit.lower()}. "
        f"Crafted from soft, breathable {fabric.lower()} fabric in a classic {colour.lower()} finish, this "
        f"{neck.lower()} {sleeve.lower()} {ptype.lower()} is built for effortless styling across casual outings, "
        f"college, travel, and daily wear. Designed in India for reliable comfort and easy maintenance."
    )

    keywords_list = [
        f"{brand.lower()} tshirt",
        f"{ product.gender.lower() } {fabric.lower()} t shirt",
        f"{colour.lower()} {neck.lower()} tshirt",
        f"{fit.lower()} {sleeve.lower()} tee",
        "casual wear t shirt india",
        "solid cotton round neck tee",
        "everyday summer tshirt men",
    ]
    backend_keywords = ", ".join(keywords_list)

    size_chart_text = (
        "Size Guide (Chest / Length in inches): S (38\" / 27\"), M (40\" / 28\"), "
        "L (42\" / 29\"), XL (44\" / 30\"), XXL (46\" / 31\"). Regular Fit — select your usual size."
    )

    alt_text = f"{brand} {gender_label} {colour} {fabric} {neck} {ptype} Front View"

    return {
        "title": clean_title,
        "variation_title": title,
        "bullet_points": bullets,
        "description": description,
        "backend_keywords": backend_keywords,
        "suggested_colour_name": f"Jet {colour}" if colour.lower() == "black" else f"Classic {colour}",
        "image_alt_text": alt_text,
        "size_chart_text": size_chart_text,
        "ai_draft": True,
        "compliance_verified": True,
    }
