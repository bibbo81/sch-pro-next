#!/usr/bin/env node
/**
 * Test MSCScraperV2 with Playwright
 */

import { mscScraperV2 } from '../src/lib/tracking/scrapers/MSCScraperV2.ts'

const TRACKING_NUMBER = 'MEDU7905689'

async function testMSCScraper() {
  console.log('🧪 Testing MSCScraperV2...\n')
  console.log(`📦 Tracking number: ${TRACKING_NUMBER}\n`)

  try {
    console.log('🔍 Starting tracking...')
    const result = await mscScraperV2.track(TRACKING_NUMBER)

    console.log('\n✅ Tracking complete!')
    console.log('\n📊 Result:')
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('\n❌ Error:', error)
  }
}

testMSCScraper()
