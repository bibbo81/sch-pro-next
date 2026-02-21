import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vgwlnsycdohrfmrfjprl.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd2xuc3ljZG9ocmZtcmZqcHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0Nzc1NiwiZXhwIjoyMDcwOTIzNzU2fQ.2qSnm4EJKboIAjbq7OzON5A8ZPqtRQoPVHTQjG4qwa0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCosts() {
  console.log('🔍 Checking additional_costs table...\n')

  // Get sample costs
  const { data: costs, error } = await supabase
    .from('additional_costs')
    .select('*, shipment:shipments(organization_id, tracking_number)')
    .limit(5)

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  console.log('Sample costs:', JSON.stringify(costs, null, 2))

  // Get total costs
  const { data: totalCosts, error: totalError } = await supabase
    .from('additional_costs')
    .select('amount')

  if (!totalError && totalCosts) {
    const sum = totalCosts.reduce((acc, c) => acc + c.amount, 0)
    console.log('\n💰 Total costs in DB:', sum)
    console.log('📊 Number of cost records:', totalCosts.length)
  }
}

checkCosts()
