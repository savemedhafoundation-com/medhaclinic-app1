# Render + Neon Migration

This is the recommended production path for MedhaClinic when you do not want
to use Google Cloud Run.

## Target architecture

- Backend hosting: `Render`
- Database: `Neon Postgres`
- Auth: `Firebase Auth`
- AI: `OpenAI`

Neon replaces the database only. The API still needs a host, and this repo is
configured to use `Render` for that role.

## 1. Create the Neon database

Create a Neon project and database, then copy both connection strings:

- `DATABASE_URL`: the pooled Neon connection string
- `DIRECT_DATABASE_URL`: the direct Neon connection string

Recommended:

- Use the pooled URL for the runtime Prisma client
- Use the direct URL for Prisma migrations
- Keep `sslmode=require`

## 2. Create the Render backend service

This repo already includes [render.yaml](e:/gitpro/medhaclinic-app1/render.yaml)
for the backend service.

Create a Render Web Service from the repo root and let Render read the
blueprint, or create the service manually with the same settings:

- Root directory: `backend`
- Build command: `npm install && npm run build`
- Pre-deploy command: `npm run prisma:deploy`
- Start command: `npm start`
- Health check path: `/health`

## 3. Set Render environment variables

Add these in Render:

```text
NODE_ENV=production
OPENAI_MODEL=gpt-4.1-mini
CORS_ORIGIN=<your app origin or * during setup>
DATABASE_URL=<Neon pooled URL>
DIRECT_DATABASE_URL=<Neon direct URL>
OPENAI_API_KEY=<your OpenAI key>
FIREBASE_SERVICE_ACCOUNT_JSON=<full Firebase service account JSON as one secret>
```

Notes:

- `FIREBASE_SERVICE_ACCOUNT_JSON` is the easiest option on Render.
- Do not use the old Cloud Run socket variables unless you are intentionally
  keeping a second deployment path.

## 4. Run Prisma migrations

Render will run this automatically during deploy:

```bash
npm run prisma:deploy
```

Because `npm run prisma:deploy` resolves `DIRECT_DATABASE_URL` first, migrations
can use the direct Neon connection through `backend/scripts/run-prisma-with-env.mjs`
while the app runtime still uses the pooled `DATABASE_URL`.

## 5. Verify the backend

After Render deploys, open:

```text
https://medhaclinic-backend.onrender.com/health
```

You should see:

- `databaseReachable: true`
- `openaiConfigured: true`
- `firebaseAdminConfigured: true`

If your Render service gets a different hostname, use that hostname instead in
the next step.

## 6. Point the app to Render

Update these app-side backend references to the final Render URL:

- [app.json](e:/gitpro/medhaclinic-app1/app.json)
- [eas.json](e:/gitpro/medhaclinic-app1/eas.json)
- your local root `.env` if you run Expo locally

This repo now defaults those tracked config files to:

```text
https://medhaclinic-backend.onrender.com
```

## 7. Retest the AI summary flow

After deployment:

1. Open `/health`
2. Submit a daily immunity check
3. Open the daily report screen
4. Confirm the AI summary returns from `/v1/ai/immunity-summary` or
   `/v1/ai/immunity-summary-public`

## Troubleshooting

- `databaseReachable: false`
  Double-check the Neon URL, SSL mode, and that the password was copied
  correctly.

- `firebaseAdminConfigured: false`
  Recheck `FIREBASE_SERVICE_ACCOUNT_JSON`.

- `openaiConfigured: false`
  Recheck `OPENAI_API_KEY`.

- Render deploy succeeds but Prisma migrations fail
  Confirm `DIRECT_DATABASE_URL` is the non-pooled Neon connection string.
