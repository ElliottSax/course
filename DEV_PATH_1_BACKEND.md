# Development Path 1: Backend & Infrastructure

**Assigned to:** Claude Code Instance #1
**Focus:** Backend, Infrastructure, APIs, Database, Authentication, Payments, Video Processing
**Timeline:** Weeks 1-32 (Parallel with Path 2)

---

## Overview

This path focuses on building the robust backend infrastructure that solves the critical technical pain points:
- **79.7% of users** face technical difficulties → Build reliable infrastructure
- **$63B piracy threat** → Implement security and DRM
- **30% revenue loss** to piracy → Content protection
- **0% transaction fees** → Payment system

You will be responsible for all backend services, APIs, database design, authentication, video infrastructure, and system reliability.

---

## Phase 1: Core Infrastructure (Weeks 1-6)

### Week 1-2: Project Setup & Database Foundation

**Priority: CRITICAL - Path 2 depends on API contracts**

#### Tasks:
- [ ] Initialize Next.js project with TypeScript
  ```bash
  npx create-next-app@latest course-platform --typescript --tailwind --app
  cd course-platform
  ```

- [ ] Set up Supabase project
  - [ ] Create Supabase account and project
  - [ ] Note down project URL and anon key for Path 2
  - [ ] Configure environment variables

- [ ] Install backend dependencies
  ```bash
  npm install drizzle-orm drizzle-kit postgres
  npm install @supabase/supabase-js
  npm install stripe
  npm install zod
  npm install -D @types/node
  ```

- [ ] Design and implement database schema with Drizzle ORM
  ```typescript
  // db/schema.ts

  // Users table (extends Supabase auth)
  export const users = pgTable('users', {
    id: uuid('id').primaryKey().references(() => auth.users.id),
    email: text('email').notNull().unique(),
    role: text('role', { enum: ['student', 'instructor', 'admin'] }).notNull().default('student'),
    stripeCustomerId: text('stripe_customer_id'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  });

  // Courses table
  export const courses = pgTable('courses', {
    id: uuid('id').defaultRandom().primaryKey(),
    instructorId: uuid('instructor_id').references(() => users.id).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    price: integer('price').notNull(), // in cents
    status: text('status', { enum: ['draft', 'published', 'archived'] }).default('draft'),
    thumbnailUrl: text('thumbnail_url'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  });

  // Lessons table
  export const lessons = pgTable('lessons', {
    id: uuid('id').defaultRandom().primaryKey(),
    courseId: uuid('course_id').references(() => courses.id).notNull(),
    title: text('title').notNull(),
    type: text('type', { enum: ['video', 'text', 'quiz', 'assignment'] }).notNull(),
    content: text('content'), // Rich text JSON or markdown
    videoUrl: text('video_url'),
    duration: integer('duration'), // in seconds
    order: integer('order').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  });

  // Enrollments table
  export const enrollments = pgTable('enrollments', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    courseId: uuid('course_id').references(() => courses.id).notNull(),
    status: text('status', { enum: ['active', 'completed', 'cancelled'] }).default('active'),
    enrolledAt: timestamp('enrolled_at').defaultNow(),
    completedAt: timestamp('completed_at')
  }, (table) => ({
    uniqueEnrollment: unique().on(table.userId, table.courseId)
  }));

  // Progress table
  export const progress = pgTable('progress', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    lessonId: uuid('lesson_id').references(() => lessons.id).notNull(),
    completed: boolean('completed').default(false),
    timeWatched: integer('time_watched').default(0), // in seconds
    lastPosition: integer('last_position').default(0), // in seconds
    updatedAt: timestamp('updated_at').defaultNow()
  }, (table) => ({
    uniqueProgress: unique().on(table.userId, table.lessonId)
  }));

  // Payments table
  export const payments = pgTable('payments', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    courseId: uuid('course_id').references(() => courses.id).notNull(),
    amount: integer('amount').notNull(), // in cents
    currency: text('currency').default('usd'),
    stripePaymentId: text('stripe_payment_id').notNull().unique(),
    status: text('status', { enum: ['pending', 'succeeded', 'failed', 'refunded'] }).notNull(),
    createdAt: timestamp('created_at').defaultNow()
  });

  // Gamification table
  export const gamification = pgTable('gamification', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull().unique(),
    xp: integer('xp').default(0),
    level: integer('level').default(1),
    streakDays: integer('streak_days').default(0),
    lastActive: timestamp('last_active').defaultNow()
  });

  // Analytics events table
  export const analyticsEvents = pgTable('analytics_events', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id),
    eventType: text('event_type').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow()
  });
  ```

- [ ] Set up database migrations
  ```bash
  npm run db:generate
  npm run db:migrate
  ```

- [ ] Create database connection utilities
  ```typescript
  // lib/db.ts
  import { drizzle } from 'drizzle-orm/postgres-js';
  import postgres from 'postgres';
  import * as schema from '@/db/schema';

  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  export const db = drizzle(client, { schema });
  ```

#### Deliverables for Path 2:
- [ ] **API Contract Document** - Share schemas and endpoints
- [ ] **Environment variables template** (.env.example)
- [ ] **Database schema documentation**

**Success Metrics:**
- [ ] All tables created successfully
- [ ] Foreign key constraints working
- [ ] Sample data can be inserted and queried
- [ ] Database accessible from API routes

---

### Week 3-4: Authentication & User Management API

**Priority: HIGH - Path 2 needs auth for all pages**

#### Tasks:
- [ ] Configure Supabase Authentication
  - [ ] Enable email/password authentication
  - [ ] Enable Google OAuth provider
  - [ ] Enable GitHub OAuth provider
  - [ ] Configure email templates
  - [ ] Set up magic link authentication

- [ ] Create authentication API routes
  ```typescript
  // app/api/auth/signup/route.ts
  export async function POST(request: Request) {
    const { email, password, role } = await request.json();

    // Validate with Zod
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(['student', 'instructor'])
    });

    const validated = schema.parse({ email, password, role });

    // Create user in Supabase
    const { data, error } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: { role: validated.role }
      }
    });

    if (error) return Response.json({ error }, { status: 400 });

    // Create user record in database
    await db.insert(users).values({
      id: data.user!.id,
      email: validated.email,
      role: validated.role
    });

    return Response.json({ user: data.user });
  }

  // app/api/auth/login/route.ts
  export async function POST(request: Request) {
    const { email, password } = await request.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return Response.json({ error }, { status: 401 });

    return Response.json({ session: data.session, user: data.user });
  }

  // app/api/auth/logout/route.ts
  export async function POST() {
    const { error } = await supabase.auth.signOut();

    if (error) return Response.json({ error }, { status: 500 });

    return Response.json({ success: true });
  }

  // app/api/auth/me/route.ts
  export async function GET(request: Request) {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, user.id)
    });

    return Response.json({ user: userRecord });
  }
  ```

- [ ] Create middleware for authentication
  ```typescript
  // middleware.ts
  import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
  import { NextResponse } from 'next/server';
  import type { NextRequest } from 'next/server';

  export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    await supabase.auth.getSession();

    return res;
  }

  export const config = {
    matcher: ['/dashboard/:path*', '/api/courses/:path*']
  };
  ```

- [ ] Implement role-based access control utilities
  ```typescript
  // lib/auth.ts
  export async function requireAuth(request: Request) {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new Error('Unauthorized');
    }

    return user;
  }

  export async function requireRole(request: Request, allowedRoles: string[]) {
    const user = await requireAuth(request);

    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, user.id)
    });

    if (!userRecord || !allowedRoles.includes(userRecord.role)) {
      throw new Error('Forbidden');
    }

    return userRecord;
  }
  ```

- [ ] Create user profile API endpoints
  ```typescript
  // app/api/users/[id]/route.ts
  export async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    await requireAuth(request);

    const user = await db.query.users.findFirst({
      where: eq(users.id, params.id)
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ user });
  }

  export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const currentUser = await requireAuth(request);

    if (currentUser.id !== params.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Update user profile
    const [updatedUser] = await db
      .update(users)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(users.id, params.id))
      .returning();

    return Response.json({ user: updatedUser });
  }
  ```

#### Deliverables for Path 2:
- [ ] **Authentication API documentation**
- [ ] **Auth helper functions** for client-side use
- [ ] **Sample curl commands** for testing auth flow

**Success Metrics:**
- [ ] Users can sign up with email/password
- [ ] Users can sign in with Google OAuth
- [ ] Users can sign in with GitHub OAuth
- [ ] JWT tokens are properly validated
- [ ] Role-based access control working
- [ ] Protected routes return 401 for unauthorized users

---

### Week 5-6: Video Infrastructure & Auto-Save System

**Priority: CRITICAL - Solves 79.7% technical issues pain point**

#### Tasks:
- [ ] Configure Supabase Storage for videos
  - [ ] Create 'videos' bucket
  - [ ] Set up RLS policies for instructor upload
  - [ ] Configure public read access for enrolled students
  - [ ] Set file size limits (500MB per video)

- [ ] Create video upload API with chunked upload support
  ```typescript
  // app/api/videos/upload/route.ts
  export async function POST(request: Request) {
    const instructor = await requireRole(request, ['instructor', 'admin']);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const courseId = formData.get('courseId') as string;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const filename = `${courseId}/${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filename);

    return Response.json({
      url: publicUrl,
      filename: data.path
    });
  }
  ```

- [ ] Implement video transcoding queue (future: use Cloudflare Stream or Mux)
  - [ ] For MVP: Direct upload to Supabase
  - [ ] Document transcoding requirements for Phase 2

- [ ] Create video streaming API with HLS support
  ```typescript
  // app/api/videos/[id]/stream/route.ts
  export async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const user = await requireAuth(request);

    // Verify user has access to this video
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, params.id),
      with: {
        course: true
      }
    });

    if (!lesson) {
      return Response.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Check enrollment
    const enrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, user.id),
        eq(enrollments.courseId, lesson.courseId)
      )
    });

    if (!enrollment) {
      return Response.json({ error: 'Not enrolled' }, { status: 403 });
    }

    // Return video URL with temporary signed URL
    const { data } = await supabase.storage
      .from('videos')
      .createSignedUrl(lesson.videoUrl!, 3600); // 1 hour expiry

    return Response.json({ url: data.signedUrl });
  }
  ```

- [ ] Implement auto-save progress system
  ```typescript
  // app/api/progress/save/route.ts
  export async function POST(request: Request) {
    const user = await requireAuth(request);
    const { lessonId, timeWatched, lastPosition, completed } = await request.json();

    // Upsert progress
    await db
      .insert(progress)
      .values({
        userId: user.id,
        lessonId,
        timeWatched,
        lastPosition,
        completed,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [progress.userId, progress.lessonId],
        set: {
          timeWatched,
          lastPosition,
          completed,
          updatedAt: new Date()
        }
      });

    // Update gamification if lesson completed
    if (completed) {
      await db
        .insert(gamification)
        .values({
          userId: user.id,
          xp: 100, // Award XP for completion
          lastActive: new Date()
        })
        .onConflictDoUpdate({
          target: gamification.userId,
          set: {
            xp: sql`${gamification.xp} + 100`,
            lastActive: new Date()
          }
        });
    }

    return Response.json({ success: true });
  }

  // app/api/progress/[lessonId]/route.ts
  export async function GET(
    request: Request,
    { params }: { params: { lessonId: string } }
  ) {
    const user = await requireAuth(request);

    const userProgress = await db.query.progress.findFirst({
      where: and(
        eq(progress.userId, user.id),
        eq(progress.lessonId, params.lessonId)
      )
    });

    return Response.json({ progress: userProgress || null });
  }
  ```

- [ ] Set up monitoring and error tracking
  - [ ] Install Sentry or similar
  ```bash
  npm install @sentry/nextjs
  ```
  - [ ] Configure error reporting
  - [ ] Set up performance monitoring
  - [ ] Create uptime monitoring alerts

#### Deliverables for Path 2:
- [ ] **Video upload API docs** with code examples
- [ ] **Progress tracking API docs**
- [ ] **Video player integration guide**

**Success Metrics:**
- [ ] Videos upload successfully (up to 500MB)
- [ ] Video URLs are properly signed and expire
- [ ] Progress saves every 30 seconds (tested)
- [ ] Resume-anywhere functionality works
- [ ] 99.9% API uptime
- [ ] <200ms API response times (p95)

---

## Phase 2: Course & Payment APIs (Weeks 7-12)

### Week 7-8: Course Management API

#### Tasks:
- [ ] Create course CRUD API endpoints
  ```typescript
  // app/api/courses/route.ts
  export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const courseList = await db.query.courses.findMany({
      where: eq(courses.status, status),
      limit,
      offset,
      with: {
        instructor: {
          columns: {
            id: true,
            email: true
          }
        }
      },
      orderBy: [desc(courses.createdAt)]
    });

    return Response.json({ courses: courseList });
  }

  export async function POST(request: Request) {
    const instructor = await requireRole(request, ['instructor', 'admin']);
    const body = await request.json();

    const schema = z.object({
      title: z.string().min(3).max(200),
      description: z.string().optional(),
      price: z.number().int().min(0)
    });

    const validated = schema.parse(body);

    const [newCourse] = await db
      .insert(courses)
      .values({
        instructorId: instructor.id,
        ...validated
      })
      .returning();

    return Response.json({ course: newCourse }, { status: 201 });
  }

  // app/api/courses/[id]/route.ts
  export async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, params.id),
      with: {
        instructor: {
          columns: {
            id: true,
            email: true
          }
        },
        lessons: {
          orderBy: [asc(lessons.order)]
        }
      }
    });

    if (!course) {
      return Response.json({ error: 'Course not found' }, { status: 404 });
    }

    return Response.json({ course });
  }

  export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const user = await requireAuth(request);
    const body = await request.json();

    // Verify ownership
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, params.id)
    });

    if (!course || course.instructorId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [updated] = await db
      .update(courses)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(courses.id, params.id))
      .returning();

    return Response.json({ course: updated });
  }

  export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const user = await requireAuth(request);

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, params.id)
    });

    if (!course || course.instructorId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.delete(courses).where(eq(courses.id, params.id));

    return Response.json({ success: true });
  }
  ```

- [ ] Create lesson CRUD API endpoints
  ```typescript
  // app/api/lessons/route.ts
  export async function POST(request: Request) {
    const instructor = await requireRole(request, ['instructor', 'admin']);
    const body = await request.json();

    // Verify course ownership
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, body.courseId)
    });

    if (!course || course.instructorId !== instructor.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [lesson] = await db
      .insert(lessons)
      .values(body)
      .returning();

    return Response.json({ lesson }, { status: 201 });
  }

  // app/api/lessons/[id]/route.ts
  export async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const user = await requireAuth(request);

    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, params.id),
      with: {
        course: true
      }
    });

    if (!lesson) {
      return Response.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Check enrollment for students
    if (user.role === 'student') {
      const enrollment = await db.query.enrollments.findFirst({
        where: and(
          eq(enrollments.userId, user.id),
          eq(enrollments.courseId, lesson.courseId)
        )
      });

      if (!enrollment) {
        return Response.json({ error: 'Not enrolled' }, { status: 403 });
      }
    }

    return Response.json({ lesson });
  }

  export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const instructor = await requireRole(request, ['instructor', 'admin']);
    const body = await request.json();

    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, params.id),
      with: { course: true }
    });

    if (!lesson || lesson.course.instructorId !== instructor.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [updated] = await db
      .update(lessons)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(lessons.id, params.id))
      .returning();

    return Response.json({ lesson: updated });
  }

  export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const instructor = await requireRole(request, ['instructor', 'admin']);

    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, params.id),
      with: { course: true }
    });

    if (!lesson || lesson.course.instructorId !== instructor.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.delete(lessons).where(eq(lessons.id, params.id));

    return Response.json({ success: true });
  }
  ```

- [ ] Create enrollment API
  ```typescript
  // app/api/enrollments/route.ts
  export async function POST(request: Request) {
    const user = await requireAuth(request);
    const { courseId } = await request.json();

    // Check if already enrolled
    const existing = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, user.id),
        eq(enrollments.courseId, courseId)
      )
    });

    if (existing) {
      return Response.json(
        { error: 'Already enrolled' },
        { status: 400 }
      );
    }

    const [enrollment] = await db
      .insert(enrollments)
      .values({
        userId: user.id,
        courseId
      })
      .returning();

    return Response.json({ enrollment }, { status: 201 });
  }

  export async function GET(request: Request) {
    const user = await requireAuth(request);

    const userEnrollments = await db.query.enrollments.findMany({
      where: eq(enrollments.userId, user.id),
      with: {
        course: {
          with: {
            instructor: {
              columns: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    });

    return Response.json({ enrollments: userEnrollments });
  }
  ```

#### Deliverables for Path 2:
- [ ] **Course API documentation** with all endpoints
- [ ] **Lesson API documentation**
- [ ] **Enrollment flow documentation**
- [ ] **Postman/Insomnia collection** for testing

**Success Metrics:**
- [ ] CRUD operations work for courses and lessons
- [ ] Instructors can only modify their own courses
- [ ] Students can only access enrolled courses
- [ ] API response times <100ms (p95)

---

### Week 9-10: Payment System (0% Transaction Fees)

**Priority: HIGH - Solves 5-10% transaction fee pain point**

#### Tasks:
- [ ] Set up Stripe account and get API keys

- [ ] Install and configure Stripe
  ```bash
  npm install stripe @stripe/stripe-js
  ```

- [ ] Create Stripe webhook handler
  ```typescript
  // app/api/webhooks/stripe/route.ts
  import Stripe from 'stripe';

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  export async function POST(request: Request) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failed = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failed);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  }

  async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const { userId, courseId } = paymentIntent.metadata;

    // Record payment
    await db.insert(payments).values({
      userId,
      courseId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      stripePaymentId: paymentIntent.id,
      status: 'succeeded'
    });

    // Create enrollment
    await db.insert(enrollments).values({
      userId,
      courseId,
      status: 'active'
    });

    // TODO: Send confirmation email (Phase 3)
  }

  async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const { userId, courseId } = paymentIntent.metadata;

    await db.insert(payments).values({
      userId,
      courseId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      stripePaymentId: paymentIntent.id,
      status: 'failed'
    });
  }
  ```

- [ ] Create payment intent API
  ```typescript
  // app/api/payments/create-intent/route.ts
  export async function POST(request: Request) {
    const user = await requireAuth(request);
    const { courseId } = await request.json();

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId)
    });

    if (!course) {
      return Response.json({ error: 'Course not found' }, { status: 404 });
    }

    // Create Stripe customer if doesn't exist
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id
        }
      });

      stripeCustomerId = customer.id;

      await db
        .update(users)
        .set({ stripeCustomerId })
        .where(eq(users.id, user.id));
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: course.price,
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        userId: user.id,
        courseId: course.id
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret
    });
  }
  ```

- [ ] Create payment history API
  ```typescript
  // app/api/payments/history/route.ts
  export async function GET(request: Request) {
    const user = await requireAuth(request);

    const paymentHistory = await db.query.payments.findMany({
      where: eq(payments.userId, user.id),
      with: {
        course: {
          columns: {
            id: true,
            title: true
          }
        }
      },
      orderBy: [desc(payments.createdAt)]
    });

    return Response.json({ payments: paymentHistory });
  }
  ```

- [ ] Create revenue dashboard API for instructors
  ```typescript
  // app/api/instructors/revenue/route.ts
  export async function GET(request: Request) {
    const instructor = await requireRole(request, ['instructor', 'admin']);

    // Get all instructor courses
    const instructorCourses = await db.query.courses.findMany({
      where: eq(courses.instructorId, instructor.id),
      columns: {
        id: true,
        title: true,
        price: true
      }
    });

    const courseIds = instructorCourses.map(c => c.id);

    // Get payment data
    const revenue = await db
      .select({
        courseId: payments.courseId,
        totalRevenue: sql<number>`SUM(${payments.amount})`,
        totalSales: sql<number>`COUNT(*)`,
        successfulSales: sql<number>`COUNT(CASE WHEN ${payments.status} = 'succeeded' THEN 1 END)`
      })
      .from(payments)
      .where(inArray(payments.courseId, courseIds))
      .groupBy(payments.courseId);

    return Response.json({
      courses: instructorCourses,
      revenue
    });
  }
  ```

#### Deliverables for Path 2:
- [ ] **Payment integration guide** for frontend
- [ ] **Stripe Elements examples**
- [ ] **Webhook testing instructions**
- [ ] **0% platform fees confirmation** (only Stripe 2.9% + $0.30)

**Success Metrics:**
- [ ] Payment intents created successfully
- [ ] Webhooks processed within 5 seconds
- [ ] Enrollments auto-created after payment
- [ ] Refunds handled correctly
- [ ] Revenue dashboard shows accurate data

---

### Week 11-12: Gamification Backend

**Priority: HIGH - Solves 10% completion rate**

#### Tasks:
- [ ] Extend gamification schema with achievements table
  ```typescript
  export const achievements = pgTable('achievements', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    icon: text('icon'),
    xpReward: integer('xp_reward').default(0),
    type: text('type', {
      enum: ['first_lesson', 'course_completion', 'perfect_quiz', 'streak_7', 'streak_30']
    }).notNull()
  });

  export const userAchievements = pgTable('user_achievements', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    achievementId: uuid('achievement_id').references(() => achievements.id).notNull(),
    earnedAt: timestamp('earned_at').defaultNow()
  }, (table) => ({
    uniqueUserAchievement: unique().on(table.userId, table.achievementId)
  }));

  export const leaderboard = pgTable('leaderboard', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull().unique(),
    xp: integer('xp').default(0),
    rank: integer('rank'),
    updatedAt: timestamp('updated_at').defaultNow()
  });
  ```

- [ ] Create gamification API endpoints
  ```typescript
  // app/api/gamification/stats/route.ts
  export async function GET(request: Request) {
    const user = await requireAuth(request);

    const stats = await db.query.gamification.findFirst({
      where: eq(gamification.userId, user.id)
    });

    const achievements = await db.query.userAchievements.findMany({
      where: eq(userAchievements.userId, user.id),
      with: {
        achievement: true
      }
    });

    return Response.json({
      stats: stats || { xp: 0, level: 1, streakDays: 0 },
      achievements
    });
  }

  // app/api/gamification/leaderboard/route.ts
  export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const courseId = searchParams.get('courseId');

    let leaderboardData;

    if (courseId) {
      // Course-specific leaderboard
      leaderboardData = await db
        .select({
          userId: users.id,
          email: users.email,
          xp: sql<number>`SUM(
            CASE WHEN ${progress.completed} THEN 100 ELSE 0 END
          )`.as('xp')
        })
        .from(enrollments)
        .innerJoin(users, eq(users.id, enrollments.userId))
        .leftJoin(progress, eq(progress.userId, users.id))
        .where(eq(enrollments.courseId, courseId))
        .groupBy(users.id, users.email)
        .orderBy(desc(sql`xp`))
        .limit(limit);
    } else {
      // Global leaderboard
      leaderboardData = await db
        .select({
          userId: gamification.userId,
          email: users.email,
          xp: gamification.xp,
          level: gamification.level,
          streakDays: gamification.streakDays
        })
        .from(gamification)
        .innerJoin(users, eq(users.id, gamification.userId))
        .orderBy(desc(gamification.xp))
        .limit(limit);
    }

    return Response.json({ leaderboard: leaderboardData });
  }
  ```

- [ ] Create achievement check system
  ```typescript
  // lib/achievements.ts
  export async function checkAndAwardAchievements(userId: string) {
    const achievements: string[] = [];

    // Check first lesson completion
    const firstLesson = await db.query.progress.findFirst({
      where: and(
        eq(progress.userId, userId),
        eq(progress.completed, true)
      )
    });

    if (firstLesson) {
      await awardAchievement(userId, 'first_lesson');
      achievements.push('first_lesson');
    }

    // Check course completion
    const completedCourses = await db
      .select({
        courseId: enrollments.courseId,
        totalLessons: sql<number>`COUNT(DISTINCT ${lessons.id})`,
        completedLessons: sql<number>`COUNT(DISTINCT CASE WHEN ${progress.completed} THEN ${lessons.id} END)`
      })
      .from(enrollments)
      .innerJoin(lessons, eq(lessons.courseId, enrollments.courseId))
      .leftJoin(progress, and(
        eq(progress.lessonId, lessons.id),
        eq(progress.userId, userId)
      ))
      .where(eq(enrollments.userId, userId))
      .groupBy(enrollments.courseId)
      .having(sql`COUNT(DISTINCT ${lessons.id}) = COUNT(DISTINCT CASE WHEN ${progress.completed} THEN ${lessons.id} END)`);

    if (completedCourses.length > 0) {
      await awardAchievement(userId, 'course_completion');
      achievements.push('course_completion');
    }

    // Check streaks
    const userGamification = await db.query.gamification.findFirst({
      where: eq(gamification.userId, userId)
    });

    if (userGamification) {
      if (userGamification.streakDays >= 7) {
        await awardAchievement(userId, 'streak_7');
        achievements.push('streak_7');
      }

      if (userGamification.streakDays >= 30) {
        await awardAchievement(userId, 'streak_30');
        achievements.push('streak_30');
      }
    }

    return achievements;
  }

  async function awardAchievement(userId: string, achievementType: string) {
    const achievement = await db.query.achievements.findFirst({
      where: eq(achievements.type, achievementType)
    });

    if (!achievement) return;

    try {
      await db.insert(userAchievements).values({
        userId,
        achievementId: achievement.id
      });

      // Award XP
      await db
        .update(gamification)
        .set({
          xp: sql`${gamification.xp} + ${achievement.xpReward}`
        })
        .where(eq(gamification.userId, userId));
    } catch (err) {
      // Achievement already awarded
    }
  }
  ```

- [ ] Update progress save to check achievements
  ```typescript
  // In app/api/progress/save/route.ts - add to existing code
  if (completed) {
    // ... existing XP award code ...

    // Check for new achievements
    const newAchievements = await checkAndAwardAchievements(user.id);

    return Response.json({
      success: true,
      achievements: newAchievements
    });
  }
  ```

#### Deliverables for Path 2:
- [ ] **Gamification API docs**
- [ ] **Achievement trigger conditions**
- [ ] **Leaderboard integration guide**
- [ ] **XP calculation formulas**

**Success Metrics:**
- [ ] XP correctly awarded for lesson completion
- [ ] Achievements unlock at correct triggers
- [ ] Leaderboards update in real-time
- [ ] Streaks calculated correctly

---

## Phase 3: Advanced Features (Weeks 13-24)

### Week 13-18: Email Automation Backend

**Priority: HIGH - Solves 97% marketing struggle**

#### Tasks:
- [ ] Set up email service (Resend or SendGrid)
  ```bash
  npm install resend
  ```

- [ ] Create email templates in code
  ```typescript
  // lib/emails/templates.ts
  export const emailTemplates = {
    welcome: (name: string) => ({
      subject: 'Welcome to CourseFlow!',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>We're excited to have you here.</p>
      `
    }),

    courseEnrollment: (courseName: string, instructorName: string) => ({
      subject: `You're enrolled in ${courseName}`,
      html: `
        <h1>Welcome to ${courseName}</h1>
        <p>Instructor: ${instructorName}</p>
        <p>Start learning now!</p>
      `
    }),

    courseCompletion: (courseName: string) => ({
      subject: `Congratulations! You completed ${courseName}`,
      html: `
        <h1>Well done!</h1>
        <p>You've completed ${courseName}</p>
        <p>Download your certificate below.</p>
      `
    })
  };
  ```

- [ ] Create email sending API
  ```typescript
  // app/api/emails/send/route.ts
  import { Resend } from 'resend';

  const resend = new Resend(process.env.RESEND_API_KEY);

  export async function POST(request: Request) {
    await requireRole(request, ['instructor', 'admin']);

    const { to, template, variables } = await request.json();

    const emailContent = emailTemplates[template](...variables);

    const { data, error } = await resend.emails.send({
      from: 'noreply@courseflow.com',
      to,
      ...emailContent
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({ success: true, messageId: data.id });
  }
  ```

- [ ] Create drip campaign system
  ```typescript
  // Add to schema
  export const campaigns = pgTable('campaigns', {
    id: uuid('id').defaultRandom().primaryKey(),
    instructorId: uuid('instructor_id').references(() => users.id).notNull(),
    name: text('name').notNull(),
    status: text('status', { enum: ['draft', 'active', 'paused'] }).default('draft'),
    createdAt: timestamp('created_at').defaultNow()
  });

  export const campaignEmails = pgTable('campaign_emails', {
    id: uuid('id').defaultRandom().primaryKey(),
    campaignId: uuid('campaign_id').references(() => campaigns.id).notNull(),
    subject: text('subject').notNull(),
    content: text('content').notNull(),
    delayDays: integer('delay_days').notNull(), // Days after enrollment
    order: integer('order').notNull()
  });

  export const campaignEnrollments = pgTable('campaign_enrollments', {
    id: uuid('id').defaultRandom().primaryKey(),
    campaignId: uuid('campaign_id').references(() => campaigns.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    currentStep: integer('current_step').default(0),
    enrolledAt: timestamp('enrolled_at').defaultNow()
  });

  // Create cron job to send scheduled emails
  // app/api/cron/send-campaign-emails/route.ts
  export async function GET(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Find emails that should be sent
    const dueEmails = await db
      .select()
      .from(campaignEnrollments)
      .innerJoin(campaignEmails, eq(campaignEmails.campaignId, campaignEnrollments.campaignId))
      .innerJoin(users, eq(users.id, campaignEnrollments.userId))
      .where(
        and(
          eq(campaignEmails.order, campaignEnrollments.currentStep + 1),
          sql`${campaignEnrollments.enrolledAt} + INTERVAL '${campaignEmails.delayDays} days' <= ${now}`
        )
      );

    // Send emails
    for (const { campaign_enrollments, campaign_emails, users } of dueEmails) {
      await resend.emails.send({
        from: 'noreply@courseflow.com',
        to: users.email,
        subject: campaign_emails.subject,
        html: campaign_emails.content
      });

      // Update current step
      await db
        .update(campaignEnrollments)
        .set({ currentStep: campaign_emails.order })
        .where(eq(campaignEnrollments.id, campaign_enrollments.id));
    }

    return Response.json({ sent: dueEmails.length });
  }
  ```

**(Continue with more email automation features...)**

#### Deliverables for Path 2:
- [ ] **Email API documentation**
- [ ] **Email template examples**
- [ ] **Campaign creation guide**

---

### Week 19-20: Content Protection (DRM)

**Priority: CRITICAL - Protects against $63B piracy, saves 30% revenue**

#### Tasks:
- [ ] Research and implement Google Widevine DRM
  - **Note:** This is complex - may need third-party service like VdoCipher or Cloudflare Stream

- [ ] Create dynamic watermarking system
  ```typescript
  // app/api/videos/[id]/watermark/route.ts
  export async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const user = await requireAuth(request);

    // Generate user-specific watermark overlay
    const watermark = {
      text: `${user.email} - ${user.id.substring(0, 8)}`,
      position: Math.random() > 0.5 ? 'top-right' : 'bottom-left',
      opacity: 0.3,
      timestamp: new Date().toISOString()
    };

    return Response.json({ watermark });
  }
  ```

- [ ] Implement device tracking
  ```typescript
  // Add to schema
  export const userDevices = pgTable('user_devices', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    deviceId: text('device_id').notNull(),
    deviceName: text('device_name'),
    lastUsed: timestamp('last_used').defaultNow()
  });

  // app/api/devices/register/route.ts
  export async function POST(request: Request) {
    const user = await requireAuth(request);
    const { deviceId, deviceName } = await request.json();

    // Check device limit (3 devices max)
    const deviceCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userDevices)
      .where(eq(userDevices.userId, user.id));

    if (deviceCount[0].count >= 3) {
      return Response.json(
        { error: 'Device limit reached (3 devices max)' },
        { status: 403 }
      );
    }

    await db.insert(userDevices).values({
      userId: user.id,
      deviceId,
      deviceName
    });

    return Response.json({ success: true });
  }
  ```

**(See CUSTOMER_PAIN_POINTS.md for full DRM requirements)**

---

### Week 21-24: Analytics & AI Backend

**Priority: MEDIUM - Differentiator features**

#### Tasks:
- [ ] Create analytics events collection system
- [ ] Build real-time analytics aggregation
- [ ] Implement AI course assistant backend (OpenAI integration)
- [ ] Create auto-quiz generation from transcripts
- [ ] Build recommendation engine

**(Detailed implementation in subsequent planning sessions)**

---

## Integration Points with Path 2

### API Contract (Share with Path 2)

**Base URL:** `http://localhost:3000/api`

**Authentication:**
All protected endpoints require `Authorization: Bearer <token>` header

**Endpoints:**

```
# Authentication
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

# Courses
GET    /api/courses
POST   /api/courses
GET    /api/courses/[id]
PATCH  /api/courses/[id]
DELETE /api/courses/[id]

# Lessons
POST   /api/lessons
GET    /api/lessons/[id]
PATCH  /api/lessons/[id]
DELETE /api/lessons/[id]

# Enrollments
GET    /api/enrollments
POST   /api/enrollments

# Progress
POST   /api/progress/save
GET    /api/progress/[lessonId]

# Videos
POST   /api/videos/upload
GET    /api/videos/[id]/stream
GET    /api/videos/[id]/watermark

# Payments
POST   /api/payments/create-intent
GET    /api/payments/history

# Gamification
GET    /api/gamification/stats
GET    /api/gamification/leaderboard

# Revenue (Instructors)
GET    /api/instructors/revenue
```

Full API documentation with request/response examples will be shared via Postman collection.

---

## Testing Strategy

### Unit Tests
```bash
npm install -D vitest @testing-library/react
```

Write tests for:
- [ ] Database queries
- [ ] Authentication logic
- [ ] Payment processing
- [ ] Gamification calculations

### Integration Tests
- [ ] API endpoint testing
- [ ] Webhook handling
- [ ] Database transactions

### Load Testing
```bash
npm install -D artillery
```
- [ ] Test 1000 concurrent users
- [ ] Test video streaming under load
- [ ] Test database connection pooling

---

## Performance Targets

- [ ] API response time <100ms (p95)
- [ ] Video start time <2s globally
- [ ] Database query time <50ms (p95)
- [ ] 99.9% uptime
- [ ] Support 10k concurrent users

---

## Deployment

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "env": {
    "DATABASE_URL": "@database-url",
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key",
    "STRIPE_SECRET_KEY": "@stripe-secret-key",
    "RESEND_API_KEY": "@resend-api-key"
  }
}
```

### Database Migrations
```bash
# Production migration
npm run db:migrate:prod
```

---

## Monitoring & Observability

- [ ] Set up Sentry for error tracking
- [ ] Configure Vercel Analytics
- [ ] Set up Supabase monitoring
- [ ] Create uptime monitoring (UptimeRobot or Pingdom)
- [ ] Set up log aggregation

---

## Security Checklist

- [ ] Environment variables secured
- [ ] API rate limiting implemented
- [ ] SQL injection prevention (using Drizzle ORM)
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Webhook signature verification
- [ ] Row-level security on Supabase
- [ ] Input validation with Zod

---

**Next Steps:**
1. Review this plan
2. Coordinate API contracts with Path 2
3. Set up development environment
4. Begin Week 1 tasks
5. Daily sync with Path 2 developer for integration checkpoints

**Last Updated:** November 19, 2025
