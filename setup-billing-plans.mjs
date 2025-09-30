import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vgwlnsycdohrfmrfjprl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd2xuc3ljZG9ocmZtcmZqcHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM0Nzc1NiwiZXhwIjoyMDcwOTIzNzU2fQ.2qSnm4EJKboIAjbq7OzON5A8ZPqtRQoPVHTQjG4qwa0'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Verificando piani di abbonamento...\n')

// Check existing plans using raw SQL query
const { data: existingPlans, error: checkError } = await supabase
  .from('subscription_plans')
  .select('name, slug, price_monthly, price_yearly')
  .order('sort_order')

if (checkError) {
  console.log('❌ Errore nel verificare i piani:', checkError.message)
  console.log('\n📝 Le tabelle potrebbero non essere ancora state create.')
  console.log('   Vai su: https://supabase.com/dashboard/project/vgwlnsycdohrfmrfjprl/sql/new')
  console.log('   E esegui il contenuto del file: supabase/migrations/20250930_billing_subscriptions.sql')
  process.exit(1)
}

if (existingPlans && existingPlans.length > 0) {
  console.log('✅ Piani già presenti nel database:\n')
  existingPlans.forEach(plan => {
    console.log(`  📦 ${plan.name.padEnd(12)} (${plan.slug.padEnd(10)}) - €${plan.price_monthly}/mese | €${plan.price_yearly}/anno`)
  })
  console.log('\n✨ Setup completato!')
  process.exit(0)
}

console.log('⚠️  Nessun piano trovato - inserisco i piani di default...\n')

const defaultPlans = [
  {
    name: 'Free',
    slug: 'free',
    description: 'Perfect for getting started with basic shipment tracking',
    price_monthly: 0.00,
    price_yearly: 0.00,
    limits: {
      max_shipments_per_month: 10,
      max_products: 50,
      max_users: 2,
      max_trackings_per_day: 10,
      max_storage_mb: 100,
      api_calls_per_month: 1000
    },
    features: {
      basic_tracking: true,
      email_notifications: true,
      standard_support: true,
      advanced_analytics: false,
      priority_support: false,
      custom_branding: false,
      api_access: false,
      export_data: false,
      multi_carrier: false
    },
    sort_order: 1
  },
  {
    name: 'Pro',
    slug: 'pro',
    description: 'For growing businesses with advanced tracking needs',
    price_monthly: 49.00,
    price_yearly: 490.00,
    limits: {
      max_shipments_per_month: 100,
      max_products: 500,
      max_users: 10,
      max_trackings_per_day: 100,
      max_storage_mb: 5000,
      api_calls_per_month: 50000
    },
    features: {
      basic_tracking: true,
      email_notifications: true,
      standard_support: true,
      advanced_analytics: true,
      priority_support: true,
      custom_branding: false,
      api_access: true,
      export_data: true,
      multi_carrier: true,
      bulk_operations: true
    },
    sort_order: 2
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'Unlimited power for large scale operations',
    price_monthly: 199.00,
    price_yearly: 1990.00,
    limits: {
      max_shipments_per_month: -1,
      max_products: -1,
      max_users: -1,
      max_trackings_per_day: -1,
      max_storage_mb: -1,
      api_calls_per_month: -1
    },
    features: {
      basic_tracking: true,
      email_notifications: true,
      standard_support: true,
      advanced_analytics: true,
      priority_support: true,
      custom_branding: true,
      api_access: true,
      export_data: true,
      multi_carrier: true,
      bulk_operations: true,
      dedicated_account_manager: true,
      sla_guarantee: true,
      custom_integrations: true,
      white_label: true
    },
    sort_order: 3
  }
]

const { data: insertedPlans, error: insertError } = await supabase
  .from('subscription_plans')
  .insert(defaultPlans)
  .select()

if (insertError) {
  console.log('❌ Errore nell\'inserimento:', insertError.message)
  process.exit(1)
}

console.log('✅ Piani di default inseriti con successo!\n')
console.log('📊 Piani disponibili:\n')

insertedPlans.forEach(plan => {
  console.log(`  📦 ${plan.name.padEnd(12)} (${plan.slug.padEnd(10)}) - €${plan.price_monthly}/mese | €${plan.price_yearly}/anno`)
})

console.log('\n✨ Setup billing completato!')