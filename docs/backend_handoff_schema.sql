-- GOOFY. Skate Shop
-- Backend handoff schema
-- Purpose: a clean PostgreSQL schema reference for a backend developer.
-- Note: this excludes Supabase Auth and Storage internals.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price integer not null default 0,
  compare_price integer,
  images text[] not null default '{}',
  category text not null
    check (category in ('deck', 'wheel', 'truck', 'bearing', 'shoe', 'apparel')),
  brand text not null,
  badge text
    check (badge in ('NEW', 'HOT', 'SALE', 'COLLAB')),
  stock integer not null default 0,
  sku text,
  low_stock_threshold integer default 3,
  description text not null default '',
  specs jsonb,
  meta_title text,
  meta_description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category);
create index if not exists products_brand_idx on public.products(brand);
create index if not exists products_active_idx on public.products(active);
create index if not exists products_created_at_idx on public.products(created_at desc);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  email text,
  address text,
  city text,
  note text,
  internal_note text,
  payment_method text,
  payment_status text not null default 'UNPAID',
  status text not null default 'PENDING',
  subtotal integer not null default 0,
  shipping_total integer not null default 0,
  discount_total integer not null default 0,
  total integer not null default 0,
  items jsonb not null default '[]'::jsonb,
  slip_image text,
  tracking_number text,
  carrier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists orders_customer_phone_idx on public.orders(customer_phone);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

create table if not exists public.order_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists order_logs_order_id_idx on public.order_logs(order_id, created_at desc);

create table if not exists public.drop_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  drop_date timestamptz not null,
  end_date timestamptz,
  status text not null default 'upcoming'
    check (lower(status) in ('upcoming', 'active', 'ended', 'live')),
  cover_image text,
  teaser_image text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists drop_events_slug_idx on public.drop_events(slug);
create index if not exists drop_events_status_idx on public.drop_events(status);
create index if not exists drop_events_drop_date_idx on public.drop_events(drop_date desc);

create table if not exists public.drop_event_products (
  id uuid primary key default gen_random_uuid(),
  drop_id uuid not null references public.drop_events(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (drop_id, product_id)
);

create index if not exists drop_event_products_drop_id_idx on public.drop_event_products(drop_id);
create index if not exists drop_event_products_product_id_idx on public.drop_event_products(product_id);

create table if not exists public.notify_list (
  id uuid primary key default gen_random_uuid(),
  drop_id uuid references public.drop_events(id) on delete cascade,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  check (phone is not null or email is not null)
);

create index if not exists notify_list_drop_id_idx on public.notify_list(drop_id, created_at desc);
create index if not exists notify_list_email_idx on public.notify_list(email);
create index if not exists notify_list_phone_idx on public.notify_list(phone);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null
    check (upper(category) in ('NEWS', 'EVENT', 'SPOT', 'INTERVIEW', 'TRICK')),
  excerpt text not null default '',
  content text not null default '',
  cover_image text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_slug_idx on public.posts(slug);
create index if not exists posts_category_idx on public.posts(category);
create index if not exists posts_published_idx on public.posts(published, published_at desc);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  tag text,
  title text not null,
  cta_text text not null,
  cta_link text not null,
  image_url text,
  active boolean not null default true,
  "order" integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists banners_order_idx on public.banners("order");
create index if not exists banners_active_idx on public.banners(active);

create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percent', 'fixed')),
  value numeric not null,
  min_order numeric not null default 0,
  max_uses integer not null default 0,
  uses_count integer not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists discounts_code_idx on public.discounts(code);
create index if not exists discounts_active_idx on public.discounts(active);

create table if not exists public.settings (
  id integer primary key default 1,
  shop_name text default 'GOOFY. Skate Shop',
  tagline text,
  address text,
  phone text,
  email text,
  logo_url text,
  bank_name text,
  bank_account text,
  bank_account_name text,
  bank_qr_url text,
  payment_instructions text,
  shipping_cost integer default 30000,
  free_shipping_threshold integer default 0,
  delivery_days text default '2-3',
  low_stock_threshold integer default 3,
  instagram text,
  facebook text,
  tiktok text,
  youtube text,
  line_id text,
  admin_email text,
  line_notify_token text,
  updated_at timestamptz not null default now()
);

insert into public.settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.parks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  location text,
  city text,
  difficulty text
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  photos text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  youtube_url text not null,
  thumbnail_url text,
  category text
    check (category in ('edit', 'trick', 'spot', 'community')),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  reviewer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists reviews_product_id_idx on public.reviews(product_id, created_at desc);
create index if not exists reviews_approved_idx on public.reviews(approved);

create table if not exists public.stock_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  old_stock integer,
  new_stock integer,
  reason text,
  changed_by text,
  created_at timestamptz not null default now()
);

create index if not exists stock_logs_product_id_idx on public.stock_logs(product_id, created_at desc);
