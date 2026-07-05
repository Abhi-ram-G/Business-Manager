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
