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

async function checkAndAddSuperAdmin() {
  const email = 'fabrizio.cagnucci@gmail.com'

  console.log(`🔍 Checking super admin status for: ${email}\n`)

  // Get user by email
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()

  if (userError) {
    console.error('❌ Error fetching users:', userError)
    process.exit(1)
  }

  const user = users.find(u => u.email === email)

  if (!user) {
    console.error(`❌ User not found: ${email}`)
    process.exit(1)
  }

  console.log('✅ User found:')
  console.log('   ID:', user.id)
  console.log('   Email:', user.email)
  console.log('')

  // Check if already super admin
  const { data: superAdmin, error: checkError } = await supabase
    .from('super_admins')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (superAdmin) {
    console.log('✅ User is already a super admin!')
    console.log('   Super Admin ID:', superAdmin.id)
    console.log('   Created at:', superAdmin.created_at)
    return
  }

  console.log('⚠️  User is NOT a super admin yet. Adding...\n')

  // Add as super admin
  const { data: newSuperAdmin, error: insertError } = await supabase
    .from('super_admins')
    .insert({
      user_id: user.id
    })
    .select()
    .single()

  if (insertError) {
    console.error('❌ Error adding super admin:', insertError)
    process.exit(1)
  }

  console.log('✅ Successfully added as super admin!')
  console.log('   Super Admin ID:', newSuperAdmin.id)
  console.log('   User ID:', newSuperAdmin.user_id)
  console.log('\n🎉 You can now access /super-admin routes!')
}

checkAndAddSuperAdmin()