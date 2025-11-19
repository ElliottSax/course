import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { enrollments, gamification } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set')
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Extract metadata
        const userId = paymentIntent.metadata.userId
        const courseId = paymentIntent.metadata.courseId

        if (!userId || !courseId) {
          console.error('Missing metadata in payment intent:', paymentIntent.id)
          break
        }

        // Create enrollment
        try {
          const [enrollment] = await db
            .insert(enrollments)
            .values({
              userId,
              courseId,
              status: 'active',
            })
            .returning()

          console.log('Enrollment created:', enrollment.id)

          // Award XP for enrollment
          await db
            .insert(gamification)
            .values({
              userId,
              xp: 50, // Award 50 XP for enrolling
              level: 1,
              streakDays: 0,
              lastActive: new Date(),
              badges: [],
            })
            .onConflictDoUpdate({
              target: gamification.userId,
              set: {
                xp: gamification.xp + 50,
                lastActive: new Date(),
              },
            })

          // TODO: Send enrollment confirmation email
        } catch (error) {
          console.error('Error creating enrollment:', error)
        }

        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', failedPayment.id)
        // TODO: Send payment failed email
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
