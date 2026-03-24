import Stripe from 'stripe'

// TODO: Add STRIPE_SECRET_KEY to your .env.local
// Get it from https://dashboard.stripe.com/apikeys
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
})
