'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Database, RefreshCw, AlertTriangle, CheckCircle, Activity, TrendingUp, XCircle } from 'lucide-react'
import Link from 'next/link'

interface DatabaseHealthMetrics {
  connectionStats: {
    total: number
    active: number
    idle: number
    idle_in_transaction: number
    max_connections: number
    usage_percentage: number
    error?: string
  }
  cacheHitRatio: {
    cache_hit_ratio: number
    heap_blocks_read: number
    heap_blocks_hit: number
    status: 'excellent' | 'good' | 'fair' | 'poor'
    error?: string
  }
  tableStats: any[]
  indexUsage: any[]
  longQueries: {
    count: number
    queries: any[]
    error?: string
  }
  deadlocks: {
    total_deadlocks: number
    status: 'healthy' | 'warning' | 'critical'
    message: string
    error?: string
  }
  vacuumStats: any[]
  timestamp: string
}

export default function DatabaseHealthPage() {
  const [metrics, setMetrics] = useState<DatabaseHealthMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/super-admin/database-health')

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setMetrics(data)
    } catch (error: any) {
      console.error('Error fetching database health:', error)
      setError(error.message || 'Failed to load database health metrics')
      setMetrics(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  if (loading && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading database health metrics...</p>
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
            <h2 className="text-2xl font-bold text-foreground mb-4">Database Health Unavailable</h2>
            <div className="bg-red-50 dark:bg-red-950 border-2 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded text-sm mb-6">
              <p className="font-semibold mb-2">Error:</p>
              <p>{error}</p>
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'healthy':
        return <Badge className="bg-green-500">Excellent</Badge>
      case 'good':
        return <Badge className="bg-blue-500">Good</Badge>
      case 'fair':
      case 'warning':
        return <Badge className="bg-yellow-500">Warning</Badge>
      case 'poor':
      case 'critical':
        return <Badge className="bg-red-500">Critical</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'healthy':
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'fair':
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'poor':
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Database Health
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor database performance, connections, and integrity
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchMetrics} disabled={loading} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/super-admin">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Connection Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.connectionStats.total} / {metrics.connectionStats.max_connections}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.connectionStats.usage_percentage}% usage
            </p>
            <div className="text-xs mt-2">
              <span className="text-green-600 dark:text-green-400">Active: {metrics.connectionStats.active}</span>
              {' • '}
              <span className="text-gray-600 dark:text-gray-400">Idle: {metrics.connectionStats.idle}</span>
            </div>
          </CardContent>
        </Card>

        {/* Cache Hit Ratio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.cacheHitRatio.cache_hit_ratio}%
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Target: &gt; 99%
            </p>
            {getStatusBadge(metrics.cacheHitRatio.status)}
          </CardContent>
        </Card>

        {/* Long Queries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Long Queries</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.longQueries.count}
            </div>
            <p className="text-xs text-muted-foreground">
              Running &gt; 30 seconds
            </p>
            {metrics.longQueries.count === 0 ? (
              <Badge className="bg-green-500 mt-2">Healthy</Badge>
            ) : (
              <Badge className="bg-yellow-500 mt-2">Warning</Badge>
            )}
          </CardContent>
        </Card>

        {/* Deadlocks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deadlocks</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.deadlocks.total_deadlocks}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Since database start
            </p>
            {getStatusBadge(metrics.deadlocks.status)}
          </CardContent>
        </Card>
      </div>

      {/* Table Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Table Access Statistics</CardTitle>
          <CardDescription>
            Top 10 most accessed tables (sequential scans vs index scans)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold">Table</th>
                  <th className="text-right p-3 font-semibold">Seq Scans</th>
                  <th className="text-right p-3 font-semibold">Index Scans</th>
                  <th className="text-right p-3 font-semibold">Live Rows</th>
                  <th className="text-right p-3 font-semibold">Dead Rows</th>
                  <th className="text-right p-3 font-semibold">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {metrics.tableStats.slice(0, 10).map((table: any) => (
                  <tr key={table.table_name} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs">
                      {table.table_name.replace('public.', '')}
                    </td>
                    <td className="text-right p-3">
                      {table.sequential_scans?.toLocaleString()}
                    </td>
                    <td className="text-right p-3">
                      {table.index_scans?.toLocaleString()}
                    </td>
                    <td className="text-right p-3">
                      {table.live_tuples?.toLocaleString()}
                    </td>
                    <td className="text-right p-3">
                      {table.dead_tuples?.toLocaleString()}
                    </td>
                    <td className="text-right p-3">
                      <Badge variant={table.efficiency_score > 80 ? 'default' : 'secondary'}>
                        {table.efficiency_score}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Index Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Index Usage Analysis</CardTitle>
          <CardDescription>
            Indexes with low usage (candidates for removal)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold">Index Name</th>
                  <th className="text-left p-3 font-semibold">Table</th>
                  <th className="text-right p-3 font-semibold">Scans</th>
                  <th className="text-right p-3 font-semibold">Size (MB)</th>
                  <th className="text-right p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.indexUsage.slice(0, 10).map((index: any) => (
                  <tr key={index.index_name} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs">
                      {index.index_name}
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {index.table_name?.replace('public.', '')}
                    </td>
                    <td className="text-right p-3">
                      {index.index_scans?.toLocaleString()}
                    </td>
                    <td className="text-right p-3">
                      {index.index_size_mb}
                    </td>
                    <td className="text-right p-3">
                      <Badge variant={index.usage_status === 'unused' ? 'destructive' : 'outline'}>
                        {index.usage_status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Long Running Queries */}
      {metrics.longQueries.count > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              Long Running Queries
            </CardTitle>
            <CardDescription>
              Queries running longer than 30 seconds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.longQueries.queries.map((query: any, index: number) => (
                <div key={query.pid} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">PID: {query.pid}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {query.duration_seconds}s
                    </span>
                  </div>
                  <code className="text-xs bg-black/10 dark:bg-white/10 p-2 rounded block">
                    {query.query}
                  </code>
                  <div className="text-xs text-muted-foreground mt-1">
                    User: {query.username} • Started: {new Date(query.started_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vacuum Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Vacuum & Analyze Status</CardTitle>
          <CardDescription>
            Tables that may need maintenance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold">Table</th>
                  <th className="text-right p-3 font-semibold">Dead Tuples</th>
                  <th className="text-right p-3 font-semibold">Dead %</th>
                  <th className="text-right p-3 font-semibold">Last Vacuum</th>
                  <th className="text-right p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.vacuumStats.slice(0, 10).map((stat: any) => (
                  <tr key={stat.table_name} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs">
                      {stat.table_name.replace('public.', '')}
                    </td>
                    <td className="text-right p-3">
                      {stat.dead_tuples?.toLocaleString()}
                    </td>
                    <td className="text-right p-3">
                      {stat.dead_tuple_ratio}%
                    </td>
                    <td className="text-right p-3 text-xs">
                      {stat.last_autovacuum ? new Date(stat.last_autovacuum).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="text-right p-3">
                      {stat.needs_vacuum ? (
                        <Badge className="bg-yellow-500">Needs Vacuum</Badge>
                      ) : (
                        <Badge className="bg-green-500">Healthy</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Timestamp */}
      <p className="text-xs text-muted-foreground text-center">
        Last updated: {new Date(metrics.timestamp).toLocaleString()}
      </p>
    </div>
  )
}