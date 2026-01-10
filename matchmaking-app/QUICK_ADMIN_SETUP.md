# Quick Admin Setup Guide

## Problem: Getting 403 Unauthorized on Admin Endpoints

You're getting this error because your user account doesn't have ADMIN role yet.

## Solution: Promote Your Account to Admin

### Option 1: Using Node Script (Easiest)

```bash
node promote-to-admin.js your-email@example.com
```

Then **logout and login again** in the browser.

### Option 2: Using cURL

```bash
curl -X POST http://localhost:3000/api/admin/make-admin \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"your-email@example.com\",\"makeAdmin\":true}"
```

Replace `your-email@example.com` with your actual login email.

### Option 3: Using Prisma Studio

1. Open Prisma Studio: `npx prisma studio`
2. Go to Users table
3. Find your user
4. Change `role` from `USER` to `ADMIN`
5. Save

## Testing in Postman

### Step 1: Import Collection

1. Open Postman
2. Click **Import**
3. Select `Admin_API.postman_collection.json`

### Step 2: Login First (Get Cookies)

You need to be logged in for the session cookies. Use one of these methods:

**Method A: Login via Browser First (Recommended)**
1. Login at http://localhost:3000/login in your browser
2. Postman will share the same cookies if using the same domain

**Method B: Configure Postman Cookie Sharing**
1. In Postman, enable "Automatically follow redirects"
2. Enable "Cookies" in settings

### Step 3: Test Admin Stats Endpoint

1. Make sure you're promoted to ADMIN (see options above)
2. **Logout and login again** in browser
3. In Postman, select: `Admin - Analytics` → `Get Admin Stats`
4. Click **Send**

**Expected Success Response (200):**
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

## Quick Command Reference

### Promote User to Admin
```bash
curl -X POST http://localhost:3000/api/admin/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","makeAdmin":true}'
```

### Test Admin Stats (After Login)
```bash
curl -X GET http://localhost:3000/api/admin/stats \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

### Create New Admin Account
```bash
curl -X POST http://localhost:3000/api/admin/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@matchmaking.com","password":"admin123","makeAdmin":true}'
```

## Troubleshooting

### Still Getting 403 After Promotion?
- **Logout and login again** - Session needs to refresh
- Check role in Prisma Studio to confirm it changed
- Clear browser cookies and login fresh

### Postman Not Using Session?
- Login via browser first at http://localhost:3000/login
- Make sure cookies are enabled in Postman settings
- Try using Postman Desktop App instead of Web version

### Can't Find Your Email?
Run this in terminal:
```bash
curl http://localhost:3000/api/auth/session
```

This shows your current logged-in user email.

## Next Steps

After becoming admin:
1. Access admin dashboard: http://localhost:3000/admin
2. You should see the 🛡️ Admin Panel button in navigation
3. All admin API endpoints will work in Postman

---

**Files Created:**
- ✅ `promote-to-admin.js` - Quick promotion script
- ✅ `Admin_API.postman_collection.json` - Full Postman collection
- ✅ `QUICK_ADMIN_SETUP.md` - This guide
