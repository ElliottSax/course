import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enrollments } from '@/db/schema'
import { constructWebhookEvent } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const event = constructWebhookEvent(body, signature)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any

        // Extract metadata
        const courseId = session.metadata.courseId
        const userId = session.metadata.userId

        if (!courseId || !userId) {
          console.error('Missing metadata in Stripe session')
          break
        }

        // Create enrollment
        await db.insert(enrollments).values({
          student_id: userId,
          course_id: courseId,
        })

        console.log(`Enrollment created for user ${userId} in course ${courseId}`)
        break
      }

      case 'payment_intent.succeeded': {
        console.log('Payment successful:', event.data.object.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
