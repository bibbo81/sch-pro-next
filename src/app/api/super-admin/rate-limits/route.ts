import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

// GET /api/super-admin/rate-limits - List all rate limits
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope')
    const endpoint = searchParams.get('endpoint')
    const isActive = searchParams.get('is_active')

    let query = supabase
      .from('rate_limits')
      .select('*')
      .order('endpoint_pattern', { ascending: true })

    if (scope) {
      query = query.eq('scope', scope)
    }

    if (endpoint) {
      query = query.ilike('endpoint_pattern', `%${endpoint}%`)
    }

    if (isActive !== null && isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data: limits, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch rate limits', details: error.message },
        { status: 500 }
      )
    }

    const stats = {
      total: limits?.length || 0,
      active: limits?.filter(l => l.is_active).length || 0,
      inactive: limits?.filter(l => !l.is_active).length || 0,
      by_scope: {
        global: limits?.filter(l => l.scope === 'global').length || 0,
        organization: limits?.filter(l => l.scope === 'organization').length || 0,
        user: limits?.filter(l => l.scope === 'user').length || 0
      }
    }

    return NextResponse.json({ limits, stats })

  } catch (error: any) {
    console.error('Error in GET /api/super-admin/rate-limits:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}

// POST /api/super-admin/rate-limits - Create new rate limit
export async function POST(request: NextRequest) {
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
    const {
      limit_name,
      endpoint_pattern,
      description,
      scope,
      organization_id,
      user_id,
      max_requests,
      window_seconds,
      block_duration_seconds,
      response_code,
      response_message,
      is_active
    } = body

    if (!limit_name || !endpoint_pattern || !scope || !max_requests || !window_seconds) {
      return NextResponse.json(
        { error: 'Missing required fields: limit_name, endpoint_pattern, scope, max_requests, window_seconds' },
        { status: 400 }
      )
    }

    const { data: limit, error } = await supabase
      .from('rate_limits')
      .insert({
        limit_name,
        endpoint_pattern,
        description,
        scope,
        organization_id,
        user_id,
        max_requests,
        window_seconds,
        block_duration_seconds: block_duration_seconds || 60,
        response_code: response_code || 429,
        response_message: response_message || 'Rate limit exceeded',
        is_active: is_active !== false
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create rate limit', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ limit }, { status: 201 })

  } catch (error: any) {
    console.error('Error in POST /api/super-admin/rate-limits:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}
