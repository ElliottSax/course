'use client'

import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Trophy, Target, Flame } from 'lucide-react'

interface CourseProgressProps {
  progress: number
  completedLessons: number
  totalLessons: number
  currentStreak?: number
  totalXP?: number
}

export function CourseProgress({
  progress,
  completedLessons,
  totalLessons,
  currentStreak = 0,
  totalXP = 0,
}: CourseProgressProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Your Progress</h3>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Course Completion</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3" />
        <p className="mt-2 text-sm text-muted-foreground">
          {completedLessons} of {totalLessons} lessons completed
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <Target className="mb-1 h-5 w-5 text-blue-600" />
          <span className="text-xs text-muted-foreground">Completed</span>
          <span className="text-lg font-bold">{completedLessons}</span>
        </div>

        <div className="flex flex-col items-center rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
          <Flame className="mb-1 h-5 w-5 text-orange-600" />
          <span className="text-xs text-muted-foreground">Streak</span>
          <span className="text-lg font-bold">{currentStreak}</span>
        </div>

        <div className="flex flex-col items-center rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
          <Trophy className="mb-1 h-5 w-5 text-purple-600" />
          <span className="text-xs text-muted-foreground">XP Earned</span>
          <span className="text-lg font-bold">{totalXP}</span>
        </div>
      </div>
    </Card>
  )
}
