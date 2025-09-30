import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// GET /api/support-tickets - List tickets
export async function GET(request: NextRequest) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const assigned_to = searchParams.get('assigned_to')

    let query = supabase
      .from('support_tickets')
      .select('*, ticket_messages(count)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (priority) query = query.eq('priority', priority)
    if (category) query = query.eq('category', category)
    if (assigned_to) query = query.eq('assigned_to', assigned_to)

    const { data: tickets, error } = await query

    if (error) throw error

    return NextResponse.json({ tickets })
  } catch (error: any) {
    console.error('[Support Tickets GET] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/support-tickets - Create new ticket
export async function POST(request: NextRequest) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()
    const body = await request.json()

    const { subject, description, category, priority, tags } = body

    if (!subject || !description || !category) {
      return NextResponse.json(
        { error: 'subject, description, and category are required' },
        { status: 400 }
      )
    }

    // Generate ticket number
    const { data: ticketNumber } = await supabase.rpc('generate_ticket_number')

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        ticket_number: ticketNumber,
        subject,
        description,
        category,
        priority: priority || 'medium',
        tags: tags || [],
        organization_id: organizationId,
        created_by: user.id,
        status: 'open'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error: any) {
    console.error('[Support Tickets POST] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
