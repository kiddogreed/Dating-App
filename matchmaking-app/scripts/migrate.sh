#!/bin/bash
# Run migrations only if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
else
  echo "DATABASE_URL not set, skipping migrations"
fi
