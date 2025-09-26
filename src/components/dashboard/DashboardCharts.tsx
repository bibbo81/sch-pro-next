'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShipmentsChart, TrendChart, MetricsChart } from '@/components/charts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DashboardData {
  shipmentsByStatus: Array<{ status: string; count: number }>
  monthlyTrends: Array<{ period: string; value: number }>
  topCarriers: Array<{ label: string; value: number }>
  costMetrics: Array<{ label: string; value: number; target?: number }>
  volumeMetrics: Array<{ period: string; value: number }>
}

interface DashboardChartsProps {
  data: DashboardData
  isLoading?: boolean
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  data,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatVolume = (value: number) => {
    return `${value.toFixed(1)} m³`
  }

  const formatWeight = (value: number) => {
    return `${value.toFixed(1)} kg`
  }

  return (
    <div className="space-y-6">
      {/* Prima riga - Grafici principali */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuzione spedizioni per status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuzione Spedizioni</CardTitle>
            <CardDescription>
              Spedizioni per stato attuale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShipmentsChart
              data={data.shipmentsByStatus}
              type="doughnut"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Trend mensile spedizioni */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Spedizioni</CardTitle>
            <CardDescription>
              Numero di spedizioni negli ultimi 12 mesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={data.monthlyTrends}
              title=""
              color="#3b82f6"
              type="line"
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Seconda riga - Tabs con metriche dettagliate */}
      <Card>
        <CardHeader>
          <CardTitle>Analisi Dettagliate</CardTitle>
          <CardDescription>
            Metriche avanzate e confronti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="carriers" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="carriers">Top Carrier</TabsTrigger>
              <TabsTrigger value="costs">Analisi Costi</TabsTrigger>
              <TabsTrigger value="volume">Volume & Peso</TabsTrigger>
            </TabsList>

            <TabsContent value="carriers" className="mt-6">
              <MetricsChart
                data={data.topCarriers}
                title="Top 10 Carrier per Numero Spedizioni"
                type="bar"
                height={350}
              />
            </TabsContent>

            <TabsContent value="costs" className="mt-6">
              <MetricsChart
                data={data.costMetrics}
                title="Distribuzione Costi"
                type="bar"
                height={350}
                showTargets={true}
                valueFormatter={formatCurrency}
              />
            </TabsContent>

            <TabsContent value="volume" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-4">Trend Volume (m³)</h4>
                  <TrendChart
                    data={data.volumeMetrics}
                    title=""
                    color="#10b981"
                    type="line"
                    height={300}
                    valueFormatter={formatVolume}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-4">Distribuzione per Modalità</h4>
                  <ShipmentsChart
                    data={[
                      { status: 'Marittimo', count: 45, color: '#3b82f6' },
                      { status: 'Aereo', count: 30, color: '#10b981' },
                      { status: 'Terrestre', count: 25, color: '#f59e0b' }
                    ]}
                    type="doughnut"
                    height={300}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Terza riga - Grafici di performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-foreground">Tempi di Transito</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={[
                { period: 'Gen', value: 25 },
                { period: 'Feb', value: 23 },
                { period: 'Mar', value: 28 },
                { period: 'Apr', value: 22 },
                { period: 'Mag', value: 24 },
                { period: 'Giu', value: 21 }
              ]}
              title=""
              color="#8b5cf6"
              type="bar"
              height={200}
              valueFormatter={(value) => `${value} giorni`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-foreground">Tasso di Consegna</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={[
                { period: 'Gen', value: 94 },
                { period: 'Feb', value: 96 },
                { period: 'Mar', value: 92 },
                { period: 'Apr', value: 98 },
                { period: 'Mag', value: 95 },
                { period: 'Giu', value: 97 }
              ]}
              title=""
              color="#10b981"
              type="line"
              height={200}
              valueFormatter={(value) => `${value}%`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-foreground">Costi per m³</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={[
                { period: 'Gen', value: 145 },
                { period: 'Feb', value: 152 },
                { period: 'Mar', value: 138 },
                { period: 'Apr', value: 148 },
                { period: 'Mag', value: 143 },
                { period: 'Giu', value: 140 }
              ]}
              title=""
              color="#f59e0b"
              type="bar"
              height={200}
              valueFormatter={formatCurrency}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}