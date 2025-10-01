import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, createSupabaseServer } from '@/lib/auth'

// GET /api/super-admin/support-tickets - List all tickets (all organizations)
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin()
    const supabase = await createSupabaseServer()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        organizations(name),
        ticket_messages(count)
      `)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }

    const { data: tickets, error } = await query

    if (error) throw error

    return NextResponse.json({ tickets })
  } catch (error: any) {
    console.error('[Super-Admin Support Tickets GET] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
