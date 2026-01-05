# Manual Testing Guide

## Quick Start Testing

### 1. Login with Test User
1. Go to http://localhost:3000/login
2. Use credentials:
   - **Email:** `evelyn.hernandez0@test.com`
   - **Password:** `password123`

### 2. Test Dashboard
- ✅ Should see user name and profile status
- ✅ Should see match count
- ✅ Should see unread messages badge (if any)
- ✅ Should see "⭐ Upgrade" button

### 3. Test Discover Page
1. Go to http://localhost:3000/discover
2. Check:
   - ✅ User cards displayed
   - ✅ Photos loading
   - ✅ Like/Pass buttons work
   - ✅ Filters work (age, gender, location)
   - ✅ After action, new card appears

### 4. Test Matches Page
1. Go to http://localhost:3000/matches
2. Check:
   - ✅ All accepted matches displayed
   - ✅ Match details shown
   - ✅ Can click to view profile or message

### 5. Test Messaging
1. Go to http://localhost:3000/messages
2. Check:
   - ✅ Conversation list shows matched users
   - ✅ Unread indicator shows
   - ✅ Click conversation opens chat
3. Click a conversation
4. Check:
   - ✅ Message history loads
   - ✅ Can send new message
   - ✅ Message appears immediately
   - ✅ Unread count updates

### 6. Test Profile
1. Go to http://localhost:3000/profile/edit
2. Check:
   - ✅ Current profile data loaded
   - ✅ Can edit bio, location, etc.
   - ✅ Can upload photo
   - ✅ Changes save successfully

### 7. Test Subscriptions
1. Go to http://localhost:3000/pricing
2. Check:
   - ✅ Free and Premium plans shown
   - ✅ Features listed
   - ✅ Click "Get Started" on Premium
3. On Stripe checkout page:
   - ✅ Use test card: 4242 4242 4242 4242
   - ✅ Any future exp date, any CVC
   - ✅ Complete payment
4. After redirect:
   - ✅ Check subscription status
   - ✅ Verify premium features unlocked

### 8. Test API Endpoints
```bash
# Check overall stats
curl http://localhost:3000/api/testing/stats

# Test subscription status
# (Login first, then use browser dev tools to get session)
curl http://localhost:3000/api/subscription/status

# Test discover endpoint
curl http://localhost:3000/api/discover

# Test matches
curl http://localhost:3000/api/matches
```

---

## Database Stats

**Current Test Data:**
- **Users:** 36 total
  - 32 with profiles
  - 31 with photos
  
- **Matches:** 54 total
  - 26 accepted (mutual)
  - 28 pending
  
- **Messages:** 30 total
  - 11 unread
  - 19 read
  
- **Subscriptions:**
  - 9 Premium users
  - 22 Free users

---

## Clean Up After Testing

To remove all test users and start fresh:
```bash
curl -X DELETE http://localhost:3000/api/testing/seed-users
```

To generate more test users:
```bash
curl -X POST http://localhost:3000/api/testing/seed-users \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'
```

---

## Test User Credentials

All test users use the same password: `password123`

Sample test accounts:
1. evelyn.hernandez0@test.com (PREMIUM, Female, 23, Indianapolis)
2. harper.lewis1@test.com (FREE, Female, 32, Columbus)
3. harper.anderson2@test.com (PREMIUM, Other, 29, San Diego)
4. charlotte.anderson3@test.com (PREMIUM, Female, 43, Indianapolis)
5. henry.williams4@test.com (FREE, Female, 23, Charlotte)

---

## Expected Behaviors

### Authentication
- ✅ Cannot access protected pages without login
- ✅ Session persists across page refreshes
- ✅ Logout clears session

### Matching
- ✅ Cannot like same person twice
- ✅ Mutual likes create accepted match
- ✅ Can only message matched users
- ✅ Cannot see already matched users in discover

### Messaging
- ✅ Messages only between matched users
- ✅ Unread count updates in real-time
- ✅ Messages marked read when viewed
- ✅ Message history ordered by time

### Subscriptions
- ✅ Free users have basic features
- ✅ Premium users have unlimited features
- ✅ Stripe webhooks update database
- ✅ Subscription status synced correctly

---

## Known Limitations

1. **Photo Upload:** Requires Cloudinary credentials
2. **Real-time Updates:** Not implemented (would need WebSockets/Pusher)
3. **Email Verification:** Not implemented
4. **Password Reset:** Not implemented
5. **Notifications:** Not implemented

---

## Performance Benchmarks

Target load times:
- Dashboard: < 1s
- Discover: < 1.5s
- Messages: < 1s
- Profile: < 1s

---

## Security Checklist

- ✅ Passwords hashed with bcrypt
- ✅ Session-based authentication
- ✅ API routes protected
- ✅ Prisma prevents SQL injection
- ✅ Input validation on forms
- ✅ Stripe webhook signature verification
