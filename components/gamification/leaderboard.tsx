'use client'

import { Trophy, Medal, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, getInitials } from '@/lib/utils'

interface LeaderboardEntry {
  rank: number
  user: {
    id: string
    name: string
    avatar_url?: string
  }
  total_xp: number
  level: number
  isCurrentUser?: boolean
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  timeframe?: 'week' | 'month' | 'all-time'
  onTimeframeChange?: (timeframe: 'week' | 'month' | 'all-time') => void
}

export function Leaderboard({
  entries,
  timeframe = 'week',
  onTimeframeChange,
}: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />
      default:
        return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={timeframe} onValueChange={(v) => onTimeframeChange?.(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all-time">All Time</TabsTrigger>
          </TabsList>

          <TabsContent value={timeframe} className="mt-6">
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.user.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg p-3 transition-colors',
                    entry.isCurrentUser
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : 'hover:bg-muted'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className="flex w-8 items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <Avatar>
                      <AvatarImage src={entry.user.avatar_url} />
                      <AvatarFallback>{getInitials(entry.user.name)}</AvatarFallback>
                    </Avatar>

                    {/* Name & Level */}
                    <div>
                      <p className={cn(
                        'font-medium',
                        entry.isCurrentUser && 'text-primary'
                      )}>
                        {entry.user.name}
                        {entry.isCurrentUser && (
                          <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <p className="font-semibold">{entry.total_xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
