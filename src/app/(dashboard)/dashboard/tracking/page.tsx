'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { entityColors } from '@/lib/colors'
import { useTrackings } from '@/hooks/useTrackings'
import { useShipsGO } from '@/hooks/useShipsGO'
import TrackingForm from '@/components/TrackingForm'
import TrackingList from '@/components/TrackingList'
import TrackingPreview from '@/components/TrackingPreview'
import StatusCounts from '@/components/StatusCounts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Ship, 
  Activity, 
  RefreshCw, 
  Plus,
  Package,
  TrendingUp,
  Clock,
  MapPin,
  Truck,
  AlertCircle,
  Search,
  Filter
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

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tracking Spedizioni</h1>
          <p className="text-muted-foreground mt-2">Errore nel caricamento dei dati tracking</p>
        </div>
        
        <Card className="bg-destructive/10 border-destructive/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <div>
                <h3 className="text-lg font-medium text-destructive">Errore nel caricamento</h3>
                <p className="text-destructive mt-1">{error}</p>
                <Button
                  onClick={() => loadTrackings()}
                  variant="destructive"
                  className="mt-3"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Riprova
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Ship className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Accesso Richiesto</h2>
          <p className="text-muted-foreground">Devi effettuare il login per accedere al sistema di tracking.</p>
        </CardContent>
      </Card>
    )
  }

  const handleTrackingAdd = async (trackingData: any) => {
    try {
      await addTracking(trackingData)
      setShowForm(false)
    } catch (err) {
      console.error('Error adding tracking:', err)
      alert('Errore nell\'aggiunta del tracking: ' + (err instanceof Error ? err.message : 'Errore sconosciuto'))
    }
  }

  const handleTrackingBatchAdd = async (trackingsData: any[]) => {
    try {
      for (const trackingData of trackingsData) {
        await addTracking(trackingData)
      }
      setShowForm(false)
    } catch (err) {
      console.error('Error adding batch trackings:', err)
      alert('Errore nell\'aggiunta multipla: ' + (err instanceof Error ? err.message : 'Errore sconosciuto'))
    }
  }

  const handleTrackingDelete = async (trackingId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo tracking?')) return
    
    try {
      await deleteTracking(trackingId)
      if (selectedTracking?.id === trackingId) {
        setSelectedTracking(null)
      }
    } catch (err) {
      console.error('Error deleting tracking:', err)
      alert('Errore nell\'eliminazione: ' + (err instanceof Error ? err.message : 'Errore sconosciuto'))
    }
  }

  const handleRefresh = async () => {
    try {
      await loadTrackings()
    } catch (err) {
      console.error('Error refreshing trackings:', err)
      alert('Errore nell\'aggiornamento: ' + (err instanceof Error ? err.message : 'Errore sconosciuto'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tracking Spedizioni</h1>
          <p className="text-muted-foreground mt-2">
            Traccia le tue spedizioni in tempo reale • Utente: {user.email} • {safeTrackings.length} tracking
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={loading || shipsGoLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(loading || shipsGoLoading) ? 'animate-spin' : ''}`} />
            Ricarica
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Tracking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Package className={`h-5 w-5 ${entityColors.tracking.total}`} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tracking Totali</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.total}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-orange-500/10">
                <Truck className={`h-5 w-5 ${entityColors.tracking.in_transit}`} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">In Transito</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.active}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-green-500/10">
                <MapPin className={`h-5 w-5 ${entityColors.tracking.delivered}`} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Consegnati</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.delivered}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-red-500/10">
                <Clock className={`h-5 w-5 ${entityColors.tracking.delayed}`} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">In Ritardo</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.delayed}
              </p>
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
              <input
                type="text"
                placeholder="Cerca per numero tracking o vettore..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
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
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
            <Card>
              <CardContent className="p-8 text-center">
                <Ship className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Seleziona un tracking
                </h3>
                <p className="text-gray-500">
                  Clicca su un tracking dalla lista per vedere i dettagli
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Status Counts */}
          <StatusCounts trackings={filteredTrackings} />
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Azioni Rapide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Tracking
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Aggiorna Tutti
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Empty State */}
      {safeTrackings.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Ship className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nessun tracking trovato
            </h3>
            <p className="text-gray-500 mb-6">
              Inizia aggiungendo il tuo primo tracking per monitorare le spedizioni in tempo reale.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Primo Tracking
            </Button>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="text-sm font-medium text-green-800">✅ Sistema Tracking Attivo</h3>
              <div className="text-xs text-green-700 mt-1 space-y-1">
                <p>• User: {user?.email}</p>
                <p>• Tracking totali: {safeTrackings.length}</p>
                <p>• Tracking filtrati: {filteredTrackings.length}</p>
                <p>• Integrazione ShipsGO: {shipsGoLoading ? '⏳ Loading...' : '✅ Pronta'}</p>
                <p>• Hooks: useTrackings={loading ? '⏳' : '✅'}, useShipsGO={shipsGoLoading ? '⏳' : '✅'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Aggiungi Nuovo Tracking</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
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