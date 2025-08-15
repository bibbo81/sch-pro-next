import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: any
let supabaseAdmin: any = null

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase non configurato - usando mock client per sviluppo')
  
  // Mock client che simula Supabase
  supabase = {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: any) => ({
          is: (column: string, value: any) => ({
            order: (column: string, options: any) => Promise.resolve({ 
              data: [], 
              error: null 
            }),
            single: () => Promise.resolve({ 
              data: null, 
              error: { code: 'PGRST116' } 
            })
          }),
          single: () => Promise.resolve({ 
            data: null, 
            error: { code: 'PGRST116' } 
          })
        })
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => Promise.resolve({ 
            data: { 
              id: `mock-${Date.now()}`, 
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...data[0] 
            }, 
            error: null 
          })
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: () => Promise.resolve({ 
              data: { 
                id: value,
                updated_at: new Date().toISOString(),
                ...data 
              }, 
              error: null 
            })
          })
        })
      })
    })
  }
} else {
  // Client Supabase reale
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Per operazioni server-side
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  supabaseAdmin = supabaseServiceRoleKey 
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null
}

export { supabase, supabaseAdmin }