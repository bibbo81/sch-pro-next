'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTrackings } from '@/hooks/useTrackings'
import { useShipsGO } from '@/hooks/useShipsGO'
import TrackingForm from '@/components/TrackingForm'
import TrackingList from '@/components/TrackingList'
import TrackingPreview from '@/components/TrackingPreview'
import StatusCounts from '@/components/StatusCounts'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Ship,
  Activity,
  RefreshCw,
  Plus,
  Package,
  Truck,
  Clock,
  MapPin,
  AlertCircle,
  Search,
  X
} from 'lucide-react'

export default function TrackingPage() {
  const { user, loading: authLoading } = useAuth()

  const {
    trackings,
    loading,
    error,
    addTracking,
    deleteTracking,
    loadTrackings
  } = useTrackings()

  const { trackSingle, trackBatch, loading: shipsGoLoading } = useShipsGO()

  const [selectedTracking, setSelectedTracking] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const safeTrackings = Array.isArray(trackings) ? trackings : []

  const filteredTrackings = safeTrackings.filter(tracking => {
    const matchesSearch = !searchTerm ||
      (tracking.tracking_number && tracking.tracking_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tracking.carrier_name && tracking.carrier_name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || tracking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: safeTrackings.length,
    active: safeTrackings.filter(t => ['in_transit', 'sailing', 'customs_hold'].includes(t.status || '')).length,
    delivered: safeTrackings.filter(t => (t.status || '') === 'delivered').length,
    delayed: safeTrackings.filter(t => (t.status || '') === 'delayed').length
  }

  // Loading skeleton
  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-muted/50 rounded-xl animate-shimmer bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 bg-[length:200%_100%] mb-2" />
            <div className="h-4 w-48 bg-muted/50 rounded-lg animate-shimmer bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 bg-[length:200%_100%]" />
          </div>
          <div className="h-10 w-32 bg-muted/50 rounded-xl animate-shimmer bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 bg-[length:200%_100%]" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <GlassCard key={i} className="p-6">
              <div className="h-8 w-16 bg-muted/50 rounded-lg animate-shimmer bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 bg-[length:200%_100%] mb-2" />
              <div className="h-4 w-24 bg-muted/50 rounded-lg animate-shimmer bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 bg-[length:200%_100%]" />
            </GlassCard>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tracking Spedizioni</h1>
          <p className="text-muted-foreground mt-1">Errore nel caricamento dei dati tracking</p>
        </div>

        <GlassCard className="p-6 border-destructive/30">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-destructive">Errore nel caricamento</h3>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
            <Button onClick={() => loadTrackings()} variant="destructive" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Riprova
            </Button>
          </div>
        </GlassCard>
      </div>
    )
  }

  // Auth guard
  if (!user) {
    return (
      <GlassCard className="p-12 text-center">
        <Ship className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-4">Accesso Richiesto</h2>
        <p className="text-muted-foreground">Devi effettuare il login per accedere al sistema di tracking.</p>
      </GlassCard>
    )
  }

  const handleTrackingAdd = async (trackingData: any) => {
    await addTracking(trackingData)
    setShowForm(false)
  }

  const handleTrackingBatchAdd = async (trackingsData: any[]) => {
    for (const trackingData of trackingsData) {
      await addTracking(trackingData)
    }
    setShowForm(false)
  }

  const handleTrackingDelete = async (trackingId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo tracking?')) return

    await deleteTracking(trackingId)
    if (selectedTracking?.id === trackingId) {
      setSelectedTracking(null)
    }
  }

  const handleRefresh = async () => {
    await loadTrackings()
  }

  const statCards = [
    { label: 'Tracking Totali', value: stats.total, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'In Transito', value: stats.active, icon: Truck, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Consegnati', value: stats.delivered, icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'In Ritardo', value: stats.delayed, icon: Clock, color: 'text-red-500', bg: 'bg-red-500/10' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tracking Spedizioni</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Traccia le tue spedizioni in tempo reale
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || shipsGoLoading}
            className="glass"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(loading || shipsGoLoading) ? 'animate-spin' : ''}`} />
            Ricarica
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Tracking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <GlassCard key={label} className="p-5 hover:shadow-lg transition-all duration-300 ease-glass">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-1">{label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Cerca per numero tracking o vettore..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm"
          >
            <option value="all">Tutti gli stati</option>
            <option value="registered">Registrato</option>
            <option value="in_transit">In Transito</option>
            <option value="sailing">Navigazione</option>
            <option value="arrived">Arrivato</option>
            <option value="customs_hold">In Dogana</option>
            <option value="delivered">Consegnato</option>
            <option value="delayed">In Ritardo</option>
          </select>
          {(searchTerm || statusFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
              }}
              className="shrink-0"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </Button>
          )}
        </div>
      </GlassCard>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrackingList
            trackings={filteredTrackings}
            onSelect={setSelectedTracking}
            onDelete={handleTrackingDelete}
            onUpdate={loadTrackings}
            selected={selectedTracking}
          />
        </div>

        <div className="space-y-6">
          {/* Tracking Preview */}
          {selectedTracking ? (
            <TrackingPreview
              tracking={selectedTracking}
              onDelete={handleTrackingDelete}
              onUpdate={loadTrackings}
            />
          ) : (
            <GlassCard className="p-8 text-center">
              <Ship className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-foreground mb-1">
                Seleziona un tracking
              </h3>
              <p className="text-sm text-muted-foreground">
                Clicca su un tracking dalla lista per vedere i dettagli
              </p>
            </GlassCard>
          )}

          {/* Status Counts */}
          <StatusCounts trackings={filteredTrackings} />

          {/* Quick Actions */}
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              Azioni Rapide
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Tracking
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Aggiorna Tutti
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Empty State */}
      {safeTrackings.length === 0 && !loading && (
        <GlassCard className="p-12 text-center">
          <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto mb-4">
            <Ship className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nessun tracking trovato
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Inizia aggiungendo il tuo primo tracking per monitorare le spedizioni in tempo reale.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Primo Tracking
          </Button>
        </GlassCard>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Aggiungi Nuovo Tracking</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <TrackingForm
                onAdd={handleTrackingAdd}
                onBatchAdd={handleTrackingBatchAdd}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
