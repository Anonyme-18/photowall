-- Photo Wall database schema for Neon PostgreSQL.

create table if not exists photos (
  id text primary key,
  url text not null,
  storage_key text,
  author text not null default '',
  timestamp timestamptz not null default now(),
  hidden boolean not null default false,
  aspect_ratio double precision not null default 1.333,
  accent_color text,
  x double precision,
  y double precision,
  rotation double precision not null default 0
);

create index if not exists photos_timestamp_idx on photos (timestamp desc);

create table if not exists event_config (
  id integer primary key default 1 check (id = 1),
  config jsonb not null
);

insert into event_config (id, config) values (
  1,
  '{
    "name": "TECH MEETUP 5",
    "subtitle": "Les Pro de la Tech · Photowall",
    "tabs": [
      { "id": "wall", "label": "Photo wall" },
      { "id": "meetup", "label": "Meetup" }
    ],
    "accentColor": "#f5c842",
    "eventDate": "25 juin 2026",
    "eventTime": "19h – 23h",
    "eventLocation": "Paris, France",
    "eventParticipants": "Communauté Les Pro de la Tech"
  }'::jsonb
) on conflict (id) do nothing;

insert into photos (id, url, author, timestamp, hidden, aspect_ratio, accent_color, x, y)
values
  ('1', '/imports/15.jpg', 'Kofi', now() - interval '3 minutes', false, 1.333, '#f44336', -390, -260),
  ('2', '/imports/128.jpg', 'André', now() - interval '8 minutes', false, 1.333, '#2196f3', -200, -275),
  ('3', '/imports/169.jpg', 'Amina', now() - interval '14 minutes', false, 1.333, '#f5c842', -10, -255),
  ('4', '/imports/243.jpg', 'Diakité', now() - interval '22 minutes', false, 1.333, '#9c27b0', 175, -265),
  ('5', '/imports/DSC_0143.jpg', 'Seun', now() - interval '31 minutes', false, 1.333, '#e91e8c', -390, 50),
  ('6', '/imports/DSC_0238.jpg', 'Chioma', now() - interval '45 minutes', false, 1.333, '#27c93f', -200, 40),
  ('7', '/imports/DSC_0349.jpg', 'Kwame', now() - interval '60 minutes', false, 1.333, '#ff6b35', -10, 55),
  ('8', '/imports/DSC_0372.jpg', 'Hana', now() - interval '72 minutes', false, 1.333, '#17c4c4', 175, 45)
on conflict (id) do nothing;
