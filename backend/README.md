# Smart Business Family Manager Backend

FastAPI backend wired to the Supabase Postgres database.

## Setup

1. Create a virtual environment and install dependencies:

```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and set your Supabase password in `DATABASE_URL`.

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
