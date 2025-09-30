import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// GET /api/custom-dashboards - List all dashboards for organization
export async function GET(request: NextRequest) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    const { data: dashboards, error } = await supabase
      .from('custom_dashboards')
      .select('*, dashboard_widgets(*)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ dashboards })
  } catch (error: any) {
    console.error('[Custom Dashboards GET] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/custom-dashboards - Create new dashboard
export async function POST(request: NextRequest) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const { name, description, layout } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data: dashboard, error } = await supabase
      .from('custom_dashboards')
      .insert({
        organization_id: organizationId,
        name,
        description,
        layout: layout || 'grid',
        is_default: false,
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ dashboard }, { status: 201 })
  } catch (error: any) {
    console.error('[Custom Dashboards POST] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
