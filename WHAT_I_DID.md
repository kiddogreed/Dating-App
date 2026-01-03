# 📖 Matchmaking App — Development Steps So Far

## 🚀 Project Overview

A full-stack matchmaking web application built with a modern tech stack.

| Category | Technology | Notes |
| :--- | :--- | :--- |
| **Frontend/Backend** | Next.js 13+ | App Router |
| **Database** | PostgreSQL | Robust relational database |
| **ORM** | Prisma 7 | Type-safe database access |
| **Authentication** | NextAuth | Credentials Provider |
| **Styling** | Tailwind CSS | Utility-first framework |
| **Other Libraries** | `bcryptjs`, `socket.io`, `axios`, `zustand`, `stripe`, `Cloudinary` | |

---

## 🎯 Step 0 — Project Initialization

### Required Tools

* **Node.js** v18+
* **VS Code**
* **PostgreSQL** (local or cloud, e.g., Railway)
* **Git** + **GitHub**

### Project Setup

1.  **Create Next.js project:**
    ```bash
    npx create-next-app@latest matchmaking-app
    cd matchmaking-app
    ```

2.  **Installed Core Libraries:**
    ```bash
    npm install prisma @prisma/client next-auth bcryptjs
    npm install tailwindcss @tailwindcss/forms
    npm install socket.io socket.io-client
    npm install zustand axios
    npm install stripe
    ```

3.  **Initialized Prisma:**
    ```bash
    npx prisma init
    ```

---

## ⚙️ Step 1 — Prisma 7 + PostgreSQL Setup

### Configuration Changes

* **Updated Prisma schema for v7:**
    * Moved `DATABASE_URL` from `schema.prisma` $\rightarrow$ `prisma.config.ts`.
    * Removed `url` from the schema `datasource` block.

* **Installed PostgreSQL adapter:**
    ```bash
    npm install @prisma/adapter-pg pg
    npm install --save-dev @types/pg
    ```

* **Created `prisma.config.ts`:**
    ```typescript
    import { defineConfig } from "@prisma/config";

    export default defineConfig({ 
      datasource: { 
        provider: "postgresql", 
        url: process.env.DATABASE_URL!, 
      }, 
    });
    ```

* **Cleaned `lib/prisma.ts` (Global Prisma Client):**
    ```typescript
    import { PrismaClient } from "@prisma/client";

    const globalForPrisma = global as unknown as { prisma: PrismaClient };

    export const prisma = 
      globalForPrisma.prisma || 
      new PrismaClient({ log: ["query", "warn", "error"] });

    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
    ```

### Environment and Sync

* **Ensured `.env` exists:**
    ```dotenv
    DATABASE_URL="postgresql://username:password@localhost:5432/MatchMakingApp"
    NEXTAUTH_SECRET="your-secret-here"
    NEXTAUTH_URL=http://localhost:3000
    ```

* **Ran Prisma commands:**
    ```bash
    npx prisma generate 
    npx prisma db push
    ```

> ✅ **Database is now synced with schema.**

---

## 📄 Step 2 — Prisma Models (Schema)

Updated `schema.prisma` with models for the core application entities:

* **User**
* **Profile**
* **Message**
* **Match** (with status enum)
* **Photo**
* **Subscription** (for Stripe memberships)

> Used `cuid()` for IDs, standard `createdAt`/`updatedAt` fields, and proper relations.

### Optional Improvements

* Added `Gender` enum
* Added `MatchStatus` enum
* Added `SubscriptionStatus` enum

---

## 🔑 Step 3 — NextAuth Authentication Setup

### Route and Configuration

1.  **Created NextAuth catch-all route:**
    `app/api/auth/[...nextauth]/route.ts`

2.  **Configured NextAuth:**
    * Credentials provider (email + password)
    * JWT sessions

3.  **Extended session to include `user.id`:**
    ```typescript
    // In callbacks:
    session.user.id = token.id
    ```

### TypeScript Fix

* **Extended types to resolve TypeScript `id` error:**
    `types/next-auth.d.ts`:

    ```typescript
    declare module "next-auth" { 
      interface Session { 
        user: { 
          id: string; 
          name?: string; 
          email?: string; 
        }; 
      } 
    }
    ```

---

## 📝 Step 4 — Register API

### Implementation

1.  **Created user registration API:**
    `app/api/register/route.ts`

2.  **Features:**
    * Validates required fields.
    * Checks if email already exists.
    * **Hashes password** with `bcryptjs`.
    * Saves user to database via Prisma.
    * Returns user info (without password).

### Test Example

**POST `/api/register`**

```json
{ 
    "name": "John Doe", 
    "email": "john@example.com", 
    "password": "123456" 
}