/**
 * Tracking Orchestrator
 * Smart routing between 3-layer tracking system:
 * Layer 1: Web Scraping (11 carriers, priority 1)
 * Layer 2: JSONCargo API (fallback, priority 2)
 * Layer 3: ShipsGo API (ultimate fallback, priority 3)
 *
 * Phase 6.3 - Orchestrator Logic
 */

import { TrackingResult } from './BaseCarrierScraper'
import { mscScraperV2 } from './scrapers/MSCScraperV2'
import { createSupabaseServer } from '@/lib/auth'

// Carrier code to scraper mapping
const SCRAPER_MAP = {
  msc: mscScraperV2,      // V2: Uses Playwright for browser automation
  // maersk: maerskScraper,  // TODO: Implement
  // cma_cgm: cmaCGMScraper, // TODO: Implement
  // cosco: coscoScraper,    // TODO: Implement
  // ... other scrapers
}

export interface OrchestatorResult extends TrackingResult {
  provider: 'web_scraping' | 'jsoncargo' | 'shipsgo' | 'cache'
  fallbackUsed: boolean
  responseTime: number // milliseconds
  cached: boolean
}

export class TrackingOrchestrator {
  /**
   * Main tracking method with intelligent routing
   */
  async track(
    trackingNumber: string,
    options?: {
      carrier?: string
      forceRefresh?: boolean
      organizationId?: string
      preferredProvider?: 'web_scraping' | 'shipsgo'
    }
  ): Promise<OrchestatorResult> {
    const startTime = Date.now()
    const { carrier, forceRefresh = false, organizationId, preferredProvider } = options || {}

    try {
      // Step 1: Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await this.checkCache(trackingNumber, organizationId)
        if (cached) {
          return {
            ...cached,
            provider: 'cache',
            fallbackUsed: false,
            responseTime: Date.now() - startTime,
            cached: true,
          }
        }
      }

      // Step 2: Detect carrier if not provided
      const detectedCarrier = carrier || this.detectCarrier(trackingNumber)

      // If user prefers ShipsGo only, skip to Layer 3
      if (preferredProvider === 'shipsgo') {
        const result = await this.trackWithShipsGo(trackingNumber)
        await this.saveToCache(trackingNumber, result, organizationId)
        await this.logRequest(
          trackingNumber,
          'shipsgo',
          result.success ? 'success' : 'failed',
          Date.now() - startTime,
          detectedCarrier,
          organizationId
        )

        return {
          ...result,
          provider: 'shipsgo',
          fallbackUsed: false,
          responseTime: Date.now() - startTime,
          cached: false,
        }
      }

      // Step 3: Try Layer 1 (Web Scraping)
      if (detectedCarrier && this.hasScraperFor(detectedCarrier)) {
        try {
          const result = await this.scrapeCarrier(detectedCarrier, trackingNumber)
          if (result.success) {
            await this.saveToCache(trackingNumber, result, organizationId)
            await this.logRequest(
              trackingNumber,
              'web_scraping',
              'success',
              Date.now() - startTime,
              detectedCarrier,
              organizationId
            )

            return {
              ...result,
              provider: 'web_scraping',
              fallbackUsed: false,
              responseTime: Date.now() - startTime,
              cached: false,
            }
          }
        } catch (error) {
          console.error(`Layer 1 (scraping ${detectedCarrier}) failed:`, error)
          await this.logRequest(
            trackingNumber,
            'web_scraping',
            'failed',
            Date.now() - startTime,
            detectedCarrier,
            organizationId,
            error instanceof Error ? error.message : 'Unknown error'
          )

          // If user prefers web_scraping only and it failed, stop here
          if (preferredProvider === 'web_scraping') {
            throw new Error(
              `Web scraping failed for carrier: ${detectedCarrier}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
          }
        }
      } else {
        // No scraper available for this carrier
        if (preferredProvider === 'web_scraping') {
          throw new Error(
            `No web scraper available for carrier: ${detectedCarrier || 'unknown'}. ` +
            `Try switching to "Automatico" mode to use fallback providers.`
          )
        }
      }

      // Step 4: Try Layer 2 (JSONCargo API)
      try {
        const result = await this.trackWithJSONCargo(trackingNumber)
        if (result.success) {
          await this.saveToCache(trackingNumber, result, organizationId)
          await this.logRequest(
            trackingNumber,
            'jsoncargo',
            'fallback_used',
            Date.now() - startTime,
            detectedCarrier,
            organizationId
          )

          return {
            ...result,
            provider: 'jsoncargo',
            fallbackUsed: true,
            responseTime: Date.now() - startTime,
            cached: false,
          }
        }
      } catch (error) {
        console.error('Layer 2 (JSONCargo) failed:', error)
        await this.logRequest(
          trackingNumber,
          'jsoncargo',
          'failed',
          Date.now() - startTime,
          detectedCarrier,
          organizationId,
          error instanceof Error ? error.message : 'Unknown error'
        )
      }

      // Step 5: Try Layer 3 (ShipsGo - Ultimate Fallback)
      const result = await this.trackWithShipsGo(trackingNumber)
      await this.saveToCache(trackingNumber, result, organizationId)
      await this.logRequest(
        trackingNumber,
        'shipsgo',
        result.success ? 'fallback_used' : 'failed',
        Date.now() - startTime,
        detectedCarrier,
        organizationId,
        result.error
      )

      return {
        ...result,
        provider: 'shipsgo',
        fallbackUsed: true,
        responseTime: Date.now() - startTime,
        cached: false,
      }
    } catch (error) {
      // Ultimate error fallback
      return {
        success: false,
        trackingNumber,
        carrier: carrier || 'unknown',
        status: 'error',
        events: [],
        scrapedAt: new Date(),
        error: error instanceof Error ? error.message : 'All tracking layers failed',
        provider: 'shipsgo',
        fallbackUsed: true,
        responseTime: Date.now() - startTime,
        cached: false,
      }
    }
  }

  /**
   * Check cache for existing tracking data
   */
  private async checkCache(
    trackingNumber: string,
    organizationId?: string
  ): Promise<TrackingResult | null> {
    try {
      const supabase = await createSupabaseServer()

      const query = supabase
        .from('trackings')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (organizationId) {
        query.eq('organization_id', organizationId)
      }

      const { data, error } = await query

      if (error || !data || data.length === 0) return null

      const cached = data[0]

      // Check if cache is still fresh (within 2 hours)
      const cacheAge = Date.now() - new Date(cached.updated_at).getTime()
      const cacheTTL = 2 * 60 * 60 * 1000 // 2 hours in ms

      if (cacheAge > cacheTTL) return null

      // Convert DB format to TrackingResult
      return {
        success: true,
        trackingNumber: cached.tracking_number,
        carrier: cached.carrier_name || 'unknown',
        status: cached.status || 'unknown',
        origin: cached.origin_port ? { port: cached.origin_port } : undefined,
        destination: cached.destination_port ? { port: cached.destination_port } : undefined,
        eta: cached.eta ? new Date(cached.eta) : undefined,
        events: [],
        scrapedAt: new Date(cached.updated_at),
        rawData: cached.raw_data,
      }
    } catch (error) {
      console.error('Cache check failed:', error)
      return null
    }
  }

  /**
   * Save tracking result to cache (trackings table)
   */
  private async saveToCache(
    trackingNumber: string,
    result: TrackingResult,
    organizationId?: string
  ): Promise<void> {
    if (!organizationId) return

    try {
      const supabase = await createSupabaseServer()

      await supabase.from('trackings').upsert(
        {
          tracking_number: trackingNumber,
          organization_id: organizationId,
          carrier_name: result.carrier,
          status: result.status,
          origin_port: result.origin?.port,
          destination_port: result.destination?.port,
          eta: result.eta?.toISOString(),
          provider_used: result.carrier,
          raw_data: result.rawData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tracking_number,organization_id' }
      )
    } catch (error) {
      console.error('Failed to save to cache:', error)
    }
  }

  /**
   * Log tracking request to tracking_requests_log
   */
  private async logRequest(
    trackingNumber: string,
    provider: string,
    status: string,
    responseTime: number,
    carrier?: string,
    organizationId?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      const supabase = await createSupabaseServer()

      // Get provider_id from tracking_providers table
      const { data: providerData } = await supabase
        .from('tracking_providers')
        .select('id')
        .eq('provider', provider)
        .limit(1)

      if (!providerData || providerData.length === 0) return

      await supabase.from('tracking_requests_log').insert({
        organization_id: organizationId,
        provider_id: providerData[0].id,
        tracking_number: trackingNumber,
        tracking_type: 'container',
        carrier_name: carrier,
        status,
        response_time_ms: responseTime,
        error_message: errorMessage,
      })
    } catch (error) {
      console.error('Failed to log request:', error)
    }
  }

  /**
   * Detect carrier from tracking number pattern
   */
  private detectCarrier(trackingNumber: string): string | undefined {
    const cleaned = trackingNumber.toUpperCase().trim()

    // MSC: Multiple prefixes (MSCU, MEDU, TCLU, APZU, etc.) + 7 digits
    if (/^(MSCU|MEDU|TCLU|APZU)\d{7}/.test(cleaned)) return 'msc'

    // Maersk: MAEU + 7 digits
    if (/^MAEU\d{7}/.test(cleaned)) return 'maersk'

    // CMA CGM: CMAU + 7 digits
    if (/^CMAU\d{7}/.test(cleaned)) return 'cma_cgm'

    // COSCO: COSU, COSCO + 7 digits
    if (/^(COSU|COSCO)\d{7}/.test(cleaned)) return 'cosco'

    // Hapag-Lloyd: HLCU, HLXU + 7 digits
    if (/^(HLCU|HLXU)\d{7}/.test(cleaned)) return 'hapag_lloyd'

    // ONE: OOLU + 7 digits
    if (/^OOLU\d{7}/.test(cleaned)) return 'one'

    // Evergreen: EISU, EMCU + 7 digits
    if (/^(EISU|EMCU)\d{7}/.test(cleaned)) return 'evergreen'

    // Yang Ming: YMLU + 7 digits
    if (/^YMLU\d{7}/.test(cleaned)) return 'yang_ming'

    // HMM: HMCU + 7 digits
    if (/^HMCU\d{7}/.test(cleaned)) return 'hmm'

    // ZIM: ZIMU + 7 digits
    if (/^ZIMU\d{7}/.test(cleaned)) return 'zim'

    // OOCL: OOLU + 7 digits (same as ONE, check context)
    if (/^OOCU\d{7}/.test(cleaned)) return 'oocl'

    return undefined
  }

  /**
   * Check if we have a scraper for this carrier
   */
  private hasScraperFor(carrier: string): boolean {
    return carrier in SCRAPER_MAP
  }

  /**
   * Scrape carrier website
   */
  private async scrapeCarrier(
    carrier: string,
    trackingNumber: string
  ): Promise<TrackingResult> {
    const scraper = SCRAPER_MAP[carrier as keyof typeof SCRAPER_MAP]
    if (!scraper) {
      throw new Error(`No scraper available for carrier: ${carrier}`)
    }

    return await scraper.track(trackingNumber)
  }

  /**
   * Track with JSONCargo API (Layer 2)
   * TODO: Implement JSONCargo integration
   */
  private async trackWithJSONCargo(trackingNumber: string): Promise<TrackingResult> {
    // Placeholder for JSONCargo implementation
    throw new Error('JSONCargo integration not yet implemented')
  }

  /**
   * Track with ShipsGo API (Layer 3)
   * Calls ShipsGo API directly
   */
  private async trackWithShipsGo(trackingNumber: string): Promise<TrackingResult> {
    const SHIPSGO_API_BASE = 'https://api.shipsgo.com/v2'
    const SHIPSGO_API_KEY = process.env.SHIPSGO_API_KEY

    if (!SHIPSGO_API_KEY) {
      throw new Error('ShipsGo API key not configured')
    }

    const response = await fetch(`${SHIPSGO_API_BASE}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SHIPSGO_API_KEY}`,
      },
      body: JSON.stringify({
        tracking_number: trackingNumber,
        carrier_code: 'auto',
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `ShipsGo API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.data) {
      throw new Error('No data received from ShipsGo')
    }

    // Map ShipsGo response to TrackingResult format
    return {
      success: true,
      trackingNumber,
      carrier: data.data.carrier_name || 'unknown',
      status: this.mapShipsGoStatus(data.data.status),
      origin: data.data.origin?.name ? { port: data.data.origin.name } : undefined,
      destination: data.data.destination?.name ? { port: data.data.destination.name } : undefined,
      vessel: data.data.vessel?.name ? { name: data.data.vessel.name } : undefined,
      eta: data.data.estimated_arrival_time ? new Date(data.data.estimated_arrival_time) : undefined,
      events: (data.data.events || []).map((e: any) => ({
        date: new Date(e.timestamp),
        location: e.location || '',
        description: e.description || '',
        status: e.status || '',
      })),
      rawData: data.data,
      scrapedAt: new Date(),
    }
  }

  /**
   * Map ShipsGo status to standard status
   */
  private mapShipsGoStatus(status?: string): string {
    if (!status) return 'unknown'
    const normalized = status.toLowerCase()
    if (normalized.includes('delivered')) return 'delivered'
    if (normalized.includes('transit') || normalized.includes('sailing')) return 'in_transit'
    if (normalized.includes('arrived')) return 'arrived'
    if (normalized.includes('customs')) return 'customs_hold'
    if (normalized.includes('exception') || normalized.includes('delay')) return 'delayed'
    return normalized
  }
}

// Export singleton instance
export const trackingOrchestrator = new TrackingOrchestrator()
