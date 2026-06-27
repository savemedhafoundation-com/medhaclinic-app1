# Security Rotation Required Before Production Release

The repository previously contained local environment files with production-like secrets. Treat every value from those files as compromised, even if the files were never intentionally shared.

Do not publish to Google Play until these credentials are rotated in their provider consoles and redeployed through a secure secret manager or CI/CD environment variables.

## Rotate Immediately

- Backend Postgres/Neon database connection string from `backend/.env`.
- OpenAI API key from `backend/.env`.
- Firebase Admin service account private key from `backend/.env`.
- Firebase Admin client email/project credential set if tied to the exposed private key.
- Admin panel default password from `admin/.env`.
- Any Razorpay key or secret that may have been present in local env files or CI logs.
- Any Google/Firebase web/API keys that are not restricted by package name, SHA certificate, domain, or API scope.

## Required Follow-Up

- Remove all `.env` files from Git tracking and keep only `.env.example` files.
- Rotate secrets in provider dashboards, not by editing local files only.
- Restrict Firebase API keys to the Android package, signing certificate SHA-1/SHA-256, and approved web origins.
- Store production secrets in the deployment platform secret manager.
- Review Git history and CI logs for exposed values.
- Rebuild and redeploy backend/admin/mobile after rotation.

No real secret values are repeated in this document.
