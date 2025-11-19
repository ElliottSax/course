# Security Best Practices

Comprehensive security guidelines for the course platform.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Data Protection](#data-protection)
3. [API Security](#api-security)
4. [Input Validation](#input-validation)
5. [Database Security](#database-security)
6. [Payment Security](#payment-security)
7. [File Upload Security](#file-upload-security)
8. [Rate Limiting](#rate-limiting)
9. [HTTPS & Headers](#https--headers)
10. [Secrets Management](#secrets-management)
11. [Monitoring & Incident Response](#monitoring--incident-response)

---

## Authentication & Authorization

### Session Management

**✅ DO:**
- Use NextAuth.js for authentication (already configured)
- Set secure session expiration (30 days default)
- Use JWT tokens for stateless sessions
- Implement refresh token rotation

**❌ DON'T:**
- Store passwords in plain text
- Use predictable session IDs
- Allow sessions to never expire

### Implementation

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user role to token
      if (user) {
        token.role = user.role
      }
      return token
    },
  },
}
```

### Role-Based Access Control (RBAC)

```typescript
// middleware.ts - Protect routes
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Protect admin routes
      if (req.nextUrl.pathname.startsWith('/admin')) {
        return token?.role === 'admin'
      }
      // Protect instructor routes
      if (req.nextUrl.pathname.startsWith('/instructor')) {
        return token?.role === 'instructor' || token?.role === 'admin'
      }
      return !!token
    },
  },
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/instructor/:path*'],
}
```

### Password Requirements (if adding custom auth)

```typescript
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character')
```

---

## Data Protection

### Encryption at Rest

**Database**: Supabase encrypts all data at rest by default using AES-256.

**File Storage**: Enable encryption for sensitive uploads:

```typescript
// When uploading to Supabase Storage
const { data, error } = await supabase.storage
  .from('private-files')
  .upload(filePath, file, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  })
```

### Encryption in Transit

**HTTPS Enforcement**: Already configured in `next.config.js`:

```javascript
async headers() {
  return [{
    source: '/:path*',
    headers: [{
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload'
    }]
  }]
}
```

### Sensitive Data Handling

**❌ NEVER log sensitive data:**

```typescript
// BAD
console.log('User password:', password)
console.log('Credit card:', cardNumber)

// GOOD
console.log('User logged in:', userId)
console.log('Payment processed:', paymentId)
```

**Redact PII in logs:**

```typescript
function sanitizeLog(data: any) {
  return {
    ...data,
    email: data.email?.replace(/(.{2}).*(@.*)/, '$1***$2'),
    phone: data.phone?.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
  }
}
```

---

## API Security

### Route Protection

```typescript
// app/api/courses/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  // Verify authentication
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Verify authorization
  if (session.user.role !== 'instructor' && session.user.role !== 'admin') {
    return new Response('Forbidden', { status: 403 })
  }

  // Process request...
}
```

### CORS Configuration

```typescript
// app/api/public/route.ts
export async function GET(req: Request) {
  const origin = req.headers.get('origin')
  const allowedOrigins = [
    'https://your-domain.com',
    'https://www.your-domain.com',
  ]

  const headers = allowedOrigins.includes(origin || '')
    ? {
        'Access-Control-Allow-Origin': origin || '',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    : {}

  return new Response(JSON.stringify({ data }), { headers })
}
```

### API Keys

**For internal services:**

```typescript
// Verify API key
const apiKey = req.headers.get('x-api-key')
if (apiKey !== process.env.INTERNAL_API_KEY) {
  return new Response('Invalid API key', { status: 401 })
}
```

---

## Input Validation

### Use Zod for All Inputs

```typescript
import { z } from 'zod'

const createCourseSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(5000),
  price: z.number().int().min(0).max(1000000),
  category: z.enum(['web-development', 'programming', 'design']),
})

export async function POST(req: Request) {
  const body = await req.json()

  // Validate input
  const result = createCourseSchema.safeParse(body)
  if (!result.success) {
    return new Response(JSON.stringify({ errors: result.error.errors }), {
      status: 400,
    })
  }

  // Use validated data
  const { title, description, price, category } = result.data
  // ...
}
```

### SQL Injection Prevention

**✅ Use Drizzle ORM (parameterized queries):**

```typescript
// SAFE - Drizzle uses prepared statements
const course = await db.query.courses.findFirst({
  where: eq(courses.id, courseId),
})
```

**❌ NEVER use raw SQL with user input:**

```typescript
// DANGEROUS
const courses = await db.execute(
  sql`SELECT * FROM courses WHERE title = '${userInput}'`
)
```

### XSS Prevention

**Sanitize HTML content:**

```typescript
import DOMPurify from 'isomorphic-dompurify'

const sanitizedContent = DOMPurify.sanitize(userContent, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'h1', 'h2', 'h3', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: [],
})
```

**Use Content Security Policy:**

```javascript
// next.config.js
async headers() {
  return [{
    source: '/:path*',
    headers: [{
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co",
      ].join('; ')
    }]
  }]
}
```

---

## Database Security

### Row Level Security (RLS)

Enable in Supabase for all tables:

```sql
-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Users can only read published courses
CREATE POLICY "Public courses are viewable by everyone"
ON courses FOR SELECT
USING (is_published = true);

-- Only course instructors can update their courses
CREATE POLICY "Instructors can update own courses"
ON courses FOR UPDATE
USING (auth.uid() = instructor_id);

-- Only admins can delete courses
CREATE POLICY "Admins can delete courses"
ON courses FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

### Database Credentials

**❌ NEVER commit credentials:**

```bash
# .gitignore (already configured)
.env
.env.local
.env.production
```

**✅ Use environment variables:**

```typescript
// lib/db.ts
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}
```

### Backup Strategy

**Supabase automatic backups:**
- Daily backups (retained 7 days on free tier)
- Point-in-time recovery on paid plans

**Manual backups:**

```bash
# Export database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Encrypt backup
gpg --encrypt backup-20250119.sql
```

---

## Payment Security

### PCI Compliance

**✅ DO:**
- Use Stripe.js (never handle card data directly)
- Use Stripe webhooks for payment verification
- Store only Stripe customer IDs, not card details

**❌ DON'T:**
- Store card numbers, CVV, or expiration dates
- Process payments client-side
- Trust payment status from client

### Webhook Verification

```typescript
// app/api/webhooks/stripe/route.ts
import { constructWebhookEvent } from '@/lib/stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  // Verify webhook signature
  try {
    const event = constructWebhookEvent(body, signature)

    // Process verified event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      // Enroll user in course...
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }
}
```

### Amount Verification

```typescript
// Verify payment amount matches course price
const course = await db.query.courses.findFirst({
  where: eq(courses.id, courseId),
})

if (session.amount_total !== course.price) {
  throw new Error('Payment amount mismatch')
}
```

---

## File Upload Security

### Validate File Types

```typescript
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

function validateFile(file: File, type: 'image' | 'video') {
  const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`)
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Max size: 100MB')
  }

  return true
}
```

### Sanitize Filenames

```typescript
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars
    .replace(/\.+/g, '.') // Remove multiple dots
    .slice(0, 255) // Limit length
}
```

### Scan Uploads (Production)

For production, integrate virus scanning:

```typescript
import { ClamScan } from 'clamscan'

const scanner = new ClamScan()

async function scanFile(filePath: string) {
  const { isInfected, viruses } = await scanner.isInfected(filePath)

  if (isInfected) {
    await fs.unlink(filePath) // Delete infected file
    throw new Error(`File is infected: ${viruses.join(', ')}`)
  }
}
```

---

## Rate Limiting

### API Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// 10 requests per 10 seconds
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

// Usage in API route
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success, remaining } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too many requests', {
      status: 429,
      headers: {
        'X-RateLimit-Remaining': remaining.toString(),
      },
    })
  }

  // Process request...
}
```

### Different Limits for Different Endpoints

```typescript
export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 min
})

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min
})
```

---

## HTTPS & Headers

### Security Headers

Already configured in `next.config.js`:

```javascript
{
  key: 'X-DNS-Prefetch-Control',
  value: 'on'
},
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload'
},
{
  key: 'X-Content-Type-Options',
  value: 'nosniff'
},
{
  key: 'X-Frame-Options',
  value: 'SAMEORIGIN'
},
{
  key: 'X-XSS-Protection',
  value: '1; mode=block'
},
{
  key: 'Referrer-Policy',
  value: 'strict-origin-when-cross-origin'
}
```

### Test Headers

```bash
curl -I https://your-domain.com | grep -i "x-\|strict"
```

---

## Secrets Management

### Environment Variables

**✅ DO:**
- Use `.env.local` for development
- Use Vercel environment variables for production
- Rotate secrets regularly (every 90 days)
- Use different secrets for dev/staging/prod

**❌ DON'T:**
- Commit `.env` files to Git
- Hardcode secrets in code
- Share secrets in Slack/email
- Use weak secrets

### Secret Rotation

```bash
# Generate new NextAuth secret
openssl rand -base64 32

# Update in Vercel
vercel env rm NEXTAUTH_SECRET production
vercel env add NEXTAUTH_SECRET production
# Paste new secret

# Redeploy
vercel --prod
```

---

## Monitoring & Incident Response

### Error Tracking

Install Sentry:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Configure to filter sensitive data:

```javascript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  beforeSend(event) {
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers
    }
    return event
  },
})
```

### Audit Logging

Log security-relevant events:

```typescript
// lib/audit-log.ts
export async function logAuditEvent({
  userId,
  action,
  resource,
  ip,
  userAgent,
}: AuditEvent) {
  await db.insert(auditLogs).values({
    user_id: userId,
    action,
    resource,
    ip_address: ip,
    user_agent: userAgent,
    created_at: new Date(),
  })
}

// Usage
await logAuditEvent({
  userId: session.user.id,
  action: 'COURSE_DELETED',
  resource: `course:${courseId}`,
  ip: req.headers.get('x-forwarded-for'),
  userAgent: req.headers.get('user-agent'),
})
```

### Incident Response Plan

1. **Detect**: Set up alerts for:
   - Failed login attempts (>10 in 5 min)
   - Unusual API traffic
   - Database errors
   - Payment failures

2. **Respond**:
   ```bash
   # Immediately rotate compromised secrets
   vercel env rm COMPROMISED_SECRET production
   vercel env add COMPROMISED_SECRET production

   # Block malicious IPs (Cloudflare)
   # Invalidate sessions if needed
   ```

3. **Recover**:
   - Restore from backup if needed
   - Notify affected users
   - Document incident

---

## Security Checklist

Before going live:

### Authentication
- [ ] NextAuth properly configured
- [ ] Session expiration set
- [ ] OAuth redirect URIs updated
- [ ] Strong NEXTAUTH_SECRET

### Authorization
- [ ] Role-based access control implemented
- [ ] Protected routes use middleware
- [ ] API routes verify permissions

### Data Protection
- [ ] Database encrypted at rest
- [ ] HTTPS enforced
- [ ] Sensitive data not logged
- [ ] Row Level Security enabled

### API Security
- [ ] Input validation on all endpoints
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] SQL injection prevented

### Payments
- [ ] Stripe webhooks verified
- [ ] No card data stored
- [ ] Payment amounts verified

### Files
- [ ] File types validated
- [ ] Filenames sanitized
- [ ] Size limits enforced

### Monitoring
- [ ] Error tracking enabled
- [ ] Audit logs implemented
- [ ] Alerts configured

---

## Regular Security Tasks

### Weekly
- [ ] Review error logs
- [ ] Check failed login attempts
- [ ] Monitor API usage

### Monthly
- [ ] Review access permissions
- [ ] Check for dependency vulnerabilities: `npm audit`
- [ ] Review audit logs

### Quarterly
- [ ] Rotate secrets
- [ ] Security audit
- [ ] Update dependencies
- [ ] Review and update policies

---

## Security Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Next.js Security**: https://nextjs.org/docs/app/building-your-application/security
- **Vercel Security**: https://vercel.com/docs/security
- **Supabase Security**: https://supabase.com/docs/guides/platform/security

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email: security@your-domain.com
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
4. Allow 90 days for fix before public disclosure

---

**Remember**: Security is an ongoing process, not a one-time setup. Stay vigilant!
