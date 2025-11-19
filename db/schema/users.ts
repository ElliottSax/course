import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: ['student', 'instructor', 'admin'] }).notNull().default('student'),
  avatar_url: text('avatar_url'),
  bio: text('bio'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})
