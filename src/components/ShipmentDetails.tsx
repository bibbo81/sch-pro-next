import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Mail,
  Truck,
  Weight,
  DollarSign,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'

// ✅ DEFINE EXPLICIT TYPES - Evita inferenza `never`
interface ShipmentItem {
  id: string
  product_id?: string | null
  description?: string | null
  quantity: number
  unit_price?: number | null
  currency?: string | null
  weight_kg?: number | null
  hs_code?: string | null
  origin_country?: string | null
  created_at: string
  updated_at: string
  products?: {
    id: string
    description?: string | null
    sku?: string | null
    unit_price?: number | null
    currency?: string | null
  } | null
}

interface Shipment {
  id: string
  organization_id: string
  user_id: string
  recipient_name?: string | null
  recipient_email?: string | null
  recipient_phone?: string | null
  origin_address?: string | null
  destination_address?: string | null
  tracking_number?: string | null
  carrier?: string | null
  service_type?: string | null
  status: string
  weight_kg?: number | null
  dimensions_cm?: any | null
  declared_value?: number | null
  currency?: string | null
  insurance_value?: number | null
  delivery_instructions?: string | null
  pickup_date?: string | null
  estimated_delivery?: string | null
  actual_delivery?: string | null
  notes?: string | null
  metadata?: any | null
  created_at: string
  updated_at: string
  shipment_items?: ShipmentItem[] | null
}

// ✅ EXPLICIT API RESPONSE TYPE
interface ApiResponse {
  success: boolean
  data?: Shipment | null
  error?: string
  message?: string
}

interface ShipmentDetailsProps {
  shipmentId: string
  onEdit?: (shipment: Shipment) => void
  onDelete?: (shipmentId: string) => void
  onClose?: () => void
}

const formatPrice = (price: number | null | undefined, currency = 'EUR'): string => {
  if (!price || price === 0) return '-'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency
  }).format(price)
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    draft: { label: 'Bozza', variant: 'secondary' as const },
    pending: { label: 'In Attesa', variant: 'default' as const },
    confirmed: { label: 'Confermato', variant: 'default' as const },
    shipped: { label: 'Spedito', variant: 'default' as const },
    in_transit: { label: 'In Transito', variant: 'default' as const },
    delivered: { label: 'Consegnato', variant: 'secondary' as const },
    cancelled: { label: 'Annullato', variant: 'destructive' as const },
    returned: { label: 'Reso', variant: 'destructive' as const }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || 
                { label: status, variant: 'secondary' as const }
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}

export default function ShipmentDetails({ 
  shipmentId, 
  onEdit, 
  onDelete, 
  onClose 
}: ShipmentDetailsProps) {
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [products, setProducts] = useState<ShipmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchShipment = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/shipments/${shipmentId}`)
      
      // ✅ EXPLICIT TYPE ASSERTION per evitare `never`
      const result: ApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Errore nel caricamento della spedizione')
      }

      // ✅ TYPE GUARDS per evitare errori `never`
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Dati spedizione non disponibili')
      }

      const shipmentData = result.data
      console.log('✅ Shipment loaded:', shipmentData.id)
      
      setShipment(shipmentData)
      
      // ✅ GESTIONE SICURA di shipment_items con TYPE GUARD
      if (shipmentData.shipment_items && Array.isArray(shipmentData.shipment_items)) {
        setProducts(shipmentData.shipment_items)
        console.log(`📦 Loaded ${shipmentData.shipment_items.length} items`)
      } else {
        console.warn('shipment_items non disponibili o non è un array')
        setProducts([])
      }

    } catch (err) {
      console.error('❌ Error fetching shipment:', err)
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      setShipment(null)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (shipmentId) {
      fetchShipment()
    }
  }, [shipmentId])

  const handleEdit = () => {
    if (shipment && onEdit) {
      onEdit(shipment)
    }
  }

  const handleDelete = async () => {
    if (!shipment) return
    
    if (!confirm(`Sei sicuro di voler eliminare la spedizione ${shipment.tracking_number || shipment.id}?`)) {
      return
    }

    if (onDelete) {
      onDelete(shipment.id)
    }
  }

  const calculateTotals = () => {
    return products.reduce((totals, item) => {
      const price = item.unit_price || 0
      const quantity = item.quantity || 0
      const weight = item.weight_kg || 0
      
      return {
        totalValue: totals.totalValue + (price * quantity),
        totalWeight: totals.totalWeight + (weight * quantity),
        totalItems: totals.totalItems + quantity
      }
    }, { totalValue: 0, totalWeight: 0, totalItems: 0 })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Caricamento dettagli spedizione...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-red-500 text-lg font-semibold mb-2">
                Errore nel caricamento
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={fetchShipment}>
                  Riprova
                </Button>
                {onClose && (
                  <Button variant="ghost" onClick={onClose}>
                    Chiudi
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Spedizione non trovata
              </h3>
              <p className="text-gray-600 mb-4">
                La spedizione richiesta non esiste o non hai i permessi per visualizzarla.
              </p>
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Torna Indietro
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totals = calculateTotals()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6" />
            Dettagli Spedizione
          </h2>
          <p className="text-gray-600 mt-1">
            {shipment.tracking_number ? `Tracking: ${shipment.tracking_number}` : `ID: ${shipment.id}`}
          </p>
        </div>
        
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Modifica
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" onClick={handleDelete} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Elimina
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Chiudi
            </Button>
          )}
        </div>
      </div>

      {/* Status e Info Generale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Informazioni Generali</span>
            {getStatusBadge(shipment.status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shipment.carrier && (
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Corriere</div>
                  <div className="font-medium">{shipment.carrier}</div>
                </div>
              </div>
            )}
            
            {shipment.service_type && (
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Servizio</div>
                  <div className="font-medium">{shipment.service_type}</div>
                </div>
              </div>
            )}

            {(shipment.weight_kg || totals.totalWeight > 0) && (
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Peso</div>
                  <div className="font-medium">
                    {(shipment.weight_kg || totals.totalWeight).toFixed(2)} kg
                  </div>
                </div>
              </div>
            )}

            {(shipment.declared_value || totals.totalValue > 0) && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Valore Dichiarato</div>
                  <div className="font-medium">
                    {formatPrice(shipment.declared_value || totals.totalValue, shipment.currency || 'EUR')}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-600">Data Creazione</div>
                <div className="font-medium">{formatDate(shipment.created_at)}</div>
              </div>
            </div>

            {shipment.estimated_delivery && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Consegna Stimata</div>
                  <div className="font-medium">{formatDate(shipment.estimated_delivery)}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Destinatario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Destinatario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="font-medium text-lg">
                {shipment.recipient_name || 'Nome non specificato'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shipment.recipient_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium">{shipment.recipient_email}</div>
                  </div>
                </div>
              )}

              {shipment.recipient_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Telefono</div>
                    <div className="font-medium">{shipment.recipient_phone}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indirizzi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Indirizzi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shipment.origin_address && (
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Origine</div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {shipment.origin_address}
                  </pre>
                </div>
              </div>
            )}

            {shipment.destination_address && (
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Destinazione</div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {shipment.destination_address}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prodotti/Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Prodotti ({products.length})
            </span>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Prodotto
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nessun prodotto aggiunto alla spedizione
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((item, index) => (
                <div key={item.id || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">
                        {item.description || item.products?.description || 'Prodotto senza nome'}
                      </div>
                      {item.products?.sku && (
                        <div className="text-sm text-gray-600">
                          SKU: {item.products.sku}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Quantità: {item.quantity}</span>
                        {item.unit_price && (
                          <span>
                            Prezzo: {formatPrice(item.unit_price, item.currency || 'EUR')}
                          </span>
                        )}
                        {item.weight_kg && (
                          <span>Peso: {item.weight_kg} kg</span>
                        )}
                        {item.hs_code && (
                          <span>HS: {item.hs_code}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {item.unit_price && (
                        <div className="font-medium">
                          {formatPrice(item.unit_price * item.quantity, item.currency || 'EUR')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Totali */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Totali:</span>
                  <div className="text-right">
                    <div>Items: {totals.totalItems}</div>
                    {totals.totalWeight > 0 && (
                      <div>Peso: {totals.totalWeight.toFixed(2)} kg</div>
                    )}
                    {totals.totalValue > 0 && (
                      <div>
                        Valore: {formatPrice(totals.totalValue, shipment.currency || 'EUR')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note */}
      {(shipment.notes || shipment.delivery_instructions) && (
        <Card>
          <CardHeader>
            <CardTitle>Note e Istruzioni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shipment.delivery_instructions && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Istruzioni di Consegna
                  </div>
                  <div className="p-3 bg-blue-50 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap font-sans">
                      {shipment.delivery_instructions}
                    </pre>
                  </div>
                </div>
              )}

              {shipment.notes && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Note Interne
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap font-sans">
                      {shipment.notes}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info - Solo in development */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xs text-gray-500">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-48">
              {JSON.stringify({ shipment, products, totals }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}