import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

/**
 * GET /api/subscriptions/usage
 * Get current usage for the authenticated user's organization
 */
export async function GET(request: NextRequest) {
  try {
    const { organizationId } = await requireAuth()

    if (!organizationId) {
      return NextResponse.json(
        { error: 'No organization found for user' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServer()

    // Get current month start
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0]

    // Call the database function to get usage
    const { data: usage, error: usageError } = await supabase
      .rpc('get_organization_usage', {
        org_id: organizationId,
        start_date: monthStart
      })

    if (usageError) {
      console.error('[API] Error fetching usage:', usageError)
      return NextResponse.json(
        { error: 'Failed to fetch usage data' },
        { status: 500 }
      )
    }

    // Get current subscription and limits
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('organization_id', organizationId)
      .in('status', ['active', 'trial'])
      .single()

    if (subError) {
      console.error('[API] Error fetching subscription:', subError)
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Check usage limits
    const { data: limitCheck, error: limitError } = await supabase
      .rpc('check_usage_limits', {
        org_id: organizationId
      })

    if (limitError) {
      console.error('[API] Error checking limits:', limitError)
    }

    return NextResponse.json({
      usage,
      subscription,
      limits: subscription.plan?.limits || {},
      limitCheck: limitCheck || { has_violations: false, violations: [] }
    }, { status: 200 })
  } catch (error) {
    console.error('[API] Unexpected error in GET /api/subscriptions/usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}