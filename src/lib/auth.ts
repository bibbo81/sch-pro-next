import { createClient, createServiceClient, createAdminClient } from '@/lib/supabase/server'

// Re-export client creators for API routes that need direct DB access
export const createSupabaseServer = createServiceClient
export const createSupabaseClient = createClient
export const createSupabaseAdmin = createAdminClient

export async function requireAuth() {
  const supabase = await createServiceClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Authentication required')
  }

  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select(`
      id,
      role,
      organization_id,
      restrict_to_own_records,
      organizations (
        id,
        name
      )
    `)
    .eq('user_id', user.id)
    .maybeSingle() as any

  if (membershipError) {
    throw new Error('Failed to fetch user organization')
  }

  if (!membership) {
    try {
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: `${user.email?.split('@')[0] || 'User'} Organization` } as any)
        .select('id, name')
        .single() as any

      if (orgError || !newOrg) {
        throw new Error('Failed to create organization')
      }

      const { data: newMembership, error: memberError } = await supabase
        .from('organization_members')
        .insert({
          user_id: user.id,
          organization_id: newOrg.id,
          role: 'admin',
          restrict_to_own_records: false
        } as any)
        .select(`
          id,
          role,
          organization_id,
          restrict_to_own_records,
          organizations (
            id,
            name
          )
        `)
        .single() as any

      if (memberError || !newMembership) {
        throw new Error('Failed to create membership')
      }

      return {
        user,
        membership: newMembership,
        organizationId: newOrg.id,
        organizationName: newOrg.name
      }
    } catch {
      throw new Error('Unable to access or create organization')
    }
  }

  const orgData = Array.isArray(membership.organizations)
    ? membership.organizations[0]
    : membership.organizations

  return {
    user,
    membership,
    organizationId: membership.organization_id,
    organizationName: orgData?.name || 'Unknown Organization'
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user || null
  } catch {
    return null
  }
}

export async function getCurrentSession() {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) return null
    return session
  } catch {
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    return !!user
  } catch {
    return false
  }
}

export async function getCurrentUserOrganization() {
  try {
    const supabase = await createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: membership, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        organization_id,
        restrict_to_own_records,
        organizations (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .maybeSingle() as any

    if (error || !membership) return null

    const orgData = Array.isArray(membership.organizations)
      ? membership.organizations[0]
      : membership.organizations

    return {
      user,
      membership,
      organizationId: membership.organization_id,
      organizationName: orgData?.name || 'Unknown Organization'
    }
  } catch {
    return null
  }
}

export async function canAccessRecord(recordUserId: string): Promise<boolean> {
  try {
    const authData = await getCurrentUserOrganization()
    if (!authData) return false
    if (authData.membership.role === 'admin') return true
    if (!authData.membership.restrict_to_own_records) return true
    return authData.user.id === recordUserId
  } catch {
    return false
  }
}

export async function getOrganizationMembers() {
  const authData = await requireAuth()
  const supabase = await createServiceClient()

  const { data: members, error } = await supabase
    .from('organization_members')
    .select(`
      id,
      role,
      restrict_to_own_records,
      created_at,
      user_id
    `)
    .eq('organization_id', authData.organizationId) as any

  if (error) throw new Error('Failed to fetch organization members')
  return members || []
}

export async function updateMemberRole(memberId: string, newRole: string) {
  const authData = await requireAuth()

  if (authData.membership.role !== 'admin') {
    throw new Error('Only admins can update member roles')
  }

  const supabase = await createServiceClient()

  const { data, error } = await (supabase as any)
    .from('organization_members')
    .update({
      role: newRole,
      updated_at: new Date().toISOString()
    })
    .eq('id', memberId)
    .eq('organization_id', authData.organizationId)
    .select()

  if (error) throw new Error('Failed to update member role')
  return data?.[0] || null
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error('Failed to sign out')
  return true
}
