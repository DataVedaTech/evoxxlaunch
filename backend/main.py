import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.database import engine, SessionLocal, Base
from backend.models import Product, ProductImage, AmazonSubmission, AppSetting
from backend.routes import products, images, drive, amazon, variations, settings
from backend.services.amazon_validator import build_amazon_payload

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EvoxxLaunch API",
    description="Amazon India Product Automation Web App for Evoxx T-Shirts",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(images.router)
app.include_router(drive.router)
app.include_router(variations.router)
app.include_router(amazon.router)
app.include_router(settings.router)


def seed_initial_data():
    db: Session = SessionLocal()
    try:
        if db.query(Product).count() > 0:
            return

        # 1. EVOXX-TS-001 — Live on Amazon India
        p1 = Product(
            sku="EVOXX-TS-001",
            title="Evoxx Men’s Cotton Regular Fit Round Neck Half Sleeve T-Shirt",
            brand="Evoxx",
            manufacturer="Evoxx",
            country_of_origin="India",
            product_type="T-Shirt",
            colour="Black",
            size="M",
            fabric="Cotton",
            fit="Regular",
            neck_type="Round Neck",
            sleeve_type="Half Sleeve",
            gender="Men",
            mrp=999.0,
            selling_price=499.0,
            stock=50,
            barcode="8901234567890",
            fulfilment_channel="FBM",
            description=(
                "Evoxx brings you a comfortable everyday T-shirt designed with a clean, modern fit. "
                "Made from soft, breathable 100% combed cotton fabric, this round-neck half-sleeve "
                "T-shirt is easy to style for casual outings, college, travel, and daily wear."
            ),
            bullet_points=json.dumps([
                "Premium breathable cotton fabric for all-day comfort",
                "Regular fit designed for a clean, modern look",
                "Soft round-neck collar with durable stitching",
                "Easy to pair with jeans, trousers, shorts, and casual wear",
                "Ideal for daily wear, college, office-casual, travel, and outings",
            ]),
            backend_keywords="evoxx tshirt, men cotton t shirt, black round neck tshirt, regular fit half sleeve tee",
            size_chart_text="Size Guide (Chest/Length): S (38/27), M (40/28), L (42/29), XL (44/30), XXL (46/31)",
            status="Live",
            amazon_asin="B0EVX00001",
        )
        db.add(p1)
        db.commit()
        db.refresh(p1)

        db.add_all([
            ProductImage(
                product_id=p1.id,
                drive_file_id="1EvoxxBlkModel001",
                filename="black-tshirt-model-1.jpg",
                image_url="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85",
                image_role="Main",
                is_main_image=True,
                sort_order=0,
                width=2000,
                height=2000,
                file_size=412800,
                checksum="dup_black_001",
                white_bg_detected=True,
            ),
            ProductImage(
                product_id=p1.id,
                drive_file_id="1EvoxxBlkBack001",
                filename="black-tshirt-back-view.jpg",
                image_url="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=85",
                image_role="Back",
                is_main_image=False,
                sort_order=1,
                width=2000,
                height=2000,
                file_size=380000,
                checksum="back_black_001",
                white_bg_detected=True,
            ),
            ProductImage(
                product_id=p1.id,
                drive_file_id="1EvoxxBlkFabric001",
                filename="black-cotton-fabric-closeup.jpg",
                image_url="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85",
                image_role="Fabric",
                is_main_image=False,
                sort_order=2,
                width=1800,
                height=1800,
                file_size=310000,
                checksum="fab_black_001",
                white_bg_detected=False,
            ),
        ])
        db.commit()
        db.refresh(p1)

        # Seed variations for EVOXX-TS-001
        var_specs = [
            ("EVOXX-TS-001-BLK-S", "Black", "S", 20, "Live"),
            ("EVOXX-TS-001-BLK-M", "Black", "M", 35, "Live"),
            ("EVOXX-TS-001-BLK-L", "Black", "L", 28, "Live"),
            ("EVOXX-TS-001-WHT-M", "White", "M", 30, "Ready"),
            ("EVOXX-TS-001-NVY-L", "Navy", "L", 25, "Ready"),
        ]
        for v_sku, v_col, v_sz, v_stk, v_status in var_specs:
            vp = Product(
                sku=v_sku,
                parent_sku="EVOXX-TS-001",
                title=f"Evoxx Men’s Cotton Regular Fit Round Neck Half Sleeve T-Shirt - {v_col} ({v_sz})",
                brand="Evoxx",
                product_type="T-Shirt",
                colour=v_col,
                size=v_sz,
                fabric="Cotton",
                fit="Regular",
                neck_type="Round Neck",
                sleeve_type="Half Sleeve",
                gender="Men",
                mrp=999.0,
                selling_price=499.0,
                stock=v_stk,
                description=p1.description,
                bullet_points=p1.bullet_points,
                backend_keywords=p1.backend_keywords,
                size_chart_text=p1.size_chart_text,
                status=v_status,
                amazon_asin=f"B0EVX{v_sku[-3:]}" if v_status == "Live" else None,
            )
            db.add(vp)
            db.commit()
            db.refresh(vp)
            db.add(
                ProductImage(
                    product_id=vp.id,
                    filename=f"{v_sku.lower()}.jpg",
                    image_url=(
                        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=85"
                        if v_col == "White"
                        else "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1000&q=85"
                        if v_col == "Navy"
                        else "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85"
                    ),
                    image_role="Main",
                    is_main_image=True,
                    width=2000,
                    height=2000,
                )
            )
            db.commit()

        # 2. EVOXX-TS-002 — Ready Draft (White)
        p2 = Product(
            sku="EVOXX-TS-002",
            title="Evoxx Men’s Cotton Regular Fit Round Neck Half Sleeve T-Shirt (White)",
            brand="Evoxx",
            product_type="T-Shirt",
            colour="White",
            size="L",
            fabric="Cotton",
            fit="Regular",
            neck_type="Round Neck",
            sleeve_type="Half Sleeve",
            gender="Men",
            mrp=999.0,
            selling_price=499.0,
            stock=40,
            description="Crisp white combed cotton round-neck T-shirt by Evoxx for everyday casual comfort.",
            bullet_points=p1.bullet_points,
            backend_keywords="white tshirt men, evoxx cotton tee, plain white round neck tshirt",
            status="Draft",
        )
        db.add(p2)
        db.commit()
        db.refresh(p2)
        db.add(
            ProductImage(
                product_id=p2.id,
                drive_file_id="1EvoxxWhtModel002",
                filename="white-tshirt-model-2.jpg",
                image_url="https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=85",
                image_role="Main",
                is_main_image=True,
                width=1800,
                height=1800,
                file_size=368400,
            )
        )

        # 3. EVOXX-TS-003 — Validation Error (Missing fabric & low-res image)
        p3 = Product(
            sku="EVOXX-TS-003",
            title="Evoxx Men’s Navy Round Neck Half Sleeve T-Shirt",
            brand="Evoxx",
            product_type="T-Shirt",
            colour="Navy",
            size="XL",
            fabric="",  # Intentionally blank to trigger validation error in Error Center
            fit="Regular",
            neck_type="Round Neck",
            sleeve_type="Half Sleeve",
            gender="Men",
            mrp=999.0,
            selling_price=499.0,
            stock=30,
            status="Error",
        )
        db.add(p3)
        db.commit()
        db.refresh(p3)
        db.add(
            ProductImage(
                product_id=p3.id,
                drive_file_id="1EvoxxNvyModel003",
                filename="navy-tshirt-model-3.jpg",
                image_url="https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1000&q=85",
                image_role="Main",
                is_main_image=True,
                width=850,
                height=850,
                file_size=145000,
            )
        )

        # Seed initial Amazon Submissions
        db.add_all([
            AmazonSubmission(
                product_id=p1.id,
                sku="EVOXX-TS-001",
                submission_type="putListingsItem (Test Mode)",
                status="Accepted",
                request_payload=json.dumps(build_amazon_payload(p1), indent=2),
                amazon_response=json.dumps(
                    {
                        "sku": "EVOXX-TS-001",
                        "status": "ACCEPTED",
                        "submissionId": "AMZ-IN-98F42C10AB",
                        "marketplaceId": "A21TJRUUN4KGV",
                        "asin": "B0EVX00001",
                    },
                    indent=2,
                ),
            ),
            AmazonSubmission(
                product_id=p3.id,
                sku="EVOXX-TS-003",
                submission_type="putListingsItem",
                status="Invalid",
                error_code="MISSING_FABRIC_TYPE",
                error_message="Missing required attribute: fabric_type; Main image resolution below 1000x1000px",
                affected_field="fabric_type",
                suggested_correction="Select fabric in Product Details and replace main image",
                request_payload=json.dumps(build_amazon_payload(p3), indent=2),
                amazon_response=json.dumps(
                    {
                        "sku": "EVOXX-TS-003",
                        "status": "INVALID",
                        "issues": [
                            {
                                "code": "90215",
                                "message": "Missing required attribute: fabric_type",
                                "severity": "ERROR",
                                "attributeNames": ["fabric_type"],
                            }
                        ],
                    },
                    indent=2,
                ),
            ),
        ])

        db.commit()
    finally:
        db.close()


seed_initial_data()


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "EvoxxLaunch", "marketplace": "A21TJRUUN4KGV"}
