-- GOOFY. Skate Shop - Admin Database Additions
-- Run in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Order change log
CREATE TABLE IF NOT EXISTS order_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by text,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Stock change log
CREATE TABLE IF NOT EXISTS stock_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  old_stock int,
  new_stock int,
  reason text,
  changed_by text,
  created_at timestamptz DEFAULT now()
);

-- Discount codes
CREATE TABLE IF NOT EXISTS discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text CHECK (type IN ('percent','fixed')) NOT NULL,
  value numeric NOT NULL,
  min_order numeric DEFAULT 0,
  max_uses int DEFAULT 0,
  uses_count int DEFAULT 0,
  active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE IF EXISTS discounts
  ADD COLUMN IF NOT EXISTS code text,
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS value numeric,
  ADD COLUMN IF NOT EXISTS min_order numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_uses int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS uses_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Settings (single row)
CREATE TABLE IF NOT EXISTS settings (
  id int PRIMARY KEY DEFAULT 1,
  shop_name text DEFAULT 'GOOFY. Skate Shop',
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
  shipping_cost int DEFAULT 30000,
  free_shipping_threshold int DEFAULT 0,
  delivery_days text DEFAULT '2-3',
  low_stock_threshold int DEFAULT 3,
  instagram text,
  facebook text,
  tiktok text,
  youtube text,
  line_id text,
  admin_email text,
  line_notify_token text,
  updated_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'settings'
      AND column_name = 'id'
  ) THEN
    INSERT INTO settings (id) VALUES (1)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Parks
CREATE TABLE IF NOT EXISTS parks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  location text,
  city text,
  difficulty text CHECK (difficulty IN ('beginner','intermediate','advanced')),
  photos text[] DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE IF EXISTS parks
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Videos
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  youtube_url text NOT NULL,
  thumbnail_url text,
  category text CHECK (category IN ('edit','trick','spot','community')),
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE IF EXISTS videos
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS published boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

UPDATE videos
SET published = false
WHERE published IS NULL;

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  rating int CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment text,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE IF EXISTS reviews
  ADD COLUMN IF NOT EXISTS reviewer_name text,
  ADD COLUMN IF NOT EXISTS rating int,
  ADD COLUMN IF NOT EXISTS comment text,
  ADD COLUMN IF NOT EXISTS approved boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

UPDATE reviews
SET approved = false
WHERE approved IS NULL;

-- RLS: admin full access on all new tables
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT unnest(
      ARRAY[
        'order_logs',
        'stock_logs',
        'discounts',
        'settings',
        'parks',
        'videos',
        'reviews'
      ]
    )
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Admin all ' || t, t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      'Admin all ' || t,
      t
    );
  END LOOP;
END $$;

-- Public policies
DROP POLICY IF EXISTS "Public read settings" ON settings;
CREATE POLICY "Public read settings" ON settings FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Public read parks" ON parks;
CREATE POLICY "Public read parks" ON parks FOR SELECT TO anon USING (active = true);

DROP POLICY IF EXISTS "Public read videos" ON videos;
CREATE POLICY "Public read videos" ON videos FOR SELECT TO anon USING (published = true);

DROP POLICY IF EXISTS "Public read reviews" ON reviews;
CREATE POLICY "Public read reviews" ON reviews FOR SELECT TO anon USING (approved = true);

DROP POLICY IF EXISTS "Public insert reviews" ON reviews;
CREATE POLICY "Public insert reviews" ON reviews FOR INSERT TO anon WITH CHECK (true);
