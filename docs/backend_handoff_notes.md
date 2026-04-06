# Backend Handoff Notes

Use [backend_handoff_schema.sql](/C:/Users/Krissana.kou/WebstormProjects/goofy-shop/docs/backend_handoff_schema.sql) as the clean PostgreSQL schema reference for this project.

Important compatibility notes from the current app code:

- `parks` is the intended table, but some older code still falls back to `skateparks`.
- `discounts` is the intended table, but some code still checks `discount_codes`.
- `notify_list` should use `drop_id`, but some legacy code still tolerates `drop_event_id`.
- `drop_events.status` is normalized in the UI, so older data may contain `LIVE` while newer admin forms use `active`.
- `orders.items` is stored as `jsonb` because the current app reads line items directly from the order row.
- Supabase Auth, Storage buckets, and RLS policies are not included in the handoff schema file.

Recommended Storage buckets if the backend stays on Supabase:

- `products`
- `banners`
- `drops`
- `posts`
- `parks`
- `videos`
- `slips`
- `settings`

Recommended file set to send your backend friend:

- [backend_handoff_schema.sql](/C:/Users/Krissana.kou/WebstormProjects/goofy-shop/docs/backend_handoff_schema.sql)
- [backend_handoff_notes.md](/C:/Users/Krissana.kou/WebstormProjects/goofy-shop/docs/backend_handoff_notes.md)
- [admin_database_additions.sql](/C:/Users/Krissana.kou/WebstormProjects/goofy-shop/docs/admin_database_additions.sql)
