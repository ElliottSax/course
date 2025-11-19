import { pgTable, uuid, text, timestamp, integer, boolean, serial, jsonb } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Users table (extends Supabase auth.users)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().references(() => sql`auth.users(id)`),
  email: text('email').notNull().unique(),
  role: text('role', { enum: ['student', 'instructor', 'admin'] }).notNull().default('student'),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Courses table
export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  instructorId: uuid('instructor_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(), // in cents
  category: text('category'),
  tags: text('tags').array(),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).default('draft').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Lessons table
export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  content: text('content'),
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  duration: integer('duration'), // in seconds
  order: integer('order').notNull(),
  quiz: jsonb('quiz'), // Quiz questions in JSON format
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Enrollments table
export const enrollments = pgTable('enrollments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  courseId: uuid('course_id').references(() => courses.id).notNull(),
  status: text('status', { enum: ['active', 'completed', 'cancelled'] }).default('active').notNull(),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at')
})

// Progress table
export const progress = pgTable('progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }).notNull(),
  completed: boolean('completed').default(false).notNull(),
  timeWatched: integer('time_watched').default(0).notNull(), // in seconds
  lastPosition: integer('last_position').default(0).notNull(), // in seconds
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Gamification table
export const gamification = pgTable('gamification', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  xp: integer('xp').default(0).notNull(),
  level: integer('level').default(1).notNull(),
  streakDays: integer('streak_days').default(0).notNull(),
  lastActive: timestamp('last_active').defaultNow().notNull(),
  badges: jsonb('badges').default('[]').notNull() // Array of badge IDs
})

// Analytics Events table
export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  eventType: text('event_type').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Email Campaigns table
export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  instructorId: uuid('instructor_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  status: text('status', { enum: ['draft', 'active', 'paused'] }).default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Campaign Emails table
export const campaignEmails = pgTable('campaign_emails', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  subject: text('subject').notNull(),
  content: text('content').notNull(),
  delayDays: integer('delay_days').notNull(),
  order: integer('order').notNull()
})

// Email Events table
export const emailEvents = pgTable('email_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  emailType: text('email_type').notNull(),
  eventType: text('event_type', {
    enum: ['sent', 'opened', 'clicked', 'bounced', 'complained']
  }).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// User Devices table (for DRM)
export const userDevices = pgTable('user_devices', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  deviceId: text('device_id').notNull(),
  deviceName: text('device_name'),
  lastUsed: timestamp('last_used').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// AI Conversations table
export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  courseId: uuid('course_id').references(() => courses.id).notNull(),
  messages: jsonb('messages').notNull(), // Array of messages
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Support Tickets table
export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketNumber: serial('ticket_number').notNull().unique(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id),
  category: text('category', {
    enum: ['billing', 'technical', 'content', 'account', 'other']
  }).notNull(),
  priority: text('priority', {
    enum: ['low', 'medium', 'high', 'urgent']
  }).notNull(),
  status: text('status', {
    enum: ['open', 'in_progress', 'waiting', 'resolved', 'closed']
  }).default('open').notNull(),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at')
})

// Ticket Messages table
export const ticketMessages = pgTable('ticket_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: uuid('ticket_id').references(() => supportTickets.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  isInternal: boolean('is_internal').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Knowledge Base Articles table
export const knowledgeBaseArticles = pgTable('knowledge_base_articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  tags: text('tags').array(),
  viewCount: integer('view_count').default(0).notNull(),
  helpfulCount: integer('helpful_count').default(0).notNull(),
  published: boolean('published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Performance Metrics table
export const performanceMetrics = pgTable('performance_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  metricType: text('metric_type').notNull(),
  endpoint: text('endpoint'),
  method: text('method'),
  duration: integer('duration').notNull(), // in milliseconds
  statusCode: integer('status_code'),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp').defaultNow().notNull()
})
