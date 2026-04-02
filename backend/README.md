# MedhaClinic Backend

Firebase-authenticated API for MedhaClinic using:

- `Firebase Auth` for identity
- `Prisma` for database access
- `Postgres` as the system of record
- `OpenAI` for backend-only report generation
- `Hono` for HTTP routing

## Runtime model

- Local development uses `backend/.env` and a local Postgres instance.
- Preferred production target is `Google Cloud Run`.
- Preferred production database is `Cloud SQL for PostgreSQL`.
- Firebase Auth stays in Firebase; only the backend hosting and Postgres move.

The backend now supports two production database patterns:

1. A fully specified `DATABASE_URL`
2. A Cloud Run / Cloud SQL socket configuration built from:
   - `DB_USER`
   - `DB_PASS`
   - `DB_NAME`
   - `INSTANCE_CONNECTION_NAME`
   - optional `DB_SOCKET_DIR`, `DB_SCHEMA`, `DB_PORT`

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

On Cloud Run in the same Google Cloud / Firebase project, ADC is the preferred
production path so you do not need to ship a JSON key file by default.

## Health endpoint

`GET /health` is available before auth is fully configured and reports:

- Firebase Admin credential source
- Firebase / Google Cloud project IDs
- database host and connection mode
- Cloud SQL socket path when applicable
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

## Cloud Run migration

Exact manual steps for Cloud Run + Cloud SQL are in
`backend/CLOUD_RUN_MIGRATION.md`.

That guide includes:

- required Google APIs
- Cloud SQL and DB user setup
- Cloud Run service account roles
- Secret Manager / env var setup
- container build and deploy commands
- Cloud Run job commands for `prisma migrate deploy`
- Expo `EXPO_PUBLIC_BACKEND_URL` update steps

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
- Legacy Vercel and Render files remain in the repo for reference, but Cloud Run
  is now the preferred production path.
