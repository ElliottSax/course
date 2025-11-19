import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { xp_transactions, user_badges } from '@/db/schema'
import { authOptions } from '@/lib/auth'
import { eq, sum, desc } from 'drizzle-orm'
import { calculateLevel } from '@/lib/utils'

// GET /api/gamification/stats - Get user's gamification stats
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total XP
    const xpResult = await db
      .select({ total: sum(xp_transactions.amount) })
      .from(xp_transactions)
      .where(eq(xp_transactions.user_id, session.user.id))

    const totalXP = parseInt(xpResult[0]?.total || '0')

    // Get recent XP transactions
    const recentXP = await db.query.xp_transactions.findMany({
      where: eq(xp_transactions.user_id, session.user.id),
      orderBy: [desc(xp_transactions.created_at)],
      limit: 10,
    })

    // Get unlocked badges
    const badges = await db.query.user_badges.findMany({
      where: eq(user_badges.user_id, session.user.id),
      orderBy: [desc(user_badges.unlocked_at)],
    })

    // Calculate level
    const level = calculateLevel(totalXP)

    // Get leaderboard position (simplified - would use a more complex query in production)
    const allUsers = await db
      .select({
        user_id: xp_transactions.user_id,
        total: sum(xp_transactions.amount),
      })
      .from(xp_transactions)
      .groupBy(xp_transactions.user_id)
      .orderBy(desc(sum(xp_transactions.amount)))

    const rank = allUsers.findIndex((u) => u.user_id === session.user.id) + 1

    return NextResponse.json({
      total_xp: totalXP,
      level,
      rank,
      badges_count: badges.length,
      recent_xp: recentXP,
      badges,
    })
  } catch (error) {
    console.error('Error fetching gamification stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
