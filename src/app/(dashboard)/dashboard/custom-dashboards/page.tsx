'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit, Trash2, Eye, Star, StarOff, Layout } from 'lucide-react'
import Link from 'next/link'

interface Dashboard {
  id: string
  name: string
  description: string | null
  layout: string
  is_default: boolean
  created_at: string
  dashboard_widgets: any[]
}

export default function CustomDashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [layout, setLayout] = useState('grid')

  useEffect(() => {
    fetchDashboards()
  }, [])

  const fetchDashboards = async () => {
    try {
      const response = await fetch('/api/custom-dashboards')
      const data = await response.json()
      setDashboards(data.dashboards || [])
    } catch (error) {
      console.error('Error fetching dashboards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!name.trim()) return

    try {
      const response = await fetch('/api/custom-dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, layout })
      })

      if (response.ok) {
        setIsCreateOpen(false)
        setName('')
        setDescription('')
        setLayout('grid')
        fetchDashboards()
      }
    } catch (error) {
      console.error('Error creating dashboard:', error)
    }
  }

  const handleEdit = async () => {
    if (!editingDashboard || !name.trim()) return

    try {
      const response = await fetch(`/api/custom-dashboards/${editingDashboard.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, layout })
      })

      if (response.ok) {
        setIsEditOpen(false)
        setEditingDashboard(null)
        setName('')
        setDescription('')
        setLayout('grid')
        fetchDashboards()
      }
    } catch (error) {
      console.error('Error updating dashboard:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa dashboard?')) return

    try {
      const response = await fetch(`/api/custom-dashboards/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchDashboards()
      }
    } catch (error) {
      console.error('Error deleting dashboard:', error)
    }
  }

  const handleSetDefault = async (id: string, isDefault: boolean) => {
    try {
      const response = await fetch(`/api/custom-dashboards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: !isDefault })
      })

      if (response.ok) {
        fetchDashboards()
      }
    } catch (error) {
      console.error('Error setting default:', error)
    }
  }

  const openEditDialog = (dashboard: Dashboard) => {
    setEditingDashboard(dashboard)
    setName(dashboard.name)
    setDescription(dashboard.description || '')
    setLayout(dashboard.layout)
    setIsEditOpen(true)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Personalizzate</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Crea e gestisci dashboard personalizzate con widget configurabili
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuova Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crea Nuova Dashboard</DialogTitle>
              <DialogDescription>
                Configura la tua dashboard personalizzata
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Es. Dashboard Vendite"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descrizione (opzionale)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrizione della dashboard"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Layout</label>
                <Select value={layout} onValueChange={setLayout}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Griglia</SelectItem>
                    <SelectItem value="flex">Flessibile</SelectItem>
                    <SelectItem value="masonry">Masonry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annulla
              </Button>
              <Button onClick={handleCreate}>Crea Dashboard</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dashboards Grid */}
      {dashboards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Layout className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nessuna Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Inizia creando la tua prima dashboard personalizzata
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crea Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <Card key={dashboard.id} className="relative">
              {dashboard.is_default && (
                <div className="absolute top-4 right-4">
                  <Badge variant="default">Predefinita</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  {dashboard.name}
                </CardTitle>
                {dashboard.description && (
                  <CardDescription>{dashboard.description}</CardDescription>
                )}
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Layout:</span>
                    <Badge variant="outline">{dashboard.layout}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Widgets:</span>
                    <span className="font-medium">
                      {dashboard.dashboard_widgets?.length || 0}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Link href={`/dashboard/custom-dashboards/${dashboard.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizza
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(dashboard)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(dashboard.id, dashboard.is_default)}
                    >
                      {dashboard.is_default ? (
                        <StarOff className="w-4 h-4" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(dashboard.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Dashboard</DialogTitle>
            <DialogDescription>
              Aggiorna le impostazioni della dashboard
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Dashboard Vendite"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Descrizione (opzionale)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrizione della dashboard"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Layout</label>
              <Select value={layout} onValueChange={setLayout}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Griglia</SelectItem>
                  <SelectItem value="flex">Flessibile</SelectItem>
                  <SelectItem value="masonry">Masonry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleEdit}>Salva Modifiche</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
