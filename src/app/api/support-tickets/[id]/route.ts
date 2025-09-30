import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// GET /api/support-tickets/[id] - Get single ticket with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        ticket_messages (
          *,
          sender:auth.users!sender_id (
            id,
            email
          )
        )
      `)
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .single()

    if (error) throw error

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ ticket })
  } catch (error: any) {
    console.error('[Support Ticket GET] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/support-tickets/[id] - Update ticket
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const { status, priority, assigned_to, tags } = body

    const updateData: any = {}
    if (status !== undefined) {
      updateData.status = status
      if (status === 'resolved') updateData.resolved_at = new Date().toISOString()
      if (status === 'closed') updateData.closed_at = new Date().toISOString()
    }
    if (priority !== undefined) updateData.priority = priority
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to
    if (tags !== undefined) updateData.tags = tags

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) throw error

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ ticket })
  } catch (error: any) {
    console.error('[Support Ticket PATCH] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/support-tickets/[id] - Delete ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    // Delete all messages first (cascade should handle this, but explicit is good)
    await supabase
      .from('ticket_messages')
      .delete()
      .eq('ticket_id', params.id)

    const { error } = await supabase
      .from('support_tickets')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', organizationId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Support Ticket DELETE] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
