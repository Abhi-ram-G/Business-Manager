# Smart Business Family Manager Backend

FastAPI backend wired to the Supabase Postgres database.

## Setup

1. Create a virtual environment and install dependencies:

```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env`.
3. For Render, set `SUPABASE_POOLER_URL` using the Supabase "Session pooler" connection string.
4. Use `DATABASE_URL` only for local development or if your Supabase project has an IPv4 add-on.

3. Run the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Supabase CLI

If you want to manage schema migrations through Supabase CLI, use:

```bash
supabase login
supabase init
supabase link --project-ref vwtjogybncekikjyqgur
```

Then apply the SQL in `supabase/migrations/0001_init.sql`.

## Notes on Supabase connectivity

- Direct Supabase Postgres connections are IPv6-only by default.
- Render web services are typically IPv4-only, so the pooler session URL is the safe choice.
- If you use the direct connection string on Render without the IPv4 add-on, startup will fail with `Network is unreachable`.

## API

- `GET /health`
- `POST /api/v1/auth/token`
- `CRUD /api/v1/labours`
- `CRUD /api/v1/vehicles`
- `CRUD /api/v1/loans/given`
- `CRUD /api/v1/loans/received`
- `CRUD /api/v1/family-members`
- `CRUD /api/v1/expenses`
- `CRUD /api/v1/documents`

The backend is CORS-enabled for local frontend development on port 3000.
