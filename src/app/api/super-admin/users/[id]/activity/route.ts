import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

// GET /api/super-admin/users/[id]/activity - Get user activity timeline
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const userId = params.id
    const { searchParams } = new URL(request.url)

    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const action = searchParams.get('action')
    const resourceType = searchParams.get('resource_type')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    // Build query
    let query = supabase
      .from('user_activity_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // Apply filters
    if (action) {
      query = query.eq('action', action)
    }

    if (resourceType) {
      query = query.eq('resource_type', resourceType)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    // Sort and paginate
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: activities, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch activity', details: error.message },
        { status: 500 }
      )
    }

    // Get activity statistics
    const { data: statsData } = await supabase
      .from('user_activity_logs')
      .select('action, status, created_at')
      .eq('user_id', userId)

    const stats = {
      total: count || 0,
      by_action: {} as Record<string, number>,
      by_status: {
        success: 0,
        failed: 0,
        error: 0
      },
      by_date: {} as Record<string, number>
    }

    statsData?.forEach(activity => {
      // Count by action
      stats.by_action[activity.action] = (stats.by_action[activity.action] || 0) + 1

      // Count by status
      if (activity.status in stats.by_status) {
        stats.by_status[activity.status as keyof typeof stats.by_status]++
      }

      // Count by date
      const date = new Date(activity.created_at).toISOString().split('T')[0]
      stats.by_date[date] = (stats.by_date[date] || 0) + 1
    })

    return NextResponse.json({
      activities,
      stats,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0)
      }
    })

  } catch (error: any) {
    console.error('Error in GET /api/super-admin/users/[id]/activity:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}
