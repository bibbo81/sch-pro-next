import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

/**
 * GET /api/invoices
 * List all invoices for the authenticated user's organization
 */
export async function GET(request: NextRequest) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get invoices for organization
    const { data: invoices, error, count } = await supabase
      .from('invoices')
      .select(`
        *,
        subscription:subscriptions(
          id,
          plan:subscription_plans(name, slug)
        )
      `, { count: 'exact' })
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[Invoices] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      invoices: invoices || [],
      total: count || 0,
      limit,
      offset
    }, { status: 200 })

  } catch (error: any) {
    console.error('[Invoices] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}
