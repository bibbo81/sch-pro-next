'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface WidgetCostsProps {
  title: string
  metric_type: string
  data_config: any
}

interface CostData {
  total_cost: number
  avg_cost_per_shipment: number
  cost_by_type: Record<string, number>
  trend?: number
}

export default function WidgetCosts({ title, metric_type, data_config }: WidgetCostsProps) {
  const [data, setData] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCostData()
  }, [])

  const fetchCostData = async () => {
    try {
      const response = await fetch('/api/analytics/metrics')
      const result = await response.json()

      if (result.metrics?.costs) {
        const currentCost = result.metrics.costs.total_cost || 0
        const previousCost = result.previous?.costs?.total_cost || 0
        const trend = previousCost > 0
          ? ((currentCost - previousCost) / previousCost) * 100
          : 0

        setData({
          ...result.metrics.costs,
          trend
        })
      }
    } catch (error) {
      console.error('Error fetching cost data:', error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-400">
            <DollarSign className="w-12 h-12 mx-auto mb-2" />
            <p>Nessun dato sui costi</p>
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
        <div className="space-y-4">
          {/* Total Cost */}
          <div>
            <div className="text-sm text-gray-600 mb-1">Costo Totale</div>
            <div className="text-2xl font-bold">
              €{data.total_cost.toLocaleString('it-IT')}
            </div>
            {data.trend !== undefined && (
              <div className={`flex items-center gap-1 text-sm mt-1 ${
                data.trend > 0 ? 'text-red-500' : data.trend < 0 ? 'text-green-500' : 'text-gray-500'
              }`}>
                {data.trend > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : data.trend < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : null}
                <span>{Math.abs(data.trend).toFixed(1)}% vs periodo precedente</span>
              </div>
            )}
          </div>

          {/* Average Cost */}
          <div className="pt-3 border-t">
            <div className="text-sm text-gray-600 mb-1">Costo Medio per Spedizione</div>
            <div className="text-xl font-semibold">
              €{data.avg_cost_per_shipment.toLocaleString('it-IT')}
            </div>
          </div>

          {/* Cost by Type */}
          {data.cost_by_type && Object.keys(data.cost_by_type).length > 0 && (
            <div className="pt-3 border-t">
              <div className="text-sm text-gray-600 mb-2">Breakdown per Tipologia</div>
              <div className="space-y-2">
                {Object.entries(data.cost_by_type).map(([type, amount]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 capitalize">{type}</span>
                    <span className="font-medium">€{amount.toLocaleString('it-IT')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
