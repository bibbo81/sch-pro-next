'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Package, DollarSign, MapPin, Calendar } from 'lucide-react'

interface ShipmentFormProps {
  onClose: () => void
  onShipmentCreated: (shipment: any) => void
}

export default function ShipmentForm({ onClose, onShipmentCreated }: ShipmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
     // Basic info
    shipment_number: '',
    type: '',
    status: 'registered', // 🔧 CORRETTO - NON 'planned'
    
    // Commercial
    supplier_name: '',
    supplier_country: '',
    total_value: '',
    currency: 'EUR',
    incoterm: '',
    
    // Transport
    transport_mode: '',
    carrier_name: '',
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.shipment_number.trim()) {
      alert('Il numero shipment è obbligatorio')
      return
    }

    try {
      setLoading(true)
      
      // Prepara i dati per l'invio - ✅ CORREZIONE ERRORE
      const submitData: any = { ...formData }
      
      // Converte campi numerici
      const numericFields = ['total_value', 'total_weight_kg', 'total_volume_cbm', 'container_count', 'pieces', 'freight_cost', 'other_costs', 'total_cost']
      numericFields.forEach(field => {
        if (submitData[field] && submitData[field] !== '') {
          // ✅ CORREZIONE: converte a number
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
        body: JSON.stringify(submitData)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Errore HTTP: ${response.status}`)
      }
      
      const newShipment = await response.json()
      console.log('✅ Shipment creato:', newShipment.id)
      
      onShipmentCreated(newShipment)
    } catch (error) {
      console.error('❌ Errore creazione shipment:', error)
      alert(`Errore nella creazione del shipment: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Nuovo Shipment
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Informazioni Base
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipment_number">Numero Shipment *</Label>
                <Input
                  id="shipment_number"
                  value={formData.shipment_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('shipment_number', e.target.value)}
                  placeholder="es. SH-2024-001"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select onValueChange={(value: string) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="import">Import</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="domestic">Domestico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Stato</Label>
                <Select value={formData.status} onValueChange={(value: string) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* 🔧 CORRETTO - USA STATI UNIFICATI */}
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
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Informazioni Commerciali
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_name">Fornitore</Label>
                <Input
                  id="supplier_name"
                  value={formData.supplier_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('supplier_name', e.target.value)}
                  placeholder="Nome fornitore"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier_country">Paese Fornitore</Label>
                <Input
                  id="supplier_country"
                  value={formData.supplier_country}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('supplier_country', e.target.value)}
                  placeholder="es. China"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="total_value">Valore Totale</Label>
                <Input
                  id="total_value"
                  type="number"
                  step="0.01"
                  value={formData.total_value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('total_value', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Valuta</Label>
                <Select value={formData.currency} onValueChange={(value: string) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="incoterm">Incoterm</Label>
                <Select onValueChange={(value: string) => handleInputChange('incoterm', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona incoterm" />
                  </SelectTrigger>
                  <SelectContent>
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
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Informazioni Trasporto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transport_mode">Modalità Trasporto</Label>
                <Select onValueChange={(value: string) => handleInputChange('transport_mode', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona modalità" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sea">Marittimo</SelectItem>
                    <SelectItem value="air">Aereo</SelectItem>
                    <SelectItem value="road">Stradale</SelectItem>
                    <SelectItem value="rail">Ferroviario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="carrier_name">Vettore</Label>
                <Input
                  id="carrier_name"
                  value={formData.carrier_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('carrier_name', e.target.value)}
                  placeholder="Nome vettore"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="origin_port">Porto Origine</Label>
                <Input
                  id="origin_port"
                  value={formData.origin_port}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('origin_port', e.target.value)}
                  placeholder="es. Shanghai"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="destination_port">Porto Destinazione</Label>
                <Input
                  id="destination_port"
                  value={formData.destination_port}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('destination_port', e.target.value)}
                  placeholder="es. Milano"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure_date">Data Partenza</Label>
                <Input
                  id="departure_date"
                  type="date"
                  value={formData.departure_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('departure_date', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="arrival_date">Data Arrivo Prevista</Label>
                <Input
                  id="arrival_date"
                  type="date"
                  value={formData.arrival_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('arrival_date', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Physical Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dettagli Fisici</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_weight_kg">Peso Totale (kg)</Label>
                <Input
                  id="total_weight_kg"
                  type="number"
                  value={formData.total_weight_kg}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('total_weight_kg', e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="total_volume_cbm">Volume (CBM)</Label>
                <Input
                  id="total_volume_cbm"
                  type="number"
                  step="0.01"
                  value={formData.total_volume_cbm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('total_volume_cbm', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="container_count">N° Container</Label>
                <Input
                  id="container_count"
                  type="number"
                  value={formData.container_count}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('container_count', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* References */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Riferimenti</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tracking_number">Numero Tracking</Label>
                <Input
                  id="tracking_number"
                  value={formData.tracking_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tracking_number', e.target.value)}
                  placeholder="Numero tracking"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reference_number">Numero Riferimento</Label>
                <Input
                  id="reference_number"
                  value={formData.reference_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('reference_number', e.target.value)}
                  placeholder="Riferimento cliente"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="booking_number">Numero Booking</Label>
                <Input
                  id="booking_number"
                  value={formData.booking_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('booking_number', e.target.value)}
                  placeholder="Numero prenotazione"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bl_number">Numero B/L</Label>
                <Input
                  id="bl_number"
                  value={formData.bl_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('bl_number', e.target.value)}
                  placeholder="Bill of Lading"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
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