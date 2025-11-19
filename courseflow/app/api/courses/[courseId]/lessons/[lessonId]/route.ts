import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { courses, lessons } from '@/lib/db/schema'
import { requireAuth, getUser } from '@/lib/auth'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'

const updateLessonSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().min(0).optional(),
  order: z.number().int().min(0).optional(),
})

// GET /api/courses/[courseId]/lessons/[lessonId] - Get a single lesson
export async function GET(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const user = await getUser()

    const [lesson] = await db
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.id, params.lessonId),
          eq(lessons.courseId, params.courseId)
        )
      )
      .limit(1)

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Check course visibility
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, params.courseId))
      .limit(1)

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (course.status !== 'published' && (!user || user.id !== course.instructorId)) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ lesson })
  } catch (error) {
    console.error('Get lesson error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    )
  }
}

// PATCH /api/courses/[courseId]/lessons/[lessonId] - Update a lesson
export async function PATCH(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const user = await requireAuth()

    // Check if user owns the course
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, params.courseId))
      .limit(1)

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (course.instructorId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have permission to edit this lesson' },
        { status: 403 }
      )
    }

    // Check if lesson exists
    const [existingLesson] = await db
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.id, params.lessonId),
          eq(lessons.courseId, params.courseId)
        )
      )
      .limit(1)

    if (!existingLesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const updates = updateLessonSchema.parse(body)

    const [updatedLesson] = await db
      .update(lessons)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(lessons.id, params.lessonId))
      .returning()

    return NextResponse.json({ lesson: updatedLesson })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Update lesson error:', error)
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[courseId]/lessons/[lessonId] - Delete a lesson
export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const user = await requireAuth()

    // Check if user owns the course
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, params.courseId))
      .limit(1)

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (course.instructorId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have permission to delete this lesson' },
        { status: 403 }
      )
    }

    // Check if lesson exists
    const [existingLesson] = await db
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.id, params.lessonId),
          eq(lessons.courseId, params.courseId)
        )
      )
      .limit(1)

    if (!existingLesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Delete the lesson
    await db
      .delete(lessons)
      .where(eq(lessons.id, params.lessonId))

    return NextResponse.json({ message: 'Lesson deleted successfully' })
  } catch (error) {
    console.error('Delete lesson error:', error)
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    )
  }
}
