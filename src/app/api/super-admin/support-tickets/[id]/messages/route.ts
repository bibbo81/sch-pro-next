import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, createSupabaseServer } from '@/lib/auth'

// POST /api/super-admin/support-tickets/[id]/messages - Add agent response
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireSuperAdmin()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const { message, is_internal_note } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Add message as agent
    const { data: ticketMessage, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: params.id,
        message,
        sender_type: 'agent',
        sender_id: user.id,
        is_internal_note: is_internal_note || false
      })
      .select()
      .single()

    if (error) throw error

    // Update first_response_at if this is the first agent response
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('first_response_at')
      .eq('id', params.id)
      .single()

    if (ticket && !ticket.first_response_at && !is_internal_note) {
      await supabase
        .from('support_tickets')
        .update({ first_response_at: new Date().toISOString() })
        .eq('id', params.id)
    }

    return NextResponse.json({ message: ticketMessage }, { status: 201 })
  } catch (error: any) {
    console.error('[Super-Admin Ticket Message POST] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
