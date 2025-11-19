import { pgTable, uuid, integer, boolean, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { courses } from './courses'
import { lessons } from './lessons'

export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  student_id: uuid('student_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  course_id: uuid('course_id')
    .references(() => courses.id, { onDelete: 'cascade' })
    .notNull(),
  enrolled_at: timestamp('enrolled_at').notNull().defaultNow(),
  completed_at: timestamp('completed_at'),
  progress: integer('progress').notNull().default(0),
}, (table) => ({
  unq_student_course: unique().on(table.student_id, table.course_id),
}))

export const lesson_progress = pgTable('lesson_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  student_id: uuid('student_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  lesson_id: uuid('lesson_id')
    .references(() => lessons.id, { onDelete: 'cascade' })
    .notNull(),
  completed: boolean('completed').notNull().default(false),
  watch_time: integer('watch_time').default(0),
  last_position: integer('last_position').default(0),
  completed_at: timestamp('completed_at'),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  unq_student_lesson: unique().on(table.student_id, table.lesson_id),
}))
