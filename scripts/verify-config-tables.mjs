import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyStructure() {
  console.log('=== Verifica Schema Supabase per Phase 4.2 ===\n')

  // 1. Verifica se le tabelle esistono già
  console.log('1. Verifico se tabelle esistono già...\n')

  const tables = ['feature_flags', 'api_keys', 'rate_limits', 'rate_limit_usage', 'configuration_backups']

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)

    if (error && error.code !== 'PGRST116') {
      console.log(`❌ Tabella ${table}: NON esiste (OK per nuova migration)`)
    } else if (!error || error.code === 'PGRST116') {
      console.log(`⚠️  Tabella ${table}: ESISTE GIÀ! (verifica se migration già applicata)`)
    }
  }

  // 2. Verifica struttura organizations table
  console.log('\n2. Verifico struttura tabella organizations...\n')
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .limit(1)

  if (!orgError) {
    console.log('✅ Tabella organizations esiste')
    if (orgData && orgData.length > 0) {
      console.log('Colonne disponibili:', Object.keys(orgData[0]))
    }
  } else {
    console.log('❌ Errore organizations:', orgError.message)
  }

  // 3. Verifica auth.users reference
  console.log('\n3. Verifico auth.users per foreign keys...\n')
  const { data: authData } = await supabase.auth.admin.listUsers()
  console.log(`✅ Auth users disponibili: ${authData?.users?.length || 0}`)

  // 4. Verifica se funzioni esistono già
  console.log('\n4. Verifico funzioni PostgreSQL esistenti...\n')

  const { data: funcCheck1, error: funcError1 } = await supabase.rpc('is_feature_enabled', {
    p_feature_key: 'test',
    p_organization_id: null
  })

  if (funcError1 && funcError1.code === '42883') {
    console.log('❌ Funzione is_feature_enabled: NON esiste (OK)')
  } else if (!funcError1) {
    console.log('⚠️  Funzione is_feature_enabled: ESISTE GIÀ!')
  }

  const { data: funcCheck2, error: funcError2 } = await supabase.rpc('create_configuration_backup', {
    p_backup_name: 'test',
    p_description: null,
    p_organization_id: null
  })

  if (funcError2 && funcError2.code === '42883') {
    console.log('❌ Funzione create_configuration_backup: NON esiste (OK)')
  } else if (!funcError2) {
    console.log('⚠️  Funzione create_configuration_backup: ESISTE GIÀ!')
  }

  console.log('\n=== Verifica Completata ===')
  console.log('\n✅ Se vedi "NON esiste" per tutte le tabelle e funzioni, la migration è pronta.')
  console.log('⚠️  Se vedi "ESISTE GIÀ", verifica se hai già applicato la migration!')
}

verifyStructure().catch(console.error)
