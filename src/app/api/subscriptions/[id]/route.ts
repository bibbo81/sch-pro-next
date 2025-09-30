import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

type Params = {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/subscriptions/[id]
 * Get a specific subscription
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()
    const { id } = await params

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
      .eq('id', id)

    // Filter by organization if not super admin
    if (!superAdmin && organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data: subscription, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        )
      }
      console.error('[API] Error fetching subscription:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ subscription }, { status: 200 })
  } catch (error) {
    console.error('[API] Unexpected error in GET /api/subscriptions/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/subscriptions/[id]
 * Update a subscription (super-admin only)
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { user } = await requireAuth()
    const supabase = await createSupabaseServer()
    const { id } = await params

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
      plan_id,
      status,
      billing_cycle,
      metadata
    } = body

    // Build update object
    const updates: any = {}
    if (plan_id !== undefined) updates.plan_id = plan_id
    if (status !== undefined) {
      updates.status = status
      if (status === 'cancelled') {
        updates.cancelled_at = new Date().toISOString()
      }
    }
    if (billing_cycle !== undefined) updates.billing_cycle = billing_cycle
    if (metadata !== undefined) updates.metadata = metadata

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        organization:organizations(id, name, slug),
        plan:subscription_plans(*)
      `)
      .single()

    if (error) {
      console.error('[API] Error updating subscription:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ subscription }, { status: 200 })
  } catch (error) {
    console.error('[API] Unexpected error in PATCH /api/subscriptions/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/subscriptions/[id]
 * Delete a subscription (super-admin only)
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { user } = await requireAuth()
    const supabase = await createSupabaseServer()
    const { id } = await params

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

    // Delete subscription
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[API] Error deleting subscription:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[API] Unexpected error in DELETE /api/subscriptions/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}