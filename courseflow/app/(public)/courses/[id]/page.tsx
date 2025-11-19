import { notFound } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

async function getCourse(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

  try {
    const response = await fetch(`${baseUrl}/api/courses/${id}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.course
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

export default async function CoursePage({
  params,
}: {
  params: { id: string }
}) {
  const course = await getCourse(params.id)
  const user = await getUser()

  if (!course) {
    notFound()
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(course.price / 100)

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {course.thumbnailUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-xl mb-6">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>

          <div className="flex items-center gap-4 text-muted-foreground mb-6">
            <span>By {course.instructor?.email || 'Unknown'}</span>
            {course.category && (
              <>
                <span>•</span>
                <span className="capitalize">{course.category}</span>
              </>
            )}
            {course.enrollmentCount > 0 && (
              <>
                <span>•</span>
                <span>{course.enrollmentCount} students enrolled</span>
              </>
            )}
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-2xl font-semibold mb-4">About this course</h2>
            <p>{course.description}</p>
          </div>

          {course.lessons && course.lessons.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Course Content</h2>
              <div className="space-y-2">
                {course.lessons.map((lesson: any, index: number) => (
                  <Card key={lesson.id}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {index + 1}. {lesson.title}
                      </CardTitle>
                      {lesson.duration && (
                        <CardDescription>
                          {Math.floor(lesson.duration / 60)} minutes
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-3xl">{formattedPrice}</CardTitle>
              <CardDescription>One-time purchase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user ? (
                <>
                  <Button asChild className="w-full" size="lg">
                    <Link href="/login?redirect=/courses/${params.id}">
                      Sign in to Enroll
                    </Link>
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Create an account to start learning
                  </p>
                </>
              ) : course.isEnrolled ? (
                <Button asChild className="w-full" size="lg">
                  <Link href={`/courses/${params.id}/lessons/${course.lessons[0]?.id}`}>
                    Continue Learning
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild className="w-full" size="lg">
                    <Link href={`/courses/${params.id}/checkout`}>
                      Enroll Now
                    </Link>
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    30-day money-back guarantee
                  </p>
                </>
              )}

              <div className="pt-4 border-t space-y-2">
                <h3 className="font-semibold mb-2">This course includes:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Lifetime access
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {course.lessons?.length || 0} lessons
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Certificate of completion
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    AI teaching assistant
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
