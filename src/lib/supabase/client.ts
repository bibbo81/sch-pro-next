'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient<Database>(supabaseUrl, supabaseKey)
  }

  return supabaseInstance
}
