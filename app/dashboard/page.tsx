import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LevelProgress } from '@/components/gamification/level-progress'
import { Leaderboard } from '@/components/gamification/leaderboard'
import { CourseGrid } from '@/components/course/course-grid'
import { BookOpen, Trophy, Target, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  // In production, fetch user's enrolled courses and stats
  const enrolledCourses: any[] = []
  const stats = {
    coursesInProgress: 0,
    completedCourses: 0,
    totalXP: 0,
    currentStreak: 0,
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">My Dashboard</h1>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesInProgress}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">Courses finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalXP.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Experience points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Level Progress */}
          <LevelProgress currentXP={stats.totalXP} />

          {/* Continue Learning */}
          <div>
            <h2 className="mb-4 text-2xl font-bold">Continue Learning</h2>
            {enrolledCourses.length > 0 ? (
              <CourseGrid courses={enrolledCourses} showEnrollButton={false} />
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold">No courses yet</h3>
                <p className="text-muted-foreground">
                  Start learning by enrolling in a course
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Leaderboard
            entries={[]}
            timeframe="week"
          />
        </div>
      </div>
    </div>
  )
}
