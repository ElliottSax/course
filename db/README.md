# Database

This directory contains the database schema, migrations, and seed data for the Course Platform.

## Directory Structure

```
db/
├── schema/              # Drizzle ORM schema definitions
│   ├── users.ts        # User accounts
│   ├── courses.ts      # Course information
│   ├── lessons.ts      # Lesson content
│   ├── enrollments.ts  # Student enrollments and progress
│   ├── quizzes.ts      # Quizzes and attempts
│   ├── gamification.ts # XP and badges
│   ├── forum.ts        # Discussion forums
│   └── index.ts        # Schema exports
├── migrations/         # SQL migration files
│   └── 0001_initial_schema.sql
├── seed.ts            # Seed data for development
└── README.md          # This file
```

## Setup

### Prerequisites

- PostgreSQL 14+ or Supabase account
- Environment variables configured (see `.env.example`)

### Database Connection

Set your database connection in `.env.local`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/course_platform
```

For Supabase:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

## Commands

### Generate Migration

Generate a new migration from schema changes:

```bash
npm run db:generate
```

This creates a new SQL file in `db/migrations/` based on schema changes.

### Push Schema

Push schema changes directly to the database (development):

```bash
npm run db:push
```

**Warning:** This bypasses migrations. Use for rapid development only.

### Run Migrations

Apply pending migrations:

```bash
npm run db:migrate
```

### Seed Database

Populate database with sample data:

```bash
npm run db:seed
```

**Warning:** This will clear existing data! Use only in development.

### Studio

Open Drizzle Studio (visual database browser):

```bash
npm run db:studio
```

Visit: http://localhost:4983

## Schema Overview

### Users (`users`)

Stores user accounts (students, instructors, admins).

**Columns:**
- `id` - UUID primary key
- `email` - Unique email address
- `name` - User's full name
- `role` - `student`, `instructor`, or `admin`
- `avatar_url` - Profile picture URL
- `bio` - User biography
- `created_at`, `updated_at` - Timestamps

### Courses (`courses`)

Course information created by instructors.

**Columns:**
- `id` - UUID primary key
- `instructor_id` - References `users.id`
- `title` - Course title
- `description` - Course description
- `thumbnail_url` - Course image
- `price` - Price in cents
- `category` - Course category
- `is_published` - Publication status
- `created_at`, `updated_at` - Timestamps

### Lessons (`lessons`)

Individual lessons within courses.

**Columns:**
- `id` - UUID primary key
- `course_id` - References `courses.id`
- `title` - Lesson title
- `content` - Rich text content (HTML)
- `video_url` - HLS video stream URL
- `duration` - Video duration in seconds
- `order` - Display order
- `is_free_preview` - Free preview flag
- `created_at` - Timestamp

### Enrollments (`enrollments`)

Tracks student course enrollments.

**Columns:**
- `id` - UUID primary key
- `student_id` - References `users.id`
- `course_id` - References `courses.id`
- `enrolled_at` - Enrollment timestamp
- `completed_at` - Completion timestamp (nullable)
- `progress` - Progress percentage (0-100)

**Unique:** `(student_id, course_id)`

### Lesson Progress (`lesson_progress`)

Tracks individual lesson progress.

**Columns:**
- `id` - UUID primary key
- `student_id` - References `users.id`
- `lesson_id` - References `lessons.id`
- `completed` - Completion status
- `watch_time` - Total watch time in seconds
- `last_position` - Last video position in seconds
- `completed_at` - Completion timestamp
- `updated_at` - Last update timestamp

**Unique:** `(student_id, lesson_id)`

### Quizzes (`quizzes`)

Quiz definitions for lessons.

**Columns:**
- `id` - UUID primary key
- `lesson_id` - References `lessons.id`
- `title` - Quiz title
- `time_limit` - Time limit in seconds (nullable)
- `passing_score` - Minimum score to pass (default: 70)
- `questions` - JSONB array of questions
- `created_at` - Timestamp

### Quiz Attempts (`quiz_attempts`)

Student quiz submissions.

**Columns:**
- `id` - UUID primary key
- `quiz_id` - References `quizzes.id`
- `student_id` - References `users.id`
- `score` - Score percentage
- `passed` - Pass/fail status
- `answers` - JSONB object of answers
- `submitted_at` - Submission timestamp

### XP Transactions (`xp_transactions`)

Gamification XP tracking.

**Columns:**
- `id` - UUID primary key
- `user_id` - References `users.id`
- `amount` - XP amount (can be negative)
- `action` - Action that earned XP
- `metadata` - JSONB additional data
- `created_at` - Timestamp

### User Badges (`user_badges`)

Badges earned by users.

**Columns:**
- `id` - UUID primary key
- `user_id` - References `users.id`
- `badge_id` - Badge identifier
- `unlocked_at` - Unlock timestamp

**Unique:** `(user_id, badge_id)`

### Forum Posts (`forum_posts`)

Discussion forum posts.

**Columns:**
- `id` - UUID primary key
- `course_id` - References `courses.id`
- `author_id` - References `users.id`
- `title` - Post title
- `content` - Post content
- `category` - `question`, `discussion`, or `showcase`
- `tags` - Text array of tags
- `upvotes` - Upvote count
- `is_answered` - Answered status (for questions)
- `best_answer_id` - Best answer reference
- `created_at`, `updated_at` - Timestamps

### Forum Replies (`forum_replies`)

Replies to forum posts.

**Columns:**
- `id` - UUID primary key
- `post_id` - References `forum_posts.id`
- `author_id` - References `users.id`
- `content` - Reply content
- `upvotes` - Upvote count
- `is_best_answer` - Best answer flag
- `created_at`, `updated_at` - Timestamps

## Indexes

All tables have strategic indexes for performance:

- Users: `email`, `role`
- Courses: `instructor_id`, `is_published`, `category`
- Lessons: `course_id`, `(course_id, order)`
- Enrollments: `student_id`, `course_id`
- Progress: `student_id`, `lesson_id`
- Quizzes: `lesson_id`
- Quiz Attempts: `quiz_id`, `student_id`
- XP: `user_id`, `created_at DESC`
- Badges: `user_id`
- Forum: `course_id`, `author_id`, `created_at DESC`

## Sample Data

The seed script creates:

- **5 users**: 2 instructors, 2 students, 1 admin
- **3 courses**: Web Development, React, TypeScript
- **8 lessons** across all courses
- **1 quiz** with sample questions
- **4 enrollments** with varying progress
- **5 XP transactions** for students
- **4 user badges** unlocked

### Test Accounts

After seeding, you can use these accounts:

**Instructors:**
- jane.smith@example.com
- john.doe@example.com

**Students:**
- alice@example.com
- bob@example.com

**Admin:**
- admin@example.com

## Migrations

### Creating a New Migration

1. Modify schema files in `db/schema/`
2. Generate migration:
   ```bash
   npm run db:generate
   ```
3. Review generated SQL in `db/migrations/`
4. Apply migration:
   ```bash
   npm run db:migrate
   ```

### Migration Best Practices

- **Always review** generated SQL before applying
- **Test migrations** on development database first
- **Backup production** database before migrations
- **Never edit** existing migration files
- **Use transactions** for complex migrations

### Rollback

To rollback a migration, manually create a down migration:

```sql
-- db/migrations/0002_rollback_example.sql
DROP TABLE IF EXISTS new_table;
ALTER TABLE old_table ADD COLUMN removed_column TEXT;
```

## Troubleshooting

### Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

### Schema Sync Issues

```bash
# Reset database (development only!)
npm run db:push -- --force
```

### Seed Data Issues

```bash
# Clear and reseed
npm run db:seed
```

## Production Considerations

### Before Production

- [ ] Review all indexes
- [ ] Set up connection pooling
- [ ] Configure read replicas (if needed)
- [ ] Enable automated backups
- [ ] Set up monitoring and alerts
- [ ] Test migration rollback procedures

### Supabase Production

- Enable **Point-in-Time Recovery** (PITR)
- Set up **daily backups**
- Monitor **connection counts**
- Use **connection pooler** (PgBouncer)
- Enable **performance insights**

---

*Last Updated: November 19, 2025*
