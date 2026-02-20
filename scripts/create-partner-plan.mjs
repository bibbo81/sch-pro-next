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

async function createPartnerPlan() {
  console.log('🚀 Creating Partner Plan (Free Unlimited Access)...\n')

  // Check if Partner plan already exists
  const { data: existing } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('slug', 'partner')
    .single()

  if (existing) {
    console.log('✅ Partner plan already exists!')
    console.log('Plan ID:', existing.id)
    console.log('Name:', existing.name)
    return
  }

  // Create Partner plan
  const { data: plan, error } = await supabase
    .from('subscription_plans')
    .insert({
      name: 'Partner',
      slug: 'partner',
      description: 'Piano gratuito con accesso illimitato per partner e organizzazioni VIP',
      price_monthly: 0,
      price_yearly: 0,
      currency: 'EUR',
      limits: {
        max_shipments_per_month: -1,    // Unlimited
        max_products: -1,                // Unlimited
        max_users: -1,                   // Unlimited
        max_trackings_per_day: -1,       // Unlimited
        max_storage_mb: -1,              // Unlimited
        api_calls_per_month: -1          // Unlimited
      },
      features: {
        tracking: true,
        products: true,
        shipments: true,
        analytics: true,
        reports: true,
        api_access: true,
        priority_support: true,
        custom_branding: true,
        white_label: true,
        advanced_analytics: true,
        bulk_operations: true,
        data_export: true,
        webhook_notifications: true,
        dedicated_support: true
      },
      is_active: true,
      sort_order: 99
    })
    .select()
    .single()

  if (error) {
    console.error('❌ Error creating Partner plan:', error)
    process.exit(1)
  }

  console.log('✅ Partner plan created successfully!\n')
  console.log('Plan Details:')
  console.log('- ID:', plan.id)
  console.log('- Name:', plan.name)
  console.log('- Slug:', plan.slug)
  console.log('- Price: €0 (FREE)')
  console.log('- All Limits: UNLIMITED (-1)')
  console.log('- All Features: ENABLED')
  console.log('\n📋 You can now assign this plan to VIP organizations!')
  console.log('   Use the "Nuovo Abbonamento" button in /super-admin/billing/subscriptions')
  console.log('   and select "Partner" plan with "lifetime" billing cycle.')
}

createPartnerPlan()