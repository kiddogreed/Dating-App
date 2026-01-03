import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,   // Your Postgres connection string
  },
  // Optional: you can specify migrations folder
  // migrate: {
  //   migrationsPath: 'prisma/migrations',
  // },
});
