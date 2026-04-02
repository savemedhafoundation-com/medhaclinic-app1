# Cloud Run Migration

This backend is now prepared for a Google Cloud Run deployment backed by Cloud
SQL for PostgreSQL.

## What the repo now supports

- Local development still uses `backend/.env` and a local Postgres instance.
- Production no longer loads local `.env` files by accident.
- In production, the backend can connect to Postgres in two ways:
  - `DATABASE_URL`
  - Cloud Run / Cloud SQL env components:
    - `DB_USER`
    - `DB_PASS`
    - `DB_NAME`
    - `INSTANCE_CONNECTION_NAME`
    - optional `DB_SOCKET_DIR`, `DB_SCHEMA`, `DB_PORT`
- Firebase Admin prefers Google Application Default Credentials on Cloud Run.
- `GET /health` reports Cloud Run and database connection details for debugging.

## Why this migration uses a Dockerfile

This repo includes `backend/Dockerfile` so the same container image can be used
for:

- the Cloud Run service
- a one-off Cloud Run Job for `prisma migrate deploy`

That keeps the production runtime and migration runtime aligned.

## Manual steps I must do

### 1. Enable required Google APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  --project <PROJECT_ID>
```

### 2. Create or confirm the Cloud SQL PostgreSQL instance

If you already have a Cloud SQL PostgreSQL instance, you can reuse it.

Example create command if needed:

```bash
gcloud sql instances create <CLOUD_SQL_INSTANCE_NAME> \
  --database-version=POSTGRES_17 \
  --cpu=1 \
  --memory=3840MiB \
  --region=<REGION> \
  --project <PROJECT_ID>
```

After the instance exists, note its instance connection name:

```text
<PROJECT_ID>:<REGION>:<CLOUD_SQL_INSTANCE_NAME>
```

Use that exact value as `INSTANCE_CONNECTION_NAME`.

### 3. Create the database and DB user

If the database already exists, reuse it.

```bash
gcloud sql databases create <DB_NAME> \
  --instance <CLOUD_SQL_INSTANCE_NAME> \
  --project <PROJECT_ID>
```

Create an app-specific built-in Postgres user:

```bash
gcloud sql users create <DB_USER> \
  --instance <CLOUD_SQL_INSTANCE_NAME> \
  --password <DB_PASSWORD> \
  --project <PROJECT_ID>
```

Recommended:

- database: `medhaclinic-3ba87-database`
- user: `medha_app`

### 4. Create or choose a Cloud Run service account

Create one if you do not already have a suitable service account:

```bash
gcloud iam service-accounts create <SERVICE_ACCOUNT_NAME> \
  --display-name "MedhaClinic Cloud Run" \
  --project <PROJECT_ID>
```

Its email will look like:

```text
<SERVICE_ACCOUNT_NAME>@<PROJECT_ID>.iam.gserviceaccount.com
```

### 5. Grant required IAM roles

Grant the Cloud Run service account the roles it needs at runtime:

```bash
gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member serviceAccount:<SERVICE_ACCOUNT_EMAIL> \
  --role roles/cloudsql.client
```

```bash
gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member serviceAccount:<SERVICE_ACCOUNT_EMAIL> \
  --role roles/secretmanager.secretAccessor
```

Your human deployer account also needs permission to deploy Cloud Run services
and impersonate the runtime service account. If deployment fails with IAM
errors, ask your project admin for roles equivalent to:

- `roles/run.admin`
- `roles/iam.serviceAccountUser`
- `roles/cloudbuild.builds.editor`
- `roles/artifactregistry.writer`

### 6. Decide how Firebase Admin credentials work on Cloud Run

Preferred path:

- Run Cloud Run in the same Google Cloud / Firebase project
- Let the backend use Application Default Credentials from the attached Cloud
  Run service account
- Set `FIREBASE_PROJECT_ID=<PROJECT_ID>` in Cloud Run env vars

Use the JSON-secret fallback only if ADC is not suitable for your setup:

- create a Secret Manager secret containing the full service account JSON
- expose it as `FIREBASE_SERVICE_ACCOUNT_JSON`

### 7. Create Secret Manager secrets or env vars

Create an Artifact Registry Docker repo if you do not already have one:

```bash
gcloud artifacts repositories create <REPOSITORY_NAME> \
  --repository-format=docker \
  --location <REGION> \
  --project <PROJECT_ID>
```

Create the secrets used by the backend:

```bash
printf "<DB_PASSWORD>" | gcloud secrets create <DB_PASS_SECRET> \
  --data-file=- \
  --project <PROJECT_ID>
```

```bash
printf "<OPENAI_API_KEY>" | gcloud secrets create <OPENAI_API_KEY_SECRET> \
  --data-file=- \
  --project <PROJECT_ID>
```

Optional Firebase Admin JSON fallback:

```bash
gcloud secrets create <FIREBASE_ADMIN_JSON_SECRET> \
  --data-file <PATH_TO_FIREBASE_SERVICE_ACCOUNT_JSON> \
  --project <PROJECT_ID>
```

Recommended plain env vars for Cloud Run:

- `NODE_ENV=production`
- `CORS_ORIGIN=<YOUR_FRONTEND_ORIGIN>`
- `DB_USER=<DB_USER>`
- `DB_NAME=<DB_NAME>`
- `INSTANCE_CONNECTION_NAME=<INSTANCE_CONNECTION_NAME>`
- `DB_SOCKET_DIR=/cloudsql`
- `DB_SCHEMA=public`
- `DB_PORT=5432`
- `FIREBASE_PROJECT_ID=<PROJECT_ID>`
- `OPENAI_MODEL=gpt-4.1-mini`

### 8. Build the backend container image

Run this from `backend/`:

```bash
gcloud builds submit \
  --tag <REGION>-docker.pkg.dev/<PROJECT_ID>/<REPOSITORY_NAME>/<SERVICE_NAME>:<TAG> \
  --project <PROJECT_ID>
```

Example image URL shape:

```text
<REGION>-docker.pkg.dev/<PROJECT_ID>/<REPOSITORY_NAME>/<SERVICE_NAME>:<TAG>
```

### 9. Deploy the Cloud Run service and connect it to Cloud SQL

Deploy the service from that image:

```bash
gcloud run deploy <SERVICE_NAME> \
  --image <IMAGE_URI> \
  --region <REGION> \
  --project <PROJECT_ID> \
  --service-account <SERVICE_ACCOUNT_EMAIL> \
  --allow-unauthenticated \
  --add-cloudsql-instances <INSTANCE_CONNECTION_NAME> \
  --set-env-vars NODE_ENV=production,CORS_ORIGIN=<YOUR_FRONTEND_ORIGIN>,DB_USER=<DB_USER>,DB_NAME=<DB_NAME>,INSTANCE_CONNECTION_NAME=<INSTANCE_CONNECTION_NAME>,DB_SOCKET_DIR=/cloudsql,DB_SCHEMA=public,DB_PORT=5432,FIREBASE_PROJECT_ID=<PROJECT_ID>,OPENAI_MODEL=gpt-4.1-mini \
  --set-secrets DB_PASS=<DB_PASS_SECRET>:latest,OPENAI_API_KEY=<OPENAI_API_KEY_SECRET>:latest
```

If you must use a JSON secret for Firebase Admin, add:

```bash
--set-secrets FIREBASE_SERVICE_ACCOUNT_JSON=<FIREBASE_ADMIN_JSON_SECRET>:latest
```

### 10. Run Prisma migrations in production

Create a Cloud Run Job that uses the same image:

```bash
gcloud run jobs create <MIGRATION_JOB_NAME> \
  --image <IMAGE_URI> \
  --region <REGION> \
  --project <PROJECT_ID> \
  --service-account <SERVICE_ACCOUNT_EMAIL> \
  --add-cloudsql-instances <INSTANCE_CONNECTION_NAME> \
  --set-env-vars NODE_ENV=production,DB_USER=<DB_USER>,DB_NAME=<DB_NAME>,INSTANCE_CONNECTION_NAME=<INSTANCE_CONNECTION_NAME>,DB_SOCKET_DIR=/cloudsql,DB_SCHEMA=public,DB_PORT=5432,FIREBASE_PROJECT_ID=<PROJECT_ID> \
  --set-secrets DB_PASS=<DB_PASS_SECRET>:latest \
  --command npm \
  --args run,prisma:deploy
```

Run the migration job:

```bash
gcloud run jobs execute <MIGRATION_JOB_NAME> \
  --region <REGION> \
  --project <PROJECT_ID> \
  --wait
```

If the job already exists and you need to update it:

```bash
gcloud run jobs update <MIGRATION_JOB_NAME> \
  --image <IMAGE_URI> \
  --region <REGION> \
  --project <PROJECT_ID> \
  --service-account <SERVICE_ACCOUNT_EMAIL> \
  --add-cloudsql-instances <INSTANCE_CONNECTION_NAME> \
  --set-env-vars NODE_ENV=production,DB_USER=<DB_USER>,DB_NAME=<DB_NAME>,INSTANCE_CONNECTION_NAME=<INSTANCE_CONNECTION_NAME>,DB_SOCKET_DIR=/cloudsql,DB_SCHEMA=public,DB_PORT=5432,FIREBASE_PROJECT_ID=<PROJECT_ID> \
  --set-secrets DB_PASS=<DB_PASS_SECRET>:latest \
  --command npm \
  --args run,prisma:deploy
```

### 11. Update Expo `EXPO_PUBLIC_BACKEND_URL`

After Cloud Run deploy succeeds, copy the service URL and update the Expo app:

```env
EXPO_PUBLIC_BACKEND_URL=https://<SERVICE_NAME>-<HASH>-<REGION>.run.app
```

Restart Expo after changing it.

### 12. Validate `/health`

Open:

```text
https://<YOUR_CLOUD_RUN_URL>/health
```

Check that the response shows:

- `googleCloudRuntime: true`
- `firebaseAdminConfigured: true`
- `databaseConnectionMode: "socket"` or `"url"` depending on your setup
- `databaseHost` is not `localhost`
- `databaseReachable: true`
- `openaiConfigured: true` if AI endpoints should work

If `databaseReachable` is `false`, recheck:

- `INSTANCE_CONNECTION_NAME`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`
- Cloud Run service account has `roles/cloudsql.client`
- Cloud Run service is deployed with `--add-cloudsql-instances`

## Local vs production reminder

Keep `backend/.env` for local development only, for example:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medhaclinic?schema=public
```

Do not copy that localhost connection string into Cloud Run or other production
env vars.
