'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface WidgetChartProps {
  title: string
  metric_type: string
  data_config: any
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function WidgetChart({ title, metric_type, data_config }: WidgetChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const chartType = data_config?.chart_type || 'bar'

  useEffect(() => {
    fetchChartData()
  }, [metric_type])

  const fetchChartData = async () => {
    try {
      const response = await fetch(`/api/analytics/metrics`)
      const result = await response.json()

      let chartData: any[] = []

      if (metric_type === 'shipments' && result.metrics?.shipments) {
        chartData = [
          { name: 'In Attesa', value: result.metrics.shipments.pending },
          { name: 'In Transito', value: result.metrics.shipments.in_transit },
          { name: 'Consegnate', value: result.metrics.shipments.delivered }
        ]
      } else if (metric_type === 'costs' && result.metrics?.costs?.cost_by_type) {
        chartData = Object.entries(result.metrics.costs.cost_by_type).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: value as number
        }))
      } else if (metric_type === 'products' && result.metrics?.products) {
        chartData = [
          { name: 'Prodotti Attivi', value: result.metrics.products.active_products },
          { name: 'Totale', value: result.metrics.products.total_products }
        ]
      }

      setData(chartData)
    } catch (error) {
      console.error('Error fetching chart data:', error)
      setData([])
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
          <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Nessun dato disponibile
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
        <ResponsiveContainer width="100%" height={250}>
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : chartType === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
