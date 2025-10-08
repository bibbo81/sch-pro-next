#!/usr/bin/env node
/**
 * Research MSC Tracking API
 *
 * This script tests different potential MSC API endpoints to find the correct one.
 * MSC's public tracking page likely calls an internal API endpoint.
 *
 * Steps to find the real endpoint:
 * 1. Open https://www.msc.com/en/track-a-shipment in Chrome
 * 2. Open DevTools (F12) → Network tab
 * 3. Enter a tracking number (e.g., MEDU7905689)
 * 4. Look for XHR/Fetch requests
 * 5. Copy the request URL and payload format
 *
 * Common patterns for MSC API endpoints:
 * - https://www.msc.com/api/track
 * - https://www.msc.com/api/tracking
 * - https://www.msc.com/api/feature/tools/track
 * - https://www.msc.com/track-trace/api
 * - https://api.msc.com/track
 */

const TRACKING_NUMBER = 'MEDU7905689'

const POTENTIAL_ENDPOINTS = [
  'https://www.msc.com/api/track',
  'https://www.msc.com/api/tracking',
  'https://www.msc.com/api/feature/tools/track',
  'https://www.msc.com/api/feature/track',
  'https://www.msc.com/track-trace/api',
  'https://api.msc.com/track',
  'https://www.msc.com/en/api/track',
]

const headers = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Content-Type': 'application/json',
  'Origin': 'https://www.msc.com',
  'Referer': 'https://www.msc.com/en/track-a-shipment',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
}

async function testEndpoint(url) {
  console.log(`\n🔍 Testing: ${url}`)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        trackingNumber: TRACKING_NUMBER,
      }),
    })

    console.log(`   Status: ${response.status} ${response.statusText}`)

    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ SUCCESS!`)
      console.log(`   Response:`, JSON.stringify(data, null, 2).slice(0, 500))
      return { url, success: true, data }
    } else {
      const text = await response.text()
      console.log(`   ❌ Failed: ${text.slice(0, 200)}`)
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }

  return { url, success: false }
}

async function main() {
  console.log(`\n📋 MSC API Endpoint Research`)
  console.log(`   Testing tracking number: ${TRACKING_NUMBER}`)
  console.log(`   Testing ${POTENTIAL_ENDPOINTS.length} potential endpoints...\n`)

  const results = []

  for (const endpoint of POTENTIAL_ENDPOINTS) {
    const result = await testEndpoint(endpoint)
    results.push(result)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limit: 1 req/sec
  }

  console.log(`\n\n📊 Summary:`)
  console.log(`   Total endpoints tested: ${results.length}`)
  console.log(`   Successful: ${results.filter(r => r.success).length}`)
  console.log(`   Failed: ${results.filter(r => !r.success).length}`)

  const successful = results.filter(r => r.success)
  if (successful.length > 0) {
    console.log(`\n✅ Working endpoints:`)
    successful.forEach(r => console.log(`   - ${r.url}`))
  } else {
    console.log(`\n⚠️  No working endpoints found.`)
    console.log(`\n💡 Next steps:`)
    console.log(`   1. Visit https://www.msc.com/en/track-a-shipment in Chrome`)
    console.log(`   2. Open DevTools (F12) → Network tab → Filter by XHR`)
    console.log(`   3. Enter tracking number: ${TRACKING_NUMBER}`)
    console.log(`   4. Look for API calls and copy the URL + payload`)
    console.log(`   5. Update MSCScraper.ts with the correct endpoint`)
  }
}

main()
