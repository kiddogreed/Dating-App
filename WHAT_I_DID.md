📖 Matchmaking App — Development Steps So Far
Project Overview

A full-stack matchmaking web application built with:

Frontend/Backend: Next.js 13+ (App Router)

Database: PostgreSQL

ORM: Prisma 7

Authentication: NextAuth (Credentials Provider)

Styling: Tailwind CSS

Other Libraries: bcryptjs, socket.io, axios, zustand, stripe, Cloudinary

Step 0 — Project Initialization

Installed required tools:

Node.js v18+

VS Code

PostgreSQL (local or cloud, e.g., Railway)

Git + GitHub

Created Next.js project:

npx create-next-app@latest matchmaking-app
cd matchmaking-app


Installed core libraries:

npm install prisma @prisma/client next-auth bcryptjs
npm install tailwindcss @tailwindcss/forms
npm install socket.io socket.io-client
npm install zustand axios
npm install stripe


Initialized Prisma:

npx prisma init

Step 1 — Prisma 7 + PostgreSQL Setup

Updated Prisma schema for v7:

Moved DATABASE_URL from schema.prisma → prisma.config.ts

Removed url from schema datasource

Installed PostgreSQL adapter:

npm install @prisma/adapter-pg pg
npm install --save-dev @types/pg


Created prisma.config.ts:

import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
});


Cleaned lib/prisma.ts:

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: ["query", "warn", "error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


Ensured .env exists:

DATABASE_URL="postgresql://username:password@localhost:5432/MatchMakingApp"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL=http://localhost:3000


Ran Prisma:

npx prisma generate
npx prisma db push


✅ Database is now synced with schema.

Step 2 — Prisma Models (Schema)

Updated Prisma models for:

User

Profile

Message

Match (with status enum)

Photo

Subscription (for Stripe memberships)

Used cuid() for IDs, createdAt/updatedAt, and proper relations.

Optional improvements:

Added Gender enum

Added MatchStatus enum

Added SubscriptionStatus enum

Step 3 — NextAuth Authentication Setup

Created NextAuth catch-all route:

app/api/auth/[...nextauth]/route.ts


Configured NextAuth:

Credentials provider (email + password)

JWT sessions

Extended session to include user.id

session.user.id = token.id


Resolved TypeScript id error (if using TS) by extending types:

types/next-auth.d.ts:

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
    };
  }
}

Step 4 — Register API

Created user registration API:

app/api/register/route.ts


Features:

Validates required fields

Checks if email already exists

Hashes password with bcryptjs

Saves user to database via Prisma

Returns user info (without password)

Test example (POST /api/register):

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}


Response:

{
  "success": true,
  "user": {
    "id": "cmjxyoe3i0000sou4dge6ajbd",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-01-03T07:08:23.262Z"
  }
}

Step 5 — Prisma 7 PostgreSQL Adapter Fix

Installed:

npm install @prisma/adapter-pg pg
npm install --save-dev @types/pg


Updated PrismaClient constructor to include adapter for PostgreSQL

✅ This fixed all PrismaClientConstructorValidationError issues.

Step 6 — Verified Everything

npm run dev starts server at http://localhost:3000

Database synced with Prisma schema

User registration works

Prisma 7 + PostgreSQL + NextAuth setup confirmed