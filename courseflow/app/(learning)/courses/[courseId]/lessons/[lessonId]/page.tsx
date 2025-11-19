import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { courses, lessons, enrollments, progress } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { VideoPlayer } from '@/components/video/video-player'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

async function getLessonData(courseId: string, lessonId: string, userId?: string) {
  // Get the course
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1)

  if (!course) return null

  // Get all lessons for sidebar
  const allLessons = await db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, courseId))
    .orderBy(asc(lessons.order))

  // Get the current lesson
  const currentLesson = allLessons.find(l => l.id === lessonId)
  if (!currentLesson) return null

  // Get user's progress if logged in
  let userProgress = null
  if (userId) {
    const [progressData] = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, userId),
          eq(progress.lessonId, lessonId)
        )
      )
      .limit(1)

    userProgress = progressData
  }

  return {
    course,
    currentLesson,
    allLessons,
    userProgress,
  }
}

async function checkEnrollment(userId: string, courseId: string) {
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

  return !!enrollment
}

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const user = await getUser()

  if (!user) {
    redirect(`/login?redirect=/courses/${params.courseId}/lessons/${params.lessonId}`)
  }

  // Check enrollment
  const isEnrolled = await checkEnrollment(user.id, params.courseId)

  if (!isEnrolled) {
    redirect(`/courses/${params.courseId}`)
  }

  const data = await getLessonData(params.courseId, params.lessonId, user.id)

  if (!data) {
    notFound()
  }

  const { course, currentLesson, allLessons, userProgress } = data

  // Find next and previous lessons
  const currentIndex = allLessons.findIndex(l => l.id === params.lessonId)
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  // Calculate course progress
  const completedLessons = allLessons.filter(l => {
    // This would need to be fetched from DB in a real implementation
    return false // Placeholder
  }).length
  const courseProgress = (completedLessons / allLessons.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          {/* Top Navigation */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={`/courses/${params.courseId}`}>
                  <Button variant="ghost" size="sm">
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back to Course
                  </Button>
                </Link>
                <div>
                  <h1 className="text-lg font-semibold">{course.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Lesson {currentIndex + 1} of {allLessons.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previousLesson && (
                  <Link href={`/courses/${params.courseId}/lessons/${previousLesson.id}`}>
                    <Button variant="outline" size="sm">
                      Previous
                    </Button>
                  </Link>
                )}
                {nextLesson && (
                  <Link href={`/courses/${params.courseId}/lessons/${nextLesson.id}`}>
                    <Button size="sm">
                      Next Lesson
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="bg-black">
            {currentLesson.videoUrl ? (
              <div className="container mx-auto max-w-6xl">
                <VideoPlayer
                  videoUrl={currentLesson.videoUrl}
                  lessonId={currentLesson.id}
                  initialPosition={userProgress?.lastPosition || 0}
                />
              </div>
            ) : (
              <div className="container mx-auto max-w-6xl aspect-video flex items-center justify-center">
                <p className="text-white">No video available for this lesson</p>
              </div>
            )}
          </div>

          {/* Lesson Content */}
          <div className="container mx-auto max-w-6xl px-6 py-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">{currentLesson.title}</h2>
                {currentLesson.content && (
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {currentLesson.content}
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                {previousLesson ? (
                  <Link href={`/courses/${params.courseId}/lessons/${previousLesson.id}`}>
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
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Previous: {previousLesson.title}
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}

                {nextLesson ? (
                  <Link href={`/courses/${params.courseId}/lessons/${nextLesson.id}`}>
                    <Button>
                      Next: {nextLesson.title}
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/courses/${params.courseId}`}>
                    <Button variant="outline">
                      Back to Course
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Lesson List */}
        <div className="w-80 bg-white border-l overflow-y-auto h-screen sticky top-0">
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Course Content</h3>
              <div className="text-sm text-muted-foreground">
                {completedLessons} / {allLessons.length} lessons completed
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${courseProgress}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {allLessons.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  href={`/courses/${params.courseId}/lessons/${lesson.id}`}
                >
                  <div
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      lesson.id === params.lessonId
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                          lesson.id === params.lessonId
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm line-clamp-2">
                          {lesson.title}
                        </div>
                        {lesson.duration && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {Math.floor(lesson.duration / 60)} min
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
