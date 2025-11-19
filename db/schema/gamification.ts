import { pgTable, uuid, text, integer, timestamp, jsonb, unique } from 'drizzle-orm/pg-core'
import { users } from './users'

export const xp_transactions = pgTable('xp_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  amount: integer('amount').notNull(),
  action: text('action').notNull(),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').notNull().defaultNow(),
})

export const user_badges = pgTable('user_badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  badge_id: text('badge_id').notNull(),
  unlocked_at: timestamp('unlocked_at').notNull().defaultNow(),
}, (table) => ({
  unq_user_badge: unique().on(table.user_id, table.badge_id),
}))
