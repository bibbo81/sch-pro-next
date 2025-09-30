'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Database, HardDrive, RefreshCw, AlertTriangle, Table } from 'lucide-react'
import Link from 'next/link'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface TableData {
  table_name: string
  row_count: number
  total_size_bytes: number | null
  total_size_mb: string
  table_size_bytes: number | null
  indexes_size_bytes: number | null
  error?: string
}

interface StorageMetrics {
  storage: {
    totalSizeBytes: number | null
    totalSizeMB: number | null
    totalSizeGB: number | null
    tablesCount: number
    message?: string
  }
  tables: TableData[]
  largestTables: TableData[]
}

export default function StoragePage() {
  const [metrics, setMetrics] = useState<StorageMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/super-admin/storage')

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setMetrics(data)
    } catch (error: any) {
      console.error('Error fetching storage metrics:', error)
      setError(error.message || 'Failed to load storage metrics')
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
          <p className="text-muted-foreground">Loading storage metrics...</p>
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
            <h2 className="text-2xl font-bold text-foreground mb-4">Storage Data Unavailable</h2>
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

  const hasSizeData = metrics.storage.totalSizeBytes !== null

  // Prepare pie chart data for largest tables
  const pieChartData = {
    labels: metrics.largestTables.map(t => t.table_name.replace('public.', '')),
    datasets: [
      {
        label: hasSizeData ? 'Size (MB)' : 'Row Count',
        data: metrics.largestTables.map(t =>
          hasSizeData ? parseFloat(t.total_size_mb) : t.row_count
        ),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const formatBytes = (bytes: number | null) => {
    if (bytes === null) return 'N/A'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Database Storage
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor database table sizes and storage usage
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

      {/* Warning if size data not available */}
      {!hasSizeData && metrics.storage.message && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Size Data Unavailable
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {metrics.storage.message}. Run the SQL migration to enable full storage tracking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasSizeData ? `${metrics.storage.totalSizeGB?.toFixed(3)} GB` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasSizeData ? `${metrics.storage.totalSizeMB?.toFixed(2)} MB` : 'Size data unavailable'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            <Table className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.storage.tablesCount}</div>
            <p className="text-xs text-muted-foreground">
              Active database tables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.tables.reduce((sum, t) => sum + t.row_count, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all tables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Table</CardTitle>
            <Table className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.largestTables[0]?.table_name.replace('public.', '') || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasSizeData
                ? `${metrics.largestTables[0]?.total_size_mb} MB`
                : `${metrics.largestTables[0]?.row_count.toLocaleString()} rows`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Largest Tables Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Largest Tables Distribution</CardTitle>
            <CardDescription>
              Top 5 tables by {hasSizeData ? 'size' : 'row count'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-full max-w-md">
              <Pie data={pieChartData} options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || ''
                        const value = context.parsed
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                        const percentage = ((value / total) * 100).toFixed(1)
                        return `${label}: ${value.toFixed(2)} (${percentage}%)`
                      }
                    }
                  }
                }
              }} />
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Largest Tables List */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Largest Tables</CardTitle>
            <CardDescription>
              Detailed breakdown of largest tables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.largestTables.map((table, index) => (
                <div key={table.table_name} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">
                        {table.table_name.replace('public.', '')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {table.row_count.toLocaleString()} rows
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {hasSizeData ? `${table.total_size_mb} MB` : `${table.row_count} rows`}
                    </p>
                    {hasSizeData && table.indexes_size_bytes && (
                      <p className="text-xs text-muted-foreground">
                        Indexes: {formatBytes(table.indexes_size_bytes)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Tables */}
      <Card>
        <CardHeader>
          <CardTitle>All Database Tables</CardTitle>
          <CardDescription>
            Complete list of all tables with storage information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold">Table Name</th>
                  <th className="text-right p-3 font-semibold">Rows</th>
                  {hasSizeData && (
                    <>
                      <th className="text-right p-3 font-semibold">Total Size</th>
                      <th className="text-right p-3 font-semibold">Table Size</th>
                      <th className="text-right p-3 font-semibold">Indexes</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {metrics.tables.map((table) => (
                  <tr key={table.table_name} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs">
                      {table.table_name.replace('public.', '')}
                    </td>
                    <td className="text-right p-3">
                      {table.row_count.toLocaleString()}
                    </td>
                    {hasSizeData && (
                      <>
                        <td className="text-right p-3 font-medium">
                          {table.total_size_mb} MB
                        </td>
                        <td className="text-right p-3 text-muted-foreground">
                          {formatBytes(table.table_size_bytes)}
                        </td>
                        <td className="text-right p-3 text-muted-foreground">
                          {formatBytes(table.indexes_size_bytes)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}