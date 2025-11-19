import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { courses } from '@/db/schema'
import { authOptions } from '@/lib/auth'
import { eq } from 'drizzle-orm'

// GET /api/courses/:courseId - Get single course
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, params.courseId),
      with: {
        instructor: {
          columns: {
            id: true,
            name: true,
            avatar_url: true,
            bio: true,
          },
        },
        lessons: {
          orderBy: (lessons, { asc }) => [asc(lessons.order)],
          columns: {
            id: true,
            title: true,
            duration: true,
            order: true,
            is_free_preview: true,
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Only show unpublished courses to the instructor or admin
    if (!course.is_published) {
      const session = await getServerSession(authOptions)
      if (
        !session ||
        (course.instructor_id !== session.user.id && session.user.role !== 'admin')
      ) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
}

// PATCH /api/courses/:courseId - Update course
const updateCourseSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(5000).optional(),
  thumbnail_url: z.string().url().optional(),
  price: z.number().int().min(0).max(1000000).optional(),
  category: z.string().min(1).optional(),
  is_published: z.boolean().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the course to check ownership
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, params.courseId),
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check permission
    if (course.instructor_id !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const result = updateCourseSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.errors },
        { status: 400 }
      )
    }

    const [updatedCourse] = await db
      .update(courses)
      .set({
        ...result.data,
        updated_at: new Date(),
      })
      .where(eq(courses.id, params.courseId))
      .returning()

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/:courseId - Delete course
export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, params.courseId),
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check permission
    if (course.instructor_id !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.delete(courses).where(eq(courses.id, params.courseId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}
