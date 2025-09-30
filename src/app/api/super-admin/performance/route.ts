import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-super-admin'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: Request) {
  try {
    await requireSuperAdmin()

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '24h' // 1h, 24h, 7d, 30d
    const endpoint = searchParams.get('endpoint') || null

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Calculate time range
    let hoursBack = 24
    switch (timeRange) {
      case '1h':
        hoursBack = 1
        break
      case '24h':
        hoursBack = 24
        break
      case '7d':
        hoursBack = 24 * 7
        break
      case '30d':
        hoursBack = 24 * 30
        break
    }

    const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()

    // Build query
    let query = supabase
      .from('api_performance_logs')
      .select('*')
      .gte('created_at', startTime)
      .order('created_at', { ascending: false })

    if (endpoint) {
      query = query.eq('endpoint', endpoint)
    }

    const { data: logs, error } = await query.limit(1000)

    if (error) {
      console.error('Error fetching performance logs:', error)
      return NextResponse.json({
        error: 'Failed to fetch logs',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    // If no logs, return empty metrics structure
    if (!logs || logs.length === 0) {
      return NextResponse.json({
        summary: {
          totalRequests: 0,
          errorCount: 0,
          errorRate: '0.00',
          avgResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: 0,
          p95ResponseTime: 0,
          p99ResponseTime: 0,
          timeRange,
        },
        endpointBreakdown: [],
        timeSeries: [],
        slowQueries: [],
      })
    }

    // Calculate metrics
    const totalRequests = logs.length
    const errorCount = logs.filter(log => log.status_code >= 400).length
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0

    const responseTimes = logs.map(log => log.response_time_ms).sort((a, b) => a - b)
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0
    const maxResponseTime = responseTimes.length > 0 ? responseTimes[responseTimes.length - 1] : 0
    const minResponseTime = responseTimes.length > 0 ? responseTimes[0] : 0
    const p95Index = Math.floor(responseTimes.length * 0.95)
    const p99Index = Math.floor(responseTimes.length * 0.99)
    const p95ResponseTime = responseTimes.length > 0 ? responseTimes[p95Index] : 0
    const p99ResponseTime = responseTimes.length > 0 ? responseTimes[p99Index] : 0

    // Get endpoint breakdown
    const endpointStats = logs.reduce((acc: any, log) => {
      if (!acc[log.endpoint]) {
        acc[log.endpoint] = {
          endpoint: log.endpoint,
          count: 0,
          errors: 0,
          totalResponseTime: 0,
        }
      }
      acc[log.endpoint].count++
      acc[log.endpoint].totalResponseTime += log.response_time_ms
      if (log.status_code >= 400) {
        acc[log.endpoint].errors++
      }
      return acc
    }, {})

    const endpointBreakdown = Object.values(endpointStats).map((stat: any) => ({
      endpoint: stat.endpoint,
      requests: stat.count,
      errors: stat.errors,
      errorRate: ((stat.errors / stat.count) * 100).toFixed(2),
      avgResponseTime: Math.round(stat.totalResponseTime / stat.count),
    })).sort((a: any, b: any) => b.requests - a.requests)

    // Time series data (grouped by hour)
    const timeSeriesData = logs.reduce((acc: any, log) => {
      const hour = new Date(log.created_at).toISOString().substring(0, 13) + ':00:00'
      if (!acc[hour]) {
        acc[hour] = {
          timestamp: hour,
          requests: 0,
          errors: 0,
          totalResponseTime: 0,
        }
      }
      acc[hour].requests++
      acc[hour].totalResponseTime += log.response_time_ms
      if (log.status_code >= 400) {
        acc[hour].errors++
      }
      return acc
    }, {})

    const timeSeries = Object.values(timeSeriesData)
      .map((data: any) => ({
        timestamp: data.timestamp,
        requests: data.requests,
        errors: data.errors,
        errorRate: ((data.errors / data.requests) * 100).toFixed(2),
        avgResponseTime: Math.round(data.totalResponseTime / data.requests),
      }))
      .sort((a: any, b: any) => a.timestamp.localeCompare(b.timestamp))

    // Slow queries (response time > 1000ms)
    const slowQueries = logs
      .filter(log => log.response_time_ms > 1000)
      .slice(0, 10)
      .map(log => ({
        endpoint: log.endpoint,
        method: log.method,
        responseTime: log.response_time_ms,
        statusCode: log.status_code,
        timestamp: log.created_at,
        errorMessage: log.error_message,
      }))

    return NextResponse.json({
      summary: {
        totalRequests,
        errorCount,
        errorRate: errorRate.toFixed(2),
        avgResponseTime,
        maxResponseTime,
        minResponseTime,
        p95ResponseTime,
        p99ResponseTime,
        timeRange,
      },
      endpointBreakdown,
      timeSeries,
      slowQueries,
    })
  } catch (error: any) {
    console.error('Performance metrics error:', error)
    return NextResponse.json({ error: 'Unauthorized or error' }, { status: 401 })
  }
}