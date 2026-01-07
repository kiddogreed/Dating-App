# 📧 Email Service Setup Guide (Resend)

## Overview

The MatchMaking App uses [Resend](https://resend.com) to send transactional emails:
- Email verification for new accounts
- Password reset emails
- Future: Welcome emails, match notifications, etc.

**Free Tier:** 100 emails/day, 3,000 emails/month

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Resend Account

1. Go to https://resend.com
2. Click "Start Building"
3. Sign up with GitHub, Google, or Email
4. Verify your email address

### Step 2: Get API Key

1. Log in to Resend Dashboard
2. Click "API Keys" in the sidebar
3. Click "Create API Key"
4. Name it (e.g., "MatchMaking App - Production")
5. Copy the API key (starts with `re_...`)

### Step 3: Add to Environment Variables

**For Local Development:**
```bash
# Add to .env file
RESEND_API_KEY=re_your_actual_key_here
```

**For Vercel Production:**
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add: `RESEND_API_KEY` = `re_your_actual_key_here`
5. Click "Save"
6. Redeploy your app

---

## 🎨 Email Templates

The app uses React Email components for beautiful, responsive emails:

### Verification Email
- Sent when user registers
- Contains verification link (expires in 24 hours)
- Template: `components/emails/templates.tsx` → `VerificationEmailTemplate`

### Password Reset Email
- Sent when user requests password reset
- Contains reset link (expires in 1 hour)
- Template: `components/emails/templates.tsx` → `PasswordResetEmailTemplate`

---

## 🧪 Testing Emails

### Test with API Endpoint

```bash
# Test if email service is configured
curl http://localhost:3000/api/testing/test-email

# Or visit in browser:
# http://localhost:3000/api/testing/test-email
```

This will:
- Check if RESEND_API_KEY is configured
- Send test verification email
- Send test password reset email
- Return results

### Test with Real Registration

1. Start your dev server: `npm run dev`
2. Go to http://localhost:3000/register
3. Fill in the form and submit
4. Check your email inbox
5. Click the verification link

### Resend Test Email

Resend provides a test email address: `delivered@resend.dev`
- All emails sent to this address are accepted
- You can see them in Resend Dashboard → Emails

---

## 🔧 Configuration

### Default Sender Email

Current default: `onboarding@resend.dev`

**To use your own domain:**

1. **Add Domain in Resend:**
   - Dashboard → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `matchmaking.com`)
   - Add DNS records to your domain provider

2. **Update Email Sender:**
   ```typescript
   // In api routes (register/route.ts, forgot-password/route.ts)
   from: 'MatchMaking App <noreply@yourdomain.com>'
   ```

### Email Templates Customization

Edit `components/emails/templates.tsx`:

```tsx
// Change colors
const button = {
  backgroundColor: '#your-color',
  // ...
};

// Change text
<Heading>Your Custom Heading</Heading>

// Add your logo
<Img 
  src="https://your-cdn.com/logo.png" 
  alt="Your Logo" 
  width="150" 
/>
```

---

## 📊 Monitoring

### Resend Dashboard

View email analytics:
- Dashboard → Emails
- See all sent emails
- Delivery status
- Open rates (if enabled)
- Click rates (if enabled)

### Logs

Check server logs for email errors:
```bash
# Vercel logs
vercel logs

# Local development
# Check terminal output
```

---

## 🆘 Troubleshooting

### Email Not Sending

**Problem:** Emails not arriving

**Solutions:**
1. Check if `RESEND_API_KEY` is set in environment variables
2. Check spam folder
3. Verify API key is valid (not expired)
4. Check Resend Dashboard → Emails for delivery status
5. Check server logs for errors

**Test email config:**
```bash
curl http://localhost:3000/api/testing/test-email
```

### Invalid API Key

**Error:** "API key is invalid"

**Solutions:**
1. Generate new API key in Resend Dashboard
2. Update environment variable
3. Restart dev server / redeploy app

### Domain Verification Failed

**Problem:** Can't send from custom domain

**Solutions:**
1. Wait up to 48 hours for DNS propagation
2. Verify DNS records are correct
3. Use `dig` or online DNS checker
4. Contact Resend support if needed

### Rate Limit Exceeded

**Problem:** "Rate limit exceeded"

**Solutions:**
1. Free tier: 100 emails/day
2. Upgrade plan in Resend Dashboard
3. Or wait until daily limit resets

---

## 💰 Pricing

### Free Tier
- 100 emails/day
- 3,000 emails/month
- Perfect for development and small apps

### Paid Plans
- **Pro:** $20/month
  - 50,000 emails/month
  - Custom domains
  - Analytics
  
- **Enterprise:** Custom pricing
  - Unlimited emails
  - Dedicated IP
  - Priority support

View pricing: https://resend.com/pricing

---

## 🔐 Security Best Practices

1. **Never commit API keys to Git**
   - Use `.env` file (in `.gitignore`)
   - Use environment variables in production

2. **Rotate API keys regularly**
   - Generate new key every 3-6 months
   - Immediately revoke if compromised

3. **Use different keys for environments**
   - Development key
   - Staging key
   - Production key

4. **Monitor usage**
   - Check Resend Dashboard weekly
   - Set up alerts for unusual activity

---

## 📚 Resources

- **Resend Docs:** https://resend.com/docs
- **React Email:** https://react.email
- **Email Testing:** https://resend.com/docs/dashboard/emails/send-test-email
- **API Reference:** https://resend.com/docs/api-reference/introduction

---

## ✅ Verification Checklist

- [ ] Resend account created
- [ ] API key generated
- [ ] Added to `.env` file
- [ ] Added to Vercel environment variables
- [ ] Test email sent successfully
- [ ] Registration email verified
- [ ] Password reset email verified
- [ ] Templates customized (optional)
- [ ] Custom domain configured (optional)

---

*Last Updated: January 7, 2026*
