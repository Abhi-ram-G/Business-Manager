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

# Validate and parse connection details
from urllib.parse import urlparse
try:
    parsed = urlparse(effective_url)
    if not parsed.scheme or not parsed.hostname or not parsed.username:
        raise ValueError("Scheme, Hostname, or Username is missing in database URL.")
    if parsed.scheme not in ["postgresql", "postgresql+psycopg2"]:
        raise ValueError(f"Invalid scheme '{parsed.scheme}'. Only 'postgresql' is supported.")
    
    # Check host correctness
    host = parsed.hostname
    if "pooler.supabase.com" in host and host != "aws-0-ap-northeast-1.pooler.supabase.com":
        print(f"[WARNING] Overriding incorrect pooler host '{host}' with Tokyo region host 'aws-0-ap-northeast-1.pooler.supabase.com'")
        port_part = f":{parsed.port}" if parsed.port else ""
        pass_part = f":{parsed.password}" if parsed.password else ""
        query_part = f"?{parsed.query}" if parsed.query else ""
        effective_url = f"postgresql://{parsed.username}{pass_part}@aws-0-ap-northeast-1.pooler.supabase.com{port_part}{parsed.path}{query_part}"
        parsed = urlparse(effective_url)
        host = parsed.hostname

    # Check username format
    username = parsed.username
    if "pooler.supabase.com" in host and username != "postgres.vwtjogybncekikjyqgur":
        print(f"[WARNING] Incorrect username '{username}' for pooler. Expected 'postgres.vwtjogybncekikjyqgur'. Fixing it.")
        pass_part = f":{parsed.password}" if parsed.password else ""
        port_part = f":{parsed.port}" if parsed.port else ""
        query_part = f"?{parsed.query}" if parsed.query else ""
        effective_url = f"postgresql://postgres.vwtjogybncekikjyqgur{pass_part}@{host}{port_part}{parsed.path}{query_part}"
        parsed = urlparse(effective_url)
        username = parsed.username

    # Print parsed connection details safely
    print("\n" + "="*50)
    print("CHECKING DATABASE CONNECTION DETAILS:")
    print(f"Host:          {host}")
    print(f"Port:          {parsed.port or 5432}")
    print(f"Database Name: {parsed.path.lstrip('/')}")
    print(f"Username:      {username}")
    print(f"SSL Enabled:   {'sslmode' in parsed.query or 'ssl' in parsed.query or 'sslmode' in effective_url}")
    print("="*50 + "\n")

except Exception as err:
    print(f"❌ Database URL validation failed: {err}")
    sys.exit(1)

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
