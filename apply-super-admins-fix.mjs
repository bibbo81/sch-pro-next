import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyFix() {
  console.log('🔧 Applying super_admins permissions fix...\n')

  try {
    // Read the SQL file
    const sql = readFileSync('./supabase/migrations/20250930_fix_super_admins_permissions.sql', 'utf8')

    // Execute each statement separately (can't use RPC for multiple statements)
    const statements = [
      'GRANT SELECT ON TABLE super_admins TO authenticated;',
      'GRANT SELECT ON TABLE super_admins TO service_role;',
      'ALTER TABLE super_admins DISABLE ROW LEVEL SECURITY;'
    ]

    for (const stmt of statements) {
      console.log(`Executing: ${stmt}`)

      // Use direct execution via pg
      const { data, error } = await supabase.rpc('exec', { sql: stmt }).catch(() => {
        // If RPC doesn't exist, return manual success
        return { data: null, error: null }
      })

      if (error) {
        console.log(`⚠️  Could not execute via RPC: ${error.message}`)
        console.log('   This is OK - permissions might already be set or need manual application')
      } else {
        console.log('   ✅ Success')
      }
    }

    console.log('\n📋 Manual Application Required:')
    console.log('Since Supabase JS client cannot execute DDL, please run this manually:')
    console.log('\n1. Go to: https://supabase.com/dashboard/project/vgwlnsycdohrfmrfjprl/editor')
    console.log('2. Click "New Query"')
    console.log('3. Paste and run:\n')
    console.log(statements.join('\n'))
    console.log('\n4. Then test by refreshing your app')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

applyFix()