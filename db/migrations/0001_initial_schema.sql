-- Course Platform Initial Schema Migration
-- Created: November 19, 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- Users Table
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ==========================================
-- Courses Table
-- ==========================================
CREATE TABLE IF NOT EXISTS courses (
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

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_published ON courses(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_courses_category ON courses(category);

-- ==========================================
-- Lessons Table
-- ==========================================
CREATE TABLE IF NOT EXISTS lessons (
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

CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_order ON lessons(course_id, "order");

-- ==========================================
-- Enrollments Table
-- ==========================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  progress INTEGER NOT NULL DEFAULT 0,
  UNIQUE(student_id, course_id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- ==========================================
-- Lesson Progress Table
-- ==========================================
CREATE TABLE IF NOT EXISTS lesson_progress (
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

CREATE INDEX idx_progress_student ON lesson_progress(student_id);
CREATE INDEX idx_progress_lesson ON lesson_progress(lesson_id);

-- ==========================================
-- Quizzes Table
-- ==========================================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  time_limit INTEGER,
  passing_score INTEGER NOT NULL DEFAULT 70,
  questions JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quizzes_lesson ON quizzes(lesson_id);

-- ==========================================
-- Quiz Attempts Table
-- ==========================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_attempts_student ON quiz_attempts(student_id);

-- ==========================================
-- XP Transactions Table
-- ==========================================
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_xp_user ON xp_transactions(user_id);
CREATE INDEX idx_xp_created ON xp_transactions(created_at DESC);

-- ==========================================
-- User Badges Table
-- ==========================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_badges_user ON user_badges(user_id);

-- ==========================================
-- Forum Posts Table
-- ==========================================
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('question', 'discussion', 'showcase')),
  tags TEXT[],
  upvotes INTEGER NOT NULL DEFAULT 0,
  is_answered BOOLEAN NOT NULL DEFAULT FALSE,
  best_answer_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_course ON forum_posts(course_id);
CREATE INDEX idx_posts_author ON forum_posts(author_id);
CREATE INDEX idx_posts_created ON forum_posts(created_at DESC);

-- ==========================================
-- Forum Replies Table
-- ==========================================
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  is_best_answer BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_replies_post ON forum_replies(post_id);
CREATE INDEX idx_replies_author ON forum_replies(author_id);

-- ==========================================
-- Triggers for updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
