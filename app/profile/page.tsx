import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LevelProgress } from '@/components/gamification/level-progress'
import { getInitials } from '@/lib/utils'
import { Trophy, Award, BookOpen, Clock } from 'lucide-react'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // In production, fetch user data and stats
  const userStats = {
    totalXP: 0,
    coursesCompleted: 0,
    coursesInProgress: 0,
    totalWatchTime: 0,
    badges: [],
  }

  return (
    <div className="container max-w-5xl py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Avatar className="h-24 w-24">
              <AvatarImage src={session.user.image || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(session.user.name || 'User')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="mb-2 text-3xl font-bold">{session.user.name}</h1>
              <p className="mb-4 text-muted-foreground">{session.user.email}</p>
              <Badge>{session.user.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress */}
      <div className="mb-8">
        <LevelProgress currentXP={userStats.totalXP} />
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <Trophy className="mb-2 h-8 w-8 text-yellow-600" />
            <span className="text-sm text-muted-foreground">Total XP</span>
            <span className="text-2xl font-bold">
              {userStats.totalXP.toLocaleString()}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <BookOpen className="mb-2 h-8 w-8 text-blue-600" />
            <span className="text-sm text-muted-foreground">Completed</span>
            <span className="text-2xl font-bold">{userStats.coursesCompleted}</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <Award className="mb-2 h-8 w-8 text-purple-600" />
            <span className="text-sm text-muted-foreground">Badges</span>
            <span className="text-2xl font-bold">{userStats.badges.length}</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <Clock className="mb-2 h-8 w-8 text-green-600" />
            <span className="text-sm text-muted-foreground">Watch Time</span>
            <span className="text-2xl font-bold">
              {Math.floor(userStats.totalWatchTime / 60)}h
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="badges">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Badges</CardTitle>
            </CardHeader>
            <CardContent>
              {userStats.badges.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {userStats.badges.map((badge: any) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-4 rounded-lg border p-4"
                    >
                      <div className="text-4xl">{badge.icon}</div>
                      <div>
                        <h4 className="font-semibold">{badge.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Award className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No badges yet</h3>
                  <p className="text-muted-foreground">
                    Complete lessons and quizzes to unlock badges
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No achievements yet</h3>
                <p className="text-muted-foreground">
                  Your recent accomplishments will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
