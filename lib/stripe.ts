/**
 * Stripe Configuration
 * Payment processing setup
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

/**
 * Create a Stripe checkout session for course purchase
 */
export async function createCheckoutSession({
  courseId,
  courseTitle,
  priceInCents,
  userId,
  userEmail,
}: {
  courseId: string
  courseTitle: string
  priceInCents: number
  userId: string
  userEmail: string
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: courseTitle,
            description: `Access to ${courseTitle} course`,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    customer_email: userEmail,
    metadata: {
      courseId,
      userId,
    },
    success_url: `${process.env.NEXTAUTH_URL}/courses/${courseId}?payment=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/courses/${courseId}?payment=cancelled`,
  })

  return session
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}
