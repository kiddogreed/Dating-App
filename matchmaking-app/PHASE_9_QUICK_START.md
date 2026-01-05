# 🛡️ Phase 9 Admin Tools - Quick Start Guide

## ⚡ Quick Access

### Become Admin (Choose One Method)

**Method 1: Self-Promotion UI (Easiest)**
1. Visit http://localhost:3000/admin/promote-me
2. Click "Promote Me to Admin"
3. Logout and login again
4. Admin Panel button will appear on dashboard

**Method 2: API Call**
```bash
curl http://localhost:3000/api/admin/promote-me
```

**Method 3: Create New Admin User**
```bash
curl -X POST http://localhost:3000/api/admin/make-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "name": "Admin User"
  }'
```

---

## 🎯 Admin Panel Features

### Access Admin Dashboard
http://localhost:3000/admin

### What You Can Do

✅ **View Analytics**
- Total users, active users, banned users
- New users today and this week
- Engagement metrics (matches, messages, photos)
- Revenue calculations (MRR, ARR)

✅ **Manage Users**
- Search by email or name
- Filter: All / Active / Banned / Premium
- Pagination (20 per page)
- View user details, profiles, subscriptions

✅ **Moderate Users**
- Ban users with custom reason
- Unban users
- Change user roles (USER / MODERATOR / ADMIN)

✅ **Security**
- Banned users cannot login
- Non-admins get 403 Forbidden
- All actions logged

---

## 📊 API Endpoints

### Analytics
```bash
GET /api/admin/stats
```

### User Management
```bash
# List users
GET /api/admin/users?page=1&limit=20&search=john&filter=active

# Ban user
POST /api/admin/users/ban
{"userId": "user123", "reason": "Violation of terms"}

# Unban user
DELETE /api/admin/users/ban?userId=user123

# Change role
POST /api/admin/users/role
{"userId": "user123", "role": "MODERATOR"}
```

---

## 🧪 Quick Test

1. **Promote yourself to admin:**
   ```bash
   curl http://localhost:3000/api/admin/promote-me
   ```

2. **Logout and login again**

3. **Access admin panel:**
   http://localhost:3000/admin

4. **Test features:**
   - View stats card
   - Search for a user
   - Try changing a user's role
   - Test ban/unban (create test user first)

---

## 🔒 Security Features

- ✅ Role-based access control (RBAC)
- ✅ Banned users prevented from logging in
- ✅ 403 Forbidden for non-admin endpoints
- ✅ Admin middleware protects all routes
- ✅ Last login tracking
- ✅ Audit trail for user actions

---

## 🛠️ Database Schema

```prisma
enum UserRole {
  USER
  ADMIN
  MODERATOR
}

model User {
  // ... existing fields
  role          UserRole  @default(USER)
  isActive      Boolean   @default(true)
  isBanned      Boolean   @default(false)
  bannedAt      DateTime?
  bannedReason  String?
  lastLoginAt   DateTime?
}
```

---

## 📝 Files Created

### Backend
- `lib/admin.ts` - Admin middleware
- `app/api/admin/stats/route.ts` - Analytics
- `app/api/admin/users/route.ts` - User listing
- `app/api/admin/users/ban/route.ts` - Ban/unban
- `app/api/admin/users/role/route.ts` - Role changes
- `app/api/admin/make-admin/route.ts` - Create admin
- `app/api/admin/promote-me/route.ts` - Self-promotion

### Frontend
- `app/admin/page.tsx` - Admin dashboard
- `app/admin/promote-me/page.tsx` - Promotion UI

### Documentation
- `PHASE_9_TESTING.md` - Comprehensive testing guide
- `PHASE_9_QUICK_START.md` - This file
- `WHAT_I_DID.md` - Updated with Phase 9 sections

---

## 🚨 Troubleshooting

**403 Forbidden when accessing /admin**
- You're not an admin yet
- Visit /admin/promote-me to become admin
- Logout and login again

**Admin Panel button not showing**
- Check if you're logged in as ADMIN or MODERATOR
- Logout and login after promotion
- Clear browser cache

**Stats showing 0 for everything**
- Database might be empty
- Use seed endpoint to create test users:
  ```bash
  curl -X POST http://localhost:3000/api/testing/seed-users \
    -d '{"count": 30}'
  ```

**Ban not working**
- User must logout and try to login again
- Check database: `isBanned` should be `true`
- Auth will prevent login on next attempt

---

## ✅ Success Criteria

- [ ] Can access admin promotion page
- [ ] Successfully promoted to admin
- [ ] Admin Panel button visible on dashboard
- [ ] Can access /admin page
- [ ] Stats cards display correct numbers
- [ ] Can search and filter users
- [ ] Can ban a user (prevents login)
- [ ] Can unban a user (allows login)
- [ ] Can change user roles
- [ ] Non-admin users get 403 error

---

## 🎉 Next Steps

After Phase 9 is verified:
- **Phase 10:** Production Deployment
  - Vercel deployment
  - Production database
  - Environment variables
  - Custom domain
  - SSL certificates
  - Performance optimization

---

**Last Updated:** January 6, 2026  
**Status:** Phase 9 Complete - Ready for Testing
