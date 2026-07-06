"""
Run this script once to add the new columns to the labours table
and fix the aadhaar_number unique/nullable constraints.
Usage:  python run_migration.py
"""
import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()  # load backend/.env

DATABASE_URL = (
    os.getenv("SUPABASE_POOLER_URL")
    or os.getenv("DATABASE_URL")
)

if not DATABASE_URL:
    print("ERROR: No DATABASE_URL or SUPABASE_POOLER_URL found in .env")
    exit(1)

SQL_STATEMENTS = [
    # Add new columns (safe to re-run)
    "ALTER TABLE labours ADD COLUMN IF NOT EXISTS gender varchar(10);",
    "ALTER TABLE labours ADD COLUMN IF NOT EXISTS profile_photo_name varchar(255);",
    # Change profile_photo to TEXT to support base64 image data
    "ALTER TABLE labours ALTER COLUMN profile_photo TYPE text;",
    # Drop unique constraint on aadhaar_number (allows empty/null values)
    "ALTER TABLE labours DROP CONSTRAINT IF EXISTS labours_aadhaar_number_key;",
    # Allow NULL on aadhaar_number, address, emergency_contact
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
    "ALTER TABLE hammer_entries ADD COLUMN IF NOT EXISTS payments json DEFAULT '[]';",
    "ALTER TABLE pipe_entries ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE pipe_entries ADD COLUMN IF NOT EXISTS payments json DEFAULT '[]';",
    "ALTER TABLE fuel_entries ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE fuel_entries ADD COLUMN IF NOT EXISTS payments json DEFAULT '[]';",
    "CREATE TABLE IF NOT EXISTS service_entries (id VARCHAR(50) PRIMARY KEY, vehicle_id VARCHAR(50), date DATE, service_type VARCHAR(150), cost NUMERIC(10, 2), spare_parts TEXT, remarks TEXT, is_paid BOOLEAN DEFAULT FALSE, payments json DEFAULT '[]', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
    "CREATE TABLE IF NOT EXISTS material_entries (id VARCHAR(50) PRIMARY KEY, vehicle_id VARCHAR(50), date DATE, material_name VARCHAR(150), quantity NUMERIC(10, 2), unit VARCHAR(20), rate NUMERIC(10, 2), total_amount NUMERIC(12, 2), vendor_name VARCHAR(150), remarks TEXT, is_paid BOOLEAN DEFAULT FALSE, payments json DEFAULT '[]', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
]

print(f"Connecting to database...")
try:
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()

    for sql in SQL_STATEMENTS:
        print(f"Running: {sql}")
        cur.execute(sql)
        print("  ✅ Done")

    cur.close()
    conn.close()
    print("\n✅ Migration complete! All changes applied successfully.")

except Exception as e:
    print(f"\n❌ Migration failed: {e}")
    exit(1)
