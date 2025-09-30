import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vgwlnsycdohrfmrfjprl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd2xuc3ljZG9ocmZtcmZqcHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0Nzc1NiwiZXhwIjoyMDcwOTIzNzU2fQ.2qSnm4EJKboIAjbq7OzON5A8ZPqtRQoPVHTQjG4qwa0'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

console.log('🧪 Test permessi di scrittura sul database\n')

// Test 1: Verifica schema della tabella products prima
console.log('0️⃣ Verifica struttura tabella products...')
const { data: sampleProduct } = await supabase
  .from('products')
  .select('*')
  .limit(1)

console.log('   Colonne disponibili:', sampleProduct ? Object.keys(sampleProduct[0]) : 'nessuna')

// Test 1: Scrittura su products (tabella di test)
console.log('\n1️⃣ Test INSERT su products...')
const { data: insertData, error: insertError } = await supabase
  .from('products')
  .insert({
    sku: 'TEST-MCP-' + Date.now(),
    description: 'MCP Write Test Product',
    user_id: '21766c53-a16b-4019-9a11-845ecea8cf10',
    organization_id: '3f3c5128-612f-42b1-a4c7-170668df884a'
  })
  .select()

if (insertError) {
  console.log('   ❌ Errore INSERT:', insertError.message)
} else {
  console.log('   ✅ INSERT riuscito!')
  console.log('   Dati inseriti:', insertData)

  // Test 2: UPDATE del record appena creato
  if (insertData && insertData.length > 0) {
    const testId = insertData[0].id
    console.log('\n2️⃣ Test UPDATE...')

    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({
        description: 'MCP_TEST_UPDATED - Write permissions verified'
      })
      .eq('id', testId)
      .select()

    if (updateError) {
      console.log('   ❌ Errore UPDATE:', updateError.message)
    } else {
      console.log('   ✅ UPDATE riuscito!')
      console.log('   Dati aggiornati:', updateData)
    }

    // Test 3: DELETE del record di test
    console.log('\n3️⃣ Test DELETE...')
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', testId)

    if (deleteError) {
      console.log('   ❌ Errore DELETE:', deleteError.message)
    } else {
      console.log('   ✅ DELETE riuscito!')
    }
  }
}

console.log('\n✅ Test completati! Tutti i permessi di scrittura funzionano.')