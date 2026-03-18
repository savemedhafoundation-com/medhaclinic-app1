# MedhaClinic Data Connect

This workspace keeps MedhaClinic inside the Firebase data layer:

- Firebase Auth for user identity
- Firebase Data Connect for app queries and mutations
- Managed Cloud SQL for PostgreSQL behind Data Connect

Current service:

- Project: `medhaclinic-3ba87`
- Service: `medhaclinic-3ba87-service`
- Location: `asia-south1`
- Cloud SQL instance: `medhaclinic-3ba87-instance`
- Database: `medhaclinic-3ba87-database`

Useful commands:

```bash
firebase dataconnect:services:list
firebase dataconnect:compile
firebase dataconnect:sdk:generate
firebase deploy --only dataconnect
```

Suggested workflow:

1. Update `schema/schema.gql` and the connector files in `mobile/`.
2. Run `firebase dataconnect:compile`.
3. Generate the client SDK with `firebase dataconnect:sdk:generate`.
4. Review SQL differences with `firebase dataconnect:sql:diff`.
5. Deploy with `firebase deploy --only dataconnect`.

Do not deploy schema changes blindly on production data. Review connector and SQL changes first.
