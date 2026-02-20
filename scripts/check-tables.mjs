import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vgwlnsycdohrfmrfjprl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd2xuc3ljZG9ocmZtcmZqcHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0Nzc1NiwiZXhwIjoyMDcwOTIzNzU2fQ.2qSnm4EJKboIAjbq7OzON5A8ZPqtRQoPVHTQjG4qwa0'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

console.log('🔍 Interrogando il database Supabase...\n')

const knownTables = [
  'organizations',
  'shipments',
  'shipment_items',
  'products',
  'trackings',
  'additional_costs',
  'documents',
  'performance_tests',
  'database_health_metrics',
  'users'
]

console.log('📊 TABELLE NEL DATABASE:\n')

for (const tableName of knownTables) {
  const { data, error, count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })

  if (!error) {
    console.log(`✅ ${tableName.padEnd(30)} - ${count || 0} record`)
  } else {
    console.log(`❌ ${tableName.padEnd(30)} - Errore: ${error.message}`)
  }
}

// Tenta di ottenere le colonne di una tabella specifica
console.log('\n\n🔍 STRUTTURA TABELLA "organizations":\n')
const { data: orgData, error: orgError } = await supabase
  .from('organizations')
  .select('*')
  .limit(1)

if (!orgError && orgData && orgData.length > 0) {
  const columns = Object.keys(orgData[0])
  console.log('Colonne:', columns.join(', '))
} else if (orgError) {
  console.log('Errore:', orgError.message)
} else {
  console.log('Tabella vuota')
}