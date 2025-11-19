import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { courses } from './courses'

export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  course_id: uuid('course_id')
    .references(() => courses.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  content: text('content'),
  video_url: text('video_url'),
  duration: integer('duration'),
  order: integer('order').notNull(),
  is_free_preview: boolean('is_free_preview').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
})
