'use client'

import { useState, useEffect } from 'react'
import { useShipsGO } from '@/hooks/useShipsGO'

interface TrackingFormProps {
  onAdd: (tracking: any) => void
  onBatchAdd: (trackings: any[]) => void
  onCancel?: () => void // ✅ FIX: Aggiungi onCancel opzionale
}

export default function TrackingForm({ onAdd, onBatchAdd, onCancel }: TrackingFormProps) {
  const { trackSingle, trackBatch, loading, error, creditsUsed, resetCredits } = useShipsGO()
  
  const [formData, setFormData] = useState({
    tracking_number: '',
    tracking_numbers: '',
    carrier_name: '',
    origin_port: '',
    destination_port: '',
    eta: '',
    tracking_type: 'container',
    status: 'SAILING',
    reference_number: '',
    transport_mode_id: '',
    vehicle_type_id: '',
    transport_company: '',
    total_weight_kg: '',
    total_volume_cbm: '',
    bl_number: '',
    flight_number: ''
  })

  const [operation, setOperation] = useState<'single' | 'batch' | 'excel' | 'manual'>('single')
  const [forceNew, setForceNew] = useState(false)
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [carriers, setCarriers] = useState<any[]>([])
  const [transportModes, setTransportModes] = useState<any[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([])
  const [detectedType, setDetectedType] = useState<string | null>(null)

  const inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
  const selectClassName = "w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
  const textareaClassName = "w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical"

  useEffect(() => {
    loadTransportModes()
    loadCarriers()
  }, [])

  const formatDateForInput = (isoString: string): string => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      return date.toISOString().slice(0, 16)
    } catch {
      return ''
    }
  }

  const parseDateFromItalian = (italianDate: string): string => {
    if (!italianDate) return ''
    try {
      if (italianDate.includes('T')) return italianDate
      
      const [datePart, timePart] = italianDate.split(' ')
      const [day, month, year] = datePart.split('/')
      const time = timePart || '12:00'
      
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}`
      return isoDate
    } catch {
      return ''
    }
  }

  const handleTrackingNumberChange = (value: string) => {
    setFormData(prev => ({ ...prev, tracking_number: value }))
    
    if (!value.trim()) {
      setDetectedType(null)
      return
    }

    if (operation !== 'manual') {
      let detected = 'container'
      let suggestedMode = '1' // Marittimo default
      
      // AWB Detection
      if (/^\d{3}-?\d{8}$/.test(value) || /^[A-Z]{2}\d{6,}/.test(value)) {
        detected = 'awb'
        suggestedMode = '2' // Aereo
      }
      // Container patterns
      else if (/^[A-Z]{4}\d{7}$/.test(value) || /^[A-Z]{4}\d{6}[A-Z]$/.test(value)) {
        detected = 'container'
        suggestedMode = '1' // Marittimo
      }
      // Parcel/Package patterns
      else if (/^(1Z|JD|1ZA|JJ|JO|JE|JP)\w+/.test(value) || /^\d{22}$/.test(value)) {
        detected = 'parcel'
        suggestedMode = '3' // Stradale
      }
      
      setDetectedType(detected)
      setFormData(prev => ({ 
        ...prev, 
        tracking_type: detected,
        transport_mode_id: prev.transport_mode_id || suggestedMode
      }))

      if (!formData.transport_mode_id) {
        loadVehicleTypes(suggestedMode)
      }
    } else {
      // Per Manual: solo suggerisce modalità base
      let suggestedMode = '1' // Default marittimo
      
      if (/^\d{3}-?\d{8}$/.test(value) || /^[A-Z]{2}\d{6,}/.test(value)) {
        suggestedMode = '2' // Aereo
        setDetectedType('air_manual')
      } else if (/^(1Z|JD|1ZA|JJ|JO|JE|JP)\w+/.test(value)) {
        suggestedMode = '3' // Stradale
        setDetectedType('road_manual')
      } else {
        setDetectedType('sea_manual')
      }
      
      setFormData(prev => ({ 
        ...prev, 
        transport_mode_id: prev.transport_mode_id || suggestedMode
      }))

      if (!formData.transport_mode_id) {
        loadVehicleTypes(suggestedMode)
      }
    }
  }

  const loadTransportModes = async () => {
    try {
      const response = await fetch('/api/transport-modes')
      const result = await response.json()
      if (result.success) {
        setTransportModes(result.data)
      }
    } catch (error) {
      console.error('Error loading transport modes:', error)
      setTransportModes([
        { id: '1', name: 'Marittimo', icon: '🚢' },
        { id: '2', name: 'Aereo', icon: '✈️' },
        { id: '3', name: 'Stradale', icon: '🚛' },
        { id: '4', name: 'Ferroviario', icon: '🚂' }
      ])
    }
  }

  const loadCarriers = async () => {
    try {
      const response = await fetch('/api/carriers')
      const result = await response.json()
      if (result.success) {
        setCarriers(result.data)
      }
    } catch (error) {
      console.error('Error loading carriers:', error)
      setCarriers([
        { id: '1', name: 'MSC', type: 'maritime' },
        { id: '2', name: 'MAERSK', type: 'maritime' },
        { id: '3', name: 'DHL', type: 'air' },
        { id: '4', name: 'FedEx', type: 'air' }
      ])
    }
  }

  const loadVehicleTypes = async (transportModeId: string) => {
    if (!transportModeId) {
      setVehicleTypes([])
      return
    }

    try {
      const response = await fetch(`/api/vehicle-types?transport_mode_id=${transportModeId}`)
      const result = await response.json()
      if (result.success) {
        setVehicleTypes(result.data)
      }
    } catch (error) {
      console.error('Error loading vehicle types:', error)
      setVehicleTypes([])
    }
  }

  const handleVehicleTypeChange = (vehicleTypeId: string) => {
    setFormData(prev => ({ ...prev, vehicle_type_id: vehicleTypeId }))
    
    const selectedVehicle = vehicleTypes.find(v => v.id === vehicleTypeId)
    if (selectedVehicle) {
      setFormData(prev => ({
        ...prev,
        total_weight_kg: selectedVehicle.default_kg || prev.total_weight_kg,
        total_volume_cbm: selectedVehicle.default_cbm || prev.total_volume_cbm
      }))
    }
  }

  const getFilteredCarriers = () => {
    if (!formData.transport_mode_id) return carriers

    const modeToType = {
      '1': 'maritime',
      '2': 'air',
      '3': 'road',
      '4': 'rail',
      '5': 'multi'
    }

    const carrierType = modeToType[formData.transport_mode_id as keyof typeof modeToType]
    if (!carrierType) return carriers

    return carriers.filter(carrier => 
      carrier.type === carrierType || carrier.type === 'multi'
    )
  }

  const operationLabels = {
    single: 'Tracking Singolo',
    batch: 'Tracking Multiplo', 
    excel: 'Import Excel',
    manual: 'Inserimento Manuale'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel')) {
      setExcelFile(file)
    } else {
      alert('Seleziona un file Excel (.xlsx o .xls)')
    }
  }

  const handleExcelImport = async () => {
    if (!excelFile) return
    
    const formDataExcel = new FormData()
    formDataExcel.append('file', excelFile)
    
    try {
      const response = await fetch('/api/excel/import', {
        method: 'POST',
        body: formDataExcel
      })
      
      const result = await response.json()
      if (result.success) {
        onBatchAdd(result.data)
        setExcelFile(null)
        const fileInput = document.getElementById('excel-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        // ✅ FIX: Chiama onCancel se disponibile
        if (onCancel) {
          onCancel()
        }
      }
    } catch (err) {
      console.error('Errore import Excel:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      switch (operation) {
        case 'single':
          if (!formData.tracking_number) return
          const result = await trackSingle(formData.tracking_number, forceNew)
          if (result.found && result.data) {
            const enrichedData = {
              ...result.data,
              reference_number: formData.reference_number,
              transport_mode_id: formData.transport_mode_id,
              vehicle_type_id: formData.vehicle_type_id,
              transport_company: formData.transport_company,
              total_weight_kg: formData.total_weight_kg ? parseFloat(formData.total_weight_kg) : null,
              total_volume_cbm: formData.total_volume_cbm ? parseFloat(formData.total_volume_cbm) : null,
              bl_number: formData.bl_number,
              flight_number: formData.flight_number,
              is_api_tracked: true
            }
            await onAdd(enrichedData)
            
            // ✅ FIX: Chiama onCancel se disponibile
            if (onCancel) {
              onCancel()
            }
          }
          break

        case 'batch':
          if (!formData.tracking_numbers) return
          const trackingNumbers = formData.tracking_numbers
            .split('\n')
            .map(num => num.trim())
            .filter(num => num.length > 0)
          
          if (trackingNumbers.length === 0) return
          
          const batchResult = await trackBatch(trackingNumbers, forceNew)
          if (batchResult.data.length > 0) {
            const enrichedBatch = batchResult.data.map(item => ({
              ...item,
              is_api_tracked: true
            }))
            await onBatchAdd(enrichedBatch)
            
            // ✅ FIX: Chiama onCancel se disponibile
            if (onCancel) {
              onCancel()
            }
          }
          break

        case 'excel':
          await handleExcelImport()
          break

        case 'manual':
          if (!formData.tracking_number) return
          
          const manualData = {
            id: Date.now().toString(),
            tracking_number: formData.tracking_number,
            carrier_name: formData.carrier_name,
            origin_port: formData.origin_port,
            destination_port: formData.destination_port,
            eta: parseDateFromItalian(formData.eta),
            status: formData.status,
            reference_number: formData.reference_number,
            transport_mode_id: formData.transport_mode_id,
            vehicle_type_id: formData.vehicle_type_id,
            transport_company: formData.transport_company,
            total_weight_kg: formData.total_weight_kg ? parseFloat(formData.total_weight_kg) : null,
            total_volume_cbm: formData.total_volume_cbm ? parseFloat(formData.total_volume_cbm) : null,
            bl_number: formData.bl_number,
            flight_number: formData.flight_number,
            is_api_tracked: false,
            tracking_type: null
          }
          
          await onAdd(manualData)
          
          // ✅ FIX: Chiama onCancel se disponibile
          if (onCancel) {
            onCancel()
          }
          break
      }
      
      // Reset form
      setFormData({
        tracking_number: '',
        tracking_numbers: '',
        carrier_name: '',
        origin_port: '',
        destination_port: '',
        eta: '',
        tracking_type: 'container',
        status: 'SAILING',
        reference_number: '',
        transport_mode_id: '',
        vehicle_type_id: '',
        transport_company: '',
        total_weight_kg: '',
        total_volume_cbm: '',
        bl_number: '',
        flight_number: ''
      })
      setShowDetails(false)
      setVehicleTypes([])
      setDetectedType(null)
    } catch (err) {
      console.error('Errore nel tracking:', err)
      alert('Errore nel tracking: ' + (err instanceof Error ? err.message : 'Errore sconosciuto'))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'tracking_number') {
      handleTrackingNumberChange(value.toUpperCase())
      return
    }
    
    if (name === 'transport_mode_id') {
      setFormData(prev => ({ ...prev, [name]: value, vehicle_type_id: '' }))
      loadVehicleTypes(value)
      return
    }
    
    if (name === 'vehicle_type_id') {
      handleVehicleTypeChange(value)
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getButtonText = () => {
    switch (operation) {
      case 'single':
        return 'Track Live Singolo'
      case 'batch':
        return 'Track Live Multiplo'
      case 'excel':
        return 'Importa da Excel'
      case 'manual':
        return 'Inserisci Manuale'
      default:
        return 'Track'
    }
  }

  const getDetectionMessage = () => {
    if (!detectedType) return null
    
    if (operation === 'manual') {
      const modeMap: Record<string, string> = {
        'air_manual': '✈️ Suggerito: Modalità Aereo',
        'road_manual': '🚛 Suggerito: Modalità Stradale', 
        'sea_manual': '🚢 Suggerito: Modalità Marittima'
      }
      return modeMap[detectedType] || '🚢 Suggerito: Modalità Marittima'
    } else {
      const typeMap: Record<string, string> = {
        'awb': '✈️ Rilevato: Aereo (AWB) - API ShipsGO',
        'parcel': '📦 Rilevato: Pacco/Corriere - API ShipsGO',
        'container': '🚢 Rilevato: Container/Mare - API ShipsGO'
      }
      return typeMap[detectedType] || '🚢 Rilevato: Container/Mare - API ShipsGO'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Gestione Tracking</h2>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Crediti usati: <span className="font-bold text-red-600">{creditsUsed}</span>
            </div>
            {creditsUsed > 0 && (
              <button
                onClick={resetCredits}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Reset contatore
              </button>
            )}
          </div>
          
          {/* ✅ FIX: Pulsante Cancel se onCancel è disponibile */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Annulla
            </button>
          )}
        </div>
      </div>

      {/* Selector tipo operazione */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo Operazione
        </label>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {Object.entries(operationLabels).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setOperation(key as any)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                operation === key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Spiegazione modalità Manual */}
      {operation === 'manual' && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-orange-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p className="text-sm text-orange-700 font-medium">Modalità Inserimento Manuale</p>
              <p className="text-xs text-orange-600 mt-1">
                Per spedizioni senza API di tracking o non ancora supportate da ShipsGO. 
                I dati dovranno essere aggiornati manualmente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Force New Toggle - NON per manual e excel */}
      {operation !== 'manual' && operation !== 'excel' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <p className="text-sm text-yellow-700">
                Controlla prima dati esistenti (gratis) poi cerca nuovi (a pagamento)
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-yellow-700">Forza nuovo</span>
              <button
                type="button"
                onClick={() => setForceNew(!forceNew)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  forceNew ? 'bg-red-600' : 'bg-green-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    forceNew ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Message */}
      {operation !== 'manual' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-sm text-blue-700">
              Live Tracking: i dati verranno recuperati automaticamente da ShipsGO
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo tracking singolo */}
        {operation === 'single' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numero Tracking *
            </label>
            <input
              type="text"
              name="tracking_number"
              value={formData.tracking_number}
              onChange={(e) => handleTrackingNumberChange(e.target.value)}
              className={inputClassName}
              placeholder="es. MEDU7905689, 125-12345678 (AWB), 1Z999AA1234567890 (UPS)"
              required
            />
            {detectedType && (
              <div className="flex items-center mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <svg className="h-4 w-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="text-xs text-green-700 font-medium">
                  {getDetectionMessage()}
                </span>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Inserisci solo il numero tracking, gli altri dati verranno recuperati automaticamente
            </p>
          </div>
        )}

        {/* Campo tracking multiplo */}
        {operation === 'batch' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numeri Tracking (uno per riga) *
            </label>
            <textarea
              name="tracking_numbers"
              value={formData.tracking_numbers}
              onChange={(e) => setFormData(prev => ({ ...prev, tracking_numbers: e.target.value }))}
              rows={6}
              className={textareaClassName}
              placeholder={`MEDU7905689
MRKU2556409
125-12345678
1Z999AA1234567890
...`}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Massimo 50 tracking per volta. Supporta Container, AWB, Parcel. Dati recuperati automaticamente da ShipsGO.
            </p>
          </div>
        )}

        {/* Campo import Excel */}
        {operation === 'excel' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Excel *
            </label>
            <input
              id="excel-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className={`${inputClassName} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
              required
            />
            {excelFile && (
              <p className="mt-1 text-sm text-green-600">
                ✅ File selezionato: {excelFile.name}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Colonne Excel: tracking_number (obbligatorio), carrier_name, origin_port, destination_port, reference_number
            </p>
          </div>
        )}

        {/* Campo tracking manuale */}
        {operation === 'manual' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numero Identificativo *
            </label>
            <input
              type="text"
              name="tracking_number"
              value={formData.tracking_number}
              onChange={handleChange}
              className={inputClassName}
              placeholder="es. REF-2024-001, AWB-123456, ORDINE-789"
              required
            />
            {detectedType && (
              <div className="flex items-center mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <svg className="h-4 w-4 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="text-xs text-blue-700 font-medium">
                  {getDetectionMessage()}
                </span>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Inserisci un codice univoco per identificare questa spedizione (non sarà tracciato via API)
            </p>
          </div>
        )}

        {/* Toggle Details - Solo per singolo */}
        {operation === 'single' && (
          <div>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
            >
              <span className="mr-1">
                {showDetails ? '▼' : '▶'}
              </span>
              Dettagli Opzionali
            </button>
          </div>
        )}

        {/* Campi manuali */}
        {(operation === 'manual' || showDetails) && (
          <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
            
            {/* Modalità di Trasporto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🚚 Modalità di Trasporto *
              </label>
              <select
                name="transport_mode_id"
                value={formData.transport_mode_id}
                onChange={handleChange}
                className={selectClassName}
                required={operation === 'manual'}
              >
                <option value="">Seleziona modalità...</option>
                {transportModes.map(mode => (
                  <option key={mode.id} value={mode.id}>
                    {mode.icon} {mode.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Spedizioniere */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏢 Spedizioniere
              </label>
              {getFilteredCarriers().length > 0 ? (
                <select
                  name="carrier_name"
                  value={formData.carrier_name}
                  onChange={handleChange}
                  className={selectClassName}
                >
                  <option value="">Seleziona spedizioniere...</option>
                  {getFilteredCarriers().map(carrier => (
                    <option key={carrier.id} value={carrier.name}>
                      {carrier.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="carrier_name"
                  value={formData.carrier_name}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="es. MSC, MAERSK, DHL, FedEx"
                />
              )}
            </div>

            {/* Altri campi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏁 Porto/Hub Origine
                </label>
                <input
                  type="text"
                  name="origin_port"
                  value={formData.origin_port}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="es. SHANGHAI, MXP (Milano), Frankfurt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏁 Porto/Hub Destinazione
                </label>
                <input
                  type="text"
                  name="destination_port"
                  value={formData.destination_port}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="es. CIVITAVECCHIA, LIN (Milano), Roma"
                />
              </div>
            </div>

            {/* ETA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 ETA (Estimated Time of Arrival)
              </label>
              <input
                type="datetime-local"
                name="eta"
                value={formData.eta}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Status Corrente
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={selectClassName}
              >
                <option value="SAILING">🚢 In Navigazione</option>
                <option value="IN_TRANSIT">🚛 In Transito</option>
                <option value="ARRIVED">📍 Arrivato</option>
                <option value="DELIVERED">✅ Consegnato</option>
                <option value="EXCEPTION">⚠️ Eccezione</option>
                <option value="PENDING">⏳ In Attesa</option>
                <option value="LOADING">📦 In Carico</option>
                <option value="CUSTOMS">🛃 In Dogana</option>
              </select>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${
            loading
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Tracking in corso...
            </div>
          ) : (
            getButtonText()
          )}
        </button>
      </form>

      {/* Live Preview */}
      {(formData.tracking_number || detectedType) && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-gray-900 mb-2">🔍 Anteprima Live</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Numero:</strong> {formData.tracking_number || 'Sarà generato automaticamente'}</p>
            {detectedType && (
              <p><strong>Rilevamento:</strong> {getDetectionMessage()}</p>
            )}
            {formData.reference_number && (
              <p><strong>Riferimento:</strong> {formData.reference_number}</p>
            )}
            {formData.transport_mode_id && (
              <p><strong>Modalità:</strong> {transportModes.find(m => m.id === formData.transport_mode_id)?.name}</p>
            )}
            
            <div className="mt-2 pt-2 border-t border-blue-200">
              {operation === 'manual' ? (
                <p className="text-orange-600 font-medium">📝 Inserimento manuale - Non tracciato via API</p>
              ) : (
                <p className="text-green-600 font-medium">🔴 Live tracking - Tracciato via ShipsGO API</p>
              )}
            </div>
            
            <p className="text-green-600 mt-2 font-medium">✅ Pronto per l'invio</p>
          </div>
        </div>
      )}
    </div>
  )
}