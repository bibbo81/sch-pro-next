/**
 * Universal Tracking API Endpoint
 * Uses 3-layer hybrid tracking system via TrackingOrchestrator
 * Phase 6 - Layer 1-3 Integration
 *
 * POST /api/tracking/track
 * Body: { tracking_number, carrier?, force_refresh? }
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { trackingOrchestrator } from '@/lib/tracking/TrackingOrchestrator'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, organizationId } = await requireAuth()

    // Parse request body
    const body = await request.json()
    const { tracking_number, carrier, force_refresh = false } = body

    // Validate tracking number
    if (!tracking_number || typeof tracking_number !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Tracking number is required' },
        { status: 400 }
      )
    }

    // Track using orchestrator
    const result = await trackingOrchestrator.track(tracking_number, {
      carrier,
      forceRefresh: force_refresh,
      organizationId,
    })

    // Return result
    return NextResponse.json({
      success: result.success,
      data: {
        tracking_number: result.trackingNumber,
        carrier: result.carrier,
        status: result.status,
        origin: result.origin,
        destination: result.destination,
        vessel: result.vessel,
        voyage: result.voyage,
        etd: result.etd,
        atd: result.atd,
        eta: result.eta,
        ata: result.ata,
        events: result.events,
        scraped_at: result.scrapedAt,
        cache_until: result.cacheUntil,
      },
      meta: {
        provider: result.provider,
        fallback_used: result.fallbackUsed,
        response_time_ms: result.responseTime,
        cached: result.cached,
      },
      error: result.error,
    })
  } catch (error) {
    console.error('Tracking API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
