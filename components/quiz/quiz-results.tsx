'use client'

import { Trophy, Target, Clock, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface QuizResultsProps {
  score: number
  totalQuestions: number
  passingScore: number
  timeSpent: number
  xpEarned: number
  onRetry?: () => void
  onContinue?: () => void
}

export function QuizResults({
  score,
  totalQuestions,
  passingScore,
  timeSpent,
  xpEarned,
  onRetry,
  onContinue,
}: QuizResultsProps) {
  const percentage = Math.round((score / totalQuestions) * 100)
  const passed = percentage >= passingScore

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Main Result Card */}
      <Card className={cn(
        'border-2',
        passed ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
      )}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800">
            {passed ? (
              <Trophy className="h-10 w-10 text-green-600" />
            ) : (
              <Target className="h-10 w-10 text-orange-600" />
            )}
          </div>
          <CardTitle className="text-3xl">
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </CardTitle>
          <p className="text-muted-foreground">
            {passed
              ? `You passed with ${percentage}%!`
              : `You scored ${percentage}%. You need ${passingScore}% to pass.`}
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="mb-2 flex justify-between text-sm">
              <span>Your Score</span>
              <span className="font-semibold">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <Target className="mb-2 h-8 w-8 text-blue-600" />
            <span className="text-sm text-muted-foreground">Correct Answers</span>
            <span className="text-2xl font-bold">
              {score}/{totalQuestions}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <Clock className="mb-2 h-8 w-8 text-purple-600" />
            <span className="text-sm text-muted-foreground">Time Spent</span>
            <span className="text-2xl font-bold">{formatTime(timeSpent)}</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <Award className="mb-2 h-8 w-8 text-yellow-600" />
            <span className="text-sm text-muted-foreground">XP Earned</span>
            <span className="text-2xl font-bold">{xpEarned}</span>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {onRetry && !passed && (
          <Button onClick={onRetry} variant="outline" className="flex-1">
            Try Again
          </Button>
        )}
        {onContinue && (
          <Button onClick={onContinue} className="flex-1">
            {passed ? 'Continue Learning' : 'Review Material'}
          </Button>
        )}
      </div>
    </div>
  )
}
