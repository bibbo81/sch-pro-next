import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

// GET /api/super-admin/users/[id] - Get single user details
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

    // Get user from auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get organization memberships
    const { data: memberships, error: membershipsError } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        created_at,
        restrict_to_own_records,
        organization_id,
        organizations (
          id,
          name,
          slug
        )
      `)
      .eq('user_id', userId)

    // Get activity stats
    const { data: activityStats } = await supabase
      .from('user_activity_summary')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Get recent activity (last 50)
    const { data: recentActivity } = await supabase
      .rpc('get_user_activity_timeline', {
        p_user_id: userId,
        p_limit: 50,
        p_offset: 0
      })

    const user = {
      id: authUser.user.id,
      email: authUser.user.email,
      email_confirmed_at: authUser.user.email_confirmed_at,
      phone: authUser.user.phone,
      created_at: authUser.user.created_at,
      updated_at: authUser.user.updated_at,
      last_sign_in_at: authUser.user.last_sign_in_at,
      user_metadata: authUser.user.user_metadata,
      is_active: !!authUser.user.email_confirmed_at && !authUser.user.banned_until,
      is_banned: !!authUser.user.banned_until,
      banned_until: authUser.user.banned_until,

      memberships: memberships?.map(m => ({
        id: m.id,
        organization_id: m.organization_id,
        organization_name: m.organizations?.name,
        organization_slug: m.organizations?.slug,
        role: m.role,
        restrict_to_own_records: m.restrict_to_own_records,
        joined_at: m.created_at
      })) || [],

      activity_stats: activityStats || {
        total_activities: 0,
        successful_activities: 0,
        failed_activities: 0,
        last_activity_at: null,
        first_activity_at: null
      },

      recent_activity: recentActivity || []
    }

    return NextResponse.json({ user })

  } catch (error: any) {
    console.error('Error in GET /api/super-admin/users/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}

// PATCH /api/super-admin/users/[id] - Update user (role, ban, etc.)
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

    const userId = params.id
    const body = await request.json()

    const {
      email,
      phone,
      user_metadata,
      ban_duration, // in hours, null to unban
      email_confirm
    } = body

    // Update auth user
    const updateData: any = {}

    if (email) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (user_metadata) updateData.user_metadata = user_metadata
    if (email_confirm) updateData.email_confirm = true

    // Handle ban
    if (ban_duration !== undefined) {
      if (ban_duration === null) {
        // Unban
        updateData.ban_duration = 'none'
      } else {
        // Ban for X hours
        updateData.ban_duration = `${ban_duration}h`
      }
    }

    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      updateData
    )

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update user', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    })

  } catch (error: any) {
    console.error('Error in PATCH /api/super-admin/users/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}

// DELETE /api/super-admin/users/[id] - Delete user
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

    const userId = params.id

    // Delete user (cascades to organization_members, activity_logs, etc.)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete user', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'User deleted successfully'
    })

  } catch (error: any) {
    console.error('Error in DELETE /api/super-admin/users/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}
