'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, TrendingUp, TrendingDown, Activity, AlertTriangle, Clock, Zap, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface PerformanceMetrics {
  summary: {
    totalRequests: number
    errorCount: number
    errorRate: string
    avgResponseTime: number
    maxResponseTime: number
    minResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    timeRange: string
  }
  endpointBreakdown: Array<{
    endpoint: string
    requests: number
    errors: number
    errorRate: string
    avgResponseTime: number
  }>
  timeSeries: Array<{
    timestamp: string
    requests: number
    errors: number
    errorRate: string
    avgResponseTime: number
  }>
  slowQueries: Array<{
    endpoint: string
    method: string
    responseTime: number
    statusCode: number
    timestamp: string
    errorMessage?: string
  }>
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('24h')
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/super-admin/performance?timeRange=${timeRange}`)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setMetrics(data)
    } catch (error: any) {
      console.error('Error fetching performance metrics:', error)
      setError(error.message || 'Failed to load performance metrics')
      setMetrics(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [timeRange])

  if (loading && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading performance metrics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Performance Data Unavailable</h2>
            <div className="bg-red-50 dark:bg-red-950 border-2 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded text-sm mb-6">
              <p className="font-semibold mb-2">Error:</p>
              <p>{error}</p>
            </div>
            <div className="text-left text-sm text-muted-foreground space-y-2 mb-6">
              <p className="font-semibold">Possible causes:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Database migration not applied yet</li>
                <li>Missing SUPABASE_SERVICE_ROLE_KEY environment variable</li>
                <li>RLS policies not configured correctly</li>
                <li>No performance data collected yet</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={fetchMetrics} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
              <Link href="/super-admin">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  // Prepare chart data
  const timeSeriesChartData = {
    labels: metrics.timeSeries.map(d => new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
    datasets: [
      {
        label: 'Requests',
        data: metrics.timeSeries.map(d => d.requests),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Errors',
        data: metrics.timeSeries.map(d => d.errors),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const responseTimeChartData = {
    labels: metrics.timeSeries.map(d => new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
    datasets: [
      {
        label: 'Avg Response Time (ms)',
        data: metrics.timeSeries.map(d => d.avgResponseTime),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const endpointChartData = {
    labels: metrics.endpointBreakdown.slice(0, 10).map(e => e.endpoint.substring(0, 30)),
    datasets: [
      {
        label: 'Requests',
        data: metrics.endpointBreakdown.slice(0, 10).map(e => e.requests),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Performance Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            API response times, error rates, and system performance metrics
          </p>
        </div>
        <Link href="/super-admin">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {['1h', '24h', '7d', '30d'].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === '1h' && 'Last Hour'}
            {range === '24h' && 'Last 24 Hours'}
            {range === '7d' && 'Last 7 Days'}
            {range === '30d' && 'Last 30 Days'}
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.summary.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">in {timeRange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {metrics.summary.errorRate}%
              {parseFloat(metrics.summary.errorRate) > 5 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{metrics.summary.errorCount} errors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.summary.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              P95: {metrics.summary.p95ResponseTime}ms | P99: {metrics.summary.p99ResponseTime}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slowest Request</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.summary.maxResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Fastest: {metrics.summary.minResponseTime}ms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Requests & Errors Over Time</CardTitle>
            <CardDescription>Traffic and error patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <Line data={timeSeriesChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
            <CardDescription>Average response time per hour</CardDescription>
          </CardHeader>
          <CardContent>
            <Line data={responseTimeChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Endpoints by Traffic</CardTitle>
            <CardDescription>Most requested endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar data={endpointChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endpoint Statistics</CardTitle>
            <CardDescription>Performance breakdown by endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {metrics.endpointBreakdown.slice(0, 10).map((endpoint) => (
                <div key={endpoint.endpoint} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{endpoint.endpoint}</p>
                    <p className="text-xs text-muted-foreground">
                      {endpoint.requests} requests | {endpoint.avgResponseTime}ms avg
                    </p>
                  </div>
                  <Badge variant={parseFloat(endpoint.errorRate) > 5 ? 'destructive' : 'default'}>
                    {endpoint.errorRate}% errors
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slow Queries */}
      {metrics.slowQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Slow Queries ({">"} 1000ms)
            </CardTitle>
            <CardDescription>Endpoints that need optimization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.slowQueries.map((query, index) => (
                <div key={index} className="p-4 border-2 border-yellow-500 rounded bg-yellow-50 dark:bg-yellow-950">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{query.method}</Badge>
                        <span className="font-semibold text-sm">{query.endpoint}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {query.responseTime}ms
                        </span>
                        <span>Status: {query.statusCode}</span>
                        <span>{new Date(query.timestamp).toLocaleString()}</span>
                      </div>
                      {query.errorMessage && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                          Error: {query.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}