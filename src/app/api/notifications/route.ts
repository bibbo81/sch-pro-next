import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

// GET /api/notifications - List user notifications
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const supabase = await createSupabaseServer()
    const { searchParams } = new URL(request.url)

    const limit = parseInt(searchParams.get('limit') || '50')
    const unreadOnly = searchParams.get('unread_only') === 'true'

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error } = await query

    if (error) throw error

    return NextResponse.json({ notifications })
  } catch (error: any) {
    console.error('[Notifications GET] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
