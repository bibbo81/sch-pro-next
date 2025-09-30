import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// GET /api/custom-dashboards/[id] - Get single dashboard
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    const { data: dashboard, error } = await supabase
      .from('custom_dashboards')
      .select('*, dashboard_widgets(*)')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .single()

    if (error) throw error

    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    return NextResponse.json({ dashboard })
  } catch (error: any) {
    console.error('[Custom Dashboard GET] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/custom-dashboards/[id] - Update dashboard
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const { name, description, layout, is_default } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (layout !== undefined) updateData.layout = layout
    if (is_default !== undefined) {
      updateData.is_default = is_default

      // If setting as default, unset other defaults
      if (is_default) {
        await supabase
          .from('custom_dashboards')
          .update({ is_default: false })
          .eq('organization_id', organizationId)
          .neq('id', params.id)
      }
    }

    const { data: dashboard, error } = await supabase
      .from('custom_dashboards')
      .update(updateData)
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) throw error

    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    return NextResponse.json({ dashboard })
  } catch (error: any) {
    console.error('[Custom Dashboard PATCH] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/custom-dashboards/[id] - Delete dashboard
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    // First delete all widgets
    await supabase
      .from('dashboard_widgets')
      .delete()
      .eq('dashboard_id', params.id)

    // Then delete dashboard
    const { error } = await supabase
      .from('custom_dashboards')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', organizationId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Custom Dashboard DELETE] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
