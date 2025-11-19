# Deployment Guide

Complete guide for deploying the course platform to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup (Supabase)](#database-setup-supabase)
4. [Deployment to Vercel](#deployment-to-vercel)
5. [Third-Party Services](#third-party-services)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- Node.js 20+ installed
- Git repository set up
- Accounts created for:
  - [Vercel](https://vercel.com) (hosting)
  - [Supabase](https://supabase.com) (database + storage)
  - [Google Cloud Console](https://console.cloud.google.com) (OAuth)
  - [Stripe](https://stripe.com) (payments)
  - [OpenAI](https://platform.openai.com) (AI features)

---

## Environment Setup

### 1. Create Environment Variables

Create a `.env.local` file in the project root:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication (NextAuth)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-...

# UploadThing (File Uploads)
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=your-app-id

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 2. Generate Secrets

Generate a secure NextAuth secret:

```bash
openssl rand -base64 32
```

---

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: course-platform
   - **Database Password**: (generate strong password)
   - **Region**: Choose closest to your users
4. Wait for project to initialize (~2 minutes)

### 2. Get Database Credentials

1. Navigate to **Settings** → **Database**
2. Copy the **Connection string** under "Connection pooling"
3. Replace `[YOUR-PASSWORD]` with your database password
4. Add to `.env.local` as `DATABASE_URL`

### 3. Run Migrations

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Verify tables were created
npm run db:studio
```

### 4. Seed Database (Optional)

For development/testing:

```bash
npm run db:seed
```

### 5. Configure Storage Buckets

For course thumbnails and videos:

1. Go to **Storage** in Supabase
2. Create buckets:
   - `course-thumbnails` (public)
   - `course-videos` (public)
   - `user-avatars` (public)
3. Set policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-thumbnails');

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-thumbnails');
```

---

## Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Project

```bash
vercel link
```

Follow prompts:
- **Set up and deploy**: Yes
- **Scope**: Your username/team
- **Link to existing project**: No
- **Project name**: course-platform

### 4. Configure Environment Variables

Add all environment variables from `.env.local` to Vercel:

```bash
# Option 1: Via CLI
vercel env add DATABASE_URL production
# Paste the value when prompted

# Option 2: Via Dashboard
# 1. Go to https://vercel.com/[username]/course-platform/settings/environment-variables
# 2. Add each variable manually
```

**Important**: Add these to all environments (Production, Preview, Development)

### 5. Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or push to main branch (auto-deploys)
git push origin main
```

### 6. Configure Domain

1. Go to **Settings** → **Domains** in Vercel dashboard
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable with new domain

---

## Third-Party Services

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: `https://your-domain.com`
   - **Authorized redirect URIs**: `https://your-domain.com/api/auth/callback/google`
6. Copy **Client ID** and **Client secret** to environment variables

### Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get API keys from **Developers** → **API keys**
3. Set up webhook:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy webhook signing secret

### OpenAI Setup

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Navigate to **API keys**
3. Create new secret key
4. Add to environment variables
5. Set up billing limits in **Settings** → **Billing**

### UploadThing Setup (File Uploads)

1. Go to [UploadThing](https://uploadthing.com)
2. Create new app
3. Get **Secret** and **App ID**
4. Add to environment variables

---

## Post-Deployment

### 1. Verify Deployment

Check these endpoints:

```bash
# Homepage
curl https://your-domain.com

# API health check
curl https://your-domain.com/api/health

# Database connection
curl https://your-domain.com/api/db-check
```

### 2. Run Database Migrations

After first deployment:

```bash
# Using Vercel CLI
vercel env pull .env.production
npm run db:migrate
```

### 3. Configure CDN (Optional)

For video streaming, consider adding:
- **Cloudflare** for CDN and DDoS protection
- **Bunny.net** or **Cloudflare Stream** for video hosting

### 4. Set Up Monitoring

Configure monitoring services:

**Sentry (Error Tracking)**:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Vercel Analytics**:
1. Go to **Analytics** tab in Vercel
2. Enable Web Analytics
3. Add to `app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 5. Configure Email (Optional)

For transactional emails, set up:
- **Resend**: `npm install resend`
- **SendGrid**: Alternative option

---

## CI/CD Pipeline

The project includes GitHub Actions workflows:

### Enable Auto-Deploy

1. Add Vercel secrets to GitHub:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Add:
     - `VERCEL_TOKEN` (from Vercel account settings)
     - `VERCEL_ORG_ID` (from `.vercel/project.json`)
     - `VERCEL_PROJECT_ID` (from `.vercel/project.json`)

2. Workflows will run on:
   - **Push to main**: Deploy to production
   - **Pull request**: Deploy preview
   - **Weekly**: Lighthouse performance audit

---

## Troubleshooting

### Build Fails

**Error**: "Module not found"
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

**Error**: "Type errors"
```bash
# Run type check locally
npm run type-check
```

### Database Connection Issues

**Error**: "connect ETIMEDOUT"
- Check DATABASE_URL is correct
- Verify Supabase project is not paused
- Check IP allowlist in Supabase settings

**Error**: "relation does not exist"
```bash
# Re-run migrations
npm run db:push
```

### Authentication Issues

**Error**: "Callback URL mismatch"
- Update OAuth redirect URIs in Google Console
- Verify NEXTAUTH_URL matches deployment URL

**Error**: "Invalid session"
- Generate new NEXTAUTH_SECRET
- Clear cookies and try again

### Payment Issues

**Error**: "Webhook signature failed"
- Verify STRIPE_WEBHOOK_SECRET is correct
- Re-create webhook in Stripe dashboard

---

## Performance Optimization

### 1. Enable Caching

Add to `next.config.js`:

```js
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
}
```

### 2. Database Connection Pooling

Already configured in `lib/db.ts` with:
- Max connections: 10
- Idle timeout: 20s

For high traffic, increase pool size:

```typescript
const client = postgres(connectionString, {
  max: 20, // Increase for production
})
```

### 3. Enable Edge Runtime (Optional)

For API routes that don't need database:

```typescript
export const runtime = 'edge'
```

---

## Security Checklist

Before going live:

- [ ] All environment variables are set in production
- [ ] NEXTAUTH_SECRET is unique and secure
- [ ] Database passwords are strong
- [ ] Stripe is in live mode (not test)
- [ ] OAuth redirect URIs are updated
- [ ] HTTPS is enforced
- [ ] Rate limiting is enabled
- [ ] Webhook secrets are configured
- [ ] Error messages don't leak sensitive data
- [ ] CORS is properly configured

---

## Scaling Considerations

As you grow:

1. **Database**: Upgrade Supabase plan or migrate to dedicated PostgreSQL
2. **Video Hosting**: Move to specialized CDN (Cloudflare Stream, Mux)
3. **File Storage**: Consider Cloudflare R2 or AWS S3
4. **API**: Implement rate limiting and caching
5. **Background Jobs**: Add queue system (BullMQ, Inngest)

---

## Rollback Procedure

If something goes wrong:

```bash
# Revert to previous deployment
vercel rollback

# Or redeploy specific version
vercel deploy --prod
```

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Stripe Docs**: https://stripe.com/docs

---

**Note**: Always test in a preview environment before deploying to production!
