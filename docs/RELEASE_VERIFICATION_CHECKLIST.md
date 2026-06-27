# Release Verification Checklist

- No `.env` files are tracked.
- Secret scan finds no OpenAI keys, database URLs, Firebase private keys, Razorpay secrets, SMTP passwords, JWT secrets, or admin passwords.
- Backend production `CORS_ORIGIN` is explicit and not `*`.
- Account deletion works in app through `DELETE /v1/me`.
- Account deletion clears backend data and local user-scoped storage.
- AI result screens show AI/template disclosure.
- AI result screens can report unsafe content.
- `POST /v1/ai/report` stores reports or emits structured logs.
- Public unauthenticated AI routes are absent.
- Store listing does not claim diagnosis, treatment, cure, disease management, or guaranteed outcomes.
- Privacy policy URL, terms URL, and account deletion URL are public and non-geofenced.
- Data Safety answers match app behavior.
- Health Apps declaration is submitted accurately.
- Release merged manifest does not include `READ_PHONE_STATE` or `SYSTEM_ALERT_WINDOW`.
- `android:allowBackup` is false.
- Location, notification, and photo permissions are optional and user-initiated.
- Android release build passes.
