'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Truck,
  Download,
  Calendar,
  BarChart3,
  Loader2,
  FileText,
  FileDown
} from 'lucide-react'
import Link from 'next/link'

interface Metrics {
  shipments?: {
    total_shipments: number
    pending: number
    in_transit: number
    delivered: number
    avg_delivery_days: number
  }
  products?: {
    total_products: number
    active_products: number
    total_quantity: number
  }
  costs?: {
    total_cost: number
    avg_cost_per_shipment: number
  }
}

interface TrendingMetrics {
  current: Metrics
  previous: Metrics
  trends: {
    shipments_change: number
    costs_change: number
  }
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<TrendingMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [exporting, setExporting] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    fetchMetrics()
  }, [dateRange])

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const response = await fetch(
        `/api/analytics/metrics?start_date=${startDate}&end_date=${endDate}&compare=true`
      )
      const data = await response.json()

      if (data.metrics) {
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePDF = async () => {
    setGeneratingPDF(true)
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const response = await fetch('/api/analytics/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Analytics_Report_${endDate}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Errore durante la generazione del report PDF')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Errore durante la generazione del report PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleExport = async (dataType: string, format: string) => {
    setExporting(true)
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          data_type: dataType,
          start_date: startDate,
          end_date: endDate
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${dataType}_export.${format === 'excel' ? 'xlsx' : 'csv'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Export failed')
      }
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    )
  }

  const getTrendColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  // Prepare chart data
  const shipmentsStatusData = metrics?.current.shipments
    ? [
        { name: 'Consegnate', value: metrics.current.shipments.delivered, color: '#10b981' },
        { name: 'In transito', value: metrics.current.shipments.in_transit, color: '#3b82f6' },
        { name: 'In attesa', value: metrics.current.shipments.pending, color: '#f59e0b' }
      ]
    : []

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reporting</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Analisi avanzate e report per la tua organizzazione
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/analytics/reports">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Report Automatici
            </Button>
          </Link>

          <Button
            onClick={handleGeneratePDF}
            disabled={generatingPDF}
            variant="outline"
          >
            {generatingPDF ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generazione PDF...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Esporta PDF
              </>
            )}
          </Button>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Ultimi 7 giorni</SelectItem>
              <SelectItem value="30">Ultimi 30 giorni</SelectItem>
              <SelectItem value="90">Ultimi 90 giorni</SelectItem>
              <SelectItem value="365">Ultimo anno</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => {
            const [dataType, format] = value.split('-')
            handleExport(dataType, format)
          }}>
            <SelectTrigger className="w-[180px]">
              <Download className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Esporta Dati" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shipments-csv">Spedizioni (CSV)</SelectItem>
              <SelectItem value="shipments-excel">Spedizioni (Excel)</SelectItem>
              <SelectItem value="products-csv">Prodotti (CSV)</SelectItem>
              <SelectItem value="products-excel">Prodotti (Excel)</SelectItem>
              <SelectItem value="costs-csv">Costi (CSV)</SelectItem>
              <SelectItem value="costs-excel">Costi (Excel)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Spedizioni Totali</CardDescription>
                  <Truck className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics?.current.shipments?.total_shipments || 0}
                </div>
                {metrics?.trends && (
                  <div className={`flex items-center gap-1 text-sm mt-2 ${getTrendColor(metrics.trends.shipments_change)}`}>
                    {getTrendIcon(metrics.trends.shipments_change)}
                    <span>{formatPercentage(metrics.trends.shipments_change)}</span>
                    <span className="text-muted-foreground">vs periodo precedente</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Prodotti Attivi</CardDescription>
                  <Package className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics?.current.products?.active_products || 0}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  di {metrics?.current.products?.total_products || 0} totali
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Costi Totali</CardDescription>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(metrics?.current.costs?.total_cost || 0)}
                </div>
                {metrics?.trends && (
                  <div className={`flex items-center gap-1 text-sm mt-2 ${getTrendColor(metrics.trends.costs_change)}`}>
                    {getTrendIcon(metrics.trends.costs_change)}
                    <span>{formatPercentage(metrics.trends.costs_change)}</span>
                    <span className="text-muted-foreground">vs periodo precedente</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Costo Medio/Spedizione</CardDescription>
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(metrics?.current.costs?.avg_cost_per_shipment || 0)}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Media del periodo
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shipments Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuzione Spedizioni per Stato</CardTitle>
                <CardDescription>
                  Stato corrente delle spedizioni nel periodo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={shipmentsStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {shipmentsStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Delivery Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance di Consegna</CardTitle>
                <CardDescription>
                  Metriche chiave sulle spedizioni
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Tasso di Consegna</span>
                    <span className="text-sm font-bold">
                      {metrics?.current.shipments?.total_shipments
                        ? (
                            (metrics.current.shipments.delivered /
                              metrics.current.shipments.total_shipments) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{
                        width: `${
                          metrics?.current.shipments?.total_shipments
                            ? (metrics.current.shipments.delivered /
                                metrics.current.shipments.total_shipments) *
                              100
                            : 0
                        }%`
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">In Transito</span>
                    <span className="text-sm font-bold">
                      {metrics?.current.shipments?.total_shipments
                        ? (
                            (metrics.current.shipments.in_transit /
                              metrics.current.shipments.total_shipments) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{
                        width: `${
                          metrics?.current.shipments?.total_shipments
                            ? (metrics.current.shipments.in_transit /
                                metrics.current.shipments.total_shipments) *
                              100
                            : 0
                        }%`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tempo Medio di Consegna</span>
                    <span className="text-2xl font-bold">
                      {metrics?.current.shipments?.avg_delivery_days?.toFixed(1) || 0}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">giorni</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="text-lg">💡 Suggerimenti per Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Usa i filtri temporali per analizzare periodi specifici</p>
              <p>• Esporta i dati in CSV o Excel per analisi approfondite</p>
              <p>• Confronta i periodi per identificare trend e pattern</p>
              <p>• Monitora i KPI chiave per ottimizzare le operazioni</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
