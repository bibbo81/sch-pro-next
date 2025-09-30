import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

/**
 * POST /api/stripe/create-portal-session
 * Create a Stripe Customer Portal session
 */
export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    // Get organization with Stripe customer ID
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', organizationId)
      .single()

    if (error || !organization?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this organization' },
        { status: 404 }
      )
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`
    })

    return NextResponse.json({
      url: session.url
    }, { status: 200 })

  } catch (error: any) {
    console.error('[API] Error creating portal session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    )
  }
}