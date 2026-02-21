import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://vgwlnsycdohrfmrfjprl.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd2xuc3ljZG9ocmZtcmZqcHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzE3OTc4MCwiZXhwIjoyMDQyNzU1NzgwfQ.kI_lfzt72d9oVoLZnqdCwN1JfDjCmESag1i6L8U1uRg'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log('🚀 Applying analytics migration...\n')

  try {
    // Read migration file
    const migrationSQL = readFileSync('./supabase/migrations/20250930_analytics_reporting.sql', 'utf8')

    // Split by semicolons to execute statement by statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'

      // Skip comments
      if (statement.trim().startsWith('--')) continue

      console.log(`[${i + 1}/${statements.length}] Executing...`)

      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement })

        if (error) {
          console.error(`❌ Error: ${error.message}`)
          errorCount++
        } else {
          console.log(`✅ Success`)
          successCount++
        }
      } catch (err) {
        console.error(`❌ Exception: ${err.message}`)
        errorCount++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Success: ${successCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)

    // Verify tables
    console.log('\n🔍 Verifying tables...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', [
        'analytics_metrics',
        'scheduled_reports',
        'report_history',
        'custom_dashboards',
        'dashboard_widgets'
      ])

    if (!tablesError && tables) {
      console.log(`✅ Found ${tables.length} tables:`, tables.map(t => t.table_name))
    } else {
      console.log('⚠️  Could not verify tables')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

applyMigration()
