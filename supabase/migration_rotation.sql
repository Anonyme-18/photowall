-- Migration : colonne rotation pour l'inclinaison des photos
-- Exécuter dans Supabase → SQL Editor

alter table public.photos
  add column if not exists rotation double precision not null default 0;

-- Recharge le cache schéma PostgREST (évite l'erreur PGRST204)
notify pgrst, 'reload schema';
