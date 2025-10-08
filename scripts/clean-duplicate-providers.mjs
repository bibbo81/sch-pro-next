#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanDuplicates() {
  console.log('\n🧹 Cleaning duplicate providers...\n')

  try {
    // Get all providers
    const { data: providers, error } = await supabase
      .from('tracking_providers')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    console.log(`Found ${providers.length} total providers`)

    // Group by name to find duplicates
    const grouped = providers.reduce((acc, p) => {
      if (!acc[p.name]) acc[p.name] = []
      acc[p.name].push(p)
      return acc
    }, {})

    const toDelete = []

    Object.entries(grouped).forEach(([name, items]) => {
      if (items.length > 1) {
        console.log(`\n⚠️  Found ${items.length} duplicates for: ${name}`)
        // Keep the first (oldest) one, delete the rest
        const [keep, ...remove] = items
        console.log(`  ✅ Keeping: ${keep.id} (created: ${keep.created_at})`)
        remove.forEach(r => {
          console.log(`  🗑️  Deleting: ${r.id} (created: ${r.created_at})`)
          toDelete.push(r.id)
        })
      }
    })

    if (toDelete.length === 0) {
      console.log('\n✅ No duplicates found!')
      return
    }

    console.log(`\n🗑️  Deleting ${toDelete.length} duplicate providers...`)

    const { error: deleteError } = await supabase
      .from('tracking_providers')
      .delete()
      .in('id', toDelete)

    if (deleteError) throw deleteError

    console.log('✅ Duplicates removed successfully!')

    // Verify final count
    const { count, error: countError } = await supabase
      .from('tracking_providers')
      .select('*', { count: 'exact', head: true })

    if (!countError) {
      console.log(`\n📊 Final provider count: ${count}`)
    }

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message)
    process.exit(1)
  }
}

cleanDuplicates()
