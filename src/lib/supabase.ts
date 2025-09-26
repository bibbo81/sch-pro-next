import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Solo per debugging in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Supabase Config:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    url: supabaseUrl
  })
}

// Usa sempre le variabili d'ambiente corrette
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Export unico del client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)