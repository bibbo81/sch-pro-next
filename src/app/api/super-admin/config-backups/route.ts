import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

// GET /api/super-admin/config-backups - List all configuration backups
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
    const organizationId = searchParams.get('organization_id')

    let query = supabase
      .from('configuration_backups')
      .select('*')
      .order('created_at', { ascending: false })

    if (scope) {
      query = query.eq('scope', scope)
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data: backups, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch backups', details: error.message },
        { status: 500 }
      )
    }

    const stats = {
      total: backups?.length || 0,
      completed: backups?.filter(b => b.status === 'completed').length || 0,
      failed: backups?.filter(b => b.status === 'failed').length || 0,
      restored: backups?.filter(b => b.is_restored).length || 0
    }

    return NextResponse.json({ backups, stats })

  } catch (error: any) {
    console.error('Error in GET /api/super-admin/config-backups:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}

// POST /api/super-admin/config-backups - Create new backup
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
      backup_name,
      description,
      organization_id
    } = body

    if (!backup_name) {
      return NextResponse.json(
        { error: 'Missing required field: backup_name' },
        { status: 400 }
      )
    }

    // Use the PostgreSQL function to create backup
    const { data: backupId, error } = await supabase.rpc('create_configuration_backup', {
      p_backup_name: backup_name,
      p_description: description || null,
      p_organization_id: organization_id || null
    })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create backup', details: error.message },
        { status: 500 }
      )
    }

    // Fetch the created backup
    const { data: backup } = await supabase
      .from('configuration_backups')
      .select('*')
      .eq('id', backupId)
      .single()

    return NextResponse.json({ backup }, { status: 201 })

  } catch (error: any) {
    console.error('Error in POST /api/super-admin/config-backups:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}
