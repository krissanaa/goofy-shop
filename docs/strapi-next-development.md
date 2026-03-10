# Strapi Next Development Steps

1. Install CMS dependencies.
   - `pnpm install --dir strapi`

2. Create Strapi environment file.
   - `Copy-Item strapi\\.env.example strapi\\.env`
   - Replace all secret placeholders in `strapi/.env`.
   - Keep `DATABASE_CLIENT=postgres` unless you intentionally set up SQLite + native build tools.

3. Start Strapi in development mode.
   - `pnpm cms:dev`
   - Open `http://localhost:1337/admin` and create the first admin user.

4. Generate an API token for the frontend.
   - Admin -> Settings -> API Tokens -> Create Read-only token.
   - Set token in root `.env` as `STRAPI_API_TOKEN`.

5. Point frontend to Strapi.
   - Set `NEXT_PUBLIC_STRAPI_URL=http://localhost:1337` in root `.env`.
   - Start Next.js with `pnpm dev`.

6. Validate endpoints.
   - `GET http://localhost:1337/api/products`
   - `GET http://localhost:1337/api/categories`
   - `GET http://localhost:1337/api/drop-events`

7. Replace mock data usage with `lib/strapi.ts` helpers in page loaders.

8. Add initial content (or seed script) for categories, products, and one active drop event.
