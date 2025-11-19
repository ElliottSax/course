import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { courses, lessons, users, enrollments } from '@/lib/db/schema'
import { requireAuth, requireRole, getUser } from '@/lib/auth'
import { z } from 'zod'
import { eq, and, asc, sql } from 'drizzle-orm'

const updateCourseSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  price: z.number().int().min(0).max(1000000).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).max(10).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  thumbnailUrl: z.string().url().optional(),
})

// GET /api/courses/[id] - Get a single course
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    const { id } = await params

    const [course] = await db
      .select({
        id: courses.id,
        instructorId: courses.instructorId,
        title: courses.title,
        description: courses.description,
        price: courses.price,
        category: courses.category,
        tags: courses.tags,
        status: courses.status,
        thumbnailUrl: courses.thumbnailUrl,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        instructor: {
          id: users.id,
          email: users.email,
        },
      })
      .from(courses)
      .leftJoin(users, eq(courses.instructorId, users.id))
      .where(eq(courses.id, id))
      .limit(1)

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Only show unpublished courses to the instructor
    if (course.status !== 'published' && (!user || user.id !== course.instructorId)) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Get lessons for this course
    const courseLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, id))
      .orderBy(asc(lessons.order))

    // Get enrollment count
    const [{ count: enrollmentCount }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(enrollments)
      .where(eq(enrollments.courseId, id))

    // Check if current user is enrolled
    let isEnrolled = false
    if (user) {
      const [enrollment] = await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.userId, user.id),
            eq(enrollments.courseId, id)
          )
        )
        .limit(1)

      isEnrolled = !!enrollment
    }

    return NextResponse.json({
      course: {
        ...course,
        lessons: courseLessons,
        enrollmentCount,
        isEnrolled,
      },
    })
  } catch (error) {
    console.error('Get course error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
}

// PATCH /api/courses/[id] - Update a course
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Check if user owns this course
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1)

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (existingCourse.instructorId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have permission to edit this course' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const updates = updateCourseSchema.parse(body)

    const [updatedCourse] = await db
      .update(courses)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, id))
      .returning()

    return NextResponse.json({ course: updatedCourse })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Update course error:', error)
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[id] - Delete a course
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Check if user owns this course
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1)

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (existingCourse.instructorId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have permission to delete this course' },
        { status: 403 }
      )
    }

    // Delete the course (cascades will delete lessons)
    await db
      .delete(courses)
      .where(eq(courses.id, id))

    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Delete course error:', error)
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}
