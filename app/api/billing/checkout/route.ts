import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Initialize Stripe if key is present
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any, // Use compatible type
})

export async function POST(req: Request) {
  const { userId } = await auth()
  const user = await currentUser()
  if (!userId || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { tier } = await req.json()
    if (!tier) return Response.json({ error: 'Missing tier' }, { status: 400 })

    let priceId = ''
    if (tier === 'starter') priceId = process.env.STRIPE_PRICE_STARTER || ''
    if (tier === 'pro') priceId = process.env.STRIPE_PRICE_PRO || ''
    if (tier === 'scale') priceId = process.env.STRIPE_PRICE_SCALE || ''

    if (!priceId) {
      return Response.json({ error: 'Invalid tier or missing price configuration' }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('STRIPE_SECRET_KEY missing. Cannot create checkout session.')
      return Response.json({ error: 'Stripe configuration missing on server' }, { status: 500 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Database configuration missing' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from Supabase to find stripe_customer_id
    const { data: dbUser, error: fetchError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('clerk_id', userId)
      .single()

    let customerId = dbUser?.stripe_customer_id

    // If no customer ID, create one
    if (!customerId) {
      const email = user.emailAddresses[0]?.emailAddress
      const customer = await stripe.customers.create({
        email,
        metadata: { clerk_id: userId }
      })
      customerId = customer.id

      // Save it in DB
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('clerk_id', userId)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?checkout_success=true`,
      cancel_url: `${appUrl}/account/billing`,
      metadata: { clerk_id: userId }
    })

    return Response.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return Response.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
