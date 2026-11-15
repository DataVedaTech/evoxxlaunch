import re
import hashlib
from typing import List, Dict, Any
import httpx
from sqlalchemy.orm import Session
from backend.config import settings
from backend.models import ProductImage
from backend.services.image_analyzer import detect_colour_from_filename
from backend.services.sku_generator import get_next_design_number


DEMO_DRIVE_IMAGES = [
    {
        "drive_file_id": "1EvoxxBlkModel001",
        "filename": "black-tshirt-model-1.jpg",
        "width": 2000,
        "height": 2000,
        "file_size": 412800,
        "colour": "Black",
        "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85",
    },
    {
        "drive_file_id": "1EvoxxWhtModel002",
        "filename": "white-tshirt-model-2.jpg",
        "width": 1800,
        "height": 1800,
        "file_size": 368400,
        "colour": "White",
        "image_url": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=85",
    },
    {
        "drive_file_id": "1EvoxxNvyModel003",
        "filename": "navy-tshirt-model-3.jpg",
        "width": 2000,
        "height": 2000,
        "file_size": 395100,
        "colour": "Navy",
        "image_url": "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1000&q=85",
    },
    {
        "drive_file_id": "1EvoxxOlvModel004",
        "filename": "olive-cotton-tshirt-model-4.jpg",
        "width": 2200,
        "height": 2200,
        "file_size": 458900,
        "colour": "Olive",
        "image_url": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85",
    },
    {
        "drive_file_id": "1EvoxxMrnModel005",
        "filename": "maroon-round-neck-model-5.jpg",
        "width": 1600,
        "height": 1600,
        "file_size": 334000,
        "colour": "Maroon",
        "image_url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85",
    },
    {
        "drive_file_id": "1EvoxxGryLowRes006",
        "filename": "grey-tshirt-preview-lowres.jpg",
        "width": 800,
        "height": 800,
        "file_size": 115200,
        "colour": "Grey",
        "image_url": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
    },
    {
        "drive_file_id": "1EvoxxBlkDup007",
        "filename": "black-tshirt-model-1-copy.jpg",
        "width": 2000,
        "height": 2000,
        "file_size": 412800,
        "colour": "Black",
        "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85",
        "force_checksum": "dup_black_001",
    },
]


def extract_folder_id(folder_link: str) -> str:
    match = re.search(r"folders/([a-zA-Z0-9_-]+)", folder_link)
    if match:
        return match.group(1)
    match_id = re.search(r"id=([a-zA-Z0-9_-]+)", folder_link)
    if match_id:
        return match_id.group(1)
    return folder_link.strip() or "Evoxx-TShirt-Models-Folder"


async def scan_drive_folder(db: Session, folder_link: str) -> Dict[str, Any]:
    folder_id = extract_folder_id(folder_link)
    existing_checksums = {
        row[0] for row in db.query(ProductImage.checksum).filter(ProductImage.checksum.isnot(None)).all()
    }
    next_num = get_next_design_number(db, "EVOXX-TS-")

    raw_items: List[Dict[str, Any]] = []
    used_live_api = False

    if settings.GOOGLE_API_KEY and folder_id not in ("Evoxx-TShirt-Models-Folder", "demo"):
        try:
            url = "https://www.googleapis.com/drive/v3/files"
            params = {
                "q": f"'{folder_id}' in parents and trashed = false and (mimeType contains 'image/')",
                "fields": "files(id,name,mimeType,size,md5Checksum,imageMediaMetadata,thumbnailLink,webContentLink)",
                "key": settings.GOOGLE_API_KEY,
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, params=params)
                if resp.status_code == 200:
                    files = resp.json().get("files", [])
                    if files:
                        used_live_api = True
                        for f in files:
                            meta = f.get("imageMediaMetadata") or {}
                            raw_items.append({
                                "drive_file_id": f["id"],
                                "filename": f["name"],
                                "width": int(meta.get("width", 2000)),
                                "height": int(meta.get("height", 2000)),
                                "file_size": int(f.get("size", 350000)),
                                "colour": detect_colour_from_filename(f["name"]),
                                "image_url": f.get("thumbnailLink") or f"https://drive.google.com/uc?export=view&id={f['id']}",
                                "checksum": f.get("md5Checksum") or hashlib.md5(f["name"].encode()).hexdigest(),
                            })
        except Exception:
            used_live_api = False

    if not raw_items:
        # Use rich demo dataset so user can immediately test scanning, duplicate detection, and low-res warnings
        for idx, item in enumerate(DEMO_DRIVE_IMAGES):
            base_hash = item.get("force_checksum") or (
                "dup_black_001" if idx == 0 else hashlib.md5(item["filename"].encode()).hexdigest()
            )
            raw_items.append({
                **item,
                "checksum": base_hash,
            })

    seen_checksums = set(existing_checksums)
    results = []
    duplicate_count = 0
    low_res_count = 0
    new_designs = 0

    for item in raw_items:
        csum = item["checksum"]
        is_duplicate = csum in seen_checksums
        seen_checksums.add(csum)

        is_low_res = item["width"] < 1000 or item["height"] < 1000
        if is_duplicate:
            duplicate_count += 1
            status = "Duplicate"
        elif is_low_res:
            low_res_count += 1
            status = "Low Resolution"
            new_designs += 1
        else:
            status = "Ready"
            new_designs += 1

        sku = f"EVOXX-TS-{next_num:03d}"
        next_num += 1

        results.append({
            "drive_file_id": item["drive_file_id"],
            "filename": item["filename"],
            "sku": sku,
            "detected_colour": item["colour"],
            "width": item["width"],
            "height": item["height"],
            "resolution": f"{item['width']} × {item['height']}",
            "file_size": item["file_size"],
            "image_url": item["image_url"],
            "checksum": csum,
            "is_duplicate": is_duplicate,
            "is_low_res": is_low_res,
            "status": status,
            "selected": not is_duplicate,
        })

    return {
        "folder_id": folder_id,
        "folder_name": "Evoxx T-Shirt Models" if not used_live_api else f"Drive Folder ({folder_id[:8]})",
        "mode": "live_google_drive" if used_live_api else "demo_simulation",
        "total_images": len(results),
        "new_designs": new_designs,
        "duplicate_images": duplicate_count,
        "low_res_warnings": low_res_count,
        "images": results,
    }
