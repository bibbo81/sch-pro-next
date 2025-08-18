import { supabase } from './supabase'

export class ShipmentService {
  static async create(shipmentData: any) {
    console.log('🔍 ShipmentService.create chiamato con:', shipmentData)
    
    try {
      // ✅ Mappiamo solo i campi che esistono nella tabella
      const validData: any = {}
      
      // Campi obbligatori
      if (shipmentData.user_id) validData.user_id = shipmentData.user_id
      if (shipmentData.shipment_number) validData.shipment_number = shipmentData.shipment_number
      
      // Campi della parte commerciale
      if (shipmentData.supplier_name) validData.supplier_name = shipmentData.supplier_name
      if (shipmentData.supplier_country) validData.supplier_country = shipmentData.supplier_country
      if (shipmentData.incoterm) validData.incoterm = shipmentData.incoterm
      if (shipmentData.total_value) validData.total_value = shipmentData.total_value
      if (shipmentData.currency) validData.currency = shipmentData.currency
      if (shipmentData.freight_cost) validData.freight_cost = shipmentData.freight_cost
      if (shipmentData.other_costs) validData.other_costs = shipmentData.other_costs
      if (shipmentData.total_cost) validData.total_cost = shipmentData.total_cost
      
      // Campi logistici
      if (shipmentData.transport_mode) validData.transport_mode = shipmentData.transport_mode
      if (shipmentData.departure_date) validData.departure_date = shipmentData.departure_date
      if (shipmentData.arrival_date) validData.arrival_date = shipmentData.arrival_date
      if (shipmentData.total_weight_kg) validData.total_weight_kg = shipmentData.total_weight_kg
      if (shipmentData.total_volume_cbm) validData.total_volume_cbm = shipmentData.total_volume_cbm
      if (shipmentData.container_count) validData.container_count = shipmentData.container_count
      if (shipmentData.container_size) validData.container_size = shipmentData.container_size
      if (shipmentData.container_type) validData.container_type = shipmentData.container_type
      
      // Carrier info
      if (shipmentData.carrier_code) validData.carrier_code = shipmentData.carrier_code
      if (shipmentData.carrier_name) validData.carrier_name = shipmentData.carrier_name
      if (shipmentData.carrier_service) validData.carrier_service = shipmentData.carrier_service
      if (shipmentData.transport_company) validData.transport_company = shipmentData.transport_company
      
      // ⚠️ UUID fields: Solo se validi
      if (shipmentData.carrier_id && this.isValidUUID(shipmentData.carrier_id)) {
        validData.carrier_id = shipmentData.carrier_id
      }
      if (shipmentData.transport_mode_id && this.isValidUUID(shipmentData.transport_mode_id)) {
        validData.transport_mode_id = shipmentData.transport_mode_id
      }
      if (shipmentData.vehicle_type_id && this.isValidUUID(shipmentData.vehicle_type_id)) {
        validData.vehicle_type_id = shipmentData.vehicle_type_id
      }
      if (shipmentData.tracking_id && this.isValidUUID(shipmentData.tracking_id)) {
        validData.tracking_id = shipmentData.tracking_id
      }
      
      // Location info
      if (shipmentData.origin) validData.origin = shipmentData.origin
      if (shipmentData.origin_port) validData.origin_port = shipmentData.origin_port
      if (shipmentData.origin_country) validData.origin_country = shipmentData.origin_country
      if (shipmentData.destination) validData.destination = shipmentData.destination
      if (shipmentData.destination_port) validData.destination_port = shipmentData.destination_port
      if (shipmentData.destination_country) validData.destination_country = shipmentData.destination_country
      
      // Reference numbers
      if (shipmentData.tracking_number) validData.tracking_number = shipmentData.tracking_number
      if (shipmentData.reference_number) validData.reference_number = shipmentData.reference_number
      if (shipmentData.booking_number) validData.booking_number = shipmentData.booking_number
      if (shipmentData.bl_number) validData.bl_number = shipmentData.bl_number
      if (shipmentData.booking) validData.booking = shipmentData.booking
      
      // Status and type
      if (shipmentData.status) validData.status = shipmentData.status
      if (shipmentData.current_status) validData.current_status = shipmentData.current_status
      if (shipmentData.type) validData.type = shipmentData.type
      if (shipmentData.tracking_type) validData.tracking_type = shipmentData.tracking_type
      
      // Vessel/Flight info
      if (shipmentData.vessel_name) validData.vessel_name = shipmentData.vessel_name
      if (shipmentData.vessel_imo) validData.vessel_imo = shipmentData.vessel_imo
      if (shipmentData.voyage_number) validData.voyage_number = shipmentData.voyage_number
      
      // Date fields
      if (shipmentData.eta) validData.eta = shipmentData.eta
      if (shipmentData.ata) validData.ata = shipmentData.ata
      if (shipmentData.etd) validData.etd = shipmentData.etd
      if (shipmentData.shipped_date) validData.shipped_date = shipmentData.shipped_date
      if (shipmentData.estimated_delivery) validData.estimated_delivery = shipmentData.estimated_delivery
      if (shipmentData.actual_delivery) validData.actual_delivery = shipmentData.actual_delivery
      if (shipmentData.date_of_loading) validData.date_of_loading = shipmentData.date_of_loading
      if (shipmentData.date_of_departure) validData.date_of_departure = shipmentData.date_of_departure
      if (shipmentData.date_of_discharge) validData.date_of_discharge = shipmentData.date_of_discharge
      if (shipmentData.date_of_arrival) validData.date_of_arrival = shipmentData.date_of_arrival
      
      // JSON fields
      if (shipmentData.documents) validData.documents = shipmentData.documents
      if (shipmentData.commercial) validData.commercial = shipmentData.commercial
      if (shipmentData.route) validData.route = shipmentData.route
      if (shipmentData.schedule) validData.schedule = shipmentData.schedule
      if (shipmentData.products) validData.products = shipmentData.products
      if (shipmentData.costs) validData.costs = shipmentData.costs
      if (shipmentData.metadata) validData.metadata = shipmentData.metadata
      
      // Other fields
      if (shipmentData.co2_emission) validData.co2_emission = shipmentData.co2_emission
      if (shipmentData.transit_time) validData.transit_time = shipmentData.transit_time
      if (shipmentData.pieces) validData.pieces = shipmentData.pieces
      if (shipmentData.weight) validData.weight = shipmentData.weight
      if (shipmentData.volume) validData.volume = shipmentData.volume
      if (shipmentData.commodity) validData.commodity = shipmentData.commodity
      if (shipmentData.container_number) validData.container_number = shipmentData.container_number
      
      // Auto-generated fields
      if (shipmentData.auto_created !== undefined) validData.auto_created = shipmentData.auto_created
      if (shipmentData.created_from) validData.created_from = shipmentData.created_from
      if (shipmentData.data_source) validData.data_source = shipmentData.data_source
      if (shipmentData.import_source) validData.import_source = shipmentData.import_source
      if (shipmentData.created_at) validData.created_at = shipmentData.created_at
      if (shipmentData.updated_at) validData.updated_at = shipmentData.updated_at
      
      console.log('🔍 Dati validati per inserimento:', JSON.stringify(validData, null, 2))
      
      const { data, error } = await supabase
        .from('shipments')
        .insert(validData)
        .select('*')
        .single()
      
      console.log('🔍 create response - data:', !!data)
      console.log('🔍 create response - error:', error)
      
      if (error) {
        console.error('❌ Error creating shipment:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('❌ ShipmentService.create catch:', error)
      throw error
    }
  }

  // ✅ HELPER: Valida se una stringa è un UUID valido
  static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  static async getAll(userId: string) {
    console.log('🔍 ShipmentService.getAll chiamato per userId:', userId)
    
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('user_id', userId)
        .is('discarded_at', null) // Escludiamo i record scartati
        .order('created_at', { ascending: false })
      
      console.log('🔍 getAll response - data count:', data?.length || 0)
      console.log('🔍 getAll response - error:', error)
      
      if (error) {
        console.error('❌ Error fetching shipments:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('❌ ShipmentService.getAll catch:', error)
      throw error
    }
  }

  static async delete(id: string) {
    console.log('🔍 ShipmentService.delete chiamato per ID:', id)
    
    try {
      // Soft delete: impostiamo discarded_at
      const { data, error } = await supabase
        .from('shipments')
        .update({ 
          discarded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      console.log('🔍 delete response - data:', !!data)
      console.log('🔍 delete response - error:', error)
      
      if (error) {
        console.error('❌ Error deleting shipment:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('❌ ShipmentService.delete catch:', error)
      throw error
    }
  }

  static async update(id: string, updateData: any) {
    console.log('🔍 ShipmentService.update chiamato per ID:', id, 'con dati:', updateData)
    
    try {
      // Stessa validazione del create ma per l'update
      const validData: any = { updated_at: new Date().toISOString() }
      
      // Copia tutti i campi validi dal create (escluso user_id che non deve cambiare)
      if (updateData.shipment_number) validData.shipment_number = updateData.shipment_number
      if (updateData.supplier_name) validData.supplier_name = updateData.supplier_name
      if (updateData.supplier_country) validData.supplier_country = updateData.supplier_country
      if (updateData.total_value) validData.total_value = updateData.total_value
      if (updateData.status) validData.status = updateData.status
      if (updateData.transport_mode) validData.transport_mode = updateData.transport_mode
      if (updateData.departure_date) validData.departure_date = updateData.departure_date
      if (updateData.arrival_date) validData.arrival_date = updateData.arrival_date
      // ... aggiungi altri campi come necessario
      
      const { data, error } = await supabase
        .from('shipments')
        .update(validData)
        .eq('id', id)
        .select('*')
        .single()
      
      if (error) {
        console.error('❌ Error updating shipment:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('❌ ShipmentService.update catch:', error)
      throw error
    }
  }
}