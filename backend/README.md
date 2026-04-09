# MedhaClinic Backend

Firebase-authenticated API for MedhaClinic using:

- `Firebase Auth` for identity
- `Prisma` for database access
- `Postgres` as the system of record
- `OpenAI` for backend-only report generation
- `Hono` for HTTP routing

## Runtime model

- Local development uses `backend/.env` and a local Postgres instance.
- Preferred production target is `Render`.
- Preferred production database is `Neon Postgres`.
- Firebase Auth stays in Firebase; only the backend hosting and Postgres move.

The backend supports two production database patterns:

1. A fully specified `DATABASE_URL` and optional `DIRECT_DATABASE_URL`
2. A computed Postgres connection built from:
   - `DB_USER`
   - `DB_PASS`
   - `DB_NAME`
   - `DB_HOST`
   - optional `DB_SCHEMA`, `DB_PORT`

## Folder layout

```text
backend/
  prisma/
    migrations/
    schema.prisma
  src/
    lib/
    middleware/
    routes/
    utils/
    app.ts
    index.ts
  Dockerfile
  RENDER_NEON_MIGRATION.md
  CLOUD_RUN_MIGRATION.md
```

## Local development

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create `.env` from `.env.example`.

3. Generate the Prisma client and run local migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Start the API locally:

```bash
npm run dev
```

The server runs on `http://localhost:4000` by default.

## Firebase Admin

The backend supports these credential sources, in order:

1. `FIREBASE_SERVICE_ACCOUNT_JSON`
2. `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
3. `GOOGLE_APPLICATION_CREDENTIALS`
4. Google Application Default Credentials on Cloud Run

For Render or other non-Google hosting, `FIREBASE_SERVICE_ACCOUNT_JSON` is the
simplest production setup.

## Health endpoint

`GET /health` is available before auth is fully configured and reports:

- Firebase Admin credential source
- Firebase / Google Cloud project IDs
- database host and connection mode
- database socket path when applicable
- whether the database is reachable
- whether OpenAI is configured

Use it after every production deploy.

## Build and verification

```bash
npm run build
npm run typecheck
```

Or run both:

```bash
npm run check
```

## Render + Neon migration

Exact manual steps for Render + Neon are in
`backend/RENDER_NEON_MIGRATION.md`.

That guide includes:

- Neon pooled vs direct connection setup
- Render secret and env var setup
- Prisma migration setup with `DIRECT_DATABASE_URL`
- Firebase Admin setup on Render
- Expo `EXPO_PUBLIC_BACKEND_URL` update steps

Cloud Run guidance remains in `backend/CLOUD_RUN_MIGRATION.md` as a legacy
reference only.

## Routes

Primary routes:

- `GET /health`
- `GET /v1/me`
- `PUT /v1/me/profile`
- `POST /v1/immunity/daily`
- `GET /v1/reports/weekly`
- `POST /v1/reports/weekly/generate`
- `POST /v1/ai/immunity-summary`

Legacy compatibility routes:

- `POST /api/auth/save_daily_immunity`
- `POST /api/auth/weekly-report`
- `POST /api/ai/chat`

## Notes

- This backend keeps Firebase only for auth and identity.
- Health and reporting data should live in Postgres.
- AI calls stay on the backend only.
- Render + Neon is now the preferred production path.
- Cloud Run remains available as an optional legacy deployment target.
