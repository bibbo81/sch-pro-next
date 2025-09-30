import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// POST /api/support-tickets/[id]/messages - Add message to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const { message, is_internal, attachments } = body

    if (!message) {
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 }
      )
    }

    // Verify ticket belongs to organization
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('id')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .single()

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Determine sender type (later we can check if user is support agent)
    const sender_type = 'customer' // TODO: Add logic to detect 'agent'

    const { data: ticketMessage, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: params.id,
        message,
        sender_id: user.id,
        sender_type,
        is_internal: is_internal || false,
        attachments: attachments || []
      })
      .select(`
        *,
        sender:auth.users!sender_id (
          id,
          email
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ message: ticketMessage }, { status: 201 })
  } catch (error: any) {
    console.error('[Ticket Message POST] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
