import { requireRole } from '@/lib/auth'
import { CourseForm } from '@/components/instructor/course-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function NewCoursePage() {
  await requireRole(['instructor', 'admin'])

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create New Course</CardTitle>
          <p className="text-muted-foreground">
            Fill in the details below to create your course. You can add lessons after
            creating the course.
          </p>
        </CardHeader>
        <CardContent>
          <CourseForm />
        </CardContent>
      </Card>
    </div>
  )
}
