import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

// POST /api/super-admin/users/bulk - Bulk operations on users
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
    const { operation, user_ids, data } = body

    if (!operation || !user_ids || !Array.isArray(user_ids)) {
      return NextResponse.json(
        { error: 'Invalid request. Required: operation, user_ids (array)' },
        { status: 400 }
      )
    }

    const results = {
      successful: [] as string[],
      failed: [] as { user_id: string; error: string }[]
    }

    switch (operation) {
      case 'ban': {
        // Ban users for X hours
        const banDuration = data?.ban_duration || 24 // default 24h

        for (const userId of user_ids) {
          try {
            await supabase.auth.admin.updateUserById(userId, {
              ban_duration: `${banDuration}h`
            })
            results.successful.push(userId)
          } catch (error: any) {
            results.failed.push({
              user_id: userId,
              error: error.message || 'Failed to ban user'
            })
          }
        }
        break
      }

      case 'unban': {
        // Unban users
        for (const userId of user_ids) {
          try {
            await supabase.auth.admin.updateUserById(userId, {
              ban_duration: 'none'
            })
            results.successful.push(userId)
          } catch (error: any) {
            results.failed.push({
              user_id: userId,
              error: error.message || 'Failed to unban user'
            })
          }
        }
        break
      }

      case 'delete': {
        // Delete users
        for (const userId of user_ids) {
          try {
            await supabase.auth.admin.deleteUser(userId)
            results.successful.push(userId)
          } catch (error: any) {
            results.failed.push({
              user_id: userId,
              error: error.message || 'Failed to delete user'
            })
          }
        }
        break
      }

      case 'change_role': {
        // Change role for users in specific organization
        const { organization_id, new_role } = data || {}

        if (!organization_id || !new_role) {
          return NextResponse.json(
            { error: 'Missing organization_id or new_role in data' },
            { status: 400 }
          )
        }

        for (const userId of user_ids) {
          try {
            const { error } = await supabase
              .from('organization_members')
              .update({ role: new_role })
              .eq('user_id', userId)
              .eq('organization_id', organization_id)

            if (error) throw error
            results.successful.push(userId)
          } catch (error: any) {
            results.failed.push({
              user_id: userId,
              error: error.message || 'Failed to change role'
            })
          }
        }
        break
      }

      case 'toggle_restriction': {
        // Toggle restrict_to_own_records for users in organization
        const { organization_id, restrict } = data || {}

        if (!organization_id || restrict === undefined) {
          return NextResponse.json(
            { error: 'Missing organization_id or restrict in data' },
            { status: 400 }
          )
        }

        for (const userId of user_ids) {
          try {
            const { error } = await supabase
              .from('organization_members')
              .update({ restrict_to_own_records: restrict })
              .eq('user_id', userId)
              .eq('organization_id', organization_id)

            if (error) throw error
            results.successful.push(userId)
          } catch (error: any) {
            results.failed.push({
              user_id: userId,
              error: error.message || 'Failed to toggle restriction'
            })
          }
        }
        break
      }

      case 'confirm_email': {
        // Confirm email for users
        for (const userId of user_ids) {
          try {
            await supabase.auth.admin.updateUserById(userId, {
              email_confirm: true
            })
            results.successful.push(userId)
          } catch (error: any) {
            results.failed.push({
              user_id: userId,
              error: error.message || 'Failed to confirm email'
            })
          }
        }
        break
      }

      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: `Bulk operation '${operation}' completed`,
      results: {
        total: user_ids.length,
        successful: results.successful.length,
        failed: results.failed.length,
        details: results
      }
    })

  } catch (error: any) {
    console.error('Error in POST /api/super-admin/users/bulk:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}
