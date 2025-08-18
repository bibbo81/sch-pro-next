import { useState } from 'react'
import { 
  Package, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Truck,
  Ship,
  Plane,
  Building2,
  Hash,
  Weight,
  Box,
  Trash2,
  Eye,
  Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatStatus } from '@/lib/statusMapping'

interface ShipmentCardProps {
  shipment: any
  onDelete: (id: string) => void
}

export default function ShipmentCard({ shipment, onDelete }: ShipmentCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  // 🔧 USA LO STATO NORMALIZZATO INVECE DI QUELLO GREZZO
  const statusToUse = shipment.normalizedStatus || shipment.status || 'registered'
  const { normalized, config } = formatStatus(statusToUse)

  // Helper per formattare le date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Helper per formattare i valori monetari
  const formatCurrency = (value: number, currency: string = 'EUR') => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value)
  }

  // 🔧 AGGIORNA - USA TRACKINGTYPE PER DETERMINARE ICONA
  const getTransportIcon = (mode: string) => {
    // Prima controlla il trackingType (più accurato)
    if (shipment.trackingType === 'awb') {
      return <Plane className="h-4 w-4" />
    }
    if (shipment.trackingType === 'container' || shipment.trackingType === 'fcl' || shipment.trackingType === 'lcl') {
      return <Ship className="h-4 w-4" />
    }
    
    switch (mode?.toLowerCase()) {
      case 'sea':
      case 'ocean':
      case 'maritime':
      case 'fcl':
      case 'lcl':
        return <Ship className="h-4 w-4" />
      case 'air':
      case 'flight':
      case 'aviation':
      case 'awb':
        return <Plane className="h-4 w-4" />
      case 'road':
      case 'truck':
      case 'trucking':
        return <Truck className="h-4 w-4" />
      case 'rail':
      case 'train':
      case 'railway':
        return <Package className="h-4 w-4" /> // Usare Package per rail
      default:
        // Fallback: cerca di capire dal tracking number
        return detectTransportIcon(shipment.tracking_number)
    }
  }
const detectTransportIcon = (trackingNumber: string) => {
    if (!trackingNumber) return <Package className="h-4 w-4" />
    
    const upper = trackingNumber.toUpperCase()
    
    // Container patterns
    if (/^[A-Z]{4}[0-9]{7}$/.test(upper) || 
        /^(MSKU|CMAU|COSU|HJMU|ZIMU|GESU|TGHU|MSCU|CASU|BEAU|OOLU|TCLU)/.test(upper)) {
      return <Ship className="h-4 w-4" />
    }
    
    // AWB patterns  
    if (/^[0-9]{3}-[0-9]{8}$/.test(upper) || 
        /^AWB/.test(upper) || 
        /^(UPS|1Z|FEDX|FX|DHL|TNT)/.test(upper)) {
      return <Plane className="h-4 w-4" />
    }
    
    // Rail patterns
    if (/^(RAIL|TRAIN|RW)/.test(upper)) {
      return <Package className="h-4 w-4" />
    }
    
    // Road patterns  
    if (/^(TRUCK|TRK|ROAD)/.test(upper)) {
      return <Truck className="h-4 w-4" />
    }
    
    return <Package className="h-4 w-4" />
  }
  
  // 🔧 AGGIUNGI - Helper per nome trasporto leggibile
  const getTransportModeName = () => {
    // Prima controlla il trackingType (più accurato dal tracking system)
    if (shipment.trackingType) {
      switch (shipment.trackingType.toLowerCase()) {
        case 'awb':
          return '✈️ Aereo (AWB)'
        case 'container':
          return '🚢 Mare (Container)'
        case 'lcl':
          return '🚢 Mare (LCL)'
        case 'fcl':
          return '🚢 Mare (FCL)'
        case 'rail':
          return '🚂 Treno'
        case 'truck':
        case 'road':
          return '🚛 Strada'
      }
    }
    
    // Poi il transport_mode dal shipment
    if (shipment.transport_mode) {
      const mode = shipment.transport_mode.toLowerCase()
      switch (mode) {
        case 'sea':
        case 'ocean':
        case 'maritime':
          return '🚢 Mare'
        case 'fcl':
          return '🚢 Mare (FCL)'
        case 'lcl':
          return '🚢 Mare (LCL)'
        case 'air':
        case 'flight':
        case 'aviation':
          return '✈️ Aereo'
        case 'awb':
          return '✈️ Aereo (AWB)'
        case 'road':
        case 'truck':
        case 'trucking':
          return '🚛 Strada'
        case 'rail':
        case 'train':
        case 'railway':
          return '🚂 Treno'
        case 'multimodal':
        case 'intermodal':
          return '🔄 Multimodale'
        case 'express':
          return '⚡ Express'
        case 'courier':
          return '📦 Corriere'
        default:
          // Se non riconosciuto, mostra il valore originale con emoji generica
          return `🚚 ${mode.charAt(0).toUpperCase() + mode.slice(1)}`
      }
    }
    
    // 🔧 FALLBACK INTELLIGENTE basato su tracking number
    const detectedMode = detectTransportModeFromTracking(shipment.tracking_number)
    if (detectedMode) return detectedMode
    
    // 🔧 FALLBACK FINALE basato su carrier o altre informazioni
    if (shipment.carrier_name) {
      const carrier = shipment.carrier_name.toUpperCase()
      
      // Compagnie aeree
      if (/AIR CHINA|LUFTHANSA|EMIRATES|BRITISH AIRWAYS|AIR FRANCE|DELTA|UNITED|AMERICAN AIRLINES/.test(carrier)) {
        return '✈️ Aereo'
      }
      
      // Compagnie marittime
      if (/MSK|MAERSK|COSCO|CMA CGM|HAPAG|LLOYD|EVERGREEN|YANG MING|ONE|ZIM/.test(carrier)) {
        return '🚢 Mare'
      }
      
      // Corrieri
      if (/DHL|UPS|FEDEX|TNT|ARAMEX/.test(carrier)) {
        return '📦 Corriere'
      }
      
      // Trasporto su strada
      if (/TRUCK|ROAD|TRANSPORT/.test(carrier)) {
        return '🚛 Strada'
      }
    }
    
    // 🔧 ULTIMO FALLBACK: cerca di capire dal vessel_name
    if (shipment.vessel_name) {
      return '🚢 Mare'
    }
    
    // 🔧 ULTIMO FALLBACK: cerca di capire dal flight_number
    if (shipment.flight_number) {
      return '✈️ Aereo'
    }
    
    return 'Non specificato'
  }
  
  const detectTransportModeFromTracking = (trackingNumber: string): string | null => {
    if (!trackingNumber) return null
    
    const upper = trackingNumber.toUpperCase()
    
    // Container patterns (più completi)
    if (/^[A-Z]{4}[0-9]{7}$/.test(upper)) {
      return '🚢 Mare (Container)'
    }
    
    // Specific container line prefixes
    if (/^(MSKU|CMAU|COSU|HJMU|ZIMU|GESU|TGHU|MSCU|CASU|BEAU|OOLU|TCLU|NYKU|FCIU|PONU|YMLU|ONEY)/.test(upper)) {
      return '🚢 Mare (Container)'
    }
    
    // AWB patterns (più completi)
    if (/^[0-9]{3}-[0-9]{8}$/.test(upper)) {
      return '✈️ Aereo (AWB)'
    }
    
    // Specific AWB prefixes by airline
    if (/^(074|020|016|006|172|176|229|014|057|160|724|721|618|999)/.test(upper)) {
      return '✈️ Aereo (AWB)'
    }
    
    // Courier services
    if (/^(UPS|1Z)/.test(upper)) {
      return '📦 UPS'
    }
    if (/^(FEDX|FX)/.test(upper)) {
      return '📦 FedEx'
    }
    if (/^DHL/.test(upper)) {
      return '📦 DHL'
    }
    if (/^TNT/.test(upper)) {
      return '📦 TNT'
    }
    
    // Rail patterns
    if (/^(RAIL|TRAIN|RW|CN[0-9])/.test(upper)) {
      return '🚂 Treno'
    }
    
    // Road patterns  
    if (/^(TRUCK|TRK|ROAD|TR[0-9])/.test(upper)) {
      return '🚛 Strada'
    }
    
    // B/L Numbers
    if (/^BL|BILL|BKG|BOOK/.test(upper)) {
      return '🚢 Mare (B/L)'
    }
    
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              {/* 🔧 USA L'ICONA CORRETTA BASATA SUL TRACKING TYPE */}
              {shipment.trackingType === 'awb' ? (
                <Plane className="h-5 w-5 text-blue-600" />
              ) : (
                <Package className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {shipment.shipment_number}
              </h3>
              {shipment.tracking_number && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {/* 🔧 AGGIUNGI ICONA TRACKING TYPE */}
                  {shipment.trackingType === 'awb' ? '✈️' : '🚢'} {shipment.tracking_number}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* 🔧 USA IL CONFIG DAL STATUS MAPPING */}
            <Badge className={`${config.bgColor} ${config.color} border-0`}>
              <span className="mr-1">{config.icon}</span>
              {config.label}
            </Badge>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Supplier */}
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-500">
              <Building2 className="h-4 w-4 mr-1" />
              Supplier
            </div>
            <p className="font-medium">
              {shipment.supplier_name || 'Non specificato'}
            </p>
            {shipment.supplier_country && (
              <p className="text-sm text-gray-500">{shipment.supplier_country}</p>
            )}
          </div>

          {/* Route */}
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              Route
            </div>
            <p className="font-medium text-sm">
              {shipment.origin_port || shipment.origin || 'Origine non specificata'}
              <br />
              ↓
              <br />
              {shipment.destination_port || shipment.destination || 'Destinazione non specificata'}
            </p>
          </div>

          {/* Transport & Schedule */}
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-500">
              {getTransportIcon(shipment.transport_mode)}
              <span className="ml-1">Transport</span>
            </div>
            <p className="font-medium">
              {/* 🔧 USA IL NOME TRASPORTO FORMATTATO */}
              {getTransportModeName()}
            </p>
            {shipment.departure_date && (
              <p className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(shipment.departure_date)}
              </p>
            )}
          </div>

          {/* Value */}
          <div className="space-y-1">
            <div className="flex items-center text-sm text-gray-500">
              <DollarSign className="h-4 w-4 mr-1" />
              Value
            </div>
            <p className="font-medium">
              {formatCurrency(shipment.total_value, shipment.currency)}
            </p>
            {shipment.total_cost && (
              <p className="text-sm text-gray-500">
                Cost: {formatCurrency(shipment.total_cost, shipment.currency)}
              </p>
            )}
          </div>
        </div>

        {/* Additional Info Row */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          {shipment.total_weight_kg && (
            <span className="flex items-center">
              <Weight className="h-3 w-3 mr-1" />
              {shipment.total_weight_kg} kg
            </span>
          )}
          {shipment.total_volume_cbm && (
            <span className="flex items-center">
              <Box className="h-3 w-3 mr-1" />
              {shipment.total_volume_cbm} CBM
            </span>
          )}
          {shipment.container_count && (
            <span className="flex items-center">
              <Package className="h-3 w-3 mr-1" />
              {shipment.container_count} containers
            </span>
          )}
          {shipment.incoterm && (
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {shipment.incoterm}
            </span>
          )}
        </div>

        {/* Expandable Details */}
        {showDetails && (
          <div className="border-t pt-4 mt-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {/* 🔧 AGGIUNGI STATUS RAW PER DEBUG */}
              {process.env.NODE_ENV === 'development' && (
                <div>
                  <span className="font-medium">Status (raw):</span> {shipment.status}
                </div>
              )}
              {/* 🔧 AGGIUNGI STATUS NORMALIZZATO PER DEBUG */}
              {process.env.NODE_ENV === 'development' && (
                <div>
                  <span className="font-medium">Status (normalized):</span> {normalized}
                </div>
              )}
              {shipment.reference_number && (
                <div>
                  <span className="font-medium">Reference:</span> {shipment.reference_number}
                </div>
              )}
              {shipment.booking_number && (
                <div>
                  <span className="font-medium">Booking:</span> {shipment.booking_number}
                </div>
              )}
              {shipment.bl_number && (
                <div>
                  <span className="font-medium">B/L:</span> {shipment.bl_number}
                </div>
              )}
              {shipment.vessel_name && (
                <div>
                  <span className="font-medium">Vessel:</span> {shipment.vessel_name}
                </div>
              )}
              {shipment.voyage_number && (
                <div>
                  <span className="font-medium">Voyage:</span> {shipment.voyage_number}
                </div>
              )}
              {shipment.carrier_name && (
                <div>
                  <span className="font-medium">Carrier:</span> {shipment.carrier_name}
                </div>
              )}
              {shipment.eta && (
                <div>
                  <span className="font-medium">ETA:</span> {formatDate(shipment.eta)}
                </div>
              )}
              {shipment.arrival_date && (
                <div>
                  <span className="font-medium">Arrival:</span> {formatDate(shipment.arrival_date)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Eye className="h-4 w-4 mr-1" />
            {showDetails ? 'Hide Details' : 'View Details'}
          </Button>

          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(shipment.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>

        {/* Created Info */}
        <div className="text-xs text-gray-400 mt-2">
          Created {formatDate(shipment.created_at)}
          {shipment.auto_created && ' (Auto-generated)'}
          {/* 🔧 AGGIUNGI INFO CARRIER E ETA SE PRESENTI */}
          {shipment.carrier_name && (
            <span className="ml-4">Carrier: {shipment.carrier_name}</span>
          )}
          {shipment.eta && (
            <span className="ml-4">ETA: {formatDate(shipment.eta)}</span>
          )}
        </div>
      </div>
    </div>
  )
}