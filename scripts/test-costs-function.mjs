import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vgwlnsycdohrfmrfjprl.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd2xuc3ljZG9ocmZtcmZqcHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0Nzc1NiwiZXhwIjoyMDcwOTIzNzU2fQ.2qSnm4EJKboIAjbq7OzON5A8ZPqtRQoPVHTQjG4qwa0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testCostsFunction() {
  console.log('🔍 Testing calculate_organization_metrics function...\n')

  // Get first organization
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name')
    .limit(1)
    .single()

  if (!orgs) {
    console.log('❌ No organizations found')
    return
  }

  console.log('Testing with organization:', orgs.name)
  console.log('Organization ID:', orgs.id)

  // Test date range (last 365 days)
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  console.log('Date range:', startDate, 'to', endDate)

  // Call function
  const { data, error } = await supabase.rpc('calculate_organization_metrics', {
    org_id: orgs.id,
    start_date: startDate,
    end_date: endDate
  })

  if (error) {
    console.error('❌ Error calling function:', error)
    return
  }

  console.log('\n📊 Metrics Result:')
  console.log(JSON.stringify(data, null, 2))

  // Verify costs manually
  console.log('\n🔍 Manual verification of costs...')
  const { data: costs } = await supabase
    .from('additional_costs')
    .select('amount, cost_type, created_at')
    .eq('organization_id', orgs.id)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  if (costs && costs.length > 0) {
    const manualTotal = costs.reduce((sum, c) => sum + c.amount, 0)
    console.log('Manual total from DB:', manualTotal)
    console.log('Function returned:', data.costs.total_cost)
    console.log('Match:', manualTotal === data.costs.total_cost ? '✅' : '❌')
  } else {
    console.log('No costs found in date range')
  }
}

testCostsFunction()
