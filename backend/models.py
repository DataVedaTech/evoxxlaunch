from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    parent_sku = Column(String, index=True, nullable=True)
    title = Column(String, nullable=False)
    brand = Column(String, default="Evoxx")
    manufacturer = Column(String, default="Evoxx")
    country_of_origin = Column(String, default="India")
    product_type = Column(String, default="T-Shirt")
    colour = Column(String, default="Black")
    size = Column(String, default="M")
    fabric = Column(String, default="Cotton")
    fit = Column(String, default="Regular")
    neck_type = Column(String, default="Round Neck")
    sleeve_type = Column(String, default="Half Sleeve")
    gender = Column(String, default="Men")
    mrp = Column(Float, default=999.0)
    selling_price = Column(Float, default=499.0)
    stock = Column(Integer, default=50)
    barcode = Column(String, nullable=True)
    fulfilment_channel = Column(String, default="FBM")
    description = Column(Text, nullable=True)
    bullet_points = Column(Text, nullable=True)  # JSON array stored as text
    backend_keywords = Column(Text, nullable=True)
    size_chart_text = Column(Text, nullable=True)
    ai_draft = Column(Boolean, default=False)
    status = Column(String, default="Draft")  # Draft, Ready, Submitted, Accepted, Invalid, Live, Error, Needs Review
    amazon_asin = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    submissions = relationship("AmazonSubmission", back_populates="product", cascade="all, delete-orphan")


class ProductImage(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    drive_file_id = Column(String, nullable=True)
    filename = Column(String, nullable=True)
    image_url = Column(String, nullable=False)
    local_path = Column(String, nullable=True)
    image_role = Column(String, default="Main")  # Main, Front, Back, Fabric, Size Chart, Lifestyle, Detail
    is_main_image = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    width = Column(Integer, default=2000)
    height = Column(Integer, default=2000)
    file_size = Column(Integer, default=250000)
    checksum = Column(String, nullable=True)
    white_bg_detected = Column(Boolean, default=True)
    is_blurry = Column(Boolean, default=False)
    has_watermark = Column(Boolean, default=False)
    alt_text = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    product = relationship("Product", back_populates="images")


class AmazonSubmission(Base):
    __tablename__ = "amazon_submissions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    sku = Column(String, index=True, nullable=False)
    submission_type = Column(String, default="putListingsItem")  # Create, Update, Patch, TestValidation
    status = Column(String, default="Submitted")  # Submitted, Accepted, Invalid, Live, Error
    error_code = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    affected_field = Column(String, nullable=True)
    suggested_correction = Column(Text, nullable=True)
    request_payload = Column(Text, nullable=True)
    amazon_response = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    product = relationship("Product", back_populates="submissions")


class AppSetting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String, unique=True, index=True, nullable=False)
    setting_value = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
