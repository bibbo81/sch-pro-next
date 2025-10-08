#!/usr/bin/env node
/**
 * Test script for Phase 6 Tracking System
 * Tests MSC scraper and orchestrator logic
 *
 * Usage: node scripts/test-tracking.mjs [tracking_number]
 */

import { mscScraper } from '../src/lib/tracking/scrapers/MSCScraper.ts'

// Test tracking numbers (you can replace with real ones)
const TEST_TRACKING_NUMBERS = [
  'MSCU1234567', // MSC container format
  'MAEU1234567', // Maersk (will fail until implemented)
  'CMAU1234567', // CMA CGM (will fail until implemented)
]

async function testMSCScraper(trackingNumber) {
  console.log('\n' + '='.repeat(60))
  console.log(`Testing MSC Scraper with: ${trackingNumber}`)
  console.log('='.repeat(60))

  try {
    // Test validation first
    const isValid = mscScraper.validateTrackingNumber(trackingNumber)
    console.log(`✓ Validation: ${isValid ? 'PASS' : 'FAIL'}`)

    if (!isValid) {
      console.log('  → Invalid tracking number format for MSC')
      return
    }

    // Test tracking
    console.log('\n⏳ Fetching tracking data...')
    const startTime = Date.now()

    const result = await mscScraper.track(trackingNumber)

    const duration = Date.now() - startTime
    console.log(`✓ Response time: ${duration}ms`)

    // Display results
    if (result.success) {
      console.log('\n✅ SUCCESS - Tracking data found:')
      console.log(`  Tracking Number: ${result.trackingNumber}`)
      console.log(`  Carrier: ${result.carrier}`)
      console.log(`  Status: ${result.status}`)
      console.log(`  Container: ${result.containerNumber || 'N/A'}`)
      console.log(`  B/L: ${result.billOfLading || 'N/A'}`)
      console.log(`  Booking: ${result.bookingNumber || 'N/A'}`)

      if (result.origin) {
        console.log(`  Origin: ${result.origin.port} ${result.origin.country || ''}`)
      }

      if (result.destination) {
        console.log(`  Destination: ${result.destination.port} ${result.destination.country || ''}`)
      }

      if (result.vessel) {
        console.log(`  Vessel: ${result.vessel.name} ${result.vessel.imo || ''}`)
      }

      console.log(`  Voyage: ${result.voyage || 'N/A'}`)
      console.log(`  ETD: ${result.etd || 'N/A'}`)
      console.log(`  ETA: ${result.eta || 'N/A'}`)
      console.log(`  Events: ${result.events.length} milestones`)

      if (result.events.length > 0) {
        console.log('\n  Latest Events:')
        result.events.slice(0, 3).forEach((event, i) => {
          console.log(`    ${i + 1}. ${event.timestamp.toISOString().split('T')[0]} - ${event.location}`)
          console.log(`       ${event.description}`)
        })
      }

      console.log(`\n  Scraped at: ${result.scrapedAt.toISOString()}`)
      console.log(`  Cache until: ${result.cacheUntil?.toISOString() || 'N/A'}`)
    } else {
      console.log('\n❌ FAILURE:')
      console.log(`  Error: ${result.error}`)
    }

    // Show raw data if available
    if (result.rawData && process.env.DEBUG) {
      console.log('\n📦 Raw Data:')
      console.log(JSON.stringify(result.rawData, null, 2))
    }
  } catch (error) {
    console.error('\n❌ EXCEPTION:', error.message)
    if (process.env.DEBUG) {
      console.error(error)
    }
  }
}

async function testAPI(trackingNumber) {
  console.log('\n' + '='.repeat(60))
  console.log(`Testing API Endpoint: /api/tracking/track`)
  console.log('='.repeat(60))

  try {
    const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    console.log(`\n⏳ Calling ${url}/api/tracking/track...`)
    const startTime = Date.now()

    const response = await fetch(`${url}/api/tracking/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real usage, would need auth token
      },
      body: JSON.stringify({
        tracking_number: trackingNumber,
        force_refresh: true,
      }),
    })

    const duration = Date.now() - startTime
    console.log(`✓ Response time: ${duration}ms`)
    console.log(`✓ Status: ${response.status} ${response.statusText}`)

    const data = await response.json()

    if (data.success) {
      console.log('\n✅ SUCCESS:')
      console.log(`  Provider: ${data.meta?.provider}`)
      console.log(`  Fallback used: ${data.meta?.fallback_used}`)
      console.log(`  Cached: ${data.meta?.cached}`)
      console.log(`  Carrier: ${data.data?.carrier}`)
      console.log(`  Status: ${data.data?.status}`)
    } else {
      console.log('\n❌ FAILURE:')
      console.log(`  Error: ${data.error}`)
    }

    console.log('\n📄 Full Response:')
    console.log(JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('\n❌ API Test Failed:', error.message)
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const testNumber = args[0]
  const mode = args[1] || 'scraper' // 'scraper' or 'api'

  console.log('🚀 Phase 6 Tracking System - Test Suite')
  console.log('=' .repeat(60))

  if (testNumber) {
    // Test single tracking number
    if (mode === 'api') {
      await testAPI(testNumber)
    } else {
      await testMSCScraper(testNumber)
    }
  } else {
    // Test all sample numbers
    console.log('\n📋 Testing sample tracking numbers...\n')

    for (const number of TEST_TRACKING_NUMBERS) {
      await testMSCScraper(number)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Rate limiting
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✓ Test suite completed')
  console.log('='.repeat(60))
}

main().catch(console.error)
