# Security policy

## Reporting a vulnerability

Please do not disclose security issues in a public GitHub issue. Contact the repository owner privately through the email address listed on the GitHub profile, including the affected route, reproduction steps and potential impact.

## Deployment checklist

- Use a unique `ADMIN_PIN` and a long random `ADMIN_SESSION_SECRET`.
- Store secrets only in Vercel environment variables or a local `.env.local` file.
- Never use the Neon connection string or UploadThing token in client-side code.
- Keep the old Supabase migration service-role key local and revoke it after migration.
- Rotate credentials immediately if they are accidentally exposed.
