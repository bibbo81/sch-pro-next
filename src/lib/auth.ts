import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

// ✅ FUNZIONE HELPER per creare client Supabase server-side con service role
async function createSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key for bypassing RLS
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ignore cookie setting errors in server context
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Ignore cookie removal errors in server context
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// ✅ FUNZIONE HELPER per creare client Supabase con chiavi pubbliche (per auth check)
async function createSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ignore cookie setting errors in server context
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Ignore cookie removal errors in server context
          }
        },
      },
    }
  )
}

// ✅ MAIN AUTH FUNCTION - Richiede autenticazione e restituisce user + organization
export async function requireAuth() {
  const supabase = await createSupabaseServer()

  // SECURITY: Use getUser() instead of getSession() to validate JWT server-side
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Authentication required')
  }

  // ✅ CAST LA QUERY SELECT COME ANY
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
      const orgData = {
        name: `${user.email?.split('@')[0] || 'User'} Organization`,
      }

      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert(orgData as any)
        .select('id, name')
        .single() as any

      if (orgError || !newOrg) {
        throw new Error('Failed to create organization')
      }

      const memberData = {
        user_id: user.id,
        organization_id: newOrg.id,
        role: 'admin',
        restrict_to_own_records: false
      }

      const { data: newMembership, error: memberError } = await supabase
        .from('organization_members')
        .insert(memberData as any)
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
    } catch (autoCreateError) {
      throw new Error('Unable to access or create organization')
    }
  }

  // ✅ Ora membership ha il tipo corretto grazie al cast
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

// ✅ FUNZIONE PER OTTENERE USER CORRENTE (senza throw se non autenticato)
export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user || null
  } catch {
    return null
  }
}

// ✅ FUNZIONE PER OTTENERE SESSION CORRENTE
export async function getCurrentSession() {
  try {
    const supabase = await createSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) return null
    return session
  } catch {
    return null
  }
}

// ✅ FUNZIONE PER VERIFICARE SE USER È AUTENTICATO (boolean)
export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    return !!user
  } catch {
    return false
  }
}

// ✅ FUNZIONE PER OTTENERE ORGANIZZAZIONE DELL'USER (senza requireAuth)
export async function getCurrentUserOrganization() {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

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

    if (error || !membership) {
      return null
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
  } catch {
    return null
  }
}

// ✅ FUNZIONE PER VERIFICARE PERMESSI SU RECORD
export async function canAccessRecord(recordUserId: string): Promise<boolean> {
  try {
    const authData = await getCurrentUserOrganization()
    
    if (!authData) {
      return false
    }

    // Admin può accedere a tutto
    if (authData.membership.role === 'admin') {
      return true
    }

    // Se restrict_to_own_records è false, può accedere a tutto nell'org
    if (!authData.membership.restrict_to_own_records) {
      return true
    }

    // Altrimenti solo ai propri record
    return authData.user.id === recordUserId
  } catch (error) {
    console.error('❌ Error checking record access:', error)
    return false
  }
}

// ✅ FUNZIONE PER OTTENERE LISTA MEMBRI DELL'ORGANIZZAZIONE
export async function getOrganizationMembers() {
  try {
    const authData = await requireAuth()
    const supabase = await createSupabaseServer()

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

    if (error) {
      console.error('❌ Error fetching organization members:', error)
      throw new Error('Failed to fetch organization members')
    }

    return members || []
  } catch (error) {
    console.error('❌ Error getting organization members:', error)
    throw error
  }
}

// ✅ FUNZIONE PER AGGIORNARE RUOLO MEMBRO (solo admin) - VERSIONE SEMPLIFICATA
export async function updateMemberRole(memberId: string, newRole: string) {
  try {
    const authData = await requireAuth()
    
    // Solo admin può modificare ruoli
    if (authData.membership.role !== 'admin') {
      throw new Error('Only admins can update member roles')
    }

    const supabase = await createSupabaseServer()

    // ✅ BYPASS COMPLETO: Usa il client senza typing
    const supabaseRaw = supabase as any
    
    const { data, error } = await supabaseRaw
      .from('organization_members')
      .update({
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .eq('organization_id', authData.organizationId)
      .select()

    if (error) {
      console.error('❌ Error updating member role:', error)
      throw new Error('Failed to update member role')
    }

    console.log('✅ Member role updated:', data)
    return data?.[0] || null
  } catch (error) {
    console.error('❌ Error updating member role:', error)
    throw error
  }
}

// ✅ FUNZIONE PER LOGOUT (pulisce session)
export async function signOut() {
  try {
    const supabase = await createSupabaseClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('❌ Error signing out:', error)
      throw new Error('Failed to sign out')
    }

    console.log('✅ User signed out successfully')
    return true
  } catch (error) {
    console.error('❌ Error during sign out:', error)
    throw error
  }
}

// ✅ EXPORT DEI CLIENT HELPER (per uso in altri file)
// ✅ FUNZIONE HELPER per creare client Supabase Admin (bypassa RLS completamente)
async function createSupabaseAdmin() {
  const { createClient } = await import('@supabase/supabase-js')

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export { createSupabaseServer, createSupabaseClient, createSupabaseAdmin }