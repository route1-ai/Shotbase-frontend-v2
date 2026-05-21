import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
})

// Map Stripe price IDs → plan names (must match STRIPE_PRICE_* env vars)
function getPlanFromPriceId(priceId: string | null | undefined): string {
  if (!priceId) return 'Free'
  if (priceId === process.env.STRIPE_PRICE_STARTER) return 'starter'
  if (priceId === process.env.STRIPE_PRICE_PRO)     return 'pro'
  if (priceId === process.env.STRIPE_PRICE_SCALE)   return 'scale'
  return 'pro' // unknown price → default to pro
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set')
    }
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ error: 'Database config missing' }, { status: 500 })
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const clerkId = session.metadata?.clerk_id

        // Resolve plan from the purchased price
        let plan = 'pro'
        if (subscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId)
            const priceId = sub.items.data[0]?.price?.id
            plan = getPlanFromPriceId(priceId)
          } catch (err) {
            console.error('Could not retrieve subscription for plan mapping:', err)
          }
        }

        if (clerkId && customerId) {
          await supabase
            .from('users')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan,
            })
            .eq('clerk_id', clerkId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const status = subscription.status
        const priceId = subscription.items.data[0]?.price?.id
        const plan = status === 'active' ? getPlanFromPriceId(priceId) : 'Free'

        await supabase
          .from('users')
          .update({
            stripe_subscription_id: subscription.id,
            plan,
          })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabase
          .from('users')
          .update({ 
            stripe_subscription_id: null,
            plan: 'Free'
          })
          .eq('stripe_customer_id', customerId)
        break
      }
    }

    return Response.json({ received: true })
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
