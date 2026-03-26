# MedhaClinic Backend

Firebase-authenticated API for MedhaClinic using:

- `Firebase Auth` for identity
- `Prisma` for database access
- `Postgres` as the system of record
- `OpenAI` for backend-only report generation
- `Hono` for HTTP routing

## What this replaces

The Expo app currently posts health data to a Vercel backend and stores some
profile data in Firestore. This scaffold moves the health/report domain to
Postgres while keeping Firebase for login.

## Folder layout

```text
backend/
  prisma/
    schema.prisma
  src/
    lib/
    middleware/
    routes/
    utils/
    app.ts
    index.ts
```

## Quick start

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create `.env` from `.env.example`.
   The only required database variable for the scaffold is `DATABASE_URL`.

   Firebase Admin is required for authenticated routes. In the Firebase console:
   - Open `Project settings` > `Service accounts`
   - Click `Generate new private key`
   - Download the JSON file
   - Preferred: set `GOOGLE_APPLICATION_CREDENTIALS` to the downloaded JSON file path
   - Or copy `project_id`, `client_email`, and `private_key` into `.env`

   Keep the private key wrapped in double quotes in `.env` so the `\n` line
   breaks are preserved, or put the whole JSON in `FIREBASE_SERVICE_ACCOUNT_JSON`.

3. Generate the Prisma client:

```bash
npx prisma generate
```

4. Create the initial database schema:

```bash
npx prisma migrate dev --name init
```

5. Start the API locally:

```bash
npm run dev
```

The server runs on `http://localhost:4000` by default.

`GET /health` stays available even before Firebase Admin is configured. It also
reports whether Firebase Admin and OpenAI are configured.

## Production deploy

This repo now includes a root-level `render.yaml` that provisions:

- a Render web service for `backend/`
- a managed Render Postgres instance
- `DATABASE_URL` wired from the database into the service
- `npm run prisma:deploy` as a pre-deploy migration step

Deploy flow:

1. Push the repo to GitHub/GitLab/Bitbucket.
2. In Render, create a new Blueprint from the repository.
3. Approve the `medhaclinic-backend` web service and `medhaclinic-postgres` database.
4. Provide these required secrets in Render:
   - `CORS_ORIGIN`
   - `FIREBASE_SERVICE_ACCOUNT_JSON`
   - `OPENAI_API_KEY` if you want AI summary/report endpoints enabled
5. After the first deploy succeeds, set the Expo app's `EXPO_PUBLIC_BACKEND_URL`
   to your Render backend URL, for example `https://medhaclinic-backend.onrender.com`.

`FIREBASE_SERVICE_ACCOUNT_JSON` is the easiest production Firebase Admin setup:
paste the downloaded service-account JSON as a single-line JSON string.

The checked-in `backend/prisma/migrations/` folder is what allows Render to run:

```bash
npm run prisma:deploy
```

on every deploy instead of trying to infer schema changes at runtime.

## Auth flow

The mobile app should send:

```http
Authorization: Bearer <firebase-id-token>
```

The backend verifies that token with Firebase Admin and maps it to a Postgres
user row.

## Routes

New routes:

- `GET /health`
- `GET /v1/me`
- `PUT /v1/me/profile`
- `POST /v1/immunity/daily`
- `GET /v1/reports/weekly`
- `POST /v1/reports/weekly/generate`
- `POST /v1/ai/immunity-summary`

Legacy compatibility routes for the current Expo app:

- `POST /api/auth/save_daily_immunity`
- `POST /api/auth/weekly-report`
- `POST /api/ai/chat`

## Frontend migration

Change the Expo app to stop sending `phone` or `userId` as authority. Instead:

1. read the Firebase ID token from `auth.currentUser`
2. send it in the `Authorization` header
3. let the backend derive the user from Firebase Admin verification

## Notes

- This scaffold keeps Firebase only for auth and identity.
- Health and reporting data should live in Postgres.
- AI calls stay on the backend only.
