import { createServerClient } from '@supabase/ssr'
import { createClient as createDirectClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!anonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')

  return { url, anonKey, serviceKey }
}

function cookieHandler(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return {
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      } catch {
        // Ignore cookie setting errors in Server Components
      }
    },
  }
}

/** Server client with anon key - respects RLS */
export async function createClient() {
  const { url, anonKey } = getEnv()
  const cookieStore = await cookies()

  return createServerClient<Database>(url, anonKey, {
    cookies: cookieHandler(cookieStore),
  })
}

/** Server client with service role key - bypasses RLS */
export async function createServiceClient() {
  const { url, serviceKey } = getEnv()
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

  const cookieStore = await cookies()

  return createServerClient<Database>(url, serviceKey, {
    cookies: cookieHandler(cookieStore),
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/** Admin client without cookies - for background jobs, cron, etc. */
export function createAdminClient() {
  const { url, serviceKey } = getEnv()
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

  return createDirectClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
