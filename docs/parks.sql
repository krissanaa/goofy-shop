create extension if not exists pgcrypto;

create table if not exists public.parks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  location text,
  city text not null,
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  photos text[] not null default '{}'::text[],
  active boolean not null default true,
  created_at timestamptz not null default now()
);
