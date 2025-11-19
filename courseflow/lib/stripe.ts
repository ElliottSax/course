import Stripe from 'stripe'

// Use placeholder key during build if STRIPE_SECRET_KEY is not set
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_for_build'

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
})
