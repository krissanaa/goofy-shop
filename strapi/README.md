# Goofy Shop Strapi CMS

This Strapi app powers:

- `Product` (`/api/products`)
- `Category` (`/api/categories`)
- `Drop Event` (`/api/drop-events`)

## Quick start

1. Copy `strapi/.env.example` to `strapi/.env` and set real secrets.
   - Default setup uses Postgres (recommended for this repo).
2. Install Strapi dependencies:
   - `pnpm install --dir strapi`
   - or from repo root: `pnpm cms:install`
3. Run Strapi:
   - `pnpm --dir strapi dev`
   - or from repo root: `pnpm cms:dev`

Admin panel will be at `http://localhost:1337/admin`.

## API permissions

`src/index.ts` enforces public `find` and `findOne` on Product, Category, and Drop Event on bootstrap.

## Media constraints

`config/plugins.ts` configures upload behavior for high-quality image workflows:

- MIME types: `image/jpeg`, `image/png`
- Upload size limit: `UPLOAD_SIZE_LIMIT_MB` (default `25`)
- Responsive breakpoints up to `2560px`

## Retro admin theme

Files:

- `src/admin/app.css`
- `src/admin/app.tsx`
- `src/admin/extensions/Branding.tsx`

Applied customizations:

- Dashboard/background: `#000000`
- Primary button color: `#00FF00`
- Monospace typography
- Replaced Strapi logo with text: `GOOFY_ADMIN_V1.0`

## Next.js integration

Frontend client is in `lib/strapi.ts`:

- Real-time fetch: `realtime: true` -> `cache: 'no-store'`
- Static fetch: default `next: { revalidate: 3600 }`
- Hype countdown helper: `getHypeDropCountdown()`
