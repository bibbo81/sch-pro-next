import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  console.log('[Webhook] Received event:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error('[Webhook] Error handling event:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('[Webhook] Checkout completed:', session.id)

  const organizationId = session.metadata?.organization_id
  const subscriptionId = session.subscription as string

  if (!organizationId || !subscriptionId) {
    console.error('[Webhook] Missing metadata in checkout session')
    return
  }

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Get plan from database using price ID
  const priceId = subscription.items.data[0].price.id
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('*')
    .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
    .single()

  if (!plan) {
    console.error('[Webhook] Plan not found for price:', priceId)
    return
  }

  // Create subscription in database
  const { error } = await supabase
    .from('subscriptions')
    .insert({
      organization_id: organizationId,
      plan_id: plan.id,
      status: subscription.status === 'trialing' ? 'trial' : 'active',
      billing_cycle: subscription.items.data[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
    })

  if (error) {
    console.error('[Webhook] Error creating subscription:', error)
  } else {
    console.log('[Webhook] Subscription created successfully')
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('[Webhook] Subscription updated:', subscription.id)

  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'trial',
    canceled: 'cancelled',
    past_due: 'suspended',
    unpaid: 'suspended'
  }

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: statusMap[subscription.status] || 'suspended',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('[Webhook] Error updating subscription:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('[Webhook] Subscription deleted:', subscription.id)

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('[Webhook] Error deleting subscription:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('[Webhook] Invoice payment succeeded:', invoice.id)

  const organizationId = invoice.subscription_metadata?.organization_id

  if (!organizationId) return

  // Get subscription from database
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single()

  if (!subscription) return

  // Create invoice record
  await supabase
    .from('invoices')
    .insert({
      organization_id: organizationId,
      subscription_id: subscription.id,
      invoice_number: invoice.number || `STRIPE-${invoice.id}`,
      amount: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'paid',
      stripe_invoice_id: invoice.id,
      stripe_payment_intent_id: invoice.payment_intent as string,
      billing_period_start: new Date(invoice.period_start * 1000).toISOString(),
      billing_period_end: new Date(invoice.period_end * 1000).toISOString(),
      due_date: new Date(invoice.due_date! * 1000).toISOString(),
      paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString()
    })
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('[Webhook] Invoice payment failed:', invoice.id)

  // TODO: Send notification to organization
  // TODO: Update subscription status if needed
}