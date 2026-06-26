# Photo Wall

Mur de photos collaboratif pour événements (Next.js 15 + Supabase).

## Prérequis

- Node.js 20+
- Projet Supabase configuré (`supabase/schema.sql` + `supabase/migration_rotation.sql`)

## Installation

```bash
npm install
cp .env.example .env.local
```

Renseignez `.env.local` avec vos clés Supabase et le code PIN admin.

## Développement

```bash
npm run dev
```

- Mur photo : `/`
- Dashboard admin : `/admin` (code PIN requis)

## Production

```bash
npm run build
npm start
```

### Variables d'environnement (production)

À configurer sur votre hébergeur (Vercel, Railway, etc.) — **ne pas committer** :

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key (`sb_secret_...`) |
| `ADMIN_PIN` | Code PIN pour `/admin` |

### Supabase

1. Exécuter `supabase/schema.sql` dans le SQL Editor
2. Exécuter `supabase/migration_rotation.sql` si la colonne `rotation` manque
3. Vérifier que le bucket Storage `photos` est public en lecture

## Sécurité

- `.env.local` et tous les fichiers `.env*` sont ignorés par Git (sauf `.env.example`)
- Le dashboard est protégé par PIN côté serveur (cookie httpOnly)
- Ne partagez jamais la `SUPABASE_SERVICE_ROLE_KEY`
