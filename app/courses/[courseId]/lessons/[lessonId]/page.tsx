import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { VideoPlayer } from '@/components/course/video-player'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

async function getLesson(lessonId: string, userId: string) {
  // In production, fetch from API
  return null
}

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const lesson = await getLesson(params.lessonId, session.user.id)

  if (!lesson) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Video Section */}
      <div className="bg-black">
        <div className="container py-8">
          <VideoPlayer
            src={lesson.video_url || ''}
            poster={lesson.thumbnail_url}
            onProgress={(currentTime, duration) => {
              // Update progress in background
              fetch(`/api/lessons/${params.lessonId}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  watch_time: Math.floor(currentTime),
                  last_position: Math.floor(currentTime),
                }),
              })
            }}
            onComplete={() => {
              // Mark as complete
              fetch(`/api/lessons/${params.lessonId}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  watch_time: lesson.duration,
                  last_position: lesson.duration,
                  completed: true,
                }),
              })
            }}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Link
                href={`/courses/${params.courseId}`}
                className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Course
              </Link>
              <h1 className="mb-4 text-3xl font-bold">{lesson.title}</h1>
            </div>

            <Card className="p-6">
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.content || '' }}
              />
            </Card>

            {/* Mark Complete */}
            {!lesson.completed && (
              <Card className="mt-6 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Ready to move on?</h3>
                    <p className="text-sm text-muted-foreground">
                      Mark this lesson as complete to track your progress
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      fetch(`/api/lessons/${params.lessonId}/progress`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          watch_time: lesson.duration,
                          last_position: lesson.duration,
                          completed: true,
                        }),
                      }).then(() => {
                        window.location.reload()
                      })
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Complete
                  </Button>
                </div>
              </Card>
            )}

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              {lesson.previousLesson ? (
                <Button variant="outline" asChild>
                  <Link href={`/courses/${params.courseId}/lessons/${lesson.previousLesson.id}`}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous Lesson
                  </Link>
                </Button>
              ) : (
                <div />
              )}
              {lesson.nextLesson ? (
                <Button asChild>
                  <Link href={`/courses/${params.courseId}/lessons/${lesson.nextLesson.id}`}>
                    Next Lesson
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Course Curriculum</h3>
              {/* Lesson list would go here */}
              <p className="text-sm text-muted-foreground">
                Lesson list component
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
