import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { courses, lessons } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

async function getInstructorCourses(instructorId: string) {
  const instructorCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      price: courses.price,
      status: courses.status,
      thumbnailUrl: courses.thumbnailUrl,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
      lessonsCount: count(lessons.id),
    })
    .from(courses)
    .leftJoin(lessons, eq(courses.id, lessons.courseId))
    .where(eq(courses.instructorId, instructorId))
    .groupBy(courses.id)
    .orderBy(desc(courses.updatedAt))

  return instructorCourses
}

export default async function InstructorCoursesPage() {
  const user = await requireRole(['instructor', 'admin'])

  const instructorCourses = await getInstructorCourses(user.id)

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">
            Manage your courses and track student engagement
          </p>
        </div>
        <Link href="/instructor/courses/new">
          <Button size="lg">
            <svg
              className="w-5 h-5 mr-2"
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
            Create New Course
          </Button>
        </Link>
      </div>

      {instructorCourses.length === 0 ? (
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
            <p className="text-muted-foreground text-center mb-6">
              Get started by creating your first course and sharing your knowledge with
              students worldwide.
            </p>
            <Link href="/instructor/courses/new">
              <Button>Create Your First Course</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {instructorCourses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge
                    variant={
                      course.status === 'published'
                        ? 'default'
                        : course.status === 'draft'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {course.status}
                  </Badge>
                  <Link href={`/instructor/courses/${course.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <svg
                        className="w-4 h-4"
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
                    </Button>
                  </Link>
                </div>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Lessons</span>
                    <span className="font-medium">{course.lessonsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">
                      ${(course.price / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span className="font-medium">
                      {new Date(course.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Link href={`/instructor/courses/${course.id}/lessons`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Manage Lessons
                  </Button>
                </Link>
                <Link href={`/courses/${course.id}`} className="flex-1">
                  <Button variant="ghost" className="w-full">
                    Preview
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
