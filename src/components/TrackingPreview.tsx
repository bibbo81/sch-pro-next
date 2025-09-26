'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TrackingPreviewProps {
  tracking: any
  onDelete: (id: string) => void
  onUpdate: () => void
}

export default function TrackingPreview({ tracking, onDelete, onUpdate }: TrackingPreviewProps) {
  if (!tracking) return null

  // ✅ AGGIORNATO: Status mapping per valori reali
  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    const normalizedStatus = status.toLowerCase()
    const colors = {
      'registered': 'bg-gray-100 text-gray-800',
      'in_transit': 'bg-blue-100 text-blue-800',
      'sailing': 'bg-blue-200 text-blue-900',
      'arrived': 'bg-green-100 text-green-800',
      'discharged': 'bg-green-200 text-green-900',
      'delivered': 'bg-green-100 text-green-800',
      'delayed': 'bg-yellow-100 text-yellow-800',
      'exception': 'bg-red-100 text-red-800',
      'customs_hold': 'bg-orange-100 text-orange-800'
    }
    return colors[normalizedStatus as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  // ✅ AGGIORNATO: Icon mapping per tipi reali
  const getTypeIcon = (type?: string) => {
    const icons = {
      'container': '📦',
      'awb': '✈️',
      'parcel': '📮',
      'truck': '🚛',
      'rail': '🚂'
    }
    return icons[type as keyof typeof icons] || '📦'
  }

  // ✅ AGGIORNATO: Format date con fallback
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non disponibile'
    try {
      return new Date(dateString).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Data non valida'
    }
  }

  // ✅ AGGIORNATO: Smart display per origin/destination
  const getLocation = (location?: string, port?: string, country?: string) => {
    if (port && country) return `${port}, ${country}`
    if (port) return port
    if (location) return location
    return 'Non specificato'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {getTypeIcon(tracking.tracking_type)}
            Dettagli Tracking
          </span>
          <div className="flex gap-2">
            <Badge className={getStatusColor(tracking.status)}>
              {tracking.status || 'Stato sconosciuto'}
            </Badge>
            {tracking.updated_by_robot && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                🤖 API
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* ✅ AGGIORNATO: Info principale */}
          <div>
            <h4 className="font-medium text-lg mb-2">
              {tracking.tracking_number || 'Tracking non specificato'}
            </h4>
            
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline">
                {tracking.tracking_type?.toUpperCase() || 'CONTAINER'}
              </Badge>
              {tracking.container_count && tracking.container_count > 1 && (
                <Badge variant="outline">
                  {tracking.container_count} Container
                </Badge>
              )}
              {tracking.container_size && (
                <Badge variant="outline">
                  {tracking.container_size}
                </Badge>
              )}
            </div>
          </div>

          {/* ✅ AGGIORNATO: Carrier info con priorità carrier_name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Vettore</label>
              <p className="text-sm text-gray-900">
                {tracking.carrier_name || tracking.carrier || tracking.carrier_code || 'Non specificato'}
              </p>
            </div>
            
            {tracking.vessel_name && (
              <div>
                <label className="text-sm font-medium text-gray-700">Nave</label>
                <p className="text-sm text-gray-900">{tracking.vessel_name}</p>
              </div>
            )}
          </div>

          {/* ✅ AGGIORNATO: Location info con smart fallback */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Origine</label>
              <p className="text-sm text-gray-900">
                {getLocation(tracking.origin, tracking.origin_port, tracking.origin_country)}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Destinazione</label>
              <p className="text-sm text-gray-900">
                {getLocation(tracking.destination, tracking.destination_port, tracking.destination_country)}
              </p>
            </div>
          </div>

          {/* ✅ AGGIORNATO: Dates con priorità corretta */}
          <div className="grid grid-cols-2 gap-4">
            {(tracking.eta || tracking.estimated_delivery) && (
              <div>
                <label className="text-sm font-medium text-gray-700">ETA</label>
                <p className="text-sm text-gray-900">
                  {formatDate(tracking.eta || tracking.estimated_delivery)}
                </p>
              </div>
            )}
            
            {tracking.actual_delivery && (
              <div>
                <label className="text-sm font-medium text-gray-700">Consegnato</label>
                <p className="text-sm text-gray-900">
                  {formatDate(tracking.actual_delivery)}
                </p>
              </div>
            )}
          </div>

          {/* ✅ AGGIORNATO: Booking numbers */}
          {(tracking.reference_number || tracking.booking_number || tracking.bl_number) && (
            <div className="space-y-2">
              {tracking.reference_number && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Riferimento</label>
                  <p className="text-sm text-gray-900">{tracking.reference_number}</p>
                </div>
              )}
              {tracking.booking_number && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Booking</label>
                  <p className="text-sm text-gray-900">{tracking.booking_number}</p>
                </div>
              )}
              {tracking.bl_number && (
                <div>
                  <label className="text-sm font-medium text-gray-700">B/L</label>
                  <p className="text-sm text-gray-900">{tracking.bl_number}</p>
                </div>
              )}
            </div>
          )}

          {/* ✅ AGGIORNATO: Last event info */}
          {tracking.last_event_description && (
            <div>
              <label className="text-sm font-medium text-gray-700">Ultimo Evento</label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded mt-1">
                <p>{tracking.last_event_description}</p>
                {tracking.last_event_location && (
                  <p className="text-xs text-gray-600 mt-1">
                    📍 {tracking.last_event_location}
                  </p>
                )}
                {tracking.last_event_date && (
                  <p className="text-xs text-gray-600">
                    🕐 {formatDate(tracking.last_event_date)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ✅ AGGIORNATO: Logistics info */}
          {(tracking.total_weight_kg || tracking.total_volume_cbm || tracking.transit_time) && (
            <div className="grid grid-cols-3 gap-2 text-sm">
              {tracking.total_weight_kg && (
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-medium">{tracking.total_weight_kg} kg</div>
                  <div className="text-xs text-gray-600">Peso</div>
                </div>
              )}
              {tracking.total_volume_cbm && (
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-medium">{tracking.total_volume_cbm} cbm</div>
                  <div className="text-xs text-gray-600">Volume</div>
                </div>
              )}
              {tracking.transit_time && (
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-medium">{tracking.transit_time} gg</div>
                  <div className="text-xs text-gray-600">Transit</div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Data Creazione</label>
            <p className="text-sm text-gray-900">
              {formatDate(tracking.created_at)}
            </p>
          </div>

          {/* ✅ AGGIORNATO: Debug info per sviluppo */}
          {process.env.NODE_ENV === 'development' && tracking.metadata && Object.keys(tracking.metadata).length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">Debug - Metadata</label>
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-1 max-h-20 overflow-y-auto">
                <pre>{JSON.stringify(tracking.metadata, null, 2)}</pre>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                onUpdate()
              }}
            >
              📝 Aggiorna
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                if (confirm(`Eliminare il tracking ${tracking.tracking_number || tracking.id}?`)) {
                  onDelete(tracking.id)
                }
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              🗑️ Elimina
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}