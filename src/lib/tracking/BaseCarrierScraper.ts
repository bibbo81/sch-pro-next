/**
 * Base Carrier Scraper
 * Abstract class for all web scraping carrier implementations
 * Phase 6.1 - Layer 1 Web Scraping Engine
 */

export interface TrackingEvent {
  timestamp: Date
  location: string
  status: string
  description: string
  vessel?: string
  voyage?: string
}

export interface TrackingResult {
  success: boolean
  trackingNumber: string
  carrier: string
  containerNumber?: string
  billOfLading?: string
  bookingNumber?: string
  status: string
  origin?: {
    port: string
    terminal?: string
    country?: string
  }
  destination?: {
    port: string
    terminal?: string
    country?: string
  }
  vessel?: {
    name: string
    imo?: string
    flag?: string
  }
  voyage?: string
  etd?: Date // Estimated Time of Departure
  atd?: Date // Actual Time of Departure
  eta?: Date // Estimated Time of Arrival
  ata?: Date // Actual Time of Arrival
  events: TrackingEvent[]
  rawData?: any
  scrapedAt: Date
  cacheUntil?: Date
  error?: string
}

export interface ScraperConfig {
  carrier: string
  name: string
  baseUrl: string
  cacheTTL: number // seconds
  timeout: number // milliseconds
  retryAttempts: number
  userAgent?: string
}

export abstract class BaseCarrierScraper {
  protected config: ScraperConfig

  constructor(config: ScraperConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      ...config,
    }
  }

  /**
   * Main tracking method - must be implemented by each carrier
   */
  abstract track(trackingNumber: string): Promise<TrackingResult>

  /**
   * Validate tracking number format (carrier-specific)
   */
  abstract validateTrackingNumber(trackingNumber: string): boolean

  /**
   * Get carrier code/identifier
   */
  getCarrierCode(): string {
    return this.config.carrier
  }

  /**
   * Get carrier display name
   */
  getCarrierName(): string {
    return this.config.name
  }

  /**
   * Calculate cache expiration timestamp
   */
  protected getCacheExpiration(): Date {
    const now = new Date()
    return new Date(now.getTime() + this.config.cacheTTL * 1000)
  }

  /**
   * Normalize status to standard values
   */
  protected normalizeStatus(rawStatus: string): string {
    const status = rawStatus.toLowerCase()

    // Delivered
    if (status.includes('delivered') || status.includes('consegnato')) {
      return 'delivered'
    }

    // In Transit
    if (
      status.includes('transit') ||
      status.includes('in viaggio') ||
      status.includes('sailing') ||
      status.includes('departed')
    ) {
      return 'in_transit'
    }

    // At Port
    if (
      status.includes('arrival') ||
      status.includes('arrived') ||
      status.includes('discharged') ||
      status.includes('at port')
    ) {
      return 'at_port'
    }

    // Loaded
    if (status.includes('loaded') || status.includes('on board')) {
      return 'loaded'
    }

    // Booking
    if (status.includes('booking') || status.includes('booked')) {
      return 'booked'
    }

    // Empty
    if (status.includes('empty') || status.includes('returned')) {
      return 'empty'
    }

    // Default
    return 'unknown'
  }

  /**
   * Retry logic wrapper
   */
  protected async withRetry<T>(
    fn: () => Promise<T>,
    attempts: number = this.config.retryAttempts
  ): Promise<T> {
    let lastError: Error | undefined

    for (let i = 0; i < attempts; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        if (i < attempts - 1) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, i) * 1000
          await this.sleep(delay)
        }
      }
    }

    throw lastError || new Error('All retry attempts failed')
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Parse date string to Date object (handles multiple formats)
   */
  protected parseDate(dateStr: string): Date | undefined {
    if (!dateStr) return undefined

    try {
      // Try ISO format first
      const isoDate = new Date(dateStr)
      if (!isNaN(isoDate.getTime())) return isoDate

      // Try common formats: DD/MM/YYYY, MM-DD-YYYY, etc.
      // Add carrier-specific date parsing here if needed

      return undefined
    } catch {
      return undefined
    }
  }

  /**
   * Extract container number from various formats
   */
  protected extractContainerNumber(input: string): string | undefined {
    // Standard container format: 4 letters + 7 digits
    const match = input.match(/[A-Z]{4}\d{7}/)
    return match ? match[0] : undefined
  }

  /**
   * Create error result
   */
  protected createErrorResult(
    trackingNumber: string,
    error: string
  ): TrackingResult {
    return {
      success: false,
      trackingNumber,
      carrier: this.config.carrier,
      status: 'error',
      events: [],
      scrapedAt: new Date(),
      error,
    }
  }
}
