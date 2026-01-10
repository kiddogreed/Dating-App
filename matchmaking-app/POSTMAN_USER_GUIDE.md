# User API - Postman Collection Guide

## Overview
Complete Postman collection for all regular user endpoints in the matchmaking app.

## Collections Available

1. **User_API.postman_collection.json** - Regular user endpoints (this guide)
2. **Admin_API.postman_collection.json** - Admin-only endpoints

---

## Import Instructions

1. Open Postman
2. Click **Import** button
3. Select `User_API.postman_collection.json`
4. Collection will appear in your sidebar

---

## Collection Structure

### 1. Authentication
- **Register New User** - Create account
- **Login** - Get session cookies
- **Get Current Session** - Check logged-in status
- **Logout** - End session
- **Verify Email** - Confirm email with token
- **Forgot Password** - Request password reset
- **Reset Password** - Reset with token

### 2. Profile
- **Get My Profile** - View your profile
- **Get User Profile by ID** - View another user's profile
- **Create Profile** - First-time profile setup
- **Update Profile** - Edit existing profile

### 3. Photos
- **Upload Photo** - Add new photo (multipart form)
- **Get My Photos** - List all your photos
- **Delete Photo** - Remove a photo
- **Set Main Photo** - Set profile picture

### 4. Discover & Matching
- **Get Discover Feed** - Get users to swipe on
- **Like User** - Swipe right
- **Pass User** - Swipe left
- **Get My Matches** - View mutual matches
- **Unmatch User** - Remove a match

### 5. Messages
- **Get Conversations** - List all chats
- **Get Messages with User** - View conversation
- **Send Message** - Send a message
- **Mark Messages as Read** - Update read status
- **Get Unread Count** - Unread message count

### 6. Subscription & Payments
- **Get Subscription Status** - Check premium status
- **Create Checkout Session** - Start Stripe payment
- **Cancel Subscription** - End premium

### 7. Testing & Development
- **Health Check** - API status
- **Seed Test Users** - Create dummy data

---

## Quick Start Workflow

### Step 1: Register & Login

1. **Register New User**
   ```json
   POST /api/register
   {
     "email": "testuser@example.com",
     "password": "password123",
     "firstName": "Test",
     "lastName": "User"
   }
   ```

2. **Login**
   ```json
   POST /api/auth/callback/credentials
   {
     "email": "testuser@example.com",
     "password": "password123"
   }
   ```
   ✅ Cookies are now set for authenticated requests

### Step 2: Create Profile

3. **Create Profile**
   ```json
   POST /api/profile
   {
     "bio": "Love hiking and coffee",
     "dateOfBirth": "1995-05-15",
     "gender": "MALE",
     "location": "New York, NY",
     "interests": ["hiking", "coffee", "photography"],
     "lookingFor": "RELATIONSHIP"
   }
   ```

### Step 3: Upload Photos

4. **Upload Photo**
   - Method: POST `/api/photos/upload`
   - Body: form-data
   - Key: `photo`, Type: File
   - Select an image file

### Step 4: Start Matching

5. **Get Discover Feed**
   ```
   GET /api/discover?limit=10
   ```

6. **Like a User**
   ```json
   POST /api/matches/like
   {
     "targetUserId": "user-id-from-discover"
   }
   ```

### Step 5: Messaging

7. **Get Matches**
   ```
   GET /api/matches
   ```

8. **Send Message**
   ```json
   POST /api/messages
   {
     "receiverId": "matched-user-id",
     "content": "Hey! How are you?"
   }
   ```

9. **Get Conversations**
   ```
   GET /api/conversations
   ```

---

## Authentication Notes

### Session-Based Auth
This app uses **NextAuth.js** session-based authentication:

- Login sets HTTP-only cookies
- Cookies automatically sent with each request
- No need for Bearer tokens

### Cookie Handling in Postman

**Option 1: Automatic (Recommended)**
1. Login via Postman using the Login request
2. Postman automatically stores cookies
3. All subsequent requests include cookies

**Option 2: Manual**
1. Login in browser at http://localhost:3000/login
2. Postman Desktop shares cookies with system browser
3. Requests will use browser session

### Testing Tips

- Keep Postman Desktop open while testing
- Check **Cookies** tab under request to verify session
- If getting 401 errors, re-run Login request

---

## Common Workflows

### Complete User Journey

```
1. Register → Login
2. Create Profile
3. Upload 3-5 Photos
4. Set Main Photo
5. Get Discover Feed
6. Like 5-10 Users
7. Check Matches
8. Send Messages
9. Upgrade to Premium (optional)
```

### Testing Matching

```
1. Create User A → Login as A
2. Create User B → Login as B
3. User A likes User B
4. User B likes User A
5. Check matches for both users
6. Send messages between them
```

### Testing Subscriptions

```
1. Get Subscription Status (should be FREE)
2. Create Checkout Session
3. Complete payment in Stripe (test mode)
4. Webhook updates subscription
5. Get Subscription Status (now PREMIUM)
```

---

## Response Examples

### Successful Login
```json
{
  "user": {
    "id": "user-uuid",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

### Get Discover Feed
```json
{
  "success": true,
  "users": [
    {
      "id": "user-id",
      "firstName": "Jane",
      "bio": "Love hiking",
      "age": 28,
      "location": "New York",
      "photos": [...]
    }
  ]
}
```

### Match Created
```json
{
  "success": true,
  "isMatch": true,
  "message": "It's a match!",
  "match": {
    "id": "match-id",
    "user": {...}
  }
}
```

---

## Environment Variables (Optional)

Create a Postman Environment for easy switching:

**Variables:**
- `baseUrl` → `http://localhost:3000`
- `userId` → Your user ID after login
- `matchId` → A match ID for testing

**Usage in requests:**
```
{{baseUrl}}/api/profile/{{userId}}
```

---

## Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request completed |
| 400 | Bad Request | Invalid data sent |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend error |

---

## Development Tips

### Seed Test Data
Before testing matching/messages:
```json
POST /api/testing/seed-users
{
  "count": 20
}
```
Creates 20 test users with profiles and photos.

### Health Check
Verify API is running:
```
GET /api/testing/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-01-11T..."
}
```

---

## File Upload (Photos)

### Postman Setup for Photo Upload

1. Select **Upload Photo** request
2. Go to **Body** tab
3. Select **form-data**
4. Add key: `photo`
5. Change type to **File** (dropdown)
6. Click **Select Files**
7. Choose an image (JPG, PNG)
8. Send request

### Supported Formats
- JPG/JPEG
- PNG
- Max size: 5MB (check app limits)

---

## Next Steps

After importing:
1. ✅ Run **Register New User**
2. ✅ Run **Login** (saves cookies)
3. ✅ Run **Create Profile**
4. ✅ Test other endpoints

For admin features, import `Admin_API.postman_collection.json`

---

**Files:**
- ✅ User_API.postman_collection.json - This collection
- ✅ Admin_API.postman_collection.json - Admin endpoints
- ✅ POSTMAN_USER_GUIDE.md - This guide
