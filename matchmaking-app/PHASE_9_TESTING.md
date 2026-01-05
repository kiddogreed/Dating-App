# Phase 9 Testing Guide - Admin Tools

## Quick Test Checklist

### ✅ Pre-Tests: Ensure Server is Running
```bash
# Start dev server
npm run dev

# Verify server is running
curl http://localhost:3000/
```

---

## Test 1: Promote User to Admin

### Method 1: Using Web Interface (Recommended)
1. Login to your account at http://localhost:3000/login
2. Go to http://localhost:3000/admin/promote-me
3. Click "Promote Me to Admin" button
4. Expected: Success message appears
5. Logout and login again
6. Expected: "🛡️ Admin Panel" button appears in dashboard

### Method 2: Using API Directly
```bash
# Must be logged in first, then run:
curl -X POST http://localhost:3000/api/admin/promote-me
```

Expected Response:
```json
{
  "success": true,
  "message": "🎉 You are now an ADMIN!...",
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "ADMIN"
  }
}
```

### Method 3: Create New Admin User
```bash
curl -X POST http://localhost:3000/api/admin/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123","makeAdmin":true}'
```

---

## Test 2: Admin Dashboard Access

### Test Admin Panel Loads
1. Login as admin user
2. Go to http://localhost:3000/admin
3. **Expected Results:**
   - Page loads successfully
   - Statistics cards display:
     - Total Users
     - Engagement metrics
     - Premium Users
     - Revenue
   - User table displays
   - Search and filter controls visible

### Test Non-Admin Access Denied
1. Login as regular user (non-admin)
2. Try to access http://localhost:3000/admin
3. **Expected:** 403 Forbidden error or redirect

---

## Test 3: Admin Statistics API

```bash
# Must be logged in as admin
curl http://localhost:3000/api/admin/stats
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 36,
      "active": 36,
      "banned": 0,
      "newToday": 0,
      "newThisWeek": 30
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

---

## Test 4: User Management

### Test User Listing API
```bash
# List all users (page 1, default limit 20)
curl "http://localhost:3000/api/admin/users?page=1&limit=20&filter=all"
```

**Expected:**
- Returns array of users
- Pagination info included
- User details include role, status, subscription

### Test User Search
```bash
# Search by email
curl "http://localhost:3000/api/admin/users?search=test.com"
```

### Test User Filters
```bash
# Active users only
curl "http://localhost:3000/api/admin/users?filter=active"

# Banned users only
curl "http://localhost:3000/api/admin/users?filter=banned"

# Premium users only
curl "http://localhost:3000/api/admin/users?filter=premium"
```

---

## Test 5: Ban/Unban Functionality

### Test Ban User
```bash
curl -X POST http://localhost:3000/api/admin/users/ban \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_HERE","reason":"Testing ban functionality"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User banned successfully",
  "user": {
    "id": "...",
    "email": "...",
    "isBanned": true,
    "bannedReason": "Testing ban functionality"
  }
}
```

### Verify Banned User Cannot Login
1. Try to login with banned user credentials
2. **Expected:** Error message with ban reason

### Test Unban User
```bash
curl -X DELETE http://localhost:3000/api/admin/users/ban \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_HERE"}'
```

**Expected:**
- User unbanned successfully
- User can login again

---

## Test 6: Role Management

### Test Change User Role
```bash
# Promote to Moderator
curl -X POST http://localhost:3000/api/admin/users/role \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_HERE","role":"MODERATOR"}'

# Promote to Admin
curl -X POST http://localhost:3000/api/admin/users/role \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_HERE","role":"ADMIN"}'

# Demote to User
curl -X POST http://localhost:3000/api/admin/users/role \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_HERE","role":"USER"}'
```

**Expected:**
- Role updated successfully
- User has new permissions

---

## Test 7: UI Testing

### Dashboard - Admin Button Visibility
- [x] Admin sees "🛡️ Admin Panel" button
- [x] Regular user does NOT see admin button
- [x] Button links to /admin page

### Admin Panel UI
- [x] Stats cards display correct numbers
- [x] User table loads with data
- [x] Search input works
- [x] Filter dropdown works
- [x] Pagination buttons functional
- [x] Ban button shows prompt
- [x] Unban button shows for banned users
- [x] Role dropdown updates user role

---

## Test 8: Security Tests

### Test Unauthorized Access
```bash
# Try to access admin endpoints without login
curl http://localhost:3000/api/admin/stats
# Expected: 401 or 403

# Try as regular user
curl http://localhost:3000/api/admin/stats
# Expected: 403 Forbidden
```

### Test Role-Based Access Control
- [x] USER role: Cannot access admin panel
- [x] MODERATOR role: Can access admin panel
- [x] ADMIN role: Full access to all features

### Test Banned User Login Prevention
- [x] Banned user gets error on login
- [x] Error message shows ban reason
- [x] Unbanned user can login again

---

## Test 9: End-to-End Workflow

### Complete Admin Workflow Test
1. **Setup:**
   - Create test user account
   - Login with test account
   
2. **Promotion:**
   - Visit /admin/promote-me
   - Click promote button
   - Logout and login
   
3. **Admin Access:**
   - See admin button in dashboard
   - Click to open admin panel
   - Verify stats display correctly
   
4. **User Management:**
   - Search for a user
   - Change their role to MODERATOR
   - Ban the user with reason
   - Verify they cannot login
   - Unban the user
   - Verify they can login again
   
5. **Analytics:**
   - Check total user count matches
   - Verify revenue calculations
   - Check engagement metrics

---

## Test 10: Phase 1-8 Regression Testing

### Verify Previous Features Still Work

**Authentication (Phase 2):**
```bash
# Test registration
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"test123","name":"New User"}'
```

**Subscriptions (Phase 8):**
```bash
# Test subscription status
curl http://localhost:3000/api/subscription/status

# Test Stripe connection
curl http://localhost:3000/api/stripe/test
```

**Testing Infrastructure:**
```bash
# Test user seeding
curl -X POST http://localhost:3000/api/testing/seed-users \
  -H "Content-Type: application/json" \
  -d '{"count": 5}'

# Test stats endpoint
curl http://localhost:3000/api/testing/stats
```

---

## Expected Results Summary

### All Tests Should Show:
- ✅ Admin promotion works via UI
- ✅ Admin dashboard loads with correct data
- ✅ User management (search, filter, pagination) functional
- ✅ Ban/unban functionality works correctly
- ✅ Role changes work properly
- ✅ Security: Non-admins blocked from admin features
- ✅ Security: Banned users cannot login
- ✅ All Phase 1-8 features still functional
- ✅ No console errors
- ✅ Database queries efficient

---

## Automated Test Script

Create and run this bash script:

```bash
#!/bin/bash

echo "=================================="
echo "Phase 9 Admin Tools - Test Suite"
echo "=================================="
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Server Running
echo "Test 1: Server Health Check"
if curl -s "$BASE_URL/" > /dev/null; then
    echo "✅ PASS - Server is running"
else
    echo "❌ FAIL - Server not responding"
    exit 1
fi

# Test 2: Stats endpoint (requires admin login)
echo ""
echo "Test 2: Testing Stats Endpoint"
curl -s "$BASE_URL/api/testing/stats" | grep -q "success"
if [ $? -eq 0 ]; then
    echo "✅ PASS - Stats endpoint working"
else
    echo "❌ FAIL - Stats endpoint error"
fi

# Test 3: Stripe still working
echo ""
echo "Test 3: Stripe Integration"
curl -s "$BASE_URL/api/stripe/test" | grep -q "success"
if [ $? -eq 0 ]; then
    echo "✅ PASS - Stripe integration working"
else
    echo "❌ FAIL - Stripe integration error"
fi

# Test 4: Database still accessible
echo ""
echo "Test 4: Database Connection"
curl -s -X POST "$BASE_URL/api/testing/seed-users" \
    -H "Content-Type: application/json" \
    -d '{"count": 1}' | grep -q "success"
if [ $? -eq 0 ]; then
    echo "✅ PASS - Database connection working"
else
    echo "❌ FAIL - Database connection error"
fi

echo ""
echo "=================================="
echo "Test Suite Complete!"
echo "=================================="
```

---

## Troubleshooting

### Issue: Cannot promote to admin
**Solution:** Make sure you're logged in first, then visit /admin/promote-me

### Issue: 403 Forbidden on admin panel
**Solution:** Logout and login again after promotion

### Issue: Admin button not showing
**Solution:** Clear cache, logout/login, or check user role in database

### Issue: Stats show 0 for everything
**Solution:** Run seed users script to populate database with test data

---

## Success Criteria

Phase 9 is considered complete when:
- [x] All admin endpoints return correct data
- [x] User promotion works via UI
- [x] Ban/unban functionality works
- [x] Role management works
- [x] Security prevents unauthorized access
- [x] All Phase 1-8 features still work
- [x] No critical errors in console
- [x] Documentation complete
