import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { courses, lessons } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import { eq, and, asc } from 'drizzle-orm'

const createLessonSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().min(0).optional(),
  order: z.number().int().min(0),
})

// GET /api/courses/[courseId]/lessons - List lessons for a course
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await requireAuth().catch(() => null)
    const { courseId } = await params

    // Check if course exists
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1)

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Only show lessons if course is published or user is the instructor
    if (course.status !== 'published' && (!user || user.id !== course.instructorId)) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    const courseLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(asc(lessons.order))

    return NextResponse.json({ lessons: courseLessons })
  } catch (error) {
    console.error('Get lessons error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}

// POST /api/courses/[courseId]/lessons - Create a new lesson
export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await requireAuth()
    const { courseId } = await params

    // Check if user owns the course
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1)

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (course.instructorId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have permission to add lessons to this course' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, videoUrl, duration, order } = createLessonSchema.parse(body)

    const [lesson] = await db
      .insert(lessons)
      .values({
        courseId: courseId,
        title,
        content,
        videoUrl,
        duration,
        order,
      })
      .returning()

    return NextResponse.json({ lesson }, { status: 201 })
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

    console.error('Create lesson error:', error)
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    )
  }
}
