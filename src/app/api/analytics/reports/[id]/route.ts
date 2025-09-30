import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

/**
 * PATCH /api/analytics/reports/[id]
 * Update scheduled report
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const { is_active } = body

    // Update report
    const { data: report, error } = await supabase
      .from('scheduled_reports')
      .update({
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      console.error('[Analytics Reports] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update report' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      report
    }, { status: 200 })

  } catch (error: any) {
    console.error('[Analytics Reports] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update report' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/analytics/reports/[id]
 * Delete scheduled report
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    const { error } = await supabase
      .from('scheduled_reports')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('[Analytics Reports] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete report' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true
    }, { status: 200 })

  } catch (error: any) {
    console.error('[Analytics Reports] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete report' },
      { status: 500 }
    )
  }
}
