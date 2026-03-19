create extension if not exists pgcrypto;

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  youtube_url text not null,
  thumbnail_url text,
  category text not null default 'community'
    check (category in ('edit', 'trick', 'spot', 'community')),
  published boolean not null default true,
  created_at timestamptz not null default now()
);
