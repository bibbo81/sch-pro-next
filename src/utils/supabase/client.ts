import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Debug logging disabled to prevent infinite loops
  // console.log('🔍 Client Supabase init:', {
  //   hasUrl: !!supabaseUrl,
  //   hasKey: !!supabaseKey,
  //   urlValid: supabaseUrl?.startsWith('https://'),
  //   keyLength: supabaseKey?.length
  // })

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    throw new Error('Supabase configuration missing')
  }

  const client = createBrowserClient<Database>(supabaseUrl, supabaseKey)

  // Debug logging disabled to prevent infinite loops
  // client.auth.getSession().then(({ data: { session }, error }) => {
  //   console.log('🔑 Auth session check:', {
  //     hasSession: !!session,
  //     userId: session?.user?.id,
  //     email: session?.user?.email,
  //     error: error?.message
  //   })
  // })

  return client
}