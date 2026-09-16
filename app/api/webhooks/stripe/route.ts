import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { getPlanFromPriceId, FREE_PLAN } from '@/lib/plans'
import { syncPlanForExternalId } from '@/lib/unkey'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
})

// Resolve the Clerk userId (== Unkey externalId) for a Stripe customer. The
// subscription.* events only carry the customer id, so we look it up here.
async function getClerkIdByCustomer(
  supabase: SupabaseClient,
  customerId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('users')
    .select('clerk_id')
    .eq('stripe_customer_id', customerId)
    .single()
  return data?.clerk_id ?? null
}

// Best-effort propagation of the plan onto the user's Unkey keys so the render
// backend applies the correct per-plan rate limit. Failures are logged (never
// the root key) but never break the webhook — Supabase remains the source of
// truth and this can be re-synced.
async function syncUnkeyPlan(externalId: string | null, plan: string): Promise<void> {
  if (!externalId) {
    console.error('Stripe webhook: no clerk_id for customer — skipping Unkey plan sync')
    return
  }
  try {
    const r = await syncPlanForExternalId(externalId, plan)
    if (r.failed > 0) {
      console.error(`Unkey plan sync partial: ${r.updated}/${r.total} updated, ${r.failed} failed`)
    }
  } catch (err) {
    console.error('Unkey plan sync failed:', err instanceof Error ? err.message : 'unknown error')
  }
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
        const clerkId = session.metadata?.clerk_id ?? null

        // Resolve the plan from the purchased price. null == unknown/unconfigured.
        let plan: string | null = null
        if (subscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId)
            plan = getPlanFromPriceId(sub.items.data[0]?.price?.id)
          } catch (err) {
            console.error(
              'Could not retrieve subscription for plan mapping:',
              err instanceof Error ? err.message : 'unknown error',
            )
          }
        }

        if (clerkId && customerId) {
          // Always persist the Stripe identity linkage.
          const update: Record<string, unknown> = {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          }
          // Fail safe: only grant a plan when the price maps to a known tier.
          // Unknown/unconfigured prices must NOT default to a paid tier.
          if (plan) {
            update.plan = plan
          } else {
            console.error(
              'checkout.session.completed: price ID did not map to a known plan — leaving plan unchanged',
            )
          }

          await supabase.from('users').update(update).eq('clerk_id', clerkId)

          if (plan) await syncUnkeyPlan(clerkId, plan)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const status = subscription.status
        const priceId = subscription.items.data[0]?.price?.id
        const clerkId = await getClerkIdByCustomer(supabase, customerId)

        if (status === 'active') {
          const plan = getPlanFromPriceId(priceId)
          if (!plan) {
            // Fail safe: an active subscription on an unrecognised price should
            // not silently upgrade the user. Keep the existing plan; just refresh
            // the subscription id linkage.
            console.error(
              'customer.subscription.updated: active sub with unknown price ID — leaving plan unchanged',
            )
            await supabase
              .from('users')
              .update({ stripe_subscription_id: subscription.id })
              .eq('stripe_customer_id', customerId)
          } else {
            await supabase
              .from('users')
              .update({ stripe_subscription_id: subscription.id, plan })
              .eq('stripe_customer_id', customerId)
            await syncUnkeyPlan(clerkId, plan)
          }
        } else {
          // Non-active (past_due, canceled, unpaid, ...) → downgrade to Free.
          await supabase
            .from('users')
            .update({ stripe_subscription_id: subscription.id, plan: FREE_PLAN })
            .eq('stripe_customer_id', customerId)
          await syncUnkeyPlan(clerkId, FREE_PLAN)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const clerkId = await getClerkIdByCustomer(supabase, customerId)

        await supabase
          .from('users')
          .update({
            stripe_subscription_id: null,
            plan: FREE_PLAN,
          })
          .eq('stripe_customer_id', customerId)
        await syncUnkeyPlan(clerkId, FREE_PLAN)
        break
      }
    }

    return Response.json({ received: true })
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
