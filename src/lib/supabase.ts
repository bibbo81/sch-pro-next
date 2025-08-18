import { createClient } from '@supabase/supabase-js'

// Debug variabili ambiente
console.log('🔍 process.env keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')))
console.log('🔍 NODE_ENV:', process.env.NODE_ENV)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Supabase URL:', supabaseUrl)
console.log('🔍 Supabase Key presente:', !!supabaseKey)
console.log('🔍 Supabase Key lunghezza:', supabaseKey?.length || 0)
console.log('🔍 Supabase Key primi 20 char:', supabaseKey?.substring(0, 20))

// ✅ EXPORT UNICO - Fuori dall'if/else
let finalUrl: string
let finalKey: string

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili ambiente Supabase mancanti:')
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseKey)
  
  // Fallback temporaneo per debug
  console.log('⚠️ Usando fallback hardcoded per debug...')
  
  finalUrl = 'https://gnlrmnsdmpjzitsysowq.supabase.co'
  finalKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdubHJtbnNkbXBqeml0c3lzb3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NjMxMzQsImV4cCI6MjA2NTAzOTEzNH0.UoJJoDUoDXGbiWnKNN48qb9PVQWOW_X_MXqAfzTHSaA'
} else {
  finalUrl = supabaseUrl
  finalKey = supabaseKey
}

// ✅ Export unico del client Supabase
export const supabase = createClient(finalUrl, finalKey)

// Test connessione - CORRETTO
console.log('🔍 Testing Supabase connection...')
supabase.auth.getSession().then(({ data, error }: any) => {
  console.log('🔍 Supabase connection test - session:', !!data)
  console.log('🔍 Supabase connection test - error:', error)
}).catch((err: any) => {
  console.error('❌ Supabase connection test failed:', err)
})

// Test tabella - CORRETTO con async/await
async function testTable() {
  try {
    console.log('🔍 Testing Supabase table access...')
    const { data, error } = await supabase
      .from('trackings')
      .select('id')
      .limit(1)
    
    console.log('🔍 Supabase table test - data:', data)
    console.log('🔍 Supabase table test - error:', error)
  } catch (err: any) {
    console.error('❌ Supabase table test failed:', err)
  }
}

// Esegui test tabella
testTable()