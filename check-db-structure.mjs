import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vgwlnsycdohrfmrfjprl.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd2xuc3ljZG9ocmZtcmZqcHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0Nzc1NiwiZXhwIjoyMDcwOTIzNzU2fQ.2qSnm4EJKboIAjbq7OzON5A8ZPqtRQoPVHTQjG4qwa0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkStructure() {
  console.log('🔍 Checking database structure...\n')

  const tables = [
    'organizations',
    'organization_users', 
    'users',
    'shipments',
    'products',
    'subscriptions',
    'subscription_plans'
  ]

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0)

      if (error) {
        console.log(`❌ ${table} - ${error.message}`)
      } else {
        console.log(`✅ ${table} - EXISTS`)
      }
    } catch (err) {
      console.log(`❌ ${table} - ${err.message}`)
    }
  }
}

checkStructure()
