from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ImageSchema(BaseModel):
    id: int
    product_id: Optional[int] = None
    drive_file_id: Optional[str] = None
    filename: Optional[str] = None
    image_url: str
    local_path: Optional[str] = None
    image_role: str = "Main"
    is_main_image: bool = False
    sort_order: int = 0
    width: int = 2000
    height: int = 2000
    file_size: int = 250000
    checksum: Optional[str] = None
    white_bg_detected: bool = True
    is_blurry: bool = False
    has_watermark: bool = False
    alt_text: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ImageCreate(BaseModel):
    drive_file_id: Optional[str] = None
    filename: Optional[str] = None
    image_url: str
    image_role: str = "Main"
    is_main_image: bool = False
    width: int = 2000
    height: int = 2000
    file_size: int = 250000
    checksum: Optional[str] = None
    white_bg_detected: bool = True


class ImageUpdate(BaseModel):
    image_role: Optional[str] = None
    is_main_image: Optional[bool] = None
    sort_order: Optional[int] = None
    alt_text: Optional[str] = None


class ProductBase(BaseModel):
    sku: str
    parent_sku: Optional[str] = None
    title: str
    brand: str = "Evoxx"
    manufacturer: str = "Evoxx"
    country_of_origin: str = "India"
    product_type: str = "T-Shirt"
    colour: str = "Black"
    size: str = "M"
    fabric: str = "Cotton"
    fit: str = "Regular"
    neck_type: str = "Round Neck"
    sleeve_type: str = "Half Sleeve"
    gender: str = "Men"
    mrp: float = 999.0
    selling_price: float = 499.0
    stock: int = 50
    barcode: Optional[str] = None
    fulfilment_channel: str = "FBM"
    description: Optional[str] = None
    bullet_points: Optional[List[str]] = Field(default_factory=list)
    backend_keywords: Optional[str] = None
    size_chart_text: Optional[str] = None
    ai_draft: bool = False
    status: str = "Draft"
    amazon_asin: Optional[str] = None


class ProductCreate(ProductBase):
    main_image_url: Optional[str] = None
    main_image_filename: Optional[str] = None
    main_image_width: Optional[int] = 2000
    main_image_height: Optional[int] = 2000


class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    parent_sku: Optional[str] = None
    title: Optional[str] = None
    brand: Optional[str] = None
    product_type: Optional[str] = None
    colour: Optional[str] = None
    size: Optional[str] = None
    fabric: Optional[str] = None
    fit: Optional[str] = None
    neck_type: Optional[str] = None
    sleeve_type: Optional[str] = None
    gender: Optional[str] = None
    mrp: Optional[float] = None
    selling_price: Optional[float] = None
    stock: Optional[int] = None
    barcode: Optional[str] = None
    fulfilment_channel: Optional[str] = None
    description: Optional[str] = None
    bullet_points: Optional[List[str]] = None
    backend_keywords: Optional[str] = None
    size_chart_text: Optional[str] = None
    ai_draft: Optional[bool] = None
    status: Optional[str] = None
    amazon_asin: Optional[str] = None


class ProductResponse(ProductBase):
    id: int
    images: List[ImageSchema] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AIContentRequest(BaseModel):
    tone: str = "Premium"
    target_customer: str = "Men aged 18–35"
    key_benefit: str = "Comfort and everyday style"
    design_theme: Optional[str] = "Minimalist Solid"
    price_positioning: Optional[str] = "Value Premium"


class VariationGenerateRequest(BaseModel):
    parent_product_id: int
    colours: List[str]
    sizes: List[str]
    selling_price: Optional[float] = None
    mrp: Optional[float] = None
    default_stock: int = 25


class DriveScanRequest(BaseModel):
    folder_link: str


class DriveImportItem(BaseModel):
    drive_file_id: str
    filename: str
    sku: str
    colour: str
    width: int
    height: int
    file_size: int
    image_url: str
    checksum: str


class DriveImportRequest(BaseModel):
    items: List[DriveImportItem]


class PublishRequest(BaseModel):
    confirmed: bool = False
    mode: str = "putListingsItem"  # putListingsItem, patchListingsItem, draft_validate


class BulkExportRequest(BaseModel):
    product_ids: Optional[List[int]] = None
    export_format: str = "xlsx"  # xlsx, txt, csv
