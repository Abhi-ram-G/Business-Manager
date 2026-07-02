"""
Run this script once to add the new columns to the labours table.
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
    "ALTER TABLE labours ADD COLUMN IF NOT EXISTS gender varchar(10);",
    "ALTER TABLE labours ADD COLUMN IF NOT EXISTS profile_photo_name varchar(255);",
    "ALTER TABLE labours ALTER COLUMN profile_photo TYPE text;",
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
    print("\n✅ Migration complete! All columns added successfully.")

except Exception as e:
    print(f"\n❌ Migration failed: {e}")
    exit(1)
