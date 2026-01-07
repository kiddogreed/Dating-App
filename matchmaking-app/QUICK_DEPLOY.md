# 🎯 Quick Reference Card - Phase 10 Deployment

## ⚡ TL;DR - Deploy in 15 Minutes

### 1. Setup Accounts (5 min)
- Railway: https://railway.app → New PostgreSQL
- Cloudinary: https://cloudinary.com → Free account
- Stripe: https://stripe.com → Get API keys
- Resend: https://resend.com → Free account (100 emails/day)
- Vercel: https://vercel.com → Connect GitHub

### 2. Get Credentials (3 min)
```bash
Railway: Copy PostgreSQL URL
Cloudinary: Cloud name, API key, API secret
Stripe: Publishable key, Secret key
Resend: API key (Dashboard → API Keys)
NextAuth: openssl rand -base64 32
```

### 3. Deploy (5 min)
```bash
vercel
# Add environment variables in Vercel dashboard
vercel --prod
```

### 4. Configure Stripe Webhook (2 min)
- Stripe Dashboard → Webhooks
- Add: https://your-app.vercel.app/api/webhooks/stripe
- Copy webhook secret to Vercel env vars

---

## 📋 Environment Variables (Copy-Paste)

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate-with-openssl"
NEXTAUTH_URL="https://your-app.vercel.app"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-name"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
RESEND_API_KEY="re_..."
```

---

## 🔥 Common Commands

```bash
# Build test
npm run build

# Deploy
vercel --prod

# Database
npx prisma migrate deploy
npx prisma studio

# Logs
vercel logs
```

---

## ✅ Test Checklist

- [ ] Register account
- [ ] Login works
- [ ] Create profile
- [ ] Upload photo
- [ ] Send message
- [ ] Test payment (4242 4242 4242 4242)
- [ ] Access admin panel

---

## 🆘 Quick Fixes

**Build fails?**
```bash
rm -rf .next node_modules
npm install
npm run build
```

**Database error?**
```bash
npx prisma generate
npx prisma migrate deploy
```

**Stripe not working?**
- Check webhook secret matches
- Verify events are selected
- Test mode vs live mode

---

## 📞 Get Help

1. Check: [PHASE_10_DEPLOYMENT.md](PHASE_10_DEPLOYMENT.md)
2. Logs: Vercel Dashboard → Logs
3. Database: `npx prisma studio`
4. Stripe: Dashboard → Developers → Logs

---

## 🎉 Success?

Your app is live at: **https://your-app.vercel.app**

Share it! Test it! Scale it! 🚀
