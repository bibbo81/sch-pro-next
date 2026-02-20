import { readFileSync } from 'fs'
import pg from 'pg'
const { Client } = pg

const client = new Client({
  host: 'db.vgwlnsycdohrfmrfjprl.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'Ogna.Cic_23$',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
})

try {
  await client.connect()
  console.log('✅ Connesso al database\n')

  const sql = readFileSync('./supabase/migrations/20250930_stripe_integration.sql', 'utf8')

  console.log('📝 Applicando migration Stripe...\n')

  await client.query(sql)

  console.log('✅ Migration Stripe applicata con successo!\n')

  // Verifica colonne aggiunte
  const { rows } = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'stripe_customer_id'
    UNION ALL
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name LIKE 'stripe%'
    UNION ALL
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name LIKE 'stripe%'
  `)

  console.log('📊 Colonne Stripe aggiunte:')
  rows.forEach(row => {
    console.log(`   ✓ ${row.column_name} (${row.data_type})`)
  })

} catch (err) {
  console.error('❌ Errore:', err.message)
  process.exit(1)
} finally {
  await client.end()
}