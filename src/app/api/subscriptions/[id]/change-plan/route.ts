import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'
import Stripe from 'stripe'

/**
 * POST /api/subscriptions/[id]/change-plan
 * Change subscription plan with Stripe proration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    // Initialize Stripe (lazy initialization for Vercel)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-11-20.acacia'
    })

    const body = await request.json()
    const { new_plan_id, billing_cycle, proration_behavior = 'create_prorations' } = body

    if (!new_plan_id || !billing_cycle) {
      return NextResponse.json(
        { error: 'Missing required fields: new_plan_id, billing_cycle' },
        { status: 400 }
      )
    }

    // 1. Get current subscription from database
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // 2. Get new plan details
    const { data: newPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', new_plan_id)
      .single()

    if (planError || !newPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // 3. Check if subscription has Stripe subscription ID
    if (!subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Cannot change plan for non-Stripe subscription' },
        { status: 400 }
      )
    }

    // 4. Get Stripe price ID based on billing cycle
    const stripePriceId = billing_cycle === 'yearly'
      ? newPlan.stripe_price_id_yearly
      : newPlan.stripe_price_id_monthly

    if (!stripePriceId) {
      return NextResponse.json(
        { error: `No Stripe price configured for ${billing_cycle} billing cycle` },
        { status: 400 }
      )
    }

    // 5. Get current Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    )

    // 6. Calculate proration preview
    const currentPrice = billing_cycle === 'yearly'
      ? subscription.plan.price_yearly
      : subscription.plan.price_monthly

    const newPrice = billing_cycle === 'yearly'
      ? newPlan.price_yearly
      : newPlan.price_monthly

    const isUpgrade = newPrice > currentPrice
    const priceDifference = Math.abs(newPrice - currentPrice)

    // 7. Update Stripe subscription
    const updatedStripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        items: [{
          id: stripeSubscription.items.data[0].id,
          price: stripePriceId
        }],
        proration_behavior: proration_behavior,
        // For downgrades, optionally apply at period end
        proration_date: isUpgrade ? Math.floor(Date.now() / 1000) : undefined
      }
    )

    // 8. Update database (will also be updated by webhook)
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan_id: new_plan_id,
        billing_cycle: billing_cycle,
        stripe_price_id: stripePriceId,
        current_period_start: new Date(updatedStripeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(updatedStripeSubscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('*, plan:subscription_plans(*)')
      .single()

    if (updateError) {
      console.error('[Change Plan] Database update error:', updateError)
      // Subscription updated in Stripe, webhook will sync it
    }

    return NextResponse.json({
      subscription: updatedSubscription || subscription,
      proration: {
        is_upgrade: isUpgrade,
        price_difference: priceDifference,
        old_price: currentPrice,
        new_price: newPrice,
        old_plan: subscription.plan.name,
        new_plan: newPlan.name,
        billing_cycle: billing_cycle
      },
      stripe_subscription_id: updatedStripeSubscription.id
    }, { status: 200 })

  } catch (error: any) {
    console.error('[Change Plan] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to change subscription plan' },
      { status: 500 }
    )
  }
}
