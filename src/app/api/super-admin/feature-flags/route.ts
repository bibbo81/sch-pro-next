import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

// GET /api/super-admin/feature-flags - List all feature flags
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
    const scope = searchParams.get('scope') // 'global' or 'organization'
    const category = searchParams.get('category')
    const organizationId = searchParams.get('organization_id')

    let query = supabase
      .from('feature_flags')
      .select('*')
      .order('category', { ascending: true })
      .order('feature_name', { ascending: true })

    if (scope) {
      query = query.eq('scope', scope)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data: flags, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch feature flags', details: error.message },
        { status: 500 }
      )
    }

    // Get stats
    const stats = {
      total: flags?.length || 0,
      enabled: flags?.filter(f => f.is_enabled).length || 0,
      disabled: flags?.filter(f => !f.is_enabled).length || 0,
      by_scope: {
        global: flags?.filter(f => f.scope === 'global').length || 0,
        organization: flags?.filter(f => f.scope === 'organization').length || 0
      }
    }

    return NextResponse.json({ flags, stats })

  } catch (error: any) {
    console.error('Error in GET /api/super-admin/feature-flags:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}

// POST /api/super-admin/feature-flags - Create new feature flag
export async function POST(request: NextRequest) {
  try {
    const superAdmin = await requireSuperAdmin()

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
      feature_key,
      feature_name,
      description,
      category,
      scope,
      organization_id,
      is_enabled,
      config
    } = body

    if (!feature_key || !feature_name || !scope) {
      return NextResponse.json(
        { error: 'Missing required fields: feature_key, feature_name, scope' },
        { status: 400 }
      )
    }

    const { data: flag, error } = await supabase
      .from('feature_flags')
      .insert({
        feature_key,
        feature_name,
        description,
        category,
        scope,
        organization_id,
        is_enabled: is_enabled || false,
        config: config || {},
        enabled_by: is_enabled ? superAdmin.user.id : null,
        enabled_at: is_enabled ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create feature flag', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ flag }, { status: 201 })

  } catch (error: any) {
    console.error('Error in POST /api/super-admin/feature-flags:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}
