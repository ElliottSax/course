import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { courses, enrollments } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { redirect } from 'next/navigation'

async function getCourseWithEnrollment(courseId: string, userId: string) {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1)

  if (!course) return null

  const [enrollment] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId)
      )
    )
    .limit(1)

  return { course, enrollment }
}

export default async function SuccessPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const data = await getCourseWithEnrollment(params.id, user.id)

  if (!data?.course) {
    redirect('/courses')
  }

  const { course, enrollment } = data

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  className="w-12 h-12 text-green-600"
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
              </div>
            </div>
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
            <CardDescription className="text-base">
              You're now enrolled in {course.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Course</span>
                <span className="font-medium">{course.title}</span>
              </div>
              {enrollment && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Enrolled</span>
                  <span className="font-medium">
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Access</span>
                <span className="font-medium">Lifetime</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">What's next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    You'll receive a confirmation email with your receipt
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Start learning immediately - all course content is now available
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Track your progress and earn XP as you complete lessons
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1" size="lg">
                <Link href={`/courses/${params.id}`}>
                  Start Learning
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1" size="lg">
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground pt-4">
              Remember: You have a 30-day money-back guarantee. If you're not satisfied,
              you can request a full refund anytime within 30 days.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
