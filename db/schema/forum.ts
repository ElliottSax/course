import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { courses } from './courses'
import { users } from './users'

export const forum_posts = pgTable('forum_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  course_id: uuid('course_id')
    .references(() => courses.id, { onDelete: 'cascade' })
    .notNull(),
  author_id: uuid('author_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category', { enum: ['question', 'discussion', 'showcase'] }).notNull(),
  tags: text('tags').array(),
  upvotes: integer('upvotes').notNull().default(0),
  is_answered: boolean('is_answered').notNull().default(false),
  best_answer_id: uuid('best_answer_id'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

export const forum_replies = pgTable('forum_replies', {
  id: uuid('id').primaryKey().defaultRandom(),
  post_id: uuid('post_id')
    .references(() => forum_posts.id, { onDelete: 'cascade' })
    .notNull(),
  author_id: uuid('author_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  content: text('content').notNull(),
  upvotes: integer('upvotes').notNull().default(0),
  is_best_answer: boolean('is_best_answer').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})
