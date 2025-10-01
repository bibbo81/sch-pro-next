import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

// GET /api/super-admin/config-backups/[id] - Get single backup
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

    const { data: backup, error } = await supabase
      .from('configuration_backups')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !backup) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ backup })

  } catch (error: any) {
    console.error('Error in GET /api/super-admin/config-backups/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}

// POST /api/super-admin/config-backups/[id]/restore - Restore backup
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get backup data
    const { data: backup, error: fetchError } = await supabase
      .from('configuration_backups')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !backup) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      )
    }

    const backupData = backup.backup_data as any

    try {
      // Restore feature flags
      if (backupData.feature_flags && Array.isArray(backupData.feature_flags)) {
        for (const flag of backupData.feature_flags) {
          const { id, created_at, updated_at, ...flagData } = flag
          await supabase
            .from('feature_flags')
            .upsert(flagData, {
              onConflict: 'feature_key',
              ignoreDuplicates: false
            })
        }
      }

      // Restore API keys
      if (backupData.api_keys && Array.isArray(backupData.api_keys)) {
        for (const key of backupData.api_keys) {
          const { id, created_at, updated_at, ...keyData } = key
          await supabase
            .from('api_keys')
            .upsert(keyData)
        }
      }

      // Restore rate limits
      if (backupData.rate_limits && Array.isArray(backupData.rate_limits)) {
        for (const limit of backupData.rate_limits) {
          const { id, created_at, updated_at, ...limitData } = limit
          await supabase
            .from('rate_limits')
            .upsert(limitData)
        }
      }

      // Mark backup as restored
      await supabase
        .from('configuration_backups')
        .update({
          is_restored: true,
          restored_at: new Date().toISOString(),
          restored_by: superAdmin.user.id
        })
        .eq('id', params.id)

      return NextResponse.json({
        message: 'Backup restored successfully',
        restored: {
          feature_flags: backupData.feature_flags?.length || 0,
          api_keys: backupData.api_keys?.length || 0,
          rate_limits: backupData.rate_limits?.length || 0
        }
      })

    } catch (restoreError: any) {
      console.error('Error restoring backup:', restoreError)
      return NextResponse.json(
        { error: 'Failed to restore backup', details: restoreError.message },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Error in POST /api/super-admin/config-backups/[id]/restore:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}

// DELETE /api/super-admin/config-backups/[id] - Delete backup
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
      .from('configuration_backups')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete backup', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Backup deleted successfully' })

  } catch (error: any) {
    console.error('Error in DELETE /api/super-admin/config-backups/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}
