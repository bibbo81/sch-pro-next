import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vgwlnsycdohrfmrfjprl.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd2xuc3ljZG9ocmZtcmZqcHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0Nzc1NiwiZXhwIjoyMDcwOTIzNzU2fQ.2qSnm4EJKboIAjbq7OzON5A8ZPqtRQoPVHTQjG4qwa0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  console.log('🔍 Checking analytics tables...\n')

  const tablesToCheck = [
    'analytics_metrics',
    'scheduled_reports',
    'report_history',
    'custom_dashboards',
    'dashboard_widgets'
  ]

  for (const table of tablesToCheck) {
    try {
      // Try to query the table with limit 0 to check if it exists
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0)

      if (error) {
        if (error.message.includes('does not exist') || error.code === '42P01') {
          console.log(`❌ ${table} - NOT FOUND`)
        } else {
          console.log(`⚠️  ${table} - Error: ${error.message}`)
        }
      } else {
        console.log(`✅ ${table} - EXISTS`)
      }
    } catch (err) {
      console.log(`❌ ${table} - Exception: ${err.message}`)
    }
  }

  console.log('\n🔍 Checking all public tables...\n')

  // Get all tables using a raw query approach
  try {
    const { data, error } = await supabase
      .from('shipments')  // Use an existing table to test connection
      .select('id')
      .limit(1)

    if (!error) {
      console.log('✅ Database connection working!')
    }
  } catch (err) {
    console.error('❌ Database connection failed:', err.message)
  }
}

checkTables()
