import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

// GET /api/super-admin/users - List all users with advanced filters and search
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin()

    // Use service_role to bypass RLS
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

    // Filters
    const search = searchParams.get('search') || ''
    const organizationId = searchParams.get('organization_id')
    const role = searchParams.get('role')
    const status = searchParams.get('status') // 'active', 'inactive'
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query for users with their organization memberships
    let query = supabase
      .from('organization_members')
      .select(`
        id,
        role,
        created_at,
        restrict_to_own_records,
        user_id,
        organization_id,
        organizations (
          id,
          name,
          slug
        )
      `)

    // Apply filters
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    if (role) {
      query = query.eq('role', role)
    }

    // Execute query
    const { data: memberships, error: membershipsError } = await query

    if (membershipsError) {
      console.error('Error fetching memberships:', membershipsError)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: membershipsError.message },
        { status: 500 }
      )
    }

    // Get unique user IDs
    const userIds = [...new Set(memberships?.map(m => m.user_id) || [])]

    // Fetch user details from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('Error fetching auth users:', authError)
      return NextResponse.json(
        { error: 'Failed to fetch user details', details: authError.message },
        { status: 500 }
      )
    }

    // Get activity stats for all users
    const { data: activityStats, error: activityError } = await supabase
      .from('user_activity_summary')
      .select('*')

    if (activityError) {
      console.error('Error fetching activity stats:', activityError)
    }

    // Combine data
    const users = authUsers.users
      .filter(user => userIds.includes(user.id))
      .map(user => {
        const userMemberships = memberships?.filter(m => m.user_id === user.id) || []
        const userStats = activityStats?.find(s => s.user_id === user.id)

        return {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          phone: user.phone,
          created_at: user.created_at,
          updated_at: user.updated_at,
          last_sign_in_at: user.last_sign_in_at,

          // User metadata
          user_metadata: user.user_metadata,

          // Organization memberships
          memberships: userMemberships.map(m => ({
            id: m.id,
            organization_id: m.organization_id,
            organization_name: m.organizations?.name,
            organization_slug: m.organizations?.slug,
            role: m.role,
            restrict_to_own_records: m.restrict_to_own_records,
            joined_at: m.created_at
          })),

          // Activity stats
          activity_stats: {
            total_activities: userStats?.total_activities || 0,
            successful_activities: userStats?.successful_activities || 0,
            failed_activities: userStats?.failed_activities || 0,
            last_activity_at: userStats?.last_activity_at || null,
            first_activity_at: userStats?.first_activity_at || null
          },

          // Status
          is_active: !!user.email_confirmed_at && !user.banned_until,
          is_banned: !!user.banned_until
        }
      })

    // Apply search filter
    let filteredUsers = users
    if (search) {
      const searchLower = search.toLowerCase()
      filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchLower) ||
        user.memberships.some(m =>
          m.organization_name?.toLowerCase().includes(searchLower)
        )
      )
    }

    // Apply status filter
    if (status === 'active') {
      filteredUsers = filteredUsers.filter(u => u.is_active && !u.is_banned)
    } else if (status === 'inactive') {
      filteredUsers = filteredUsers.filter(u => !u.is_active || u.is_banned)
    }

    // Sort
    filteredUsers.sort((a, b) => {
      let aVal: any = a[sortBy as keyof typeof a]
      let bVal: any = b[sortBy as keyof typeof b]

      // Handle nested fields
      if (sortBy === 'last_activity_at') {
        aVal = a.activity_stats.last_activity_at
        bVal = b.activity_stats.last_activity_at
      }

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    // Paginate
    const paginatedUsers = filteredUsers.slice(offset, offset + limit)

    // Get stats
    const stats = {
      total: filteredUsers.length,
      active: filteredUsers.filter(u => u.is_active && !u.is_banned).length,
      inactive: filteredUsers.filter(u => !u.is_active).length,
      banned: filteredUsers.filter(u => u.is_banned).length,
      with_activity: filteredUsers.filter(u => u.activity_stats.total_activities > 0).length
    }

    return NextResponse.json({
      users: paginatedUsers,
      stats,
      pagination: {
        total: filteredUsers.length,
        limit,
        offset,
        hasMore: offset + limit < filteredUsers.length
      }
    })

  } catch (error: any) {
    console.error('Error in GET /api/super-admin/users:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
}
