from typing import Any
from fastapi import Depends, FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from .core.config import get_settings
from .core.db import Base, engine, get_db
from .core.security import hash_password
from .models import User
from .utils import purge_legacy_demo_business_bills, resequence_all_bills

# Modular structured imports
from .auth import auth
from .business.management.labour.labours import add_drivers, add_helper, attendance, salary
from .business.management.bit_hammer_pipe import bit, hammer, pipe
from .business.management.vehicle import vehicles, fuel, service, materials, trips
from .business.bill import bills
from .business.report import reports
from .finance.loans import lent, got
from .family import members, income, expense, budget
from .vault import documents
from .notifications import notifications

settings = get_settings()

app = FastAPI(title="Smart Business Family Manager API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origin_list,
    allow_origin_regex=settings.allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def mask_database_url(url: str) -> str:
    if not url:
        return "Not Configured"
    from urllib.parse import urlparse
    try:
        parsed = urlparse(url)
        if parsed.password:
            netloc = parsed.hostname or ""
            if parsed.port:
                netloc = f"{netloc}:{parsed.port}"
            if parsed.username:
                netloc = f"{parsed.username}:******@{netloc}"
            return parsed._replace(netloc=netloc).geturl()
        return url
    except Exception:
        if "@" in url:
            parts = url.split("@", 1)
            prefix, suffix = parts[0], parts[1]
            if ":" in prefix:
                sub_parts = prefix.split(":")
                if len(sub_parts) >= 3:
                    sub_parts[-1] = "******"
                    return ":".join(sub_parts) + "@" + suffix
            return "******@" + suffix
        return "[Masked URL]"


def get_connection_type(url: str) -> str:
    if not url:
        return "None"
    if "pooler" in url or ":6543" in url:
        return "Session Pooler (IPv4)"
    elif "supabase.co" in url:
        return "Direct Connection (IPv6)"
    return "Direct/Other"


@app.on_event("startup")
def initialize_database() -> None:
    db_url = settings.effective_database_url
    masked_url = mask_database_url(db_url)
    conn_type = get_connection_type(db_url)
    selected_var = settings.selected_db_env_var
    
    print("\n" + "="*50)
    print("DATABASE STARTUP CONNECTION DETAILS")
    print(f"Selected Env Var: {selected_var}")
    print(f"Active URL:       {masked_url}")
    print(f"Connection Type:  {conn_type}")
    
    if db_url and "db.vwtjogybncekikjyqgur.supabase.co" in db_url:
        print("\n[WARNING] Direct Supabase connection detected. Render requires the Session Pooler (IPv4).")
        
    print("="*50 + "\n")

    try:
        # Run programmatic migrations to alter existing tables
        print("Running database schema migrations...")
        migration_statements = [
            "ALTER TABLE labours ADD COLUMN IF NOT EXISTS gender varchar(10);",
            "ALTER TABLE labours ADD COLUMN IF NOT EXISTS profile_photo_name varchar(255);",
            "ALTER TABLE labours ALTER COLUMN profile_photo TYPE text;",
            "ALTER TABLE labours DROP CONSTRAINT IF EXISTS labours_aadhaar_number_key;",
            "ALTER TABLE labours ALTER COLUMN aadhaar_number DROP NOT NULL;",
            "ALTER TABLE labours ALTER COLUMN address DROP NOT NULL;",
            "ALTER TABLE labours ALTER COLUMN emergency_contact DROP NOT NULL;",
            "ALTER TABLE business_bills ADD COLUMN IF NOT EXISTS bit_id varchar(50);",
            "ALTER TABLE business_bills ADD COLUMN IF NOT EXISTS hammer_id varchar(50);",
            "ALTER TABLE business_bills ADD COLUMN IF NOT EXISTS casing10_hammer_id varchar(50);",
            "ALTER TABLE business_bills ADD COLUMN IF NOT EXISTS casing7_hammer_id varchar(50);",
            "ALTER TABLE bit_entries ADD COLUMN IF NOT EXISTS button_size_mm int DEFAULT 0;",
            "ALTER TABLE bit_entries ADD COLUMN IF NOT EXISTS date_entry date DEFAULT CURRENT_DATE;",
            "ALTER TABLE business_bills ADD COLUMN IF NOT EXISTS customer_paid numeric(10, 2) DEFAULT 0.00;",
            "ALTER TABLE business_bills ADD COLUMN IF NOT EXISTS payment_date date;",
            "ALTER TABLE business_bills ADD COLUMN IF NOT EXISTS payments json DEFAULT '[]';",
            "CREATE TABLE IF NOT EXISTS hammer_entries (id VARCHAR(50) PRIMARY KEY, hammer_no VARCHAR(50) NOT NULL, brand VARCHAR(100) NOT NULL, date_entry DATE, rate NUMERIC(10, 2) DEFAULT 0.00, capable_feet_depth INTEGER DEFAULT 950, is_paid BOOLEAN DEFAULT FALSE, casing_type VARCHAR(50), usage_history JSON DEFAULT '[]', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
            "ALTER TABLE hammer_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
            "CREATE TABLE IF NOT EXISTS pipe_entries (id VARCHAR(50) PRIMARY KEY, company_name VARCHAR(150) NOT NULL, location VARCHAR(200) NOT NULL, date_entry DATE, pipe_7_high_count INT DEFAULT 0, pipe_7_high_rate NUMERIC(10, 2) DEFAULT 0.00, pipe_7_high_total NUMERIC(12, 2) DEFAULT 0.00, pipe_7_medium_count INT DEFAULT 0, pipe_7_medium_rate NUMERIC(10, 2) DEFAULT 0.00, pipe_7_medium_total NUMERIC(12, 2) DEFAULT 0.00, pipe_10_high_count INT DEFAULT 0, pipe_10_high_rate NUMERIC(10, 2) DEFAULT 0.00, pipe_10_high_total NUMERIC(12, 2) DEFAULT 0.00, pipe_10_medium_count INT DEFAULT 0, pipe_10_medium_rate NUMERIC(10, 2) DEFAULT 0.00, pipe_10_medium_total NUMERIC(12, 2) DEFAULT 0.00, grand_total NUMERIC(12, 2) DEFAULT 0.00, discount_amount NUMERIC(10, 2) DEFAULT 0.00, grand_price NUMERIC(12, 2) DEFAULT 0.00, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
            "ALTER TABLE pipe_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
            "ALTER TABLE business_bills ADD COLUMN IF NOT EXISTS pipe_supplier_id VARCHAR(50);",
            "ALTER TABLE business_bills ADD COLUMN IF NOT EXISTS casing_7_high_feet NUMERIC(10, 2) DEFAULT 0.00;",
            "ALTER TABLE business_bills ADD COLUMN IF NOT EXISTS casing_7_medium_feet NUMERIC(10, 2) DEFAULT 0.00;",
            "ALTER TABLE business_bills ADD COLUMN IF NOT EXISTS casing_10_high_feet NUMERIC(10, 2) DEFAULT 0.00;",
            "ALTER TABLE business_bills ADD COLUMN IF NOT EXISTS casing_10_medium_feet NUMERIC(10, 2) DEFAULT 0.00;",
            "ALTER TABLE bit_entries ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE bit_entries ADD COLUMN IF NOT EXISTS payments json DEFAULT '[]';",
            "ALTER TABLE bit_entries ADD COLUMN IF NOT EXISTS capable_feet_depth INTEGER DEFAULT 950;",
            "ALTER TABLE bit_entries ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';",
            "ALTER TABLE bit_entries ADD COLUMN IF NOT EXISTS sold_date DATE;",
            "ALTER TABLE bit_entries ADD COLUMN IF NOT EXISTS sold_rate NUMERIC(12, 2);",
            "ALTER TABLE bit_entries ADD COLUMN IF NOT EXISTS usage_history JSON DEFAULT '[]';",
            "ALTER TABLE hammer_entries ADD COLUMN IF NOT EXISTS payments json DEFAULT '[]';",
            "ALTER TABLE hammer_entries ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';",
            "ALTER TABLE hammer_entries ADD COLUMN IF NOT EXISTS sold_date DATE;",
            "ALTER TABLE hammer_entries ADD COLUMN IF NOT EXISTS sold_rate NUMERIC(10, 2);",
            "ALTER TABLE hammer_entries ADD COLUMN IF NOT EXISTS casing_usage_history JSON DEFAULT '[]';",
            "ALTER TABLE pipe_entries ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE pipe_entries ADD COLUMN IF NOT EXISTS payments json DEFAULT '[]';",
            "ALTER TABLE fuel_entries ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE fuel_entries ADD COLUMN IF NOT EXISTS payments json DEFAULT '[]';",
            "CREATE TABLE IF NOT EXISTS service_entries (id VARCHAR(50) PRIMARY KEY, vehicle_id VARCHAR(50), date DATE, service_type VARCHAR(150), cost NUMERIC(10, 2), spare_parts TEXT, remarks TEXT, is_paid BOOLEAN DEFAULT FALSE, payments json DEFAULT '[]', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
            "CREATE TABLE IF NOT EXISTS material_entries (id VARCHAR(50) PRIMARY KEY, vehicle_id VARCHAR(50), date DATE, material_name VARCHAR(150), quantity NUMERIC(10, 2), unit VARCHAR(20), rate NUMERIC(10, 2), total_amount NUMERIC(12, 2), vendor_name VARCHAR(150), remarks TEXT, is_paid BOOLEAN DEFAULT FALSE, payments json DEFAULT '[]', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
        ]
        with engine.connect() as connection:
            for statement in migration_statements:
                try:
                    connection.execute(text(statement))
                    connection.commit()
                except Exception as stmt_err:
                    print(f"Skipping migration statement due to error: {stmt_err}")
        Base.metadata.create_all(bind=engine)
        print("Database initialized/synchronized successfully.\n")
        
        # Ensure default admin user exists in database
        db = Session(bind=engine)
        try:
            admin_exists = db.query(User).filter(User.username == "admin").first()
            if not admin_exists:
                default_admin = User(
                    username="admin",
                    email="admin@local.app",
                    hashed_password=hash_password("30072005"),
                    role="Admin",
                )
                db.add(default_admin)
                db.commit()
                print("Default admin user created in database successfully.")

            removed_bills = purge_legacy_demo_business_bills(db)
            if removed_bills:
                print(f"Removed {removed_bills} legacy demo business bills from the database.")
            
            # Resequence all existing bills in database to match new gapless I-SRS format
            print("Enforcing gapless resequencing for existing bills...")
            resequence_all_bills(db)
            print("Gapless resequencing completed successfully.")
        except Exception as err:
            db.rollback()
            print(f"Warning: Failed to initialize/resequence database: {err}")
        finally:
            db.close()
    except OperationalError as exc:
        raise RuntimeError(
            "Unable to connect to Supabase from Render. The direct Supabase database endpoint is IPv6-only. "
            "Set SUPABASE_POOLER_URL to the Supabase shared pooler session URL (IPv4) or enable the IPv4 add-on."
        ) from exc


@app.get("/health")
def health(db: Session = Depends(get_db)) -> dict[str, Any]:
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"error: {exc.__class__.__name__}"
    return {
        "status": "ok",
        "service": "smart-business-family-manager-backend",
        "database_configured": bool(settings.database_url),
        "database_status": db_status,
    }


# Include Modular Routers
app.include_router(auth.router)
app.include_router(add_drivers.router)
app.include_router(add_helper.router)
app.include_router(attendance.router)
app.include_router(salary.router)
app.include_router(bit.router)
app.include_router(hammer.router)
app.include_router(pipe.router)
app.include_router(vehicles.router)
app.include_router(fuel.router)
app.include_router(service.router)
app.include_router(materials.router)
app.include_router(trips.router)
app.include_router(bills.router)
app.include_router(reports.router)
app.include_router(lent.router)
app.include_router(got.router)
app.include_router(members.router)
app.include_router(income.router)
app.include_router(expense.router)
app.include_router(budget.router)
app.include_router(documents.router)
app.include_router(notifications.router)
