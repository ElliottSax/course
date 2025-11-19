import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { lessons } from './lessons'
import { users } from './users'

export const quizzes = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  lesson_id: uuid('lesson_id')
    .references(() => lessons.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  time_limit: integer('time_limit'), // in seconds
  passing_score: integer('passing_score').notNull().default(70),
  questions: jsonb('questions').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
})

export const quiz_attempts = pgTable('quiz_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  quiz_id: uuid('quiz_id')
    .references(() => quizzes.id, { onDelete: 'cascade' })
    .notNull(),
  student_id: uuid('student_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  score: integer('score').notNull(),
  passed: boolean('passed').notNull(),
  answers: jsonb('answers').notNull(),
  submitted_at: timestamp('submitted_at').notNull().defaultNow(),
})
