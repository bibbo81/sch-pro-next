import { supabase } from './supabase'
import { ShipmentService } from './shipmentService'

export interface Tracking {
  id: string
  user_id: string
  tracking_number: string
  tracking_type?: string
  carrier_code?: string
  carrier_name?: string
  carrier_id?: string
  reference_number?: string
  status?: string
  current_status?: string
  origin_port?: string
  origin_country?: string
  origin?: string
  destination_port?: string
  destination_country?: string
  destination?: string
  transport_mode_id?: string
  vehicle_type_id?: string
  transport_company?: string
  vessel_name?: string
  vessel_imo?: string
  voyage_number?: string
  flight_number?: string
  container_size?: string
  container_type?: string
  container_count?: number
  booking_number?: string
  bl_number?: string
  total_weight_kg?: number
  total_volume_cbm?: number
  eta?: string
  ata?: string
  estimated_delivery?: string
  actual_delivery?: string
  shipped_date?: string
  metadata?: any
  created_at: string
  updated_at: string
  deleted_at?: string
  created_by?: string
}

export class TrackingService {
  static async create(trackingData: any, userId?: string) {
    console.log('🔍 TrackingService.create chiamato con:', trackingData)
    
    try {
      // ✅ Mappiamo solo i campi che esistono nella tabella
      const validData: any = {}
      
      // Campi obbligatori
      if (userId) validData.user_id = userId
      if (trackingData.user_id) validData.user_id = trackingData.user_id
      if (trackingData.tracking_number) validData.tracking_number = trackingData.tracking_number
      
      // Campi opzionali che esistono nella tabella
      if (trackingData.tracking_type) validData.tracking_type = trackingData.tracking_type
      if (trackingData.carrier_code) validData.carrier_code = trackingData.carrier_code
      if (trackingData.carrier_name) validData.carrier_name = trackingData.carrier_name
      
      // ⚠️ CARRIER_ID: Solo se è un UUID valido
      if (trackingData.carrier_id && this.isValidUUID(trackingData.carrier_id)) {
        validData.carrier_id = trackingData.carrier_id
      }
      
      if (trackingData.reference_number) validData.reference_number = trackingData.reference_number
      if (trackingData.status) validData.status = trackingData.status
      if (trackingData.current_status) validData.current_status = trackingData.current_status
      if (trackingData.origin_port) validData.origin_port = trackingData.origin_port
      if (trackingData.origin_country) validData.origin_country = trackingData.origin_country
      if (trackingData.origin) validData.origin = trackingData.origin
      if (trackingData.destination_port) validData.destination_port = trackingData.destination_port
      if (trackingData.destination_country) validData.destination_country = trackingData.destination_country
      if (trackingData.destination) validData.destination = trackingData.destination
      
      // ⚠️ TRANSPORT_MODE_ID: Solo se è un UUID valido, altrimenti NULL
      if (trackingData.transport_mode_id && this.isValidUUID(trackingData.transport_mode_id)) {
        validData.transport_mode_id = trackingData.transport_mode_id
        console.log('✅ transport_mode_id UUID valido:', trackingData.transport_mode_id)
      } else if (trackingData.transport_mode_id) {
        console.log('❌ transport_mode_id non è un UUID valido:', trackingData.transport_mode_id, '- verrà ignorato')
      }
      
      // ⚠️ VEHICLE_TYPE_ID: Solo se è un UUID valido, altrimenti NULL
      if (trackingData.vehicle_type_id && this.isValidUUID(trackingData.vehicle_type_id)) {
        validData.vehicle_type_id = trackingData.vehicle_type_id
        console.log('✅ vehicle_type_id UUID valido:', trackingData.vehicle_type_id)
      } else if (trackingData.vehicle_type_id) {
        console.log('❌ vehicle_type_id non è un UUID valido:', trackingData.vehicle_type_id, '- verrà ignorato')
      }
      
      if (trackingData.transport_company) validData.transport_company = trackingData.transport_company
      if (trackingData.vessel_name) validData.vessel_name = trackingData.vessel_name
      if (trackingData.vessel_imo) validData.vessel_imo = trackingData.vessel_imo
      if (trackingData.voyage_number) validData.voyage_number = trackingData.voyage_number
      if (trackingData.flight_number) validData.flight_number = trackingData.flight_number
      if (trackingData.container_size) validData.container_size = trackingData.container_size
      if (trackingData.container_type) validData.container_type = trackingData.container_type
      if (trackingData.container_count) validData.container_count = trackingData.container_count
      if (trackingData.booking_number) validData.booking_number = trackingData.booking_number
      if (trackingData.bl_number) validData.bl_number = trackingData.bl_number
      if (trackingData.total_weight_kg) validData.total_weight_kg = trackingData.total_weight_kg
      if (trackingData.total_volume_cbm) validData.total_volume_cbm = trackingData.total_volume_cbm
      
      // Date fields
      if (trackingData.eta) validData.eta = trackingData.eta
      if (trackingData.ata) validData.ata = trackingData.ata
      if (trackingData.estimated_delivery) validData.estimated_delivery = trackingData.estimated_delivery
      if (trackingData.actual_delivery) validData.actual_delivery = trackingData.actual_delivery
      if (trackingData.shipped_date) validData.shipped_date = trackingData.shipped_date
      
      // Metadata per informazioni extra (come is_manual)
      const metadata: any = trackingData.metadata || {}
      if (trackingData.is_manual !== undefined) {
        metadata.is_manual = trackingData.is_manual
      }
      if (trackingData.is_api_tracked !== undefined) {
        metadata.is_api_tracked = trackingData.is_api_tracked
      }
      validData.metadata = metadata
      
      // Timestamps (il database li gestisce automaticamente, ma possiamo sovrascriverli se necessario)
      if (trackingData.created_at) validData.created_at = trackingData.created_at
      if (trackingData.updated_at) validData.updated_at = trackingData.updated_at
      if (trackingData.created_by) validData.created_by = trackingData.created_by
      
      console.log('🔍 Dati validati per inserimento:', JSON.stringify(validData, null, 2))
      
      // ✅ CORRETTA - solo colonne che esistono
      const { data, error } = await supabase
        .from('trackings')
        .insert(validData)
        .select(`
          *,
          carriers (
            id,
            name
          ),
          transport_modes (
            id,
            name
          ),
          vehicle_types (
            id,
            name,
            transport_mode_id
          )
        `)
        .single()
      
      console.log('🔍 create response - data:', !!data)
      console.log('🔍 create response - error:', error)
      console.log('🔍 create response - data completa:', data)
      
      if (error) {
        console.error('❌ Error creating tracking:', error)
        throw error
      }

      // 🚀 NUOVO: Crea automaticamente shipment dal tracking
      try {
        await this.createShipmentFromTracking(data, validData.user_id)
      } catch (shipmentError) {
        console.warn('⚠️ Errore creazione shipment automatico (non bloccante):', shipmentError)
        // Non bloccare il tracking se la creazione shipment fallisce
      }
      
      return data
    } catch (error) {
      console.error('❌ TrackingService.create catch:', error)
      throw error
    }
  }

  // 🚀 NUOVA FUNZIONE: Crea shipment da tracking
  static async createShipmentFromTracking(tracking: any, userId: string) {
    console.log('🔍 Creazione shipment automatica da tracking:', tracking.id)
    
    try {
      // Verifica se esiste già un shipment per questo tracking
      const { data: existingShipment } = await supabase
        .from('shipments')
        .select('id')
        .eq('tracking_number', tracking.tracking_number)
        .eq('user_id', userId)
        .is('discarded_at', null)
        .single()

      if (existingShipment) {
        console.log('✅ Shipment già esistente per tracking:', tracking.tracking_number)
        return existingShipment
      }

      // 🔧 MIGLIORATO - Rileva transport mode più accuratamente
      const detectedTransportMode = this.detectTransportMode(tracking.tracking_number)
      console.log(`🚛 Transport mode rilevato: ${detectedTransportMode} per tracking: ${tracking.tracking_number}`)

      // Mappa i dati tracking → shipment
      const shipmentData = {
        user_id: userId,
        shipment_number: this.generateShipmentNumber(),
        tracking_number: tracking.tracking_number,
        status: this.mapTrackingStatusToShipment(tracking.status || tracking.current_status),
        transport_mode: detectedTransportMode, // 🔧 USA IL RILEVAMENTO MIGLIORATO
        origin: tracking.origin || tracking.origin_port,
        destination: tracking.destination || tracking.destination_port,
        carrier_name: tracking.carrier_name,
        tracking_id: tracking.id,
        vessel_name: tracking.vessel_name,
        voyage_number: tracking.voyage_number,
        booking_number: tracking.booking_number,
        bl_number: tracking.bl_number,
        container_count: tracking.container_count,
        container_size: tracking.container_size,
        container_type: tracking.container_type,
        total_weight_kg: tracking.total_weight_kg,
        total_volume_cbm: tracking.total_volume_cbm,
        eta: tracking.eta,
        ata: tracking.ata,
        estimated_delivery: tracking.estimated_delivery,
        actual_delivery: tracking.actual_delivery,
        shipped_date: tracking.shipped_date,
        auto_created: true,
        created_from: 'tracking',
        data_source: 'auto_tracking'
      }

      // Crea il shipment
      const newShipment = await ShipmentService.create(shipmentData)
      
      console.log('✅ Shipment creato automaticamente:', newShipment.id, 'con transport_mode:', detectedTransportMode)
      return newShipment
    } catch (error) {
      console.error('❌ Errore creazione shipment da tracking:', error)
      throw error
    }
  }

  // Genera numero shipment automatico
  static generateShipmentNumber(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `SH-${year}${month}${day}-${random}`
  }

  // Mappa status tracking → shipment
  static mapTrackingStatusToShipment(trackingStatus: string): string {
    if (!trackingStatus) return 'registered' // NON 'planned'
    
    const statusMap: { [key: string]: string } = {
      'pending': 'registered',        // 🔧 CORRETTO
      'registered': 'registered',     // 🔧 CORRETTO
      'in_transit': 'in_transit',     // ✅ OK
      'on_the_way': 'in_transit',     // 🔧 AGGIUNTO
      'departed': 'in_transit',       // 🔧 AGGIUNTO
      'sailing': 'in_transit',        // 🔧 AGGIUNTO
      'out_for_delivery': 'out_for_delivery', // 🔧 CORRETTO
      'delivered': 'delivered',       // ✅ OK
      'exception': 'exception',       // 🔧 CORRETTO
      'delayed': 'delayed',           // 🔧 AGGIUNTO
      'cancelled': 'cancelled',       // ✅ OK
      'planned': 'registered'         // 🔧 FALLBACK
    }
    return statusMap[trackingStatus.toLowerCase()] || 'registered'
  }

  // Rileva modalità trasporto da tracking number
       static detectTransportMode(trackingNumber: string): string {
      if (!trackingNumber) return 'road'
      
      const upperTracking = trackingNumber.toUpperCase()
      
      // Pattern più completi e specifici
      const patterns = {
        sea: [
          // Standard container format
          /^[A-Z]{4}[0-9]{7}$/i,
          // Specific container line prefixes (major shipping lines)
          /^(MSKU|CMAU|COSU|HJMU|ZIMU|GESU|TGHU|MSCU|CASU|BEAU|OOLU|TCLU|NYKU|FCIU|PONU|YMLU|ONEY|WHLU|SEGU|DRYU|TRLU|GLDU|APLU|SUDU)/i,
          // B/L and booking numbers
          /^(BL|BILL|BKG|BOOK)/i,
          // Alternative container formats
          /^[A-Z]{3}[0-9]{8}$/i,
          // Vessel-related
          /^V[0-9]/i,
          // Maritime booking
          /^MB[0-9]/i
        ],
        air: [
          // Standard AWB format
          /^[0-9]{3}-[0-9]{8}$/i,
          // AWB prefix
          /^AWB/i,
          // Specific airline prefixes (major airlines)
          /^(074|020|016|006|172|176|229|014|057|160|724|721|618|999|078|125|180|126|147|302|448|924)/i,
          // Flight numbers
          /^[A-Z]{2}[0-9]{1,4}$/i,
          // Air cargo
          /^AC[0-9]/i
        ],
        courier: [
          // UPS
          /^(UPS|1Z)/i,
          // FedEx
          /^(FEDX|FX)/i,
          // DHL
          /^DHL/i,
          // TNT
          /^TNT/i,
          // Other couriers
          /^(ARAMEX|DPEX)/i
        ],
        rail: [
          /^(RAIL|TRAIN|RW)/i,
          // China Railway
          /^CN[0-9]/i,
          // European rail
          /^EU[0-9]/i,
          // Rail specific
          /^TR[0-9]/i
        ],
        road: [
          /^(TRUCK|TRK|ROAD)/i,
          // Truck specific
          /^TR[0-9]/i,
          // Road transport
          /^RT[0-9]/i
        ]
      }
      
      // Verifica ogni modalità nell'ordine di specificità
      for (const [mode, patternList] of Object.entries(patterns)) {
        for (const pattern of patternList) {
          if (pattern.test(upperTracking)) {
            console.log(`🔍 Transport mode detected: ${mode} for tracking: ${trackingNumber}`)
            return mode === 'courier' ? 'air' : mode // Courier viene mappato su air
          }
        }
      }
      
      // Fallback logic basato su lunghezza e formato
      if (upperTracking.length === 11 && /^[A-Z]{4}[0-9]{7}$/.test(upperTracking)) {
        console.log(`🔍 Container format detected: sea for tracking: ${trackingNumber}`)
        return 'sea'
      }
      
      if (upperTracking.includes('-') && /^[0-9]{3}-[0-9]{8}$/.test(upperTracking)) {
        console.log(`🔍 AWB format detected: air for tracking: ${trackingNumber}`)
        return 'air'
      }
      
      // Analisi euristica basata su caratteristiche
      if (upperTracking.length > 10 && /[A-Z]{4,}/.test(upperTracking)) {
        console.log(`🔍 Long alphanumeric detected: sea for tracking: ${trackingNumber}`)
        return 'sea'
      }
      
      if (upperTracking.length < 8 && /^[A-Z]{2}[0-9]/.test(upperTracking)) {
        console.log(`🔍 Short airline format detected: air for tracking: ${trackingNumber}`)
        return 'air'
      }
      
      console.log(`🔍 Transport mode fallback: road for tracking: ${trackingNumber}`)
      return 'road'
    }
  
  // ✅ HELPER: Valida se una stringa è un UUID valido
  static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  // Verifica se esiste un tracking per numero e utente
  static async exists(trackingNumber: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('trackings')
        .select('id')
        .eq('tracking_number', trackingNumber)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single()

      return !error && !!data
    } catch {
      return false
    }
  }

  // Ottiene tracking per numero
  static async getByTrackingNumber(trackingNumber: string, userId: string): Promise<Tracking | null> {
    try {
      const { data, error } = await supabase
        .from('trackings')
        .select(`
          *,
          carriers (
            id,
            name
          ),
          transport_modes (
            id,
            name
          ),
          vehicle_types (
            id,
            name,
            transport_mode_id
          )
        `)
        .eq('tracking_number', trackingNumber)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single()

      return error ? null : data
    } catch {
      return null
    }
  }

  // Crea multipli trackings
  static async createMany(trackingsData: any[]): Promise<Tracking[]> {
    console.log('🔍 TrackingService.createMany chiamato con:', trackingsData.length, 'trackings')
    
    const results = []
    
    for (const trackingData of trackingsData) {
      try {
        const tracking = await this.create(trackingData)
        results.push(tracking)
      } catch (error) {
        console.error('❌ Errore creazione tracking:', trackingData.tracking_number, error)
        // Continua con gli altri anche se uno fallisce
      }
    }
    
    return results
  }

  // Ottiene statistiche
  static async getStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('trackings')
        .select('status, created_at')
        .eq('user_id', userId)
        .is('deleted_at', null)

      if (error) throw error

      const total = data.length
      const byStatus = data.reduce((acc: any, tracking) => {
        const status = tracking.status || 'unknown'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})

      const thisMonth = data.filter(t => {
        const created = new Date(t.created_at)
        const now = new Date()
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      }).length

      return {
        total,
        byStatus,
        thisMonth
      }
    } catch (error) {
      console.error('❌ TrackingService.getStats error:', error)
      return { total: 0, byStatus: {}, thisMonth: 0 }
    }
  }

  static async getAll(userId: string) {
    console.log('🔍 TrackingService.getAll chiamato per userId:', userId)
    
    try {
      // ✅ CORRETTA - solo colonne che esistono
      const { data, error } = await supabase
        .from('trackings')
        .select(`
          *,
          carriers (
            id,
            name
          ),
          transport_modes (
            id,
            name
          ),
          vehicle_types (
            id,
            name,
            transport_mode_id
          )
        `)
        .eq('user_id', userId)
        .is('deleted_at', null) // Escludiamo i record eliminati logicamente
        .order('created_at', { ascending: false })
      
      console.log('🔍 getAll response - data count:', data?.length || 0)
      console.log('🔍 getAll response - error:', error)
      
      // 🔍 Debug: mostra i primi tracking se ci sono
      if (data && data.length > 0) {
        console.log('🔍 Primo tracking:', JSON.stringify(data[0], null, 2))
        console.log('🔍 deleted_at values:', data.slice(0, 3).map(t => ({ 
          id: t.id.substring(0, 8), 
          deleted_at: t.deleted_at,
          tracking_number: t.tracking_number 
        })))
      }
      
      if (error) {
        console.error('❌ Error fetching trackings:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('❌ TrackingService.getAll catch:', error)
      throw error
    }
  }
  
  static async delete(id: string) {
    console.log('🔍 TrackingService.delete chiamato per ID:', id)
    
    try {
      // Soft delete: impostiamo deleted_at invece di eliminare fisicamente
      const { data, error } = await supabase
        .from('trackings')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      console.log('🔍 delete response - data:', !!data)
      console.log('🔍 delete response - error:', error)
      
      if (error) {
        console.error('❌ Error deleting tracking:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('❌ TrackingService.delete catch:', error)
      throw error
    }
  }

  
    static async update(id: string, updateData: any) {
      console.log('🔍 TrackingService.update chiamato per ID:', id, 'con dati:', updateData)
      
      try {
        // 🔧 VALIDAZIONE COMPLETA per l'update
        const validData: any = {}
        
        // Campi base aggiornabili
        if (updateData.tracking_number) validData.tracking_number = updateData.tracking_number
        if (updateData.tracking_type) validData.tracking_type = updateData.tracking_type
        if (updateData.carrier_code) validData.carrier_code = updateData.carrier_code
        if (updateData.carrier_name) validData.carrier_name = updateData.carrier_name
        
        // UUID fields con validazione
        if (updateData.carrier_id && this.isValidUUID(updateData.carrier_id)) {
          validData.carrier_id = updateData.carrier_id
        }
        if (updateData.transport_mode_id && this.isValidUUID(updateData.transport_mode_id)) {
          validData.transport_mode_id = updateData.transport_mode_id
        }
        if (updateData.vehicle_type_id && this.isValidUUID(updateData.vehicle_type_id)) {
          validData.vehicle_type_id = updateData.vehicle_type_id
        }
        
        // Status e reference
        if (updateData.reference_number !== undefined) validData.reference_number = updateData.reference_number
        if (updateData.status) validData.status = updateData.status
        if (updateData.current_status) validData.current_status = updateData.current_status
        
        // 🔧 AGGIUNTI - Campi location mancanti
        if (updateData.origin_port !== undefined) validData.origin_port = updateData.origin_port
        if (updateData.origin_country !== undefined) validData.origin_country = updateData.origin_country
        if (updateData.origin !== undefined) validData.origin = updateData.origin
        if (updateData.destination_port !== undefined) validData.destination_port = updateData.destination_port
        if (updateData.destination_country !== undefined) validData.destination_country = updateData.destination_country
        if (updateData.destination !== undefined) validData.destination = updateData.destination
        
        // 🔧 AGGIUNTI - Campi transport mancanti
        if (updateData.transport_company !== undefined) validData.transport_company = updateData.transport_company
        if (updateData.vessel_name !== undefined) validData.vessel_name = updateData.vessel_name
        if (updateData.vessel_imo !== undefined) validData.vessel_imo = updateData.vessel_imo
        if (updateData.voyage_number !== undefined) validData.voyage_number = updateData.voyage_number
        if (updateData.flight_number !== undefined) validData.flight_number = updateData.flight_number
        
        // 🔧 AGGIUNTI - Campi container mancanti
        if (updateData.container_size !== undefined) validData.container_size = updateData.container_size
        if (updateData.container_type !== undefined) validData.container_type = updateData.container_type
        if (updateData.container_count !== undefined) validData.container_count = updateData.container_count
        if (updateData.booking_number !== undefined) validData.booking_number = updateData.booking_number
        if (updateData.bl_number !== undefined) validData.bl_number = updateData.bl_number
        
        // 🔧 AGGIUNTI - Campi weight/volume mancanti
        if (updateData.total_weight_kg !== undefined) validData.total_weight_kg = updateData.total_weight_kg
        if (updateData.total_volume_cbm !== undefined) validData.total_volume_cbm = updateData.total_volume_cbm
        
        // 🔧 AGGIUNTI - Campi date mancanti
        if (updateData.eta !== undefined) validData.eta = updateData.eta
        if (updateData.ata !== undefined) validData.ata = updateData.ata
        if (updateData.estimated_delivery !== undefined) validData.estimated_delivery = updateData.estimated_delivery
        if (updateData.actual_delivery !== undefined) validData.actual_delivery = updateData.actual_delivery
        if (updateData.shipped_date !== undefined) validData.shipped_date = updateData.shipped_date
        
        // 🔧 AGGIUNGI - Metadata update
        if (updateData.metadata !== undefined) {
          validData.metadata = updateData.metadata
        } else {
          // Preserva metadata esistenti e aggiorna solo campi specifici
          const existingTracking = await this.getById(id)
          const existingMetadata = existingTracking?.metadata || {}
          
          if (updateData.is_manual !== undefined) {
            existingMetadata.is_manual = updateData.is_manual
          }
          if (updateData.is_api_tracked !== undefined) {
            existingMetadata.is_api_tracked = updateData.is_api_tracked
          }
          
          validData.metadata = existingMetadata
        }
        
        // Sempre aggiorna timestamp
        validData.updated_at = new Date().toISOString()
        
        console.log('🔍 Dati validati per update:', JSON.stringify(validData, null, 2))
        
        // ✅ Query update corretta
        const { data, error } = await supabase
          .from('trackings')
          .update(validData)
          .eq('id', id)
          .select(`
            *,
            carriers (
              id,
              name
            ),
            transport_modes (
              id,
              name
            ),
            vehicle_types (
              id,
              name,
              transport_mode_id
            )
          `)
          .single()
        
        console.log('🔍 update response - data:', !!data)
        console.log('🔍 update response - error:', error)
        
        if (error) {
          console.error('❌ Error updating tracking:', error)
          throw error
        }
        
        return data
      } catch (error) {
        console.error('❌ TrackingService.update catch:', error)
        throw error
      }
    }
    // 🔧 AGGIUNGI QUESTO METODO SE MANCANTE
  static async getById(id: string) {
    console.log('🔍 TrackingService.getById chiamato per ID:', id)

    try {
      const { data, error } = await supabase
        .from('trackings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Errore get tracking by ID:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('❌ TrackingService.getById error:', error)
      throw error
    }
  }
}