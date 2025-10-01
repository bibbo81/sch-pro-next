import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// GET /api/notifications/unread-count - Get count of unread notifications
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const supabase = await createSupabaseServer()

    // Use the PostgreSQL function
    const { data, error } = await supabase.rpc('get_unread_notification_count')

    if (error) throw error

    return NextResponse.json({ count: data || 0 })
  } catch (error: any) {
    console.error('[Notifications Unread Count] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
