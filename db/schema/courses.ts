import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  instructor_id: uuid('instructor_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  thumbnail_url: text('thumbnail_url'),
  price: integer('price').notNull().default(0),
  category: text('category'),
  is_published: boolean('is_published').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})
