import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// POST /api/notifications/mark-all-read - Mark all notifications as read
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const supabase = await createSupabaseServer()

    // Use the PostgreSQL function
    const { data, error } = await supabase.rpc('mark_all_notifications_read')

    if (error) throw error

    return NextResponse.json({ count: data })
  } catch (error: any) {
    console.error('[Notifications Mark All Read] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
