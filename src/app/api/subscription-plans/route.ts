import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

/**
 * GET /api/subscription-plans
 * Get all active subscription plans
 */
export async function GET(request: NextRequest) {
  try {
    // Auth check (anyone authenticated can view plans)
    await requireAuth()

    const supabase = await createSupabaseServer()

    // Get all active plans
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error('[API] Error fetching subscription plans:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscription plans' },
        { status: 500 }
      )
    }

    return NextResponse.json({ plans }, { status: 200 })
  } catch (error) {
    console.error('[API] Unexpected error in GET /api/subscription-plans:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/subscription-plans
 * Create a new subscription plan (super-admin only)
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
      name,
      slug,
      description,
      price_monthly,
      price_yearly,
      currency = 'EUR',
      features = {},
      limits = {},
      is_active = true,
      sort_order = 0
    } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Create plan
    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .insert({
        name,
        slug,
        description,
        price_monthly: price_monthly || 0,
        price_yearly: price_yearly || 0,
        currency,
        features,
        limits,
        is_active,
        sort_order
      })
      .select()
      .single()

    if (error) {
      console.error('[API] Error creating subscription plan:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create subscription plan' },
        { status: 500 }
      )
    }

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error('[API] Unexpected error in POST /api/subscription-plans:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}