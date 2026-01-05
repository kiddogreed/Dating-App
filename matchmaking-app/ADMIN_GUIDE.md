# Phase 9: Admin Tools - Testing Guide

## Overview
Phase 9 adds complete admin functionality including user management, analytics dashboard, role management, and content moderation.

---

## New Database Schema Changes

### User Model Updates
```prisma
model User {
  role             UserRole      @default(USER)
  isActive         Boolean       @default(true)
  isBanned         Boolean       @default(false)
  bannedAt         DateTime?
  bannedReason     String?
  lastLoginAt      DateTime?
}

enum UserRole {
  USER
  ADMIN
  MODERATOR
}
```

---

## Creating an Admin User

### Method 1: Using API Endpoint (Development Only)
```bash
curl -X POST http://localhost:3000/api/admin/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@matchmaking.com","password":"admin123","makeAdmin":true}'
```

### Method 2: Promote Existing User
```bash
curl -X POST http://localhost:3000/api/admin/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"existing@user.com","makeAdmin":true}'
```

### Method 3: Directly in Database (Prisma Studio)
```bash
npx prisma studio
```
1. Open Users table
2. Find your user
3. Change `role` field to `"ADMIN"`
4. Save changes

**Default Admin Credentials (after creation):**
- Email: `admin@matchmaking.com`
- Password: `admin123`

---

## Admin Features

### 1. Admin Dashboard (`/admin`)

**Access:** Only users with `ADMIN` or `MODERATOR` role

**Features:**
- **Analytics Overview**
  - Total users (active, banned, new today, new this week)
  - Engagement metrics (matches, messages, photos)
  - Revenue tracking (Premium subscriptions, MRR, ARR)
  - Conversion rates

- **User Management Table**
  - Search by email or name
  - Filter by status (all, active, banned, premium)
  - Pagination (20 users per page)
  - Real-time user stats (photos, matches, messages)

### 2. User Management Actions

**Ban User:**
- Click "Ban" button on any user
- Provide ban reason
- User immediately cannot login
- All sessions invalidated

**Unban User:**
- Click "Unban" button on banned user
- User can login again
- Account reactivated

**Change User Role:**
- Select from dropdown: USER, MODERATOR, ADMIN
- Changes take effect immediately
- Role determines dashboard access

---

## API Endpoints

### Admin Stats
```bash
GET /api/admin/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 36,
      "active": 35,
      "banned": 1,
      "newToday": 2,
      "newThisWeek": 5
    },
    "engagement": {
      "totalMatches": 54,
      "totalMessages": 30,
      "totalPhotos": 31,
      "avgMessagesPerUser": "0.83"
    },
    "revenue": {
      "premiumSubscriptions": 9,
      "monthlyRevenue": "89.91",
      "annualRevenue": "1078.92"
    }
  }
}
```

### List Users
```bash
GET /api/admin/users?page=1&limit=20&search=john&filter=active
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Users per page (default: 20)
- `search` - Search by email or name
- `filter` - all | active | banned | premium

**Response:**
```json
{
  "success": true,
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 36,
    "totalPages": 2
  }
}
```

### Ban User
```bash
POST /api/admin/users/ban
Content-Type: application/json

{
  "userId": "user_id_here",
  "reason": "Violation of terms of service"
}
```

### Unban User
```bash
DELETE /api/admin/users/ban
Content-Type: application/json

{
  "userId": "user_id_here"
}
```

### Change User Role
```bash
POST /api/admin/users/role
Content-Type: application/json

{
  "userId": "user_id_here",
  "role": "ADMIN"  // USER | MODERATOR | ADMIN
}
```

---

## Security Features

### Authentication Protection
- Admin routes check user role before rendering
- Non-admin users get 403 Forbidden
- Redirected to dashboard if not authorized

### Ban System
- Banned users cannot login
- Ban reason displayed at login attempt
- `lastLoginAt` timestamp tracked
- Banned users show in admin dashboard with red badge

### Role Hierarchy
- **USER** - Normal user, no admin access
- **MODERATOR** - Can view admin panel, limited actions
- **ADMIN** - Full access to all admin features

---

## Testing Checklist

### Prerequisites
- [ ] Dev server running (`npm run dev`)
- [ ] Admin user created
- [ ] Test users in database (use seed endpoint)

### Admin Dashboard Access
- [ ] Login with admin credentials
- [ ] See "🛡️ Admin Panel" button in navigation
- [ ] Click to access `/admin`
- [ ] Dashboard loads with stats

### Analytics Verification
- [ ] Total users count matches database
- [ ] Active/banned counts accurate
- [ ] Premium subscriptions count correct
- [ ] Revenue calculations correct (Premium users × $9.99)
- [ ] New user stats show today/week counts

### User Management
- [ ] User table displays with pagination
- [ ] Search by email works
- [ ] Search by name works
- [ ] Filter "Active Only" shows only active users
- [ ] Filter "Banned Only" shows only banned users
- [ ] Filter "Premium Only" shows only premium users
- [ ] Pagination controls work

### Ban/Unban Functionality
- [ ] Ban a test user
- [ ] User shown as "Banned" in table
- [ ] Logout and try to login as banned user
- [ ] See ban reason in error message
- [ ] Unban user from admin panel
- [ ] User can login again

### Role Management
- [ ] Change user role to MODERATOR
- [ ] Change user role to ADMIN
- [ ] Change user role back to USER
- [ ] Role changes reflected immediately

### Non-Admin Access
- [ ] Logout admin
- [ ] Login as regular user
- [ ] No admin panel button visible
- [ ] Direct access to `/admin` redirects
- [ ] Admin API endpoints return 403

---

## Known Features

### Current Features
✅ User analytics dashboard
✅ Ban/unban users
✅ Role management
✅ Search and filter users
✅ Pagination
✅ Revenue tracking
✅ Engagement metrics
✅ Last login tracking
✅ Ban reason management

### Future Enhancements (Phase 10)
⏳ Content moderation (photos, messages)
⏳ User reports management
⏳ Email notifications for bans
⏳ Audit log for admin actions
⏳ Bulk user actions
⏳ Advanced analytics charts
⏳ Export data to CSV
⏳ Refund management

---

## Troubleshooting

### "Access denied. Admin privileges required"
**Solution:** Check user role in database. Must be ADMIN or MODERATOR.

### Admin panel button not showing
**Solution:** 
1. Check user role in Prisma Studio
2. Restart dev server after database changes
3. Clear browser cache and re-login

### Can't create admin user
**Solution:** Use Prisma Studio to manually set role:
```bash
npx prisma studio
# Navigate to Users → Find user → Set role to "ADMIN"
```

### Stats not loading
**Solution:** Check browser console for errors. Ensure all API endpoints returning 200.

---

## Development Notes

**Security Warning:** 
The `/api/admin/make-admin` endpoint should be removed or heavily secured in production. It's meant for development only.

**Production Deployment:**
1. Remove make-admin endpoint
2. Create admin users via secure CLI script
3. Add environment variable for admin emails
4. Implement 2FA for admin accounts
5. Add audit logging for all admin actions

---

## File Structure

```
matchmaking-app/
├── lib/
│   └── admin.ts                    # Admin utility functions
├── app/
│   ├── admin/
│   │   └── page.tsx                # Admin dashboard
│   └── api/
│       └── admin/
│           ├── stats/route.ts      # Analytics API
│           ├── users/
│           │   ├── route.ts        # List users
│           │   ├── ban/route.ts    # Ban/unban users
│           │   └── role/route.ts   # Change roles
│           └── make-admin/route.ts # Create admin (dev only)
└── prisma/
    └── schema.prisma               # Updated with UserRole enum
```

---

## Success Criteria

Phase 9 is complete when:
- ✅ Admin dashboard accessible to admin users only
- ✅ Analytics showing real-time stats
- ✅ Ban system working (prevents login)
- ✅ Role management functional
- ✅ Search and filters working
- ✅ Pagination implemented
- ✅ All security checks in place
- ✅ Documentation complete

---

**Status:** Phase 9 Complete ✅
**Next:** Phase 10 - Production Deployment

