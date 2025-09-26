import { createSupabaseServer } from './auth'

// Check if current user is a super admin
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data, error } = await supabase
      .from('super_admins')
      .select('id')
      .eq('user_id', user.id)
      .single()

    return !error && !!data
  } catch (error) {
    console.error('Error checking super admin status:', error)
    return false
  }
}

// Require super admin access (throws error if not super admin)
export async function requireSuperAdmin() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  const isAdmin = await isSuperAdmin()

  if (!isAdmin) {
    throw new Error('Super admin access required')
  }

  return { user, isSuperAdmin: true }
}

// Get super admin statistics
export async function getSuperAdminStats() {
  try {
    await requireSuperAdmin()
    const supabase = await createSupabaseServer()

    // Get organization stats
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })

    // Get total users count
    const { count: usersCount } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })

    // Get recent activity
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: activeOrgs } = await supabase
      .from('shipments')
      .select('organization_id')
      .gte('created_at', thirtyDaysAgo.toISOString())

    const uniqueActiveOrgs = new Set(activeOrgs?.map(s => s.organization_id) || [])

    return {
      totalOrganizations: orgs?.length || 0,
      totalUsers: usersCount || 0,
      activeOrganizations30d: uniqueActiveOrgs.size,
      organizations: orgs || [],
      recentOrganizations: orgs?.slice(0, 5) || []
    }
  } catch (error) {
    console.error('Error getting super admin stats:', error)
    throw error
  }
}

// Log super admin action
export async function logSuperAdminAction(
  action: string,
  targetType?: string,
  targetId?: string,
  details?: any
) {
  try {
    const supabase = await createSupabaseServer()

    await supabase.rpc('log_super_admin_action', {
      p_action: action,
      p_target_type: targetType,
      p_target_id: targetId,
      p_details: details
    })
  } catch (error) {
    console.error('Error logging super admin action:', error)
    // Don't throw - logging shouldn't break the action
  }
}