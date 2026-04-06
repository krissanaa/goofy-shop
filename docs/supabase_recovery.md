# Supabase Recovery

Use this when the original Supabase project is gone and you need to rebuild the database for this repo.

If the old project still exists and your organization has paid backups enabled, use Supabase "Restore to a new project" first. That copies the database into a fresh project, but you still need to reconfigure storage, auth settings, API keys, and other project-level settings.

If the project was deleted, Supabase treats that as permanent removal. In that case this repo can rebuild the schema, but it cannot recover hosted data or Storage files that only existed in the deleted project.

## Rebuild order

1. Create a new Supabase project.
2. In the SQL Editor, run:
   - `docs/backend_handoff_schema.sql`
   - `docs/admin_database_additions.sql`
   - `docs/supabase_legacy_compat.sql`
3. Create these Storage buckets manually:
   - `products`
   - `banners`
   - `drops`
   - `posts`
   - `parks`
   - `videos`
   - `slips`
   - `settings`
4. Recreate any admin/auth users you need in Supabase Auth.
5. Re-upload Storage files such as product images, banners, drop assets, park photos, video thumbnails, slips, and settings assets.
6. Update local environment variables with the new project URL and keys.

## Why the compatibility file exists

The clean schema files use the newer names:

- `parks`
- `discounts`
- `notify_list.drop_id`

The current app still has a few legacy reads and writes against:

- `skateparks`
- `discount_codes`
- `notify_list.drop_event_id`
- `videos.published_date`

`docs/supabase_legacy_compat.sql` adds compatibility objects so the rebuilt database matches the code that is in this repo today.

## Environment variables

This app expects:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY` is required for admin user management in the dashboard code.
