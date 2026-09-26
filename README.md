# Photo Wall

Photo Wall is a collaborative event gallery built with Next.js, TypeScript, Neon Postgres and UploadThing. Guests can share photos in real time, while event organizers manage the wall from a protected dashboard.

## Features

- Collaborative photo uploads from a phone, camera or gallery
- Responsive infinite wall with slideshow mode and ambient music
- Admin dashboard for moderation and event configuration
- Neon PostgreSQL database with a small server-side data layer
- UploadThing image storage with server-only credentials
- Stateless, signed ownership tokens for guest photo management
- Production-ready deployment on Vercel

## Tech stack

- Next.js 15 App Router
- React 18 and TypeScript
- Neon PostgreSQL with `@neondatabase/serverless`
- UploadThing server API for image storage
- Tailwind CSS and Radix UI

## Requirements

- Node.js 20 or newer
- A Neon project
- An UploadThing app

## Local development

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the photo wall and `/admin` for the dashboard.

## Environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon PostgreSQL connection string; server-side only |
| `UPLOADTHING_TOKEN` | UploadThing server token; never expose it to the browser |
| `ADMIN_PIN` | Admin login PIN; use a long, unique value |
| `ADMIN_SESSION_SECRET` | Long random secret used to sign sessions and ownership tokens |

Never expose or commit `.env.local`, database URLs, UploadThing tokens, admin PINs or session secrets. Configure these variables in Vercel Project Settings → Environment Variables.

## Database setup

1. Create a Neon project.
2. Run [`neon/schema.sql`](neon/schema.sql) in the Neon SQL Editor.
3. Copy the Neon connection string to `DATABASE_URL`.

## Migrating from Supabase

The repository includes a one-time migration utility that copies the event configuration and photo records from the existing Supabase project. Supabase-hosted images are downloaded and re-uploaded to UploadThing, and their new UploadThing keys are stored in Neon.

Set these temporary variables locally, then run:

```bash
$env:SUPABASE_MIGRATION_URL="https://your-project.supabase.co"
$env:SUPABASE_MIGRATION_SERVICE_ROLE_KEY="your_old_service_role_key"
npm run migrate:supabase
```

The migration is idempotent by photo ID. Review the result before deleting anything from Supabase. The migration script does not delete data from the old services.

## Production

```bash
npm run typecheck
npm run build
npm start
```

To deploy, import the repository into Vercel, add `DATABASE_URL`, `UPLOADTHING_TOKEN`, `ADMIN_PIN` and `ADMIN_SESSION_SECRET`, and use the default Next.js build settings.

## Security notes

- Database and UploadThing credentials are used only in server-side code.
- Admin mutations require an HTTP-only signed session cookie.
- Guest photo mutations require a signed per-photo ownership token.
- Uploads are restricted to JPEG, PNG and WebP files up to 10 MB.
- API input is validated server-side; client-side validation is only a convenience.
- UploadThing file deletion uses the stored server-side file key, never a user-provided URL.

For vulnerability reports, see [SECURITY.md](SECURITY.md).

## Attribution

See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for third-party assets and licenses.

## License

The source code is released under the MIT License. See [LICENSE](LICENSE).
