import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

// Create service role client to bypass RLS
function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// GET /api/super-admin/support-tickets/[id] - Get single ticket
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireSuperAdmin()
    const supabase = createServiceRoleClient()

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        organizations(name),
        ticket_messages(
          id,
          message,
          sender_type,
          sender_id,
          created_at,
          is_internal_note
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) throw error

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ ticket })
  } catch (error: any) {
    console.error('[Super-Admin Support Ticket GET] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/super-admin/support-tickets/[id] - Update ticket (status, assignment)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireSuperAdmin()
    const supabase = createServiceRoleClient()
    const body = await request.json()

    const { status, priority, assigned_to } = body

    const updateData: any = {}
    if (status !== undefined) {
      updateData.status = status

      // Update resolution/close timestamps
      if (status === 'resolved' && !updateData.resolved_at) {
        updateData.resolved_at = new Date().toISOString()
      }
      if (status === 'closed' && !updateData.closed_at) {
        updateData.closed_at = new Date().toISOString()
      }
    }

    if (priority !== undefined) updateData.priority = priority
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ ticket })
  } catch (error: any) {
    console.error('[Super-Admin Support Ticket PATCH] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/super-admin/support-tickets/[id] - Delete ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin()
    const supabase = createServiceRoleClient()

    // Delete all messages first
    await supabase
      .from('ticket_messages')
      .delete()
      .eq('ticket_id', params.id)

    // Then delete ticket
    const { error } = await supabase
      .from('support_tickets')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Super-Admin Support Ticket DELETE] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
