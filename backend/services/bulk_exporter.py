import csv
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from backend.config import EXPORTS_DIR
from backend.models import Product
from backend.services.amazon_validator import get_main_image

EXPORT_COLUMNS = [
    ("item_sku", "SKU"),
    ("item_name", "Product Name"),
    ("brand_name", "Brand"),
    ("parent_sku", "Parent SKU"),
    ("relationship_type", "Variation Type"),
    ("color_name", "Colour"),
    ("size_name", "Size"),
    ("fabric_type", "Fabric"),
    ("fit_type", "Fit"),
    ("sleeve_type", "Sleeve Length"),
    ("neck_style", "Neck Style"),
    ("department_name", "Gender"),
    ("list_price", "MRP (INR)"),
    ("standard_price", "Selling Price (INR)"),
    ("quantity", "Quantity"),
    ("main_image_url", "Main Image URL"),
    ("other_image_urls", "Additional Image URLs"),
    ("product_description", "Description"),
    ("generic_keywords", "Search Terms"),
    ("fulfillment_channel_code", "Fulfilment Channel"),
    ("country_of_origin", "Country of Origin"),
]


def product_to_export_row(product: Product) -> Dict[str, Any]:
    main_img = get_main_image(product)
    other_imgs = [
        img.image_url for img in (product.images or [])
        if main_img is None or img.id != main_img.id
    ]
    return {
        "item_sku": product.sku,
        "item_name": product.title,
        "brand_name": product.brand or "Evoxx",
        "parent_sku": product.parent_sku or "",
        "relationship_type": "Variation" if product.parent_sku else "",
        "color_name": product.colour,
        "size_name": product.size,
        "fabric_type": product.fabric,
        "fit_type": product.fit,
        "sleeve_type": product.sleeve_type,
        "neck_style": product.neck_type,
        "department_name": product.gender,
        "list_price": product.mrp,
        "standard_price": product.selling_price,
        "quantity": product.stock,
        "main_image_url": main_img.image_url if main_img else "",
        "other_image_urls": " | ".join(other_imgs),
        "product_description": product.description or "",
        "generic_keywords": product.backend_keywords or "",
        "fulfillment_channel_code": product.fulfilment_channel or "FBM",
        "country_of_origin": product.country_of_origin or "India",
    }


def generate_bulk_export(products: List[Product], export_format: str = "xlsx") -> Dict[str, Any]:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    fmt = export_format.lower().strip()
    if fmt not in ("xlsx", "txt", "csv"):
        fmt = "xlsx"

    filename = f"Evoxx_Amazon_IN_Bulk_{timestamp}.{fmt}"
    filepath: Path = EXPORTS_DIR / filename

    rows = [product_to_export_row(p) for p in products]
    keys = [col[0] for col in EXPORT_COLUMNS]
    headers = [col[1] for col in EXPORT_COLUMNS]

    if fmt == "xlsx":
        wb = Workbook()
        ws = wb.active
        ws.title = "Amazon_IN_SHIRT_Template"

        # Row 1: Human-readable headers
        ws.append(headers)
        # Row 2: Amazon technical attribute names
        ws.append(keys)

        header_fill = PatternFill(start_color="FF6B00", end_color="FF6B00", fill_type="solid")
        sub_fill = PatternFill(start_color="101828", end_color="101828", fill_type="solid")
        white_font = Font(color="FFFFFF", bold=True)

        for col_idx in range(1, len(headers) + 1):
            c1 = ws.cell(row=1, column=col_idx)
            c1.fill = header_fill
            c1.font = white_font
            c1.alignment = Alignment(horizontal="center")

            c2 = ws.cell(row=2, column=col_idx)
            c2.fill = sub_fill
            c2.font = white_font
            c2.alignment = Alignment(horizontal="center")

        for r in rows:
            ws.append([r[k] for k in keys])

        for col in ws.columns:
            max_len = max(len(str(cell.value or "")) for cell in col)
            col_letter = col[0].column_letter
            ws.column_dimensions[col_letter].width = min(max(max_len + 3, 14), 45)

        wb.save(filepath)

    elif fmt == "txt":
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f, delimiter="\t")
            writer.writerow(headers)
            writer.writerow(keys)
            for r in rows:
                writer.writerow([r[k] for k in keys])

    else:  # csv
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerow(keys)
            for r in rows:
                writer.writerow([r[k] for k in keys])

    return {
        "filename": filename,
        "format": fmt,
        "product_count": len(rows),
        "download_url": f"/api/export/download/{filename}",
        "filepath": str(filepath),
    }
