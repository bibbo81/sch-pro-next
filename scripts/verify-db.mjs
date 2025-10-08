#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyMigration() {
  console.log('\n🔍 Verifying Phase 6.1 Migration...\n')

  try {
    // 1. Check tracking_providers table
    const { data: providers, error: providersError } = await supabase
      .from('tracking_providers')
      .select('*')
      .order('priority', { ascending: true })

    if (providersError) {
      console.log('❌ tracking_providers table:', providersError.message)
    } else {
      console.log(`✅ tracking_providers table: ${providers.length} providers found`)
      console.log('\nProviders by priority:')
      providers.forEach(p => {
        console.log(`  ${p.priority}. ${p.name} (${p.provider}) - ${p.is_active ? '🟢 Active' : '🔴 Inactive'}`)
      })
    }

    // 2. Check tracking_requests_log table
    const { data: logs, error: logsError } = await supabase
      .from('tracking_requests_log')
      .select('id')
      .limit(1)

    if (logsError) {
      console.log('\n❌ tracking_requests_log table:', logsError.message)
    } else {
      console.log('\n✅ tracking_requests_log table: OK')
    }

    // 3. Check trackings table alterations
    const { data: trackings, error: trackingsError } = await supabase
      .from('trackings')
      .select('tracking_number, provider_used, tracking_type')
      .limit(1)

    if (trackingsError) {
      console.log('❌ trackings table (new columns):', trackingsError.message)
    } else {
      console.log('✅ trackings table (new columns): OK')
    }

    // 4. Count providers by type
    const { data: byType, error: byTypeError } = await supabase
      .from('tracking_providers')
      .select('provider, type')

    if (!byTypeError && byType) {
      const groupedByProvider = byType.reduce((acc, p) => {
        acc[p.provider] = (acc[p.provider] || 0) + 1
        return acc
      }, {})

      console.log('\n📊 Providers by type:')
      Object.entries(groupedByProvider).forEach(([provider, count]) => {
        console.log(`  ${provider}: ${count}`)
      })
    }

    // 5. Test helper function (if accessible)
    try {
      const { data: bestProvider, error: funcError } = await supabase
        .rpc('get_best_tracking_provider', {
          p_tracking_type: 'container',
          p_organization_id: null
        })

      if (funcError) {
        console.log('\n⚠️ get_best_tracking_provider function:', funcError.message)
      } else {
        console.log('\n✅ get_best_tracking_provider function: OK')
        console.log(`  Best provider ID for containers: ${bestProvider}`)
      }
    } catch (e) {
      console.log('\n⚠️ get_best_tracking_provider function: Not accessible (RLS may require super_admin)')
    }

    console.log('\n✅ Migration verification complete!\n')

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message)
    process.exit(1)
  }
}

verifyMigration()
