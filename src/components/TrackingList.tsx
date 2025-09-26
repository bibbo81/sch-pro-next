'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TrackingListProps {
  trackings: any[]
  onSelect: (tracking: any) => void
  selected: any
  onDelete: (id: string) => void
  onUpdate: () => void // ✅ FIX: Signature corretta senza parametri
}

// ✅ FIX: Controllo sicuro per getStatusColor
const getStatusColor = (status?: string) => {
  if (!status) return 'bg-gray-100 text-gray-800'
  
  const colors = {
    'registered': 'bg-gray-100 text-gray-800',
    'in_transit': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-green-100 text-green-800',
    'delayed': 'bg-yellow-100 text-yellow-800',
    'exception': 'bg-red-100 text-red-800',
    'sailing': 'bg-blue-100 text-blue-800',
    'customs_hold': 'bg-orange-100 text-orange-800',
    'arrived': 'bg-green-100 text-green-800',
    'SAILING': 'bg-blue-100 text-blue-800',
    'IN_TRANSIT': 'bg-blue-100 text-blue-800',
    'DELIVERED': 'bg-green-100 text-green-800',
    'ARRIVED': 'bg-green-100 text-green-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

// ✅ FIX: Funzione sicura per formattare date
const formatDate = (dateString?: string) => {
  if (!dateString) return 'Data non disponibile'
  try {
    return new Date(dateString).toLocaleDateString('it-IT')
  } catch {
    return 'Data non valida'
  }
}

export default function TrackingList({ 
  trackings, 
  onSelect, 
  selected, 
  onDelete, 
  onUpdate 
}: TrackingListProps) {
  // ✅ FIX: Array safety check
  const safeTrackings = Array.isArray(trackings) ? trackings : []

  if (safeTrackings.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessun tracking trovato
          </h3>
          <p className="text-gray-500">
            Aggiungi il tuo primo tracking per iniziare
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📋 Lista Tracking ({safeTrackings.length})</span>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onUpdate}
            title="Aggiorna lista tracking"
          >
            🔄 Aggiorna
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {safeTrackings.map((tracking) => (
            <div
              key={tracking.id || tracking.tracking_number}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selected?.id === tracking.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onSelect(tracking)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">
                      {tracking.tracking_number || 'Tracking non specificato'}
                    </h4>
                    <Badge className={getStatusColor(tracking.status)}>
                      {tracking.status || 'Stato non definito'}
                    </Badge>
                    
                    {/* ✅ FIX: Badge per tipo di tracking */}
                    {tracking.is_api_tracked !== undefined && (
                      <Badge variant={tracking.is_api_tracked ? "default" : "secondary"}>
                        {tracking.is_api_tracked ? '🔴 API' : '📝 MAN'}
                      </Badge>
                    )}
                  </div>
                  
                  {tracking.carrier_name && (
                    <p className="text-sm text-gray-600 mb-1">
                      🚛 {tracking.carrier_name}
                    </p>
                  )}
                  
                  {/* ✅ FIX: Controllo sicuro per porti */}
                  {(tracking.origin_port || tracking.destination_port || tracking.origin || tracking.destination) && (
                    <p className="text-sm text-gray-600">
                      📍 {tracking.origin_port || tracking.origin || '?'} → {tracking.destination_port || tracking.destination || '?'}
                    </p>
                  )}
                  
                  {/* ✅ FIX: Informazioni aggiuntive */}
                  {tracking.reference_number && (
                    <p className="text-xs text-gray-500">
                      Rif: {tracking.reference_number}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Creato: {formatDate(tracking.created_at)}
                  </p>
                  
                  {tracking.updated_at && tracking.updated_at !== tracking.created_at && (
                    <p className="text-xs text-gray-500">
                      Aggiornato: {formatDate(tracking.updated_at)}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect(tracking)
                    }}
                    title="Visualizza dettagli"
                  >
                    👁️
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Eliminare il tracking ${tracking.tracking_number || tracking.id}?`)) {
                        onDelete(tracking.id)
                      }
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Elimina tracking"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}