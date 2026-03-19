create extension if not exists pgcrypto;

create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percent', 'fixed')),
  value integer not null,
  min_order integer not null default 0,
  max_uses integer not null default 0,
  uses_count integer not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists discount_codes_code_idx on public.discount_codes (code);
create index if not exists discount_codes_active_idx on public.discount_codes (active);
