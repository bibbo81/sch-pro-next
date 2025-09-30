import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// PATCH /api/dashboard-widgets/[id] - Update widget
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const { title, config, position } = body

    // Verify widget belongs to organization dashboard
    const { data: widget } = await supabase
      .from('dashboard_widgets')
      .select('dashboard_id, custom_dashboards(organization_id)')
      .eq('id', params.id)
      .single()

    if (!widget || (widget as any).custom_dashboards?.organization_id !== organizationId) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (config !== undefined) updateData.config = config
    if (position !== undefined) updateData.position = position

    const { data: updatedWidget, error } = await supabase
      .from('dashboard_widgets')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ widget: updatedWidget })
  } catch (error: any) {
    console.error('[Dashboard Widget PATCH] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/dashboard-widgets/[id] - Delete widget
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    // Verify widget belongs to organization dashboard
    const { data: widget } = await supabase
      .from('dashboard_widgets')
      .select('dashboard_id, custom_dashboards(organization_id)')
      .eq('id', params.id)
      .single()

    if (!widget || (widget as any).custom_dashboards?.organization_id !== organizationId) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('dashboard_widgets')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Dashboard Widget DELETE] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
