import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔄 Sincronizzando piani con Stripe...\n')

// Fetch piani dal database
const { data: plans, error } = await supabase
  .from('subscription_plans')
  .select('*')
  .order('sort_order')

if (error) {
  console.error('❌ Errore nel recuperare i piani:', error.message)
  process.exit(1)
}

for (const plan of plans) {
  console.log(`\n📦 Processando piano: ${plan.name}`)

  let product
  let priceMonthly
  let priceYearly

  // 1. Crea o recupera Product
  if (plan.stripe_product_id) {
    console.log(`   ℹ️  Product già esistente: ${plan.stripe_product_id}`)
    product = await stripe.products.retrieve(plan.stripe_product_id)
  } else {
    console.log('   ➕ Creando nuovo Product su Stripe...')
    product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: {
        plan_id: plan.id,
        slug: plan.slug
      }
    })
    console.log(`   ✅ Product creato: ${product.id}`)
  }

  // 2. Crea Price Mensile
  if (plan.price_monthly > 0) {
    if (plan.stripe_price_id_monthly) {
      console.log(`   ℹ️  Price monthly già esistente: ${plan.stripe_price_id_monthly}`)
      priceMonthly = await stripe.prices.retrieve(plan.stripe_price_id_monthly)
    } else {
      console.log('   ➕ Creando Price mensile...')
      priceMonthly = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(plan.price_monthly * 100), // Convert to cents
        currency: plan.currency.toLowerCase(),
        recurring: {
          interval: 'month'
        },
        metadata: {
          plan_id: plan.id,
          billing_cycle: 'monthly'
        }
      })
      console.log(`   ✅ Price monthly creato: ${priceMonthly.id}`)
    }
  }

  // 3. Crea Price Annuale
  if (plan.price_yearly > 0) {
    if (plan.stripe_price_id_yearly) {
      console.log(`   ℹ️  Price yearly già esistente: ${plan.stripe_price_id_yearly}`)
      priceYearly = await stripe.prices.retrieve(plan.stripe_price_id_yearly)
    } else {
      console.log('   ➕ Creando Price annuale...')
      priceYearly = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(plan.price_yearly * 100),
        currency: plan.currency.toLowerCase(),
        recurring: {
          interval: 'year'
        },
        metadata: {
          plan_id: plan.id,
          billing_cycle: 'yearly'
        }
      })
      console.log(`   ✅ Price yearly creato: ${priceYearly.id}`)
    }
  }

  // 4. Aggiorna database con Stripe IDs
  const { error: updateError } = await supabase
    .from('subscription_plans')
    .update({
      stripe_product_id: product.id,
      stripe_price_id_monthly: priceMonthly?.id || null,
      stripe_price_id_yearly: priceYearly?.id || null
    })
    .eq('id', plan.id)

  if (updateError) {
    console.error(`   ❌ Errore aggiornamento database:`, updateError.message)
  } else {
    console.log(`   ✅ Database aggiornato con Stripe IDs`)
  }
}

console.log('\n\n✅ Sincronizzazione completata!')
console.log('\n📊 Riepilogo:')
console.log(`   Piani processati: ${plans.length}`)
console.log(`   Puoi visualizzare i prodotti su: https://dashboard.stripe.com/test/products`)