import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { courses, lessons } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LessonList } from '@/components/instructor/lesson-list'

async function getCourseWithLessons(courseId: string, instructorId: string) {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1)

  if (!course) return null
  if (course.instructorId !== instructorId) return null

  const courseLessons = await db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, courseId))
    .orderBy(asc(lessons.order))

  return { course, lessons: courseLessons }
}

export default async function CourseLessonsPage({
  params,
}: {
  params: { courseId: string }
}) {
  const user = await requireRole(['instructor', 'admin'])
  const data = await getCourseWithLessons(params.courseId, user.id)

  if (!data && user.role !== 'admin') {
    notFound()
  }

  if (!data) {
    notFound()
  }

  const { course, lessons: courseLessons } = data

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link
              href="/instructor/courses"
              className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Courses
            </Link>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">Manage your course lessons</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/instructor/courses/${params.courseId}/edit`}>
              <Button variant="outline">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Course
              </Button>
            </Link>
            <Link href={`/instructor/courses/${params.courseId}/lessons/new`}>
              <Button>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Lesson
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {courseLessons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <svg
              className="w-16 h-16 text-muted-foreground mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No lessons yet</h2>
            <p className="text-muted-foreground text-center mb-6">
              Start building your course by adding your first lesson.
            </p>
            <Link href={`/instructor/courses/${params.courseId}/lessons/new`}>
              <Button>Add Your First Lesson</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <LessonList courseId={params.courseId} lessons={courseLessons} />
      )}
    </div>
  )
}
