'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Truck,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Package,
  Euro,
  TrendingUp,
  Ship
} from 'lucide-react'

interface Forwarder {
  id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  active: boolean
  created_at: string
  updated_at: string
  // Analytics calcolate
  total_shipments?: number
  total_spent?: number
  average_cost?: number
  last_used?: string
}

export default function ForwardersPage() {
  const { user } = useAuth()
  const [forwarders, setForwarders] = useState<Forwarder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingForwarder, setEditingForwarder] = useState<Forwarder | null>(null)

  // Load forwarders with analytics
  const loadForwarders = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/forwarders')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load forwarders')
      }

      setForwarders(result.data || [])
    } catch (err) {
      console.error('Error loading forwarders:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento degli spedizionieri')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadForwarders()
  }, [user?.id])

  // Filtered forwarders
  const filteredForwarders = useMemo(() => {
    return forwarders.filter(forwarder => {
      const matchesSearch = !searchTerm ||
        forwarder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forwarder.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forwarder.email?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [forwarders, searchTerm])

  // Statistics
  const stats = useMemo(() => {
    return {
      total: forwarders.length,
      active: forwarders.filter(f => f.active).length,
      totalSpent: forwarders.reduce((sum, f) => sum + (f.total_spent || 0), 0),
      totalShipments: forwarders.reduce((sum, f) => sum + (f.total_shipments || 0), 0)
    }
  }, [forwarders])


  const formatCurrency = (amount?: number) => {
    if (!amount) return '€0,00'
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return 'Mai utilizzato'
    return new Date(date).toLocaleDateString('it-IT')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-6 w-16 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestione Spedizionieri</h1>
          <p className="text-muted-foreground mt-2">
            Gestisci i tuoi partner logistici • {stats.total} spedizionieri totali
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadForwarders} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Spedizioniere
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="p-3 rounded-xl bg-primary/10 mb-4 inline-block">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Spedizionieri Totali</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border hover:shadow-lg hover:shadow-green-500/5 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="p-3 rounded-xl bg-green-500/10 mb-4 inline-block">
                  <Package className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Attivi</p>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="p-3 rounded-xl bg-purple-500/10 mb-4 inline-block">
                  <Euro className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Spesa Totale</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="p-3 rounded-xl bg-orange-500/10 mb-4 inline-block">
                  <Ship className="h-5 w-5 text-orange-500" />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Spedizioni</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalShipments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Cerca spedizionieri..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forwarders List */}
      <div className="space-y-3">
        {filteredForwarders.map((forwarder) => (
          <Card key={forwarder.id} className="bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {/* Left: Forwarder Info */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{forwarder.name}</h3>
                      <Badge variant={forwarder.active ? 'default' : 'secondary'}>
                        {forwarder.active ? 'Attivo' : 'Inattivo'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {forwarder.contact_person && `${forwarder.contact_person}`}
                      {forwarder.email && ` • ${forwarder.email}`}
                      {forwarder.phone && ` • ${forwarder.phone}`}
                    </p>
                  </div>
                </div>

                {/* Center: Analytics */}
                <div className="hidden md:flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="text-muted-foreground">Spedizioni</div>
                    <div className="font-medium text-blue-600 dark:text-blue-400">
                      {forwarder.total_shipments || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Spesa Totale</div>
                    <div className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(forwarder.total_spent)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Costo Medio</div>
                    <div className="font-medium text-purple-600 dark:text-purple-400">
                      {formatCurrency(forwarder.average_cost)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Ultimo Utilizzo</div>
                    <div className="font-medium text-muted-foreground">
                      {formatDate(forwarder.last_used)}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setEditingForwarder(forwarder)
                      setShowForm(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => alert('Delete functionality temporarily disabled')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredForwarders.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nessun spedizioniere trovato
            </h3>
            <p className="text-muted-foreground mb-6">
              {forwarders.length === 0
                ? "Non hai ancora configurato nessun spedizioniere."
                : "Nessun spedizioniere corrisponde ai filtri selezionati."
              }
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Primo Spedizioniere
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Forwarder Form Modal */}
      {showForm && (
        <ForwarderForm
          forwarder={editingForwarder}
          onSave={async () => {
            await loadForwarders()
            setShowForm(false)
            setEditingForwarder(null)
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingForwarder(null)
          }}
        />
      )}
    </div>
  )
}

// Delete forwarder handler - moved outside for later integration
// const handleDeleteForwarder = async (forwarderId: string, forwarderName: string) => {
//   if (!confirm(`Eliminare lo spedizioniere ${forwarderName}?`)) return
//   try {
//     const response = await fetch(`/api/forwarders/${forwarderId}`, {
//       method: 'DELETE'
//     })
//     const result = await response.json()
//     if (!result.success) {
//       alert(result.error || 'Errore durante l\'eliminazione')
//       return
//     }
//     // await loadForwarders() // TODO: Fix scope
//   } catch (error) {
//     console.error('Error deleting forwarder:', error)
//     alert('Errore durante l\'eliminazione')
//   }
// }

// Forwarder Form Component
function ForwarderForm({ forwarder, onSave, onCancel }: {
  forwarder: Forwarder | null
  onSave: () => Promise<void>
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: forwarder?.name || '',
    contact_person: forwarder?.contact_person || '',
    email: forwarder?.email || '',
    phone: forwarder?.phone || '',
    address: forwarder?.address || '',
    notes: forwarder?.notes || '',
    active: forwarder?.active ?? true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    try {
      const method = forwarder ? 'PUT' : 'POST'
      const url = forwarder ? `/api/forwarders/${forwarder.id}` : '/api/forwarders'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!result.success) {
        alert(result.error || 'Errore nel salvataggio')
        return
      }

      await onSave()
    } catch (error) {
      console.error('Error saving forwarder:', error)
      alert('Errore nel salvataggio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {forwarder ? 'Modifica Spedizioniere' : 'Nuovo Spedizioniere'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nome Spedizioniere *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Contatto</label>
                <Input
                  value={formData.contact_person}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Telefono</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Indirizzo</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Note</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="active" className="text-sm font-medium text-foreground">
                Spedizioniere attivo
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Annulla
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvataggio...' : 'Salva'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}