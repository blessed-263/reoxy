# ReOxy / Micor

Receipt and flight-ticket generators. The SPA and `/api` both run on Vercel. Postgres and Auth are on Supabase.

## Run locally

```
npm install
```

Copy `.env.example` to `.env` (never commit it). Then:

```
npm run db:migrate
```

Paste `scripts/supabase-rls.sql` in the Supabase SQL editor. Disable public signup, create the operator user, put that email in `DESK_OPERATORS`.

```
npm run dev
```

Desk: `http://localhost:3000/desk`  
Portal: `http://localhost:3000/portal`

## Vercel env (server only, never `VITE_`)

`DATABASE_URL` (Supabase transaction pooler), `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DESK_OPERATORS`, `RESEND_API_KEY`, `RESEND_FROM`, `FRONTEND_URL`, `CORS_ORIGIN`.

Frontend: `VITE_APP_URL` for QR links. The browser calls same-origin `/api`.
