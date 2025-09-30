import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, createSupabaseServer } from '@/lib/auth'

/**
 * GET /api/analytics/metrics
 * Get analytics metrics for organization
 */
export async function GET(request: NextRequest) {
  try {
    const { user, organizationId } = await requireAuth()
    const supabase = await createSupabaseServer()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0]
    const comparePrevious = searchParams.get('compare') === 'true'

    // Calculate current period metrics
    const { data: currentMetrics, error: currentError } = await supabase
      .rpc('calculate_organization_metrics', {
        org_id: organizationId,
        start_date: startDate,
        end_date: endDate
      })

    if (currentError) {
      console.error('[Analytics Metrics] Error calculating current metrics:', currentError)
      return NextResponse.json(
        { error: 'Failed to calculate metrics' },
        { status: 500 }
      )
    }

    // If comparison requested, calculate previous period
    if (comparePrevious) {
      const daysDiff = Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
      const previousStart = new Date(new Date(startDate).getTime() - daysDiff * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const previousEnd = new Date(new Date(startDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data: trendingMetrics, error: trendError } = await supabase
        .rpc('get_trending_metrics', {
          org_id: organizationId,
          current_start: startDate,
          current_end: endDate,
          previous_start: previousStart,
          previous_end: previousEnd
        })

      if (trendError) {
        console.error('[Analytics Metrics] Error calculating trends:', trendError)
      } else {
        return NextResponse.json({
          metrics: trendingMetrics,
          period: {
            current: { start: startDate, end: endDate },
            previous: { start: previousStart, end: previousEnd }
          }
        }, { status: 200 })
      }
    }

    return NextResponse.json({
      metrics: currentMetrics,
      period: { start: startDate, end: endDate }
    }, { status: 200 })

  } catch (error: any) {
    console.error('[Analytics Metrics] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics metrics' },
      { status: 500 }
    )
  }
}
