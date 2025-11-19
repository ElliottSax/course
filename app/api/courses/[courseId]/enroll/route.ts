import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { courses, enrollments } from '@/db/schema'
import { authOptions } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import { createCheckoutSession } from '@/lib/stripe'

// POST /api/courses/:courseId/enroll - Enroll in course
export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get course details
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, params.courseId),
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (!course.is_published) {
      return NextResponse.json(
        { error: 'Course is not published' },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.student_id, session.user.id),
        eq(enrollments.course_id, params.courseId)
      ),
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      )
    }

    // If course is free, enroll immediately
    if (course.price === 0) {
      const [enrollment] = await db
        .insert(enrollments)
        .values({
          student_id: session.user.id,
          course_id: params.courseId,
        })
        .returning()

      return NextResponse.json({
        enrolled: true,
        enrollment,
      })
    }

    // For paid courses, create Stripe checkout session
    const checkoutSession = await createCheckoutSession({
      courseId: course.id,
      courseTitle: course.title,
      priceInCents: course.price,
      userId: session.user.id,
      userEmail: session.user.email!,
    })

    return NextResponse.json({
      enrolled: false,
      checkout_url: checkoutSession.url,
    })
  } catch (error) {
    console.error('Error enrolling in course:', error)
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    )
  }
}

// GET /api/courses/:courseId/enroll - Check enrollment status
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ enrolled: false })
    }

    const enrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.student_id, session.user.id),
        eq(enrollments.course_id, params.courseId)
      ),
    })

    return NextResponse.json({
      enrolled: !!enrollment,
      enrollment,
    })
  } catch (error) {
    console.error('Error checking enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to check enrollment' },
      { status: 500 }
    )
  }
}
