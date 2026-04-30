# Medha Clinic Admin Panel

Production admin workspace for Medha Clinic operations: patients, immunity submissions, weekly reports, AI logs, products, coupons, orders, fulfillment, health checks, and audit logs.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- TanStack Table
- React Hook Form + Zod
- Firebase Auth

## Environment

Create `.env.local`, `.env.staging`, or `.env.production`:

```env
VITE_API_URL=https://your-backend.example.com
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_SUPER_ADMIN_EMAILS=mirajsk2000@gmail.com
```

## Admin Access

The frontend and backend require Firebase custom claims:

```json
{ "admin": true }
```

or:

```json
{ "role": "super_admin" }
```

Supported roles are `super_admin`, `admin`, `support`, and `viewer`.

`mirajsk2000@gmail.com` is configured as the bootstrap `super_admin` in the frontend and backend defaults. For production, set `ADMIN_SUPER_EMAILS` on the backend and `VITE_SUPER_ADMIN_EMAILS` on the admin web app to the approved comma-separated list.

Seed the backend `AdminUser` mirror after assigning Firebase claims:

```bash
cd ../backend
ADMIN_FIREBASE_UID="<firebase uid>" ADMIN_EMAIL="admin@medha.example" ADMIN_ROLE="super_admin" npm run seed:admin
```

Seed the initial Medha store catalog after running migrations:

```bash
cd ../backend
npm run seed:catalog
```

## Development

```bash
npm install
npm run dev
```

## Build Checks

```bash
npm run check
npm run build
```

## Deployment

Deploy `admin-web` as the project root. Build command is `npm run build`; output directory is `dist`.

The backend must expose `/v1/admin/*` and include the deployed admin origin in `CORS_ORIGIN`.

## Test Checklist

- Login rejects non-admin Firebase users.
- Login accepts users with `admin: true` or valid `role`.
- Dashboard cards load from `/v1/admin/dashboard`.
- Users list supports search, status filter, notes, disable, and super-admin soft delete.
- Immunity submissions load and CSV export works with auth.
- Weekly reports list and regenerate.
- AI summaries show redacted prompt previews.
- Product create/edit/archive works.
- Coupon create/edit/status works and store validation honors usage limits.
- Orders load and fulfillment updates write tracking/courier/status.
- Settings shows DB, Firebase, OpenAI, Razorpay, env, uptime.
- Audit logs are created for sensitive admin mutations.
