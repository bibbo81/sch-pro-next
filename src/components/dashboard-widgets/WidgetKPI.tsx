'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface WidgetKPIProps {
  title: string
  metric_type: string
  data_config: any
}

interface MetricData {
  value: number
  trend?: number
  previousValue?: number
}

export default function WidgetKPI({ title, metric_type, data_config }: WidgetKPIProps) {
  const [data, setData] = useState<MetricData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetricData()
  }, [metric_type])

  const fetchMetricData = async () => {
    try {
      // Fetch data from analytics API based on metric_type
      const response = await fetch(`/api/analytics/metrics?metric_type=${metric_type}`)
      const result = await response.json()

      // Extract the relevant metric value
      let value = 0
      let previousValue = 0

      if (result.metrics) {
        switch (metric_type) {
          case 'shipments':
            value = result.metrics.shipments?.total_shipments || 0
            previousValue = result.previous?.shipments?.total_shipments || 0
            break
          case 'products':
            value = result.metrics.products?.total_products || 0
            previousValue = result.previous?.products?.total_products || 0
            break
          case 'costs':
            value = result.metrics.costs?.total_cost || 0
            previousValue = result.previous?.costs?.total_cost || 0
            break
          case 'kpi':
          default:
            // Generic KPI - try to get total_shipments as default
            value = result.metrics.shipments?.total_shipments || 0
            previousValue = result.previous?.shipments?.total_shipments || 0
        }
      }

      // Calculate trend percentage
      const trend = previousValue > 0
        ? ((value - previousValue) / previousValue) * 100
        : 0

      setData({ value, trend, previousValue })
    } catch (error) {
      console.error('Error fetching KPI data:', error)
      setData({ value: 0, trend: 0 })
    } finally {
      setLoading(false)
    }
  }

  const formatValue = (value: number) => {
    if (metric_type === 'costs') {
      return `€${value.toLocaleString('it-IT')}`
    }
    return value.toLocaleString('it-IT')
  }

  const getTrendIcon = () => {
    if (!data?.trend) return <Minus className="w-4 h-4" />
    if (data.trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (data.trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4" />
  }

  const getTrendColor = () => {
    if (!data?.trend) return 'text-gray-500'
    if (data.trend > 0) return 'text-green-500'
    if (data.trend < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            {formatValue(data?.value || 0)}
          </div>
          {data?.trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(data.trend).toFixed(1)}%</span>
              <span className="text-gray-500">vs periodo precedente</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
