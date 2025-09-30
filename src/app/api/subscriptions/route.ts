import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

/**
 * GET /api/subscriptions
 * Get subscriptions (filtered by organization for normal users, all for super-admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    // Check if user is super admin
    const { data: superAdmin } = await supabase
      .from('super_admins')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let query = supabase
      .from('subscriptions')
      .select(`
        *,
        organization:organizations(id, name, slug),
        plan:subscription_plans(*)
      `)

    // Filter by organization if not super admin
    if (!superAdmin && organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data: subscriptions, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('[API] Error fetching subscriptions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ subscriptions }, { status: 200 })
  } catch (error) {
    console.error('[API] Unexpected error in GET /api/subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/subscriptions
 * Create a new subscription
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const supabase = await createSupabaseServer()

    // Check if user is super admin
    const { data: superAdmin } = await supabase
      .from('super_admins')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!superAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Super admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      organization_id,
      plan_id,
      status = 'trial',
      billing_cycle = 'monthly',
      trial_days = 10,
      metadata = {}
    } = body

    // Validate required fields
    if (!organization_id || !plan_id) {
      return NextResponse.json(
        { error: 'organization_id and plan_id are required' },
        { status: 400 }
      )
    }

    // Check if organization already has an active subscription
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('organization_id', organization_id)
      .in('status', ['active', 'trial'])
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Organization already has an active subscription' },
        { status: 409 }
      )
    }

    // Calculate periods
    const now = new Date()
    const trial_start = status === 'trial' ? now.toISOString() : null
    const trial_end = status === 'trial'
      ? new Date(now.getTime() + trial_days * 24 * 60 * 60 * 1000).toISOString()
      : null

    const current_period_start = now.toISOString()
    const current_period_end = billing_cycle === 'monthly'
      ? new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString()
      : new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString()

    // Create subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        organization_id,
        plan_id,
        status,
        billing_cycle,
        current_period_start,
        current_period_end,
        trial_start,
        trial_end,
        metadata
      })
      .select(`
        *,
        organization:organizations(id, name, slug),
        plan:subscription_plans(*)
      `)
      .single()

    if (error) {
      console.error('[API] Error creating subscription:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ subscription }, { status: 201 })
  } catch (error) {
    console.error('[API] Unexpected error in POST /api/subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}