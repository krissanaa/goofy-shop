-- GOOFY. Skate Shop - Supabase legacy compatibility patch
-- Run this after backend_handoff_schema.sql and admin_database_additions.sql.

-- Some current app paths still query `discount_codes`.
DO $$
BEGIN
  IF to_regclass('public.discount_codes') IS NULL THEN
    EXECUTE $view$
      CREATE VIEW public.discount_codes
      WITH (security_invoker = true) AS
      SELECT
        id,
        code,
        type,
        value,
        min_order,
        max_uses,
        uses_count,
        active,
        expires_at,
        created_at
      FROM public.discounts
    $view$;
  END IF;
END $$;

-- Some current app paths still query `skateparks`.
DO $$
BEGIN
  IF to_regclass('public.skateparks') IS NULL THEN
    EXECUTE $view$
      CREATE VIEW public.skateparks
      WITH (security_invoker = true) AS
      SELECT
        id,
        name,
        slug,
        description,
        location,
        city,
        difficulty,
        photos,
        active,
        created_at
      FROM public.parks
    $view$;
  END IF;
END $$;

-- Keep legacy `drop_event_id` inserts working while the main schema uses `drop_id`.
ALTER TABLE IF EXISTS public.notify_list
  ADD COLUMN IF NOT EXISTS drop_event_id uuid;

UPDATE public.notify_list
SET drop_event_id = drop_id
WHERE drop_event_id IS NULL
  AND drop_id IS NOT NULL;

UPDATE public.notify_list
SET drop_id = drop_event_id
WHERE drop_id IS NULL
  AND drop_event_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_notify_list_drop_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.drop_id IS NULL THEN
    NEW.drop_id := NEW.drop_event_id;
  END IF;

  IF NEW.drop_event_id IS NULL THEN
    NEW.drop_event_id := NEW.drop_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_notify_list_drop_columns ON public.notify_list;

CREATE TRIGGER sync_notify_list_drop_columns
BEFORE INSERT OR UPDATE ON public.notify_list
FOR EACH ROW
EXECUTE FUNCTION public.sync_notify_list_drop_columns();

-- Older code paths order videos by `published_date`.
ALTER TABLE IF EXISTS public.videos
  ADD COLUMN IF NOT EXISTS published_date timestamptz;

ALTER TABLE IF EXISTS public.videos
  ALTER COLUMN published_date SET DEFAULT now();

UPDATE public.videos
SET published_date = COALESCE(published_date, created_at, now())
WHERE published_date IS NULL;
