import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { progress, gamification, lessons, enrollments } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import { eq, and, sql } from 'drizzle-orm'

const saveProgressSchema = z.object({
  lessonId: z.string().uuid(),
  timeWatched: z.number().int().min(0),
  lastPosition: z.number().int().min(0),
  completed: z.boolean().optional().default(false),
})

export async function POST(request: Request) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const { lessonId, timeWatched, lastPosition, completed } = saveProgressSchema.parse(body)

    // Get the lesson to find the course
    const [lesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1)

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Verify user is enrolled in the course
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, user.id),
          eq(enrollments.courseId, lesson.courseId)
        )
      )
      .limit(1)

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course' },
        { status: 403 }
      )
    }

    // Check if progress already exists
    const [existingProgress] = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, user.id),
          eq(progress.lessonId, lessonId)
        )
      )
      .limit(1)

    let savedProgress

    if (existingProgress) {
      // Update existing progress
      [savedProgress] = await db
        .update(progress)
        .set({
          timeWatched,
          lastPosition,
          completed: completed || existingProgress.completed, // Once completed, always completed
          updatedAt: new Date(),
        })
        .where(eq(progress.id, existingProgress.id))
        .returning()
    } else {
      // Create new progress
      [savedProgress] = await db
        .insert(progress)
        .values({
          userId: user.id,
          lessonId,
          timeWatched,
          lastPosition,
          completed,
        })
        .returning()
    }

    // Award XP if lesson was just completed
    if (completed && (!existingProgress || !existingProgress.completed)) {
      await db
        .insert(gamification)
        .values({
          userId: user.id,
          xp: 100, // Award 100 XP for completing a lesson
          level: 1,
          streakDays: 0,
          lastActive: new Date(),
          badges: [],
        })
        .onConflictDoUpdate({
          target: gamification.userId,
          set: {
            xp: sql`${gamification.xp} + 100`,
            lastActive: new Date(),
          },
        })
    }

    // Update streak if user was active today
    await db
      .insert(gamification)
      .values({
        userId: user.id,
        xp: 0,
        level: 1,
        streakDays: 1,
        lastActive: new Date(),
        badges: [],
      })
      .onConflictDoUpdate({
        target: gamification.userId,
        set: {
          lastActive: new Date(),
          // Update streak logic would go here
        },
      })

    return NextResponse.json({
      success: true,
      progress: savedProgress,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      )
    }

    console.error('Save progress error:', error)
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    )
  }
}

// GET /api/progress/save - Get user's progress for a lesson
export async function GET(request: Request) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId is required' },
        { status: 400 }
      )
    }

    const [userProgress] = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, user.id),
          eq(progress.lessonId, lessonId)
        )
      )
      .limit(1)

    return NextResponse.json({
      progress: userProgress || null,
    })
  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    )
  }
}
