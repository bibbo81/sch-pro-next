import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// POST /api/notifications/[id]/read - Mark notification as read
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireAuth()
    const supabase = await createSupabaseServer()

    // Use the PostgreSQL function
    const { data, error } = await supabase.rpc('mark_notification_read', {
      p_notification_id: params.id
    })

    if (error) throw error

    return NextResponse.json({ success: data })
  } catch (error: any) {
    console.error('[Notification Mark Read] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
