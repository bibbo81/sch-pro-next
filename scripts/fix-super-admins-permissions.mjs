import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixSuperAdminsPermissions() {
  console.log('🔧 Fixing super_admins table permissions...\n')

  // Test current access
  console.log('1️⃣ Testing current access with service_role...')
  const { data: testData, error: testError } = await supabase
    .from('super_admins')
    .select('*')
    .limit(1)

  if (testError) {
    console.error('❌ Service role cannot access super_admins:', testError)
  } else {
    console.log('✅ Service role can access super_admins:', testData.length, 'records')
  }

  console.log('\n2️⃣ RLS and permissions info will be shown after SQL fix')

  // Check if user exists in super_admins
  console.log('\n3️⃣ Verifying your super admin record...')
  const userId = '21766c53-a16b-4019-9a11-845ecea8cf10'

  const { data: adminRecord, error: adminError } = await supabase
    .from('super_admins')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (adminError) {
    console.error('❌ Cannot find super admin record:', adminError)
    console.log('\n💡 Need to run this SQL in Supabase SQL Editor:')
    console.log(`
-- 1. Grant permissions
GRANT SELECT ON TABLE super_admins TO authenticated;
GRANT SELECT ON TABLE super_admins TO service_role;

-- 2. Disable RLS (recommended for super_admins)
ALTER TABLE super_admins DISABLE ROW LEVEL SECURITY;

-- 3. Verify your record exists
SELECT * FROM super_admins WHERE user_id = '${userId}';
    `)
  } else {
    console.log('✅ Super admin record found:', {
      id: adminRecord.id,
      user_id: adminRecord.user_id,
      created_at: adminRecord.created_at
    })
  }

  console.log('\n📋 Summary:')
  console.log('To fix the issue, run this in Supabase SQL Editor:')
  console.log('👉 https://supabase.com/dashboard/project/vgwlnsycdohrfmrfjprl/editor\n')
  console.log(`
GRANT SELECT ON TABLE super_admins TO authenticated;
GRANT SELECT ON TABLE super_admins TO service_role;
ALTER TABLE super_admins DISABLE ROW LEVEL SECURITY;
  `)
}

fixSuperAdminsPermissions()