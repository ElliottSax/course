'use client'

import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import { calculateLevel, xpForNextLevel } from '@/lib/utils'

interface LevelProgressProps {
  currentXP: number
  showDetails?: boolean
}

export function LevelProgress({ currentXP, showDetails = true }: LevelProgressProps) {
  const currentLevel = calculateLevel(currentXP)
  const xpNeeded = xpForNextLevel(currentXP)
  const xpForCurrentLevel = currentLevel * currentLevel * 100
  const xpInCurrentLevel = currentXP - xpForCurrentLevel
  const xpForNextLevelTotal = (currentLevel + 1) * (currentLevel + 1) * 100 - xpForCurrentLevel
  const progress = (xpInCurrentLevel / xpForNextLevelTotal) * 100

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        {/* Level Badge */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg">
          <div className="text-center">
            <Trophy className="mx-auto h-6 w-6" />
            <span className="text-xs font-bold">{currentLevel}</span>
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold">Level {currentLevel}</span>
            <span className="text-muted-foreground">
              {xpNeeded.toLocaleString()} XP to Level {currentLevel + 1}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          {showDetails && (
            <p className="mt-1 text-xs text-muted-foreground">
              {xpInCurrentLevel.toLocaleString()} / {xpForNextLevelTotal.toLocaleString()} XP
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
