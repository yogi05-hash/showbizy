import Stripe from 'stripe'

// TODO: Add STRIPE_SECRET_KEY to your .env.local
// Get it from https://dashboard.stripe.com/apikeys
function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, {
    apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
  })
}

export const stripe = getStripeClient()
