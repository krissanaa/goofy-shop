# Strapi Environment Setup

## Create your .env file

Create `strapi/.env` with the following content:

```env
HOST=0.0.0.0
PORT=1337

APP_KEYS=your-app-key-1,your-app-key-2,your-app-key-3,your-app-key-4
API_TOKEN_SALT=your-api-token-salt-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-here
TRANSFER_TOKEN_SALT=your-transfer-token-salt-here
JWT_SECRET=your-jwt-secret-here

DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/goofy_shop?schema=public
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=goofy_shop
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_SCHEMA=public
DATABASE_SSL=false
DATABASE_CONNECTION_TIMEOUT=60000

UPLOAD_SIZE_LIMIT_MB=25
```

## Generate Secrets

Run these commands to generate secure secrets:

```bash
# Generate APP_KEYS (4 comma-separated values)
node -e "console.log(Array(4).fill(0).map(() => require('crypto').randomBytes(16).toString('hex')).join(','))"

# Generate other secrets
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## After creating .env

1. Start Strapi: `cd strapi && npm run dev`
2. Visit: http://localhost:1337/admin
3. Create your admin account
4. Start creating products, categories, and drop events!
