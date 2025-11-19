# Database Schema Documentation

Complete database schema reference for the Course Platform using PostgreSQL and Drizzle ORM.

## Table of Contents

- [Overview](#overview)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Tables](#tables)
- [Indexes](#indexes)
- [Migrations](#migrations)
- [Sample Queries](#sample-queries)

---

## Overview

The database is designed with the following principles:

- **Normalization**: Properly normalized to 3NF to reduce redundancy
- **Performance**: Strategic indexes on frequently queried columns
- **Scalability**: UUID primary keys for distributed systems
- **Audit**: Created/updated timestamps on all tables
- **Type Safety**: Full TypeScript types via Drizzle ORM

### Technology Stack

- **Database**: PostgreSQL 14+
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle Kit
- **Hosting**: Supabase (production), Local PostgreSQL (development)

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    Users    │       │   Courses    │       │   Lessons   │
│             │       │              │       │             │
│ id (PK)     │───┐   │ id (PK)      │───┐   │ id (PK)     │
│ email       │   │   │ instructor_id│   │   │ course_id   │
│ name        │   │   │ title        │   │   │ title       │
│ role        │   │   │ description  │   │   │ content     │
│ avatar_url  │   │   │ price        │   │   │ video_url   │
└─────────────┘   │   │ is_published │   │   │ duration    │
                  │   └──────────────┘   │   └─────────────┘
                  │                      │
                  │   ┌──────────────┐   │   ┌─────────────┐
                  └──▶│ Enrollments  │   │   │   Quizzes   │
                      │              │   │   │             │
                      │ id (PK)      │   │   │ id (PK)     │
                      │ student_id   │   │   │ lesson_id   │
                      │ course_id    │   │   │ title       │
                      │ progress     │   │   │ questions   │
                      └──────────────┘   │   └─────────────┘
                                        │
        ┌───────────────┐               │   ┌─────────────────┐
        │Lesson Progress│               └──▶│ Quiz Attempts   │
        │               │                   │                 │
        │ id (PK)       │                   │ id (PK)         │
        │ student_id    │                   │ quiz_id         │
        │ lesson_id     │                   │ student_id      │
        │ completed     │                   │ score           │
        │ watch_time    │                   │ answers         │
        └───────────────┘                   │ passed          │
                                            └─────────────────┘

┌──────────────────┐       ┌─────────────┐       ┌─────────────┐
│ XP Transactions  │       │   Badges    │       │Forum Posts  │
│                  │       │             │       │             │
│ id (PK)          │       │ id (PK)     │       │ id (PK)     │
│ user_id          │       │ name        │       │ course_id   │
│ amount           │       │ description │       │ author_id   │
│ action           │       │ icon        │       │ title       │
│ created_at       │       │ criteria    │       │ content     │
└──────────────────┘       └─────────────┘       └─────────────┘
```

---

## Tables

### users

Stores user accounts (students, instructors, admins).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Drizzle Schema:**
```typescript
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: ['student', 'instructor', 'admin'] }).notNull().default('student'),
  avatar_url: text('avatar_url'),
  bio: text('bio'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
})
```

**Indexes:**
- `idx_users_email` on `email` (unique, for login)
- `idx_users_role` on `role` (filter by role)

---

### courses

Stores course information.

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Drizzle Schema:**
```typescript
export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  instructor_id: uuid('instructor_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  thumbnail_url: text('thumbnail_url'),
  price: integer('price').notNull().default(0),
  category: text('category'),
  is_published: boolean('is_published').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
})
```

**Indexes:**
- `idx_courses_instructor` on `instructor_id`
- `idx_courses_published` on `is_published`
- `idx_courses_category` on `category`

---

### lessons

Stores lesson content for courses.

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  duration INTEGER,
  "order" INTEGER NOT NULL,
  is_free_preview BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Drizzle Schema:**
```typescript
export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  course_id: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  content: text('content'),
  video_url: text('video_url'),
  duration: integer('duration'),
  order: integer('order').notNull(),
  is_free_preview: boolean('is_free_preview').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow()
})
```

**Indexes:**
- `idx_lessons_course` on `course_id`
- `idx_lessons_order` on `course_id, order` (composite for ordering)

---

### enrollments

Tracks student enrollments in courses.

```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  progress INTEGER NOT NULL DEFAULT 0,
  UNIQUE(student_id, course_id)
);
```

**Drizzle Schema:**
```typescript
export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  student_id: uuid('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  course_id: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  enrolled_at: timestamp('enrolled_at').notNull().defaultNow(),
  completed_at: timestamp('completed_at'),
  progress: integer('progress').notNull().default(0)
}, (table) => ({
  unq: unique().on(table.student_id, table.course_id)
}))
```

**Indexes:**
- `idx_enrollments_student` on `student_id`
- `idx_enrollments_course` on `course_id`
- `unq_student_course` on `student_id, course_id` (unique constraint)

---

### lesson_progress

Tracks individual lesson progress for students.

```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  watch_time INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);
```

**Drizzle Schema:**
```typescript
export const lesson_progress = pgTable('lesson_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  student_id: uuid('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  lesson_id: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }).notNull(),
  completed: boolean('completed').notNull().default(false),
  watch_time: integer('watch_time').default(0),
  last_position: integer('last_position').default(0),
  completed_at: timestamp('completed_at'),
  updated_at: timestamp('updated_at').notNull().defaultNow()
}, (table) => ({
  unq: unique().on(table.student_id, table.lesson_id)
}))
```

**Indexes:**
- `idx_progress_student` on `student_id`
- `idx_progress_lesson` on `lesson_id`

---

### quizzes

Stores quiz information for lessons.

```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  time_limit INTEGER,
  passing_score INTEGER NOT NULL DEFAULT 70,
  questions JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Drizzle Schema:**
```typescript
export const quizzes = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  lesson_id: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  time_limit: integer('time_limit'),
  passing_score: integer('passing_score').notNull().default(70),
  questions: jsonb('questions').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow()
})
```

**Indexes:**
- `idx_quizzes_lesson` on `lesson_id`

---

### quiz_attempts

Tracks student quiz attempts.

```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Drizzle Schema:**
```typescript
export const quiz_attempts = pgTable('quiz_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  quiz_id: uuid('quiz_id').references(() => quizzes.id, { onDelete: 'cascade' }).notNull(),
  student_id: uuid('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  score: integer('score').notNull(),
  passed: boolean('passed').notNull(),
  answers: jsonb('answers').notNull(),
  submitted_at: timestamp('submitted_at').notNull().defaultNow()
})
```

**Indexes:**
- `idx_attempts_quiz` on `quiz_id`
- `idx_attempts_student` on `student_id`

---

### xp_transactions

Tracks XP (experience points) transactions for gamification.

```sql
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Drizzle Schema:**
```typescript
export const xp_transactions = pgTable('xp_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: integer('amount').notNull(),
  action: text('action').notNull(),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').notNull().defaultNow()
})
```

**Indexes:**
- `idx_xp_user` on `user_id`
- `idx_xp_created` on `created_at` (for leaderboards)

---

### user_badges

Tracks badges earned by users.

```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```

**Drizzle Schema:**
```typescript
export const user_badges = pgTable('user_badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  badge_id: text('badge_id').notNull(),
  unlocked_at: timestamp('unlocked_at').notNull().defaultNow()
}, (table) => ({
  unq: unique().on(table.user_id, table.badge_id)
}))
```

**Indexes:**
- `idx_badges_user` on `user_id`

---

### forum_posts

Discussion forum posts.

```sql
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  upvotes INTEGER NOT NULL DEFAULT 0,
  is_answered BOOLEAN NOT NULL DEFAULT FALSE,
  best_answer_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Drizzle Schema:**
```typescript
export const forum_posts = pgTable('forum_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  course_id: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  author_id: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category', { enum: ['question', 'discussion', 'showcase'] }).notNull(),
  tags: text('tags').array(),
  upvotes: integer('upvotes').notNull().default(0),
  is_answered: boolean('is_answered').notNull().default(false),
  best_answer_id: uuid('best_answer_id'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
})
```

**Indexes:**
- `idx_posts_course` on `course_id`
- `idx_posts_author` on `author_id`
- `idx_posts_created` on `created_at DESC` (for recent posts)

---

### forum_replies

Replies to forum posts.

```sql
CREATE TABLE forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  is_best_answer BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Drizzle Schema:**
```typescript
export const forum_replies = pgTable('forum_replies', {
  id: uuid('id').primaryKey().defaultRandom(),
  post_id: uuid('post_id').references(() => forum_posts.id, { onDelete: 'cascade' }).notNull(),
  author_id: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  upvotes: integer('upvotes').notNull().default(0),
  is_best_answer: boolean('is_best_answer').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
})
```

**Indexes:**
- `idx_replies_post` on `post_id`
- `idx_replies_author` on `author_id`

---

## Indexes

### Performance Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Courses
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_published ON courses(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_courses_category ON courses(category);

-- Lessons
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_order ON lessons(course_id, "order");

-- Enrollments
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- Progress
CREATE INDEX idx_progress_student ON lesson_progress(student_id);
CREATE INDEX idx_progress_lesson ON lesson_progress(lesson_id);

-- Quizzes
CREATE INDEX idx_quizzes_lesson ON quizzes(lesson_id);
CREATE INDEX idx_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_attempts_student ON quiz_attempts(student_id);

-- Gamification
CREATE INDEX idx_xp_user ON xp_transactions(user_id);
CREATE INDEX idx_xp_created ON xp_transactions(created_at DESC);
CREATE INDEX idx_badges_user ON user_badges(user_id);

-- Forum
CREATE INDEX idx_posts_course ON forum_posts(course_id);
CREATE INDEX idx_posts_created ON forum_posts(created_at DESC);
CREATE INDEX idx_replies_post ON forum_replies(post_id);
```

---

## Migrations

### Running Migrations

```bash
# Generate migration from schema changes
npm run db:generate

# Apply migrations to database
npm run db:push

# View current database state
npm run db:studio
```

### Migration Files

Migrations are stored in `db/migrations/` and automatically generated by Drizzle Kit.

Example migration:

```sql
-- db/migrations/0001_add_courses.sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
```

---

## Sample Queries

### Get course with lessons and stats

```typescript
const course = await db.query.courses.findFirst({
  where: eq(courses.id, courseId),
  with: {
    instructor: {
      columns: {
        id: true,
        name: true,
        avatar_url: true
      }
    },
    lessons: {
      orderBy: (lessons, { asc }) => [asc(lessons.order)]
    }
  }
})

// Get enrollment count
const studentCount = await db
  .select({ count: count() })
  .from(enrollments)
  .where(eq(enrollments.course_id, courseId))
```

### Get student progress

```typescript
const progress = await db.query.lesson_progress.findMany({
  where: and(
    eq(lesson_progress.student_id, studentId),
    eq(lessons.course_id, courseId)
  ),
  with: {
    lesson: true
  }
})

const completedCount = progress.filter(p => p.completed).length
const progressPercentage = (completedCount / progress.length) * 100
```

### Get leaderboard

```typescript
const leaderboard = await db
  .select({
    user_id: xp_transactions.user_id,
    total_xp: sum(xp_transactions.amount).as('total_xp'),
    user: {
      name: users.name,
      avatar_url: users.avatar_url
    }
  })
  .from(xp_transactions)
  .innerJoin(users, eq(users.id, xp_transactions.user_id))
  .groupBy(xp_transactions.user_id, users.name, users.avatar_url)
  .orderBy(desc(sql`total_xp`))
  .limit(10)
```

---

## Database Management

### Backup Strategy

```bash
# Create backup
pg_dump -h localhost -U postgres -d course_platform > backup.sql

# Restore from backup
psql -h localhost -U postgres -d course_platform < backup.sql
```

### Supabase Backups

Supabase provides automatic daily backups on paid plans. Manual backups can be triggered from the dashboard.

---

## Best Practices

### 1. Use Transactions for Related Operations

```typescript
await db.transaction(async (tx) => {
  // Create enrollment
  await tx.insert(enrollments).values({
    student_id: studentId,
    course_id: courseId
  })

  // Award XP
  await tx.insert(xp_transactions).values({
    user_id: studentId,
    amount: 50,
    action: 'ENROLL_COURSE'
  })
})
```

### 2. Use Prepared Statements

```typescript
const getCourse = db.query.courses.findFirst({
  where: eq(courses.id, sql.placeholder('id'))
}).prepare('get_course')

// Reuse prepared statement
const course1 = await getCourse.execute({ id: 'course_1' })
const course2 = await getCourse.execute({ id: 'course_2' })
```

### 3. Index Common Query Patterns

```sql
-- For searching courses by title
CREATE INDEX idx_courses_title_trgm ON courses USING gin(title gin_trgm_ops);

-- For filtering published courses by category
CREATE INDEX idx_courses_published_category ON courses(category, is_published)
  WHERE is_published = TRUE;
```

---

*Last Updated: November 19, 2025*
