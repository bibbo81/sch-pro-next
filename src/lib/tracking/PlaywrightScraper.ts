/**
 * Playwright-based Web Scraper
 * For carriers that require JavaScript rendering and have anti-bot protection
 * Phase 6.1 - Enhanced Web Scraping with Browser Automation
 */

import { chromium, Browser, Page } from 'playwright'
import { BaseCarrierScraper, TrackingResult, ScraperConfig } from './BaseCarrierScraper'

export abstract class PlaywrightScraper extends BaseCarrierScraper {
  private browser: Browser | null = null
  private page: Page | null = null

  constructor(config: ScraperConfig) {
    super(config)
  }

  /**
   * Initialize browser instance (headless mode)
   */
  protected async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      })
    }

    if (!this.page) {
      const context = await this.browser.newContext({
        userAgent: this.config.userAgent,
        viewport: { width: 1920, height: 1080 },
        locale: 'en-US',
      })
      this.page = await context.newPage()

      // Block unnecessary resources to speed up scraping
      await this.page.route('**/*', (route) => {
        const resourceType = route.request().resourceType()
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          route.abort()
        } else {
          route.continue()
        }
      })
    }
  }

  /**
   * Close browser instance
   */
  protected async closeBrowser(): Promise<void> {
    if (this.page) {
      await this.page.close()
      this.page = null
    }
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  /**
   * Navigate to URL and wait for page load
   */
  protected async navigateToPage(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initBrowser() first.')
    }

    await this.page.goto(url, {
      waitUntil: 'networkidle',
      timeout: this.config.timeout,
    })
  }

  /**
   * Get current page instance
   */
  protected getPage(): Page {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initBrowser() first.')
    }
    return this.page
  }

  /**
   * Execute tracking with automatic browser lifecycle
   */
  async track(trackingNumber: string): Promise<TrackingResult> {
    try {
      await this.initBrowser()
      const result = await this.performTracking(trackingNumber)
      return result
    } catch (error) {
      return this.createErrorResult(
        trackingNumber,
        error instanceof Error ? error.message : 'Unknown error occurred'
      )
    } finally {
      await this.closeBrowser()
    }
  }

  /**
   * Perform actual tracking (to be implemented by subclasses)
   */
  protected abstract performTracking(trackingNumber: string): Promise<TrackingResult>
}
