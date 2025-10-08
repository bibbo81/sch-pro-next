#!/usr/bin/env node
/**
 * Capture MSC Tracking API Response
 * This script submits a tracking query and captures the API endpoint + response
 */

import { chromium } from 'playwright'
import { writeFileSync } from 'fs'

const TRACKING_NUMBER = 'MEDU7905689'

async function captureMSCAPI() {
  console.log('🚀 Capturing MSC API response...\n')

  const apiResponses = []

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  })
  const page = await context.newPage()

  // Capture all API responses
  page.on('response', async (response) => {
    const url = response.url()
    // Look for tracking-related API calls
    if (
      url.includes('track') ||
      url.includes('shipment') ||
      url.includes('container') ||
      (url.includes('/api/') && response.request().method() === 'POST')
    ) {
      try {
        const contentType = response.headers()['content-type'] || ''
        if (contentType.includes('json')) {
          const body = await response.json()
          const request = response.request()

          const apiCall = {
            url,
            method: request.method(),
            status: response.status(),
            requestHeaders: request.headers(),
            requestBody: request.postData(),
            responseBody: body,
          }

          apiResponses.push(apiCall)
          console.log(`📡 Captured API call: ${request.method()} ${url}`)
        }
      } catch (e) {
        // Not JSON or failed to parse
      }
    }
  })

  console.log('📄 Navigating to MSC tracking page...')
  await page.goto('https://www.msc.com/en/track-a-shipment', { waitUntil: 'networkidle' })

  console.log(`✏️  Filling tracking number: ${TRACKING_NUMBER}`)
  await page.locator('input[id*="track"]').first().fill(TRACKING_NUMBER)

  console.log('🔘 Clicking submit button...')
  await page.locator('button[type="submit"]').first().click()

  console.log('⏳ Waiting for API responses (10 seconds)...')
  await page.waitForTimeout(10000)

  await browser.close()

  // Save results
  if (apiResponses.length > 0) {
    console.log(`\n✅ Captured ${apiResponses.length} API calls`)

    writeFileSync('msc-api-responses.json', JSON.stringify(apiResponses, null, 2))
    console.log('\n📁 Saved to: msc-api-responses.json')

    // Print summary
    console.log('\n📊 Summary:')
    apiResponses.forEach((api, i) => {
      console.log(`\n${i + 1}. ${api.method} ${api.url}`)
      console.log(`   Status: ${api.status}`)
      if (api.requestBody) {
        console.log(`   Request: ${api.requestBody.slice(0, 200)}`)
      }
      console.log(`   Response: ${JSON.stringify(api.responseBody).slice(0, 200)}`)
    })
  } else {
    console.log('\n⚠️  No tracking API calls captured')
    console.log('   MSC might be using a different mechanism (iframe, redirect, etc.)')
  }
}

captureMSCAPI().catch(console.error)
