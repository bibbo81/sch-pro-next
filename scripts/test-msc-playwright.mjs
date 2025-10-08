#!/usr/bin/env node
/**
 * Test MSC tracking with Playwright
 * This script opens MSC tracking page, fills the form, and captures the response
 */

import { chromium } from 'playwright'

const TRACKING_NUMBER = 'MEDU7905689'

async function testMSCTracking() {
  console.log('🚀 Starting MSC Playwright test...\n')

  const browser = await chromium.launch({ headless: false }) // visible for debugging
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  })
  const page = await context.newPage()

  // Listen for API responses
  page.on('response', async (response) => {
    const url = response.url()
    if (url.includes('track') || url.includes('api')) {
      console.log(`\n📡 API Call detected:`)
      console.log(`   URL: ${url}`)
      console.log(`   Status: ${response.status()}`)
      console.log(`   Method: ${response.request().method()}`)

      if (response.request().postData()) {
        console.log(`   Payload: ${response.request().postData()}`)
      }

      try {
        const body = await response.text()
        console.log(`   Response: ${body.slice(0, 500)}`)
      } catch (e) {
        console.log(`   Response: [binary or empty]`)
      }
    }
  })

  console.log('📄 Navigating to MSC tracking page...')
  await page.goto('https://www.msc.com/en/track-a-shipment', { waitUntil: 'networkidle' })

  console.log('🔍 Looking for tracking input field...')

  // Try to find and fill tracking input
  const inputSelectors = [
    'input[type="text"]',
    'input[name*="track"]',
    'input[placeholder*="track"]',
    'input[id*="track"]',
    '#trackingNumber',
    '[data-testid*="track"]',
  ]

  let inputFound = false
  for (const selector of inputSelectors) {
    try {
      const input = await page.locator(selector).first()
      if (await input.isVisible()) {
        console.log(`   ✅ Found input: ${selector}`)
        await input.fill(TRACKING_NUMBER)
        inputFound = true
        break
      }
    } catch (e) {
      // Continue to next selector
    }
  }

  if (!inputFound) {
    console.log('   ❌ No tracking input found. Taking screenshot...')
    await page.screenshot({ path: 'msc-page.png' })
    console.log('   Screenshot saved: msc-page.png')
    await browser.close()
    return
  }

  console.log('\n🔘 Looking for submit button...')

  const buttonSelectors = [
    'button[type="submit"]',
    'button:has-text("Track")',
    'button:has-text("Search")',
    '.track-button',
    '.submit-button',
  ]

  let buttonFound = false
  for (const selector of buttonSelectors) {
    try {
      const button = await page.locator(selector).first()
      if (await button.isVisible()) {
        console.log(`   ✅ Found button: ${selector}`)
        console.log('\n📤 Submitting form...')
        await button.click()
        buttonFound = true
        break
      }
    } catch (e) {
      // Continue to next selector
    }
  }

  if (buttonFound) {
    console.log('   ⏳ Waiting for response...')
    await page.waitForTimeout(5000)
  } else {
    console.log('   ❌ No submit button found')
  }

  await browser.close()
  console.log('\n✅ Test complete!')
}

testMSCTracking().catch(console.error)
