# Photo Wall

Photo Wall is a collaborative event gallery built with Next.js, TypeScript and Supabase. Guests can share photos in real time, while event organizers manage the wall from a protected dashboard.

## Features

- Collaborative photo uploads from a phone, camera or gallery
- Responsive infinite wall with slideshow mode and ambient music
- Admin dashboard for moderation and event configuration
- Supabase database and Storage integration
- Stateless, signed ownership tokens for guest photo management
- Production-ready deployment on Vercel

## Tech stack

- Next.js 15 App Router
- React 18 and TypeScript
- Supabase (Postgres, Row Level Security and Storage)
- Tailwind CSS and Radix UI

## Requirements

- Node.js 20 or newer
- A Supabase project

## Local development

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the photo wall and `/admin` for the dashboard.

## Environment variables

Copy `.env.example` to `.env.local` and provide:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secret key; server-side only |
| `ADMIN_PIN` | Admin login PIN; use a long, unique value |
| `ADMIN_SESSION_SECRET` | Long random secret used to sign sessions and ownership tokens |

Never expose or commit `.env.local`, Supabase Secret keys, admin PINs or session secrets. Configure the same variables in Vercel Project Settings → Environment Variables.

## Supabase setup

1. Run `supabase/schema.sql` in the Supabase SQL Editor.
2. Run `supabase/migration_rotation.sql` for existing databases.
3. Confirm that the `photos` Storage bucket exists and is public for read access.
4. Keep the Supabase Secret key exclusively in server-side environment variables.

The application uses server-side Supabase access for its API routes. The database schema enables Row Level Security and exposes only the intended public read policies.

## Production

```bash
npm run typecheck
npm run build
npm start
```

To deploy, import the repository into Vercel, select the root directory, add the environment variables, and use the default Next.js build settings.

## Security notes

- Admin mutations require an HTTP-only signed session cookie.
- Guest photo mutations require a signed per-photo ownership token.
- Uploads are restricted to JPEG, PNG and WebP files up to 10 MB.
- API input is validated server-side; client-side validation is only a convenience.
- Do not use the example PIN or example session secret in production.

For vulnerability reports, see [SECURITY.md](SECURITY.md).

## Attribution

See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for third-party assets and licenses.

## License

The source code is released under the MIT License. See [LICENSE](LICENSE).
