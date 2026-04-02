# Medha Admin Dashboard

React + TypeScript admin dashboard for a Cloud Run backend secured with Firebase
Authentication.

## Stack

- Vite
- React 19
- TypeScript
- Material UI
- React Router
- React Query
- Firebase client SDK
- Recharts
- Zustand

## Quick start

```bash
cd admin-web
cp .env.example .env
npm install
npm run dev
```

## Required environment variables

```env
VITE_API_URL=https://your-cloud-run-backend-url
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Firebase admin access

The frontend checks the signed-in Firebase user's custom claims and only allows
users with either:

- `admin: true`
- `role: "admin"`

Example command for setting a claim:

```bash
firebase auth:setcustomclaims <UID> '{"admin": true, "role": "admin"}'
```

## Build

```bash
npm run build
```

## Deploy to Vercel

1. Import `admin-web/` as the project root.
2. Add the `VITE_*` environment variables.
3. Build command: `npm run build`
4. Output directory: `dist`

`vercel.json` is included for SPA rewrites.

## Deploy to Firebase Hosting

```bash
npm run build
firebase hosting:sites:create medha-admin
firebase target:apply hosting admin medha-admin
firebase deploy --only hosting:admin
```

Point Hosting to `admin-web/dist`.
