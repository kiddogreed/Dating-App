# 🚀 Phase 10: Production Deployment Guide

## ✅ Pre-Deployment Checklist

Your app has been verified and is **ready for deployment**!

- ✅ Build successful (no TypeScript errors)
- ✅ All phases 1-9 completed
- ✅ Authentication working (NextAuth)
- ✅ Database schema ready (Prisma)
- ✅ Stripe integration configured
- ✅ Messaging system implemented
- ✅ Admin panel functional

---

## 🎯 Deployment Options

### **Option 1: Vercel + Railway (Recommended - Easiest)**
- **Frontend + API**: Vercel (Free)
- **Database**: Railway PostgreSQL (Free tier)
- **Images**: Cloudinary (Free tier)
- **Time**: 15-20 minutes

### **Option 2: Vercel + Neon**
- **Frontend + API**: Vercel (Free)
- **Database**: Neon PostgreSQL (Free tier - serverless)
- **Time**: 15-20 minutes

### **Option 3: Full Manual Setup**
- **Frontend**: Vercel
- **Database**: Your own PostgreSQL
- **Redis**: Upstash (for Socket.IO)

---

## 📋 Step-by-Step Deployment (Option 1 - Railway)

### **Step 1: Prepare Your Repository**

```bash
# Initialize git if not already done
cd /c/projects/react/DatingApp/matchmaking-app
git init
git add .
git commit -m "Initial commit - ready for deployment"

# Create GitHub repository and push
# Visit: https://github.com/new
git remote add origin https://github.com/YOUR_USERNAME/matchmaking-app.git
git branch -M main
git push -u origin main
```

---

### **Step 2: Deploy Database to Railway**

1. **Create Railway Account**
   - Visit: https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Wait for database to provision (~30 seconds)

3. **Get Database URL**
   - Click on PostgreSQL service
   - Go to "Connect" tab
   - Copy the "Postgres Connection URL"
   - Example: `postgresql://postgres:password@containers.railway.app:5432/railway`

4. **Run Migrations**
   ```bash
   # Update your .env with Railway URL temporarily
   DATABASE_URL="postgresql://postgres:password@containers.railway.app:5432/railway"
   
   # Run Prisma migrations
   npx prisma migrate deploy
   ```

---

### **Step 3: Setup Cloudinary**

1. **Create Account**
   - Visit: https://cloudinary.com
   - Sign up (Free tier: 25GB storage, 25GB bandwidth)

2. **Get Credentials**
   - Dashboard → Account Details
   - Copy:
     - Cloud Name
     - API Key
     - API Secret

---

### **Step 4: Setup Stripe**

1. **Get API Keys**
   - Visit: https://dashboard.stripe.com
   - Go to Developers → API Keys
   - Copy:
     - Publishable key (starts with `pk_`)
     - Secret key (starts with `sk_`)

2. **Get Webhook Secret** (for later)
   - You'll configure this after Vercel deployment

---

### **Step 5: Deploy to Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd /c/projects/react/DatingApp/matchmaking-app
vercel
```

**Follow the prompts:**
```
? Set up and deploy? Yes
? Which scope? [Your account]
? Link to existing project? No
? What's your project's name? matchmaking-app
? In which directory is your code located? ./
```

---

### **Step 6: Configure Environment Variables in Vercel**

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your project

2. **Settings → Environment Variables**

Add these variables:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@containers.railway.app:5432/railway

# NextAuth
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
NEXTAUTH_URL=https://your-app.vercel.app

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (you'll add this later)

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

3. **Redeploy**
   ```bash
   vercel --prod
   ```

---

### **Step 7: Configure Stripe Webhooks**

1. **Go to Stripe Dashboard**
   - https://dashboard.stripe.com/webhooks

2. **Add Endpoint**
   - Click "Add endpoint"
   - Endpoint URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Copy Webhook Secret**
   - Click on the webhook endpoint
   - Copy "Signing secret" (starts with `whsec_`)
   - Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

4. **Redeploy**
   ```bash
   vercel --prod
   ```

---

### **Step 8: Create Stripe Products**

Your app includes an API endpoint to create products:

```bash
# Visit in browser or use curl
https://your-app.vercel.app/api/subscription/create-product
```

Or manually in Stripe Dashboard:
1. Products → Add Product
2. Create two products:
   - **Premium** - $9.99/month
   - **Gold** - $19.99/month

---

### **Step 9: Test Your Deployment**

**Test Checklist:**

```bash
# 1. Visit your site
https://your-app.vercel.app

# 2. Test Registration
- Register a new account
- Verify email is stored in database

# 3. Test Login
- Login with created account
- Check dashboard loads

# 4. Test Profile Creation
- Create/edit profile
- Upload photo (Cloudinary test)

# 5. Test Stripe (Use test card)
- Go to /pricing
- Click subscribe
- Use test card: 4242 4242 4242 4242
- Verify subscription in Stripe dashboard

# 6. Test Messaging
- Create second account
- Match with first account
- Send messages

# 7. Test Admin
- Make yourself admin via database or /api/admin/promote-me
- Access /admin dashboard
```

---

## 🔧 Troubleshooting

### **Database Connection Issues**

```bash
# Test connection
npx prisma db push

# Check migrations
npx prisma migrate status

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### **Build Failures**

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build

# Check logs in Vercel dashboard
```

### **Stripe Webhook Issues**

1. Check webhook endpoint is correct
2. Verify `STRIPE_WEBHOOK_SECRET` is set
3. Test with Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### **Image Upload Issues**

1. Verify Cloudinary credentials
2. Check CORS settings in Cloudinary dashboard
3. Test upload widget configuration

---

## 📊 Monitoring & Analytics

### **Vercel Analytics**
```bash
# Enable in Vercel Dashboard
Settings → Analytics → Enable
```

### **Database Monitoring**
- Railway Dashboard → PostgreSQL → Metrics
- Monitor connections, queries, storage

### **Stripe Dashboard**
- Monitor subscriptions
- Track revenue
- View failed payments

---

## 🔐 Security Checklist

- ✅ Use environment variables for all secrets
- ✅ Never commit `.env` to git
- ✅ Use strong NEXTAUTH_SECRET
- ✅ Enable CORS only for your domain
- ✅ Use Stripe webhook signatures
- ✅ Rate limit API endpoints (future enhancement)
- ✅ Sanitize user inputs
- ✅ Use HTTPS (automatic with Vercel)

---

## 📈 Post-Deployment Tasks

### **1. Custom Domain** (Optional)
```bash
# Vercel Dashboard
Settings → Domains → Add Domain
```

### **2. Email Setup** (Future Enhancement)
- SendGrid for transactional emails
- Email verification
- Password reset emails

### **3. Performance Optimization**
```bash
# Enable Next.js Image Optimization
# Already configured with next/image

# Add Redis for caching (Optional)
# Upstash Redis for serverless
```

### **4. Backup Strategy**
- Railway: Automatic daily backups
- Manual backups: `pg_dump` from Railway database

---

## 💰 Cost Estimation (Free Tier)

| Service | Free Tier | Paid Starts At |
|---------|-----------|----------------|
| **Vercel** | 100GB bandwidth | $20/month |
| **Railway** | $5 free credit/month | Pay as you go |
| **Cloudinary** | 25GB storage | $89/month |
| **Stripe** | Unlimited | 2.9% + 30¢ per transaction |

**Total Monthly Cost (starting):** $0-5
**With traffic (1000 users):** ~$20-30/month

---

## 🎉 You're Live!

Your matchmaking app is now deployed and ready for users!

**Next Steps:**
1. Share your URL with friends
2. Monitor user feedback
3. Iterate on features
4. Scale as needed

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Stripe Docs: https://stripe.com/docs

---

## 🚀 Quick Deploy Script (All-in-One)

Save this as `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying Matchmaking App..."

# Step 1: Build test
echo "📦 Testing build..."
npm run build

# Step 2: Git commit
echo "📝 Committing changes..."
git add .
git commit -m "Deploy: $(date +%Y-%m-%d)"

# Step 3: Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push origin main

# Step 4: Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Check your Vercel dashboard for the live URL"
```

Make executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

**🎊 Congratulations! You've completed all 10 phases!** 🎊
