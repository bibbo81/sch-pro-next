'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  Truck,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import WidgetKPI from '@/components/dashboard-widgets/WidgetKPI'
import WidgetChart from '@/components/dashboard-widgets/WidgetChart'
import WidgetShipments from '@/components/dashboard-widgets/WidgetShipments'
import WidgetProducts from '@/components/dashboard-widgets/WidgetProducts'
import WidgetCosts from '@/components/dashboard-widgets/WidgetCosts'

interface Widget {
  id: string
  widget_type: string
  title: string
  metric_type: string
  data_config: any
  position: { x: number; y: number; w: number; h: number }
}

interface Dashboard {
  id: string
  name: string
  description: string | null
  layout: { type: string; columns: number } | string
  is_default: boolean
  dashboard_widgets: Widget[]
}

const WIDGET_TYPES = [
  { value: 'kpi', label: 'KPI Card', icon: TrendingUp },
  { value: 'chart', label: 'Grafico', icon: BarChart3 },
  { value: 'shipments', label: 'Spedizioni Recenti', icon: Truck },
  { value: 'products', label: 'Prodotti Top', icon: Package },
  { value: 'costs', label: 'Analisi Costi', icon: DollarSign },
]

export default function DashboardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dashboardId = params.id as string

  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false)
  const [isEditWidgetOpen, setIsEditWidgetOpen] = useState(false)
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null)

  // Widget form state
  const [widgetType, setWidgetType] = useState('kpi')
  const [widgetTitle, setWidgetTitle] = useState('')

  useEffect(() => {
    fetchDashboard()
  }, [dashboardId])

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`/api/custom-dashboards/${dashboardId}`)
      const data = await response.json()

      if (!response.ok) {
        router.push('/dashboard/custom-dashboards')
        return
      }

      setDashboard(data.dashboard)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      router.push('/dashboard/custom-dashboards')
    } finally {
      setLoading(false)
    }
  }

  const handleAddWidget = async () => {
    if (!widgetTitle.trim()) return

    try {
      const response = await fetch('/api/dashboard-widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboard_id: dashboardId,
          widget_type: widgetType,
          title: widgetTitle,
          config: {},
          position: { x: 0, y: 0, w: 4, h: 4 }
        })
      })

      if (response.ok) {
        setIsAddWidgetOpen(false)
        setWidgetType('kpi')
        setWidgetTitle('')
        fetchDashboard()
      }
    } catch (error) {
      console.error('Error adding widget:', error)
    }
  }

  const handleDeleteWidget = async (widgetId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo widget?')) return

    try {
      const response = await fetch(`/api/dashboard-widgets/${widgetId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchDashboard()
      }
    } catch (error) {
      console.error('Error deleting widget:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!dashboard) {
    return null
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/custom-dashboards">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alle Dashboard
          </Button>
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{dashboard.name}</h1>
              {dashboard.is_default && (
                <Badge>Predefinita</Badge>
              )}
            </div>
            {dashboard.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {dashboard.description}
              </p>
            )}
          </div>

          <Button onClick={() => setIsAddWidgetOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Widget
          </Button>
        </div>
      </div>

      {/* Widgets Grid */}
      {dashboard.dashboard_widgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nessun Widget</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Inizia aggiungendo widget alla tua dashboard
            </p>
            <Button onClick={() => setIsAddWidgetOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Widget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboard.dashboard_widgets.map((widget) => {
            const renderWidget = () => {
              const commonProps = {
                title: widget.title,
                metric_type: widget.metric_type,
                data_config: widget.data_config
              }

              switch (widget.widget_type) {
                case 'kpi':
                  return <WidgetKPI {...commonProps} />
                case 'chart':
                  return <WidgetChart {...commonProps} />
                case 'shipments':
                  return <WidgetShipments {...commonProps} />
                case 'products':
                  return <WidgetProducts {...commonProps} />
                case 'costs':
                  return <WidgetCosts {...commonProps} />
                default:
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{widget.title}</CardTitle>
                        <CardDescription>
                          <Badge variant="outline">{widget.widget_type}</Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-400">
                          Tipo widget non supportato: {widget.widget_type}
                        </div>
                      </CardContent>
                    </Card>
                  )
              }
            }

            return (
              <div key={widget.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => handleDeleteWidget(widget.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
                {renderWidget()}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Widget Dialog */}
      <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Nuovo Widget</DialogTitle>
            <DialogDescription>
              Seleziona il tipo di widget da aggiungere alla dashboard
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tipo Widget</label>
              <Select value={widgetType} onValueChange={setWidgetType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WIDGET_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Titolo</label>
              <Input
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
                placeholder="Es. Spedizioni Totali"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddWidgetOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleAddWidget}>Aggiungi Widget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
