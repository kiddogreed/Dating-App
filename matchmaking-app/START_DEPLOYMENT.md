# 🎯 YOUR DEPLOYMENT ROADMAP - Start Here!

**Current Status**: ✅ Code committed and pushed to GitHub  
**Next**: Setup external services and deploy

---

## ⚡ ACTION PLAN (Do These In Order)

### ✅ Step 1: Git Repository - DONE!
Your code is now on GitHub at: https://github.com/kiddogreed/Dating-App

---

### 📋 Step 2: Create Railway Database (5 minutes)

**What you need to do:**

1. **Visit Railway**
   - Go to: https://railway.app
   - Click "Login" → Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Wait ~30 seconds for provisioning

3. **Get Database URL**
   - Click on the PostgreSQL service card
   - Go to "Variables" tab
   - Find and copy `DATABASE_URL`
   - It looks like: `postgresql://postgres:password@containers-us-west-XXX.railway.app:5432/railway`

4. **Save it temporarily**
   - Keep this URL handy - you'll need it in a moment
   - DO NOT commit this to Git

**⏭️ When done, we'll run migrations to this database**

---

### 📋 Step 3: Get Cloudinary Credentials (3 minutes)

**What you need to do:**

1. **Create Account**
   - Go to: https://cloudinary.com
   - Click "Sign Up" → Choose free plan
   - Verify your email

2. **Get Credentials**
   - After login, you'll see the Dashboard
   - Look for "Account Details" section
   - Copy these 3 values:
     - **Cloud Name**: (e.g., `dxxxxx`)
     - **API Key**: (e.g., `123456789012345`)
     - **API Secret**: (e.g., `abcdef123456`)

3. **Save them temporarily**
   - Write them down or keep the tab open

---

### 📋 Step 4: Get Stripe API Keys (3 minutes)

**What you need to do:**

1. **Create Account**
   - Go to: https://stripe.com
   - Click "Sign up"
   - Complete registration

2. **Get Test API Keys**
   - After login, go to Dashboard
   - Click "Developers" in top menu
   - Click "API keys"
   - You'll see:
     - **Publishable key**: Starts with `pk_test_`
     - **Secret key**: Click "Reveal test key", starts with `sk_test_`

3. **Save them temporarily**
   - Copy both keys
   - We'll add webhook secret later

**💡 Note**: Start with TEST keys. Switch to LIVE keys only when you're ready for real payments.

---

### 📋 Step 5: Generate NextAuth Secret (30 seconds)

**Run this command in your terminal:**

```bash
openssl rand -base64 32
```

**Save the output** - this is your `NEXTAUTH_SECRET`

---

### 📋 Step 6: Deploy to Vercel (5 minutes)

**What you need to do:**

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```
   - Choose your preferred login method (GitHub recommended)

3. **Deploy**
   ```bash
   cd /c/projects/react/DatingApp/matchmaking-app
   vercel
   ```

4. **Answer the prompts:**
   ```
   ? Set up and deploy? [Y/n] → Press Y
   ? Which scope? → Choose your account
   ? Link to existing project? [y/N] → Press N
   ? What's your project's name? → matchmaking-app (or your choice)
   ? In which directory is your code located? → Press Enter (./)
   ```

5. **Get Preview URL**
   - Vercel will give you a preview URL
   - Don't worry about errors yet - we need to add environment variables

---

### 📋 Step 7: Add Environment Variables to Vercel (5 minutes)

**What you need to do:**

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project (`matchmaking-app`)

2. **Go to Settings**
   - Click "Settings" tab
   - Click "Environment Variables" in left sidebar

3. **Add Each Variable** (Click "Add" for each one)

   **Database:**
   ```
   Name: DATABASE_URL
   Value: [Your Railway PostgreSQL URL]
   Environment: Production, Preview, Development
   ```

   **NextAuth:**
   ```
   Name: NEXTAUTH_SECRET
   Value: [Your generated secret from Step 5]
   Environment: Production, Preview, Development
   ```
   
   ```
   Name: NEXTAUTH_URL
   Value: https://your-project-name.vercel.app
   Environment: Production
   ```
   
   **Note**: Replace `your-project-name` with your actual Vercel project URL

   **Cloudinary:**
   ```
   Name: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
   Value: [Your Cloud Name from Step 3]
   Environment: Production, Preview, Development
   ```
   
   ```
   Name: CLOUDINARY_API_KEY
   Value: [Your API Key from Step 3]
   Environment: Production, Preview, Development
   ```
   
   ```
   Name: CLOUDINARY_API_SECRET
   Value: [Your API Secret from Step 3]
   Environment: Production, Preview, Development
   ```

   **Stripe:**
   ```
   Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   Value: [Your Stripe Publishable Key from Step 4]
   Environment: Production, Preview, Development
   ```
   
   ```
   Name: STRIPE_SECRET_KEY
   Value: [Your Stripe Secret Key from Step 4]
   Environment: Production, Preview, Development
   ```
   
   **Note**: We'll add STRIPE_WEBHOOK_SECRET in Step 9

   **App URL:**
   ```
   Name: NEXT_PUBLIC_APP_URL
   Value: https://your-project-name.vercel.app
   Environment: Production
   ```

4. **Save All Variables**

---

### 📋 Step 8: Run Database Migrations (2 minutes)

**After adding DATABASE_URL to Vercel, run this locally:**

```bash
# Temporarily set your Railway DATABASE_URL in terminal
export DATABASE_URL="your-railway-url-here"

# Or on Windows:
set DATABASE_URL=your-railway-url-here

# Run migrations
npx prisma migrate deploy

# Optional: Open Prisma Studio to verify
npx prisma studio
```

---

### 📋 Step 9: Deploy to Production (2 minutes)

**Deploy to production with environment variables:**

```bash
cd /c/projects/react/DatingApp/matchmaking-app
vercel --prod
```

**Get your production URL** - something like `https://matchmaking-app-xxx.vercel.app`

---

### 📋 Step 10: Setup Stripe Webhooks (3 minutes)

**What you need to do:**

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/test/webhooks

2. **Add Endpoint**
   - Click "+ Add endpoint"
   - **Endpoint URL**: `https://your-vercel-url.vercel.app/api/webhooks/stripe`
   - Click "Select events"

3. **Select These Events:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. **Add Endpoint**
   - Click "Add endpoint"

5. **Get Webhook Secret**
   - Click on the newly created endpoint
   - Find "Signing secret"
   - Click "Reveal"
   - Copy the value (starts with `whsec_`)

6. **Add to Vercel**
   - Go back to Vercel → Settings → Environment Variables
   - Add new variable:
     ```
     Name: STRIPE_WEBHOOK_SECRET
     Value: [Your webhook secret]
     Environment: Production
     ```

7. **Redeploy**
   ```bash
   vercel --prod
   ```

---

### 📋 Step 11: Test Your Deployment (10 minutes)

**Visit your production URL and test:**

- [ ] **Homepage loads** - Visit your Vercel URL
- [ ] **Register account** - Create a new user
- [ ] **Login** - Login with new account
- [ ] **Create profile** - Fill out profile information
- [ ] **Upload photo** - Test Cloudinary upload
- [ ] **Test subscription** - Go to /pricing
  - Use test card: `4242 4242 4242 4242`
  - Any future date
  - Any CVC
- [ ] **Check Stripe dashboard** - Verify payment appears
- [ ] **Test messaging** (optional) - Create 2nd account and test chat

---

## 🎉 SUCCESS CHECKLIST

When everything works, you should have:

- ✅ App deployed at `https://your-app.vercel.app`
- ✅ Database running on Railway
- ✅ Images uploading to Cloudinary
- ✅ Payments processing through Stripe
- ✅ Users can register, login, create profiles
- ✅ Real-time messaging works
- ✅ Admin panel accessible

---

## 🆘 TROUBLESHOOTING

**Build fails on Vercel?**
- Check the build logs in Vercel dashboard
- Verify all environment variables are set
- Make sure DATABASE_URL is accessible from Vercel

**Database connection error?**
- Verify Railway DATABASE_URL is correct
- Check Railway dashboard that database is running
- Try: `npx prisma generate && npx prisma migrate deploy`

**Cloudinary upload fails?**
- Double-check credentials (Cloud Name, API Key, API Secret)
- Verify NEXT_PUBLIC_ prefix is used for Cloud Name

**Stripe webhook not working?**
- Verify webhook URL is correct
- Check all 6 events are selected
- Ensure STRIPE_WEBHOOK_SECRET matches

**Still stuck?**
- Check Vercel logs: `vercel logs`
- Check Railway logs in Railway dashboard
- Review [PHASE_10_DEPLOYMENT.md](PHASE_10_DEPLOYMENT.md) for detailed troubleshooting

---

## 📞 QUICK COMMANDS

```bash
# View deployment logs
vercel logs

# Redeploy
vercel --prod

# Check database
npx prisma studio

# Test build locally
npm run build && npm run start
```

---

## ✨ YOU'RE ALMOST THERE!

Follow the steps above in order. Each step builds on the previous one.

**Estimated total time**: 30-40 minutes

**Ready?** Start with Step 2 (Railway) and work your way down! 🚀
