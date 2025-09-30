import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// POST /api/dashboard-widgets - Add widget to dashboard
export async function POST(request: NextRequest) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const { dashboard_id, widget_type, title, metric_type, data_config, position } = body

    if (!dashboard_id || !widget_type || !title) {
      return NextResponse.json(
        { error: 'dashboard_id, widget_type, and title are required' },
        { status: 400 }
      )
    }

    // Verify dashboard belongs to organization
    const { data: dashboard } = await supabase
      .from('custom_dashboards')
      .select('id')
      .eq('id', dashboard_id)
      .eq('organization_id', organizationId)
      .single()

    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    const { data: widget, error } = await supabase
      .from('dashboard_widgets')
      .insert({
        dashboard_id,
        widget_type,
        title,
        metric_type: metric_type || widget_type, // Use widget_type as default metric_type
        data_config: data_config || {},
        position: position || { x: 0, y: 0, w: 4, h: 4 }
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ widget }, { status: 201 })
  } catch (error: any) {
    console.error('[Dashboard Widgets POST] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
