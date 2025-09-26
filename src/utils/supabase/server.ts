import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()

  // ✅ VERIFICA CHE LE VARIABILI D'AMBIENTE ESISTANO
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    )
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // ✅ MIGLIORE ERROR HANDLING
            // Il metodo `setAll` è stato chiamato da un Server Component.
            // Questo può essere ignorato se hai middleware che aggiorna
            // le sessioni utente automaticamente.
            console.warn('Failed to set cookies in Server Component:', error)
          }
        },
      },
    }
  )
}

// ✅ FUNZIONE HELPER PER SERVER ACTIONS
export async function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase service environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.'
    )
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Service client non ha bisogno di cookies
        },
      },
    }
  )
}

// ✅ HELPER PER VERIFICARE SE L'UTENTE È AUTENTICATO
export async function getAuthenticatedUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Auth error:', error.message)
      return null
    }

    return user
  } catch (error) {
    console.error('Failed to get authenticated user:', error)
    return null
  }
}

// ✅ HELPER PER VERIFICARE SE L'UTENTE È AUTENTICATO (CON THROW)
export async function requireAuth() {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}