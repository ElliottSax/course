import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { lesson_progress, xp_transactions } from '@/db/schema'
import { authOptions } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'

// POST /api/lessons/:lessonId/progress - Update lesson progress
const updateProgressSchema = z.object({
  watch_time: z.number().int().min(0),
  last_position: z.number().int().min(0),
  completed: z.boolean().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = updateProgressSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.errors },
        { status: 400 }
      )
    }

    const { watch_time, last_position, completed } = result.data

    // Check for existing progress
    const existing = await db.query.lesson_progress.findFirst({
      where: and(
        eq(lesson_progress.student_id, session.user.id),
        eq(lesson_progress.lesson_id, params.lessonId)
      ),
    })

    let progress

    if (existing) {
      // Update existing progress
      const wasCompleted = existing.completed

      const [updated] = await db
        .update(lesson_progress)
        .set({
          watch_time,
          last_position,
          completed: completed !== undefined ? completed : existing.completed,
          completed_at:
            completed && !wasCompleted ? new Date() : existing.completed_at,
          updated_at: new Date(),
        })
        .where(eq(lesson_progress.id, existing.id))
        .returning()

      progress = updated

      // Award XP if lesson was just completed
      if (completed && !wasCompleted) {
        await db.insert(xp_transactions).values({
          user_id: session.user.id,
          amount: 50, // 50 XP for completing a lesson
          action: 'COMPLETE_LESSON',
          metadata: { lesson_id: params.lessonId },
        })
      }
    } else {
      // Create new progress record
      const [created] = await db
        .insert(lesson_progress)
        .values({
          student_id: session.user.id,
          lesson_id: params.lessonId,
          watch_time,
          last_position,
          completed: completed || false,
          completed_at: completed ? new Date() : null,
        })
        .returning()

      progress = created

      // Award XP if completed on first attempt
      if (completed) {
        await db.insert(xp_transactions).values({
          user_id: session.user.id,
          amount: 50,
          action: 'COMPLETE_LESSON',
          metadata: { lesson_id: params.lessonId },
        })
      }
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error updating lesson progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

// GET /api/lessons/:lessonId/progress - Get lesson progress
export async function GET(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const progress = await db.query.lesson_progress.findFirst({
      where: and(
        eq(lesson_progress.student_id, session.user.id),
        eq(lesson_progress.lesson_id, params.lessonId)
      ),
    })

    if (!progress) {
      return NextResponse.json({
        completed: false,
        watch_time: 0,
        last_position: 0,
      })
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching lesson progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}
