import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { courses, enrollments } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'

// POST /api/courses/[id]/enroll - Enroll in a course
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    // Check if course exists and is published
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, params.id))
      .limit(1)

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (course.status !== 'published') {
      return NextResponse.json(
        { error: 'This course is not available for enrollment' },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const [existingEnrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, user.id),
          eq(enrollments.courseId, params.id)
        )
      )
      .limit(1)

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'You are already enrolled in this course' },
        { status: 400 }
      )
    }

    // Create enrollment
    const [enrollment] = await db
      .insert(enrollments)
      .values({
        userId: user.id,
        courseId: params.id,
        status: 'active',
      })
      .returning()

    return NextResponse.json(
      {
        message: 'Successfully enrolled in course',
        enrollment,
      },
      { status: 201 }
    )
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'You must be logged in to enroll in a course' },
        { status: 401 }
      )
    }

    console.error('Enroll in course error:', error)
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[id]/enroll - Unenroll from a course
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    // Find enrollment
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, user.id),
          eq(enrollments.courseId, params.id)
        )
      )
      .limit(1)

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course' },
        { status: 404 }
      )
    }

    // Delete enrollment
    await db
      .delete(enrollments)
      .where(eq(enrollments.id, enrollment.id))

    return NextResponse.json({
      message: 'Successfully unenrolled from course',
    })
  } catch (error) {
    console.error('Unenroll from course error:', error)
    return NextResponse.json(
      { error: 'Failed to unenroll from course' },
      { status: 500 }
    )
  }
}
