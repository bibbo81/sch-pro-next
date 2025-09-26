import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

// ✅ CLIENT SUPABASE PER IL BROWSER (componenti client)
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ✅ ISTANZA SINGLETON PER COMPONENTI CLIENT
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient()
  }
  return supabaseInstance
}

// ✅ HELPER PER AUTENTICAZIONE CLIENT-SIDE
export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ✅ HELPER PER REGISTRAZIONE
export async function signUpWithEmail(email: string, password: string) {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ✅ HELPER PER LOGOUT CLIENT-SIDE
export async function signOutClient() {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }

  // Opzionale: refresh della pagina dopo logout
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

// ✅ HELPER PER OTTENERE SESSIONE CLIENT-SIDE
export async function getSessionClient() {
  const supabase = getSupabaseClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting session:', error)
    return null
  }

  return session
}

// ✅ HELPER PER OTTENERE USER CLIENT-SIDE
export async function getUserClient() {
  const session = await getSessionClient()
  return session?.user || null
}

// ✅ EXPORT DEL CLIENT PER USO DIRETTO
export default getSupabaseClient