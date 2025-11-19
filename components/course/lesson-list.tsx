'use client'

import { CheckCircle2, Lock, PlayCircle } from 'lucide-react'
import { cn, formatDuration } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface LessonListProps {
  lessons: {
    id: string
    title: string
    duration: number
    order: number
    is_free_preview: boolean
    completed?: boolean
  }[]
  courseId: string
  isEnrolled: boolean
  onLessonClick?: (lessonId: string) => void
}

export function LessonList({
  lessons,
  courseId,
  isEnrolled,
  onLessonClick,
}: LessonListProps) {
  return (
    <div className="space-y-2">
      {lessons.map((lesson, index) => {
        const isLocked = !isEnrolled && !lesson.is_free_preview
        const canAccess = isEnrolled || lesson.is_free_preview

        return (
          <Card
            key={lesson.id}
            className={cn(
              'group cursor-pointer transition-all hover:shadow-md',
              isLocked && 'opacity-60',
              lesson.completed && 'border-green-500 bg-green-50 dark:bg-green-900/10'
            )}
            onClick={() => canAccess && onLessonClick?.(lesson.id)}
          >
            <div className="flex items-center gap-4 p-4">
              {/* Lesson Number / Status Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                {lesson.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : isLocked ? (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <PlayCircle className="h-5 w-5 text-primary" />
                )}
              </div>

              {/* Lesson Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Lesson {lesson.order}
                  </span>
                  {lesson.is_free_preview && (
                    <Badge variant="outline" className="text-xs">
                      Free Preview
                    </Badge>
                  )}
                </div>
                <h4
                  className={cn(
                    'font-medium truncate',
                    !isLocked && 'group-hover:text-primary transition-colors'
                  )}
                >
                  {lesson.title}
                </h4>
              </div>

              {/* Duration */}
              <div className="shrink-0 text-sm text-muted-foreground">
                {formatDuration(lesson.duration)}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
