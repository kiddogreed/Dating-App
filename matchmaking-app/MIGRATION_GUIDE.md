# Production Migration Guide

## Run migrations on production database

1. Make sure you have the production DATABASE_URL from Railway/Vercel environment variables

2. Run this command (replace with your actual production DATABASE_URL):

```bash
DATABASE_URL="your-production-database-url" npx prisma migrate deploy
```

Or if using .env.production:

```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

## For Vercel deployments

The app will work even without running migrations manually if you:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Make sure DATABASE_URL is exposed to **both Build and Runtime**
3. Redeploy

## Quick fix for current deployment

Run this locally with your production DATABASE_URL to apply migrations:

```bash
cd matchmaking-app
npx prisma migrate deploy
```
