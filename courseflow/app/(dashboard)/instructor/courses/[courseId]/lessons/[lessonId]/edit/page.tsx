import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { courses, lessons } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { LessonForm } from '@/components/instructor/lesson-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getLesson(courseId: string, lessonId: string, instructorId: string) {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1)

  if (!course) return null
  if (course.instructorId !== instructorId) return null

  const [lesson] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.id, lessonId), eq(lessons.courseId, courseId)))
    .limit(1)

  if (!lesson) return null

  return { course, lesson }
}

export default async function EditLessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const user = await requireRole(['instructor', 'admin'])
  const data = await getLesson(params.courseId, params.lessonId, user.id)

  if (!data && user.role !== 'admin') {
    notFound()
  }

  if (!data) {
    notFound()
  }

  const { course, lesson } = data

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-4">
        <Link
          href={`/instructor/courses/${params.courseId}/lessons`}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
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
          Back to Lessons
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Edit Lesson</CardTitle>
          <p className="text-muted-foreground">
            Update lesson for <strong>{course.title}</strong>
          </p>
        </CardHeader>
        <CardContent>
          <LessonForm courseId={params.courseId} lesson={lesson} />
        </CardContent>
      </Card>
    </div>
  )
}
