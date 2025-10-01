import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

// GET /api/super-admin/rate-limits/[id] - Get single rate limit
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

    const { data: limit, error } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !limit) {
      return NextResponse.json(
        { error: 'Rate limit not found' },
        { status: 404 }
      )
    }

    // Get usage stats for this limit
    const { data: usageStats } = await supabase
      .from('rate_limit_usage')
      .select('*')
      .eq('rate_limit_id', params.id)
      .gte('window_end', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const stats = {
      total_requests_24h: usageStats?.reduce((sum, u) => sum + u.request_count, 0) || 0,
      blocked_requests: usageStats?.filter(u => u.is_blocked).length || 0,
      unique_identifiers: new Set(usageStats?.map(u => u.identifier)).size || 0
    }

    return NextResponse.json({ limit, stats })

  } catch (error: any) {
    console.error('Error in GET /api/super-admin/rate-limits/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}

// PATCH /api/super-admin/rate-limits/[id] - Update rate limit
export async function PATCH(
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

    const body = await request.json()
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    const { data: limit, error } = await supabase
      .from('rate_limits')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update rate limit', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ limit })

  } catch (error: any) {
    console.error('Error in PATCH /api/super-admin/rate-limits/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}

// DELETE /api/super-admin/rate-limits/[id] - Delete rate limit
export async function DELETE(
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

    const { error } = await supabase
      .from('rate_limits')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete rate limit', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Rate limit deleted successfully' })

  } catch (error: any) {
    console.error('Error in DELETE /api/super-admin/rate-limits/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}
