/**
 * MSC (Mediterranean Shipping Company) Scraper
 * Market Share: 40% (Italy)
 * Priority: #1 CRITICAL
 *
 * Tracking URL: https://www.msc.com/track-a-shipment
 */

import { BaseCarrierScraper, TrackingResult, ScraperConfig } from '../BaseCarrierScraper'

export class MSCScraper extends BaseCarrierScraper {
  constructor() {
    const config: ScraperConfig = {
      carrier: 'msc',
      name: 'MSC (Mediterranean Shipping Company)',
      baseUrl: 'https://www.msc.com/api/feature/tools/track',
      cacheTTL: 7200, // 2 hours
      timeout: 30000,
      retryAttempts: 3,
    }
    super(config)
  }

  /**
   * Validate MSC tracking number
   * Accepts: Container number (MSCU1234567), BL number, Booking number
   */
  validateTrackingNumber(trackingNumber: string): boolean {
    if (!trackingNumber) return false

    const cleaned = trackingNumber.toUpperCase().trim()

    // Container number: MSCU + 7 digits (MSC specific prefix)
    const containerPattern = /^MSCU\d{7}$/
    if (containerPattern.test(cleaned)) return true

    // BL number: Various formats, typically 10-13 alphanumeric
    const blPattern = /^[A-Z0-9]{10,13}$/
    if (blPattern.test(cleaned)) return true

    // Booking number: Various formats
    const bookingPattern = /^[A-Z0-9]{6,12}$/
    if (bookingPattern.test(cleaned)) return true

    return false
  }

  /**
   * Track shipment via MSC API
   * Note: MSC provides a public API endpoint for tracking
   */
  async track(trackingNumber: string): Promise<TrackingResult> {
    if (!this.validateTrackingNumber(trackingNumber)) {
      return this.createErrorResult(
        trackingNumber,
        'Invalid MSC tracking number format'
      )
    }

    try {
      return await this.withRetry(async () => {
        const result = await this.fetchTracking(trackingNumber)
        return result
      })
    } catch (error) {
      return this.createErrorResult(
        trackingNumber,
        error instanceof Error ? error.message : 'Unknown error occurred'
      )
    }
  }

  /**
   * Fetch tracking data from MSC API
   */
  private async fetchTracking(trackingNumber: string): Promise<TrackingResult> {
    const url = `${this.config.baseUrl}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': this.config.userAgent!,
        'Accept': 'application/json',
        'Origin': 'https://www.msc.com',
        'Referer': 'https://www.msc.com/track-a-shipment',
      },
      body: JSON.stringify({
        trackingNumber: trackingNumber.toUpperCase().trim(),
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    })

    if (!response.ok) {
      throw new Error(`MSC API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Parse MSC response format
    return this.parseResponse(trackingNumber, data)
  }

  /**
   * Parse MSC API response into standard TrackingResult format
   */
  private parseResponse(trackingNumber: string, data: any): TrackingResult {
    // MSC API response structure (may need adjustment based on actual response)
    const container = data.containers?.[0] || data.container || data

    if (!container || container.error) {
      return this.createErrorResult(
        trackingNumber,
        container?.error || 'No tracking data found'
      )
    }

    // Extract events/milestones
    const events = (container.events || container.milestones || []).map((event: any) => ({
      timestamp: this.parseDate(event.date || event.timestamp) || new Date(),
      location: event.location || event.place || '',
      status: event.status || event.eventType || '',
      description: event.description || event.details || event.status || '',
      vessel: event.vessel || event.vesselName,
      voyage: event.voyage || event.voyageNumber,
    }))

    // Determine current status
    const latestEvent = events[0]
    const status = this.normalizeStatus(
      container.status || latestEvent?.status || 'unknown'
    )

    return {
      success: true,
      trackingNumber,
      carrier: 'msc',
      containerNumber: container.containerNumber || this.extractContainerNumber(trackingNumber),
      billOfLading: container.billOfLading || container.blNumber,
      bookingNumber: container.bookingNumber,
      status,
      origin: container.origin ? {
        port: container.origin.port || container.origin.name || '',
        terminal: container.origin.terminal,
        country: container.origin.country,
      } : undefined,
      destination: container.destination ? {
        port: container.destination.port || container.destination.name || '',
        terminal: container.destination.terminal,
        country: container.destination.country,
      } : undefined,
      vessel: container.vessel ? {
        name: container.vessel.name || container.vesselName || '',
        imo: container.vessel.imo,
        flag: container.vessel.flag,
      } : undefined,
      voyage: container.voyage || container.voyageNumber,
      etd: this.parseDate(container.etd || container.estimatedDeparture),
      atd: this.parseDate(container.atd || container.actualDeparture),
      eta: this.parseDate(container.eta || container.estimatedArrival),
      ata: this.parseDate(container.ata || container.actualArrival),
      events,
      rawData: container,
      scrapedAt: new Date(),
      cacheUntil: this.getCacheExpiration(),
    }
  }
}

// Export singleton instance
export const mscScraper = new MSCScraper()
