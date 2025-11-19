import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { CourseForm } from '@/components/instructor/course-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getCourse(courseId: string, instructorId: string) {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1)

  if (!course) return null
  if (course.instructorId !== instructorId) return null

  return course
}

export default async function EditCoursePage({
  params,
}: {
  params: { courseId: string }
}) {
  const user = await requireRole(['instructor', 'admin'])
  const course = await getCourse(params.courseId, user.id)

  if (!course && user.role !== 'admin') {
    notFound()
  }

  if (!course) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Edit Course</CardTitle>
          <p className="text-muted-foreground">
            Update your course details and settings.
          </p>
        </CardHeader>
        <CardContent>
          <CourseForm course={course} />
        </CardContent>
      </Card>
    </div>
  )
}
