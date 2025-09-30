import { createSupabaseServer, createSupabaseClient } from './auth'

// Check if current user is a super admin
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const supabase = await createSupabaseClient() // Use client for auth check
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('[isSuperAdmin] No user found')
      return false
    }

    console.log('[isSuperAdmin] Checking user:', user.id, user.email)

    // TEMPORARY: Check both database AND hardcoded email
    const isHardcodedAdmin = user.email === 'fabrizio.cagnucci@gmail.com'

    // Check against super_admins table
    const { data: superAdmin, error } = await supabase
      .from('super_admins')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[isSuperAdmin] Database error:', error)
      // Fallback to hardcoded check if database fails
      return isHardcodedAdmin
    }

    const result = !!superAdmin || isHardcodedAdmin
    console.log('[isSuperAdmin] Result:', result, { superAdmin, isHardcodedAdmin })
    return result
  } catch (error) {
    console.error('[isSuperAdmin] Error checking super admin status:', error)
    return false
  }
}

// Require super admin access (throws error if not super admin)
export async function requireSuperAdmin() {
  const supabase = await createSupabaseServer() // Use server for API routes
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    console.error('[requireSuperAdmin] No session found')
    throw new Error('Authentication required')
  }

  console.log('[requireSuperAdmin] Checking user:', session.user.id, session.user.email)

  // TEMPORARY: Check both database AND hardcoded email for compatibility
  const isHardcodedAdmin = session.user.email === 'fabrizio.cagnucci@gmail.com'

  // Check against super_admins table
  const { data: superAdmin, error } = await supabase
    .from('super_admins')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  console.log('[requireSuperAdmin] Query result:', { superAdmin, error, isHardcodedAdmin })

  if (error) {
    console.error('[requireSuperAdmin] Database error:', error)
    // If database check fails but is hardcoded admin, allow access
    if (!isHardcodedAdmin) {
      throw new Error('Super admin access required - database error')
    }
  }

  // Allow access if EITHER database check succeeds OR is hardcoded admin
  if (!superAdmin && !isHardcodedAdmin) {
    console.error('[requireSuperAdmin] User not authorized:', session.user.email)
    throw new Error('Super admin access required')
  }

  console.log('[requireSuperAdmin] ✅ Super admin verified:', session.user.email)
  return { user: session.user, isSuperAdmin: true }
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
    // Temporarily disabled - RPC function doesn't exist yet
    console.log('Super admin action:', { action, targetType, targetId, details })

    // TODO: Implement proper logging when RPC function is created
    // const supabase = await createSupabaseServer()
    // await supabase.rpc('log_super_admin_action', {
    //   p_action: action,
    //   p_target_type: targetType,
    //   p_target_id: targetId,
    //   p_details: details
    // })
  } catch (error) {
    console.error('Error logging super admin action:', error)
    // Don't throw - logging shouldn't break the action
  }
}