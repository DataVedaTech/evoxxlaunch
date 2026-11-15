import hashlib
from pathlib import Path
from typing import Dict, Any, Optional

try:
    from PIL import Image, ImageStat
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

COLOUR_KEYWORDS = {
    "black": "Black",
    "blk": "Black",
    "white": "White",
    "wht": "White",
    "navy": "Navy",
    "nvy": "Navy",
    "maroon": "Maroon",
    "olive": "Olive",
    "grey": "Grey",
    "gray": "Grey",
    "charcoal": "Charcoal",
    "red": "Red",
    "blue": "Blue",
    "green": "Green",
    "mustard": "Mustard",
    "yellow": "Yellow",
    "beige": "Beige",
    "lavender": "Lavender",
    "orange": "Orange",
}


def detect_colour_from_filename(filename: str) -> str:
    lower = (filename or "").lower()
    for key, val in COLOUR_KEYWORDS.items():
        if key in lower:
            return val
    return "Black"


def analyze_image_file(file_path: Optional[Path] = None, filename: str = "", width: int = 2000, height: int = 2000) -> Dict[str, Any]:
    detected_colour = detect_colour_from_filename(filename)
    white_bg = True
    is_blurry = False
    has_watermark = "watermark" in filename.lower() or "logo_overlay" in filename.lower()
    checksum = hashlib.md5((filename + f"{width}x{height}").encode()).hexdigest()

    if file_path and file_path.exists() and PIL_AVAILABLE:
        try:
            with Image.open(file_path) as img:
                width, height = img.size
                rgb = img.convert("RGB")
                # Check top-left and top-right corners for white background
                corners = [
                    rgb.getpixel((5, 5)),
                    rgb.getpixel((max(0, width - 6), 5)),
                    rgb.getpixel((5, max(0, height - 6))),
                    rgb.getpixel((max(0, width - 6), max(0, height - 6))),
                ]
                avg_corner = sum(sum(c) / 3 for c in corners) / 4
                white_bg = avg_corner > 235
            checksum = hashlib.md5(file_path.read_bytes()).hexdigest()
        except Exception:
            pass

    low_res = width < 1000 or height < 1000
    status = "Low Resolution" if low_res else "Ready"

    return {
        "detected_colour": detected_colour,
        "width": width,
        "height": height,
        "low_resolution": low_res,
        "white_bg_detected": white_bg,
        "is_blurry": is_blurry,
        "has_watermark": has_watermark,
        "checksum": checksum,
        "status": status,
    }
