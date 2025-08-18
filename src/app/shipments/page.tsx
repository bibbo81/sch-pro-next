'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Package, DollarSign, Truck, Calendar, AlertCircle } from 'lucide-react'
import ShipmentCard from '@/components/shipments/ShipmentCard'
import ShipmentForm from '@/components/shipments/ShipmentForm'
import ShipmentFilters from '@/components/shipments/ShipmentFilters'
import { formatStatus } from '@/lib/statusMapping'

interface Shipment {
  id: string
  shipment_number: string
  tracking_number?: string
  supplier_name?: string
  status?: string
  transport_mode?: string
  total_value?: number
  currency?: string
  origin?: string
  destination?: string
  eta?: string
  created_at: string
  updated_at: string
  [key: string]: any
}

interface Tracking {
  id: string
  tracking_number: string
  status?: string
  current_status?: string
  tracking_type?: string
  [key: string]: any
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [trackings, setTrackings] = useState<Tracking[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtri
  const [statusFilter, setStatusFilter] = useState('all')
  const [transportModeFilter, setTransportModeFilter] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('')

  // Carica dati
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Ottieni il user_id (stesso che usi per trackings)
      const userId = "21766c53-a16b-4019-9a11-845ecea8cf10" // O dalla tua logica di auth
      
      console.log('🔍 Fetching shipments and trackings...')
      
      // Aggiungi user_id alla chiamata shipments
      const [shipmentsRes, trackingsRes] = await Promise.all([
        fetch(`/api/shipments?user_id=${userId}`), // ← AGGIUNGI QUESTO PARAMETRO
        fetch(`/api/trackings?user_id=${userId}`)
      ])
  
      // Verifica response shipments
      if (!shipmentsRes.ok) {
        throw new Error(`Shipments error! status: ${shipmentsRes.status}`)
      }
      
      // Verifica response trackings  
      if (!trackingsRes.ok) {
        throw new Error(`Trackings error! status: ${trackingsRes.status}`)
      }
  
      const [shipmentsData, trackingsData] = await Promise.all([
        shipmentsRes.json(),
        trackingsRes.json()
      ])
  
      if (shipmentsData.success) {
        setShipments(shipmentsData.data)
      }
      
      if (trackingsData.success) {
        setTrackings(trackingsData.data)
      }
  
    } catch (error) {
      console.error('❌ Errore nel caricamento dati:', error)
      setError(error instanceof Error ? error.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Crea mappa tracking per stati aggiornati
  const trackingMap = new Map<string, { status: string; rawStatus: string; type: string }>()
  trackings.forEach(t => {
    const rawStatus = t.status || t.current_status || 'registered'
    const { normalized } = formatStatus(rawStatus)
    trackingMap.set(t.tracking_number, {
      status: normalized,
      rawStatus: rawStatus,
      type: t.tracking_type || 'container'
    })
  })

  // Filtra shipments con stati normalizzati
  const filteredShipments = shipments.filter((shipment) => {
    // Ottieni stato finale (tracking ha priorità su shipment)
    const trackingInfo = trackingMap.get(shipment.tracking_number || '')
    const finalStatus = trackingInfo 
      ? trackingInfo.status 
      : formatStatus(shipment.status || 'registered').normalized
    
    const statusMatch = statusFilter === 'all' || finalStatus === statusFilter
    const transportMatch = transportModeFilter === 'all' || shipment.transport_mode === transportModeFilter
    const supplierMatch = supplierFilter === '' || 
                         shipment.supplier_name?.toLowerCase().includes(supplierFilter.toLowerCase())
    
    return statusMatch && transportMatch && supplierMatch
  })

  // Calcola statistiche con stati normalizzati
  const totalShipments = shipments.length
  const totalValue = shipments.reduce((sum, s) => sum + (s.total_value || 0), 0)
  
  // Stati normalizzati per statistiche corrette
  let inTransitCount = 0
  let deliveredCount = 0
  let exceptionCount = 0
  
  const statusCounts: Record<string, number> = {}
  
  shipments.forEach(shipment => {
    const trackingInfo = trackingMap.get(shipment.tracking_number || '')
    const finalStatus = trackingInfo 
      ? trackingInfo.status 
      : formatStatus(shipment.status || 'registered').normalized
    
    statusCounts[finalStatus] = (statusCounts[finalStatus] || 0) + 1
    
    // Conteggi specifici
    if (finalStatus === 'in_transit') inTransitCount++
    if (finalStatus === 'delivered') deliveredCount++
    if (['exception', 'delayed', 'cancelled'].includes(finalStatus)) exceptionCount++
  })
  
  const activeShipments = totalShipments - deliveredCount - statusCounts.cancelled || 0
  
  const recentShipments = shipments.filter((s) => {
    const created = new Date(s.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return created > weekAgo
  }).length

  // Debug log stati
  console.log('📊 Stati shipments normalizzati:', statusCounts)
  console.log('🚛 In transito:', inTransitCount)

  const handleShipmentCreated = (newShipment: Shipment) => {
    setShipments(prev => [newShipment, ...prev])
    setShowForm(false)
  }

  const handleShipmentDelete = (deletedId: string) => {
    setShipments(shipments.filter((s) => s.id !== deletedId))
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setTransportModeFilter('all')
    setSupplierFilter('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Caricamento shipments...</p>
        </div>
      </div>
    )
  }
// ✅ AGGIUNGI RENDER PER ERRORI
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Errore nel caricamento</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => {
              setError(null)
              fetchData()
            }}>
              Riprova
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shipments</h1>
          <p className="text-muted-foreground">
            Gestisci le tue spedizioni ({filteredShipments.length} di {totalShipments})
          </p>
        </div>
        
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuovo Shipment
        </Button>
      </div>

      {/* Statistiche CORRETTE con stati normalizzati */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShipments}</div>
            <p className="text-xs text-muted-foreground">
              {deliveredCount} consegnati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transito</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inTransitCount}</div>
            <p className="text-xs text-muted-foreground">
              {statusCounts.registered || 0} registrati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valore Totale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problemi</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{exceptionCount}</div>
            <p className="text-xs text-muted-foreground">
              Ritardi/Eccezioni
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Debug Panel - Solo in development */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🔧 Debug Stati</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              {Object.entries(statusCounts).map(([status, count]) => {
                const { config } = formatStatus(status)
                return (
                  <div key={status} className="flex items-center gap-1">
                    <span>{config.icon}</span>
                    <span>{config.label}: {count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtri - AGGIORNA con stati normalizzati */}
      <ShipmentFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        transportModeFilter={transportModeFilter}
        setTransportModeFilter={setTransportModeFilter}
        supplierFilter={supplierFilter}
        setSupplierFilter={setSupplierFilter}
        onClearFilters={clearFilters}
      />

      {/* Lista Shipments */}
      <div className="space-y-4">
        {filteredShipments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessun shipment trovato</h3>
              <p className="text-muted-foreground mb-4">
                {shipments.length === 0 
                  ? "Non hai ancora creato nessun shipment." 
                  : "Nessun shipment corrisponde ai filtri selezionati."
                }
              </p>
              {shipments.length === 0 && (
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crea il tuo primo shipment
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredShipments.map((shipment) => {
              // Passa informazioni di tracking al componente
              const trackingInfo = trackingMap.get(shipment.tracking_number || '')
              const enhancedShipment = {
                ...shipment,
                // Aggiungi stato normalizzato
                normalizedStatus: trackingInfo 
                  ? trackingInfo.status 
                  : formatStatus(shipment.status || 'registered').normalized,
                trackingType: trackingInfo?.type
              }
              
              return (
                <ShipmentCard 
                  key={shipment.id} 
                  shipment={enhancedShipment}
                  onDelete={handleShipmentDelete}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ShipmentForm 
              onClose={() => setShowForm(false)}
              onShipmentCreated={handleShipmentCreated}
            />
          </div>
        </div>
      )}
    </div>
  )
}