'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Package, DollarSign, MapPin, Calendar } from 'lucide-react'

interface ShipmentFormProps {
  onClose: () => void
  onShipmentCreated: (shipment: any) => void
  onSuccess?: () => void
  onCancel?: () => void
}

interface Forwarder {
  id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  active?: boolean
}

export default function ShipmentForm({ onClose, onShipmentCreated }: ShipmentFormProps) {
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [forwarders, setForwarders] = useState<Forwarder[]>([])
  const [forwardersLoading, setForwardersLoading] = useState(true)
  const [forwardersError, setForwardersError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    // Basic info
    shipment_number: '',
    type: '',
    status: 'registered',
    
    // Commercial
    supplier_name: '',
    supplier_country: '',
    total_value: '',
    currency: 'EUR',
    incoterm: '',
    
    // Transport
    transport_mode: '',
    carrier_name: '',
    forwarder_id: '',
    transport_company: '',
    
    // Route
    origin: '',
    origin_port: '',
    origin_country: '',
    destination: '',
    destination_port: '',
    destination_country: '',
    
    // Dates
    departure_date: '',
    arrival_date: '',
    eta: '',
    etd: '',
    
    // Physical
    total_weight_kg: '',
    total_volume_cbm: '',
    container_count: '',
    container_size: '',
    container_type: '',
    pieces: '',
    
    // References
    tracking_number: '',
    reference_number: '',
    booking_number: '',
    bl_number: '',
    
    // Costs
    freight_cost: '',
    other_costs: '',
    total_cost: '',
    
    // Other
    commodity: '',
    vessel_name: '',
    voyage_number: ''
  })

  // Load forwarders on component mount
  useEffect(() => {
    const loadForwarders = async () => {
      try {
        setForwardersLoading(true)
        setForwardersError(null)

        const response = await fetch('/api/forwarders')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success && Array.isArray(result.data)) {
          setForwarders(result.data)
        } else {
          throw new Error(result.error || 'Failed to load forwarders')
        }
      } catch (error) {
        console.error('Error loading forwarders:', error)
        setForwardersError(error instanceof Error ? error.message : 'Failed to load forwarders')
        setForwarders([])
      } finally {
        setForwardersLoading(false)
      }
    }

    loadForwarders()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user is authenticated
    if (!user?.id) {
      alert('Errore: Utente non autenticato')
      return
    }
    
    if (!formData.shipment_number.trim()) {
      alert('Il numero shipment è obbligatorio')
      return
    }

    try {
      setLoading(true)
      
      // Prepara i dati per l'invio
      const submitData: any = { ...formData }
      
      // Converte campi numerici
      const numericFields = ['total_value', 'total_weight_kg', 'total_volume_cbm', 'container_count', 'pieces', 'freight_cost', 'other_costs', 'total_cost']
      numericFields.forEach(field => {
        if (submitData[field] && submitData[field] !== '') {
          const numValue = parseFloat(submitData[field]) || 0
          submitData[field] = numValue
        } else {
          delete submitData[field]
        }
      })
      
      // Rimuove campi vuoti
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          delete submitData[key]
        }
      })
      
      console.log('🔍 Invio dati shipment:', submitData)
      
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submitData,
          user_id: user.id
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Errore HTTP: ${response.status}`)
      }
      
      const newShipment = await response.json()
      console.log('✅ Shipment creato:', newShipment.id)
      
      onShipmentCreated(newShipment)
      onClose()
    } catch (error) {
      console.error('❌ Errore creazione shipment:', error)
      alert(`Errore nella creazione del shipment: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full bg-card text-card-foreground border-border">
      <CardHeader className="bg-card">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Package className="h-5 w-5" />
            Nuovo Shipment
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-muted">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="bg-card text-card-foreground">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-card-foreground">
              <Package className="h-4 w-4" />
              Informazioni Base
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipment_number" className="text-card-foreground">Numero Shipment *</Label>
                <Input
                  id="shipment_number"
                  value={formData.shipment_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('shipment_number', e.target.value)}
                  placeholder="es. SH-2024-001"
                  required
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type" className="text-card-foreground">Tipo</Label>
                <Select onValueChange={(value: string) => handleInputChange('type', value)}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-card-foreground border-border">
                    <SelectItem value="import">Import</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="domestic">Domestico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-card-foreground">Stato</Label>
                <Select value={formData.status} onValueChange={(value: string) => handleInputChange('status', value)}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-card-foreground border-border">
                    <SelectItem value="registered">📝 Registrato</SelectItem>
                    <SelectItem value="in_transit">🚛 In Transito</SelectItem>
                    <SelectItem value="delivered">✅ Consegnato</SelectItem>
                    <SelectItem value="cancelled">🚫 Annullato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Commercial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-card-foreground">
              <DollarSign className="h-4 w-4" />
              Informazioni Commerciali
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_name" className="text-card-foreground">Fornitore</Label>
                <Input
                  id="supplier_name"
                  value={formData.supplier_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('supplier_name', e.target.value)}
                  placeholder="Nome fornitore"
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier_country" className="text-card-foreground">Paese Fornitore</Label>
                <Input
                  id="supplier_country"
                  value={formData.supplier_country}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('supplier_country', e.target.value)}
                  placeholder="es. China"
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="total_value" className="text-card-foreground">Valore Totale</Label>
                <Input
                  id="total_value"
                  type="number"
                  step="0.01"
                  value={formData.total_value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('total_value', e.target.value)}
                  placeholder="0.00"
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-card-foreground">Valuta</Label>
                <Select value={formData.currency} onValueChange={(value: string) => handleInputChange('currency', value)}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-card-foreground border-border">
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="incoterm" className="text-card-foreground">Incoterm</Label>
                <Select onValueChange={(value: string) => handleInputChange('incoterm', value)}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Seleziona incoterm" />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-card-foreground border-border">
                    <SelectItem value="EXW">EXW</SelectItem>
                    <SelectItem value="FOB">FOB</SelectItem>
                    <SelectItem value="CIF">CIF</SelectItem>
                    <SelectItem value="DDP">DDP</SelectItem>
                    <SelectItem value="FCA">FCA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Transport Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-card-foreground">
              <MapPin className="h-4 w-4" />
              Informazioni Trasporto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transport_mode" className="text-card-foreground">Modalità Trasporto</Label>
                <Select onValueChange={(value: string) => handleInputChange('transport_mode', value)}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Seleziona modalità" />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-card-foreground border-border">
                    <SelectItem value="sea">Marittimo</SelectItem>
                    <SelectItem value="air">Aereo</SelectItem>
                    <SelectItem value="road">Stradale</SelectItem>
                    <SelectItem value="rail">Ferroviario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="forwarder_id" className="text-card-foreground">Spedizioniere</Label>
                <Select
                  value={formData.forwarder_id}
                  onValueChange={(value: string) => handleInputChange('forwarder_id', value)}
                  disabled={forwardersLoading}
                >
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue
                      placeholder={
                        forwardersLoading
                          ? "Caricamento spedizionieri..."
                          : forwardersError
                            ? "Errore nel caricamento"
                            : forwarders.length === 0
                              ? "Nessuno spedizioniere disponibile"
                              : "Seleziona spedizioniere"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-card-foreground border-border">
                    {forwarders.map((forwarder) => (
                      <SelectItem key={forwarder.id} value={forwarder.id}>
                        {forwarder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {forwardersError && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {forwardersError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="carrier_name" className="text-card-foreground">Vettore (Testo libero)</Label>
                <Input
                  id="carrier_name"
                  value={formData.carrier_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('carrier_name', e.target.value)}
                  placeholder="Nome vettore"
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="origin_port" className="text-card-foreground">Porto Origine</Label>
                <Input
                  id="origin_port"
                  value={formData.origin_port}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('origin_port', e.target.value)}
                  placeholder="es. Shanghai"
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="destination_port" className="text-card-foreground">Porto Destinazione</Label>
                <Input
                  id="destination_port"
                  value={formData.destination_port}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('destination_port', e.target.value)}
                  placeholder="es. Milano"
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-card-foreground">
              <Calendar className="h-4 w-4" />
              Date
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure_date" className="text-card-foreground">Data Partenza</Label>
                <Input
                  id="departure_date"
                  type="date"
                  value={formData.departure_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('departure_date', e.target.value)}
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="arrival_date" className="text-card-foreground">Data Arrivo Prevista</Label>
                <Input
                  id="arrival_date"
                  type="date"
                  value={formData.arrival_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('arrival_date', e.target.value)}
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Physical Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Dettagli Fisici</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_weight_kg" className="text-card-foreground">Peso Totale (kg)</Label>
                <Input
                  id="total_weight_kg"
                  type="number"
                  value={formData.total_weight_kg}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('total_weight_kg', e.target.value)}
                  placeholder="0"
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="total_volume_cbm" className="text-card-foreground">Volume (CBM)</Label>
                <Input
                  id="total_volume_cbm"
                  type="number"
                  step="0.01"
                  value={formData.total_volume_cbm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('total_volume_cbm', e.target.value)}
                  placeholder="0.00"
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="container_count" className="text-card-foreground">N° Container</Label>
                <Input
                  id="container_count"
                  type="number"
                  value={formData.container_count}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('container_count', e.target.value)}
                  placeholder="0"
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* References */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Riferimenti</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tracking_number" className="text-card-foreground">Numero Tracking</Label>
                <Input
                  id="tracking_number"
                  value={formData.tracking_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tracking_number', e.target.value)}
                  placeholder="Numero tracking"
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reference_number" className="text-card-foreground">Numero Riferimento</Label>
                <Input
                  id="reference_number"
                  value={formData.reference_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('reference_number', e.target.value)}
                  placeholder="Riferimento cliente"
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="booking_number" className="text-card-foreground">Numero Booking</Label>
                <Input
                  id="booking_number"
                  value={formData.booking_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('booking_number', e.target.value)}
                  placeholder="Numero prenotazione"
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bl_number" className="text-card-foreground">Numero B/L</Label>
                <Input
                  id="bl_number"
                  value={formData.bl_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('bl_number', e.target.value)}
                  placeholder="Bill of Lading"
                  className="bg-background text-foreground border-border focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading || !user?.id} className="flex-1">
              {loading ? 'Creazione in corso...' : 'Crea Shipment'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}