import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load local environment variables from .env
load_dotenv()

database_url = os.getenv("DATABASE_URL")
supabase_pooler_url = os.getenv("SUPABASE_POOLER_URL")

effective_url = supabase_pooler_url or database_url

if not effective_url:
    print("Error: No database connection URL found in .env file.")
    sys.exit(1)

print("Checking connection to database...")
print(f"URL: {effective_url.split('@')[-1]}")  # Print hostname/port only for safety

try:
    # Use require sslmode for supabase connection
    connect_args = {"sslmode": "require"} if effective_url.startswith("postgresql") else {}
    engine = create_engine(effective_url, connect_args=connect_args)
    
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("\n=== CONNECTION SUCCESSFUL! ===")
        print("Backend successfully connected to the online Supabase database.")
        print(f"Database response: {result.scalar()}")
except Exception as e:
    print("\n=== CONNECTION FAILED! ===")
    print(f"Error type: {type(e).__name__}")
    print(f"Details: {str(e)}")
    sys.exit(1)
