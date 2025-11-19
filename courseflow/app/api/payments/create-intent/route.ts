import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { users, courses, enrollments } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const createIntentSchema = z.object({
  courseId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const { courseId } = createIntentSchema.parse(body)

    // Get course
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

    if (course.status !== 'published') {
      return NextResponse.json(
        { error: 'Course is not available for purchase' },
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
          eq(enrollments.courseId, courseId)
        )
      )
      .limit(1)

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'You are already enrolled in this course' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      })

      stripeCustomerId = customer.id

      // Update user with Stripe customer ID
      await db
        .update(users)
        .set({ stripeCustomerId })
        .where(eq(users.id, user.id))
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: course.price,
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        userId: user.id,
        courseId: course.id,
        courseTitle: course.title,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: course.price,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Create payment intent error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
