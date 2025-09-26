import { supabase } from './supabase'

export interface Tracking {
  id: string
  tracking_number: string
  user_id: string
  status?: string
  carrier_name?: string
  carrier_code?: string
  reference_number?: string
  origin?: string
  destination?: string
  origin_port?: string
  destination_port?: string
  eta?: string
  tracking_type?: string
  vessel_name?: string
  voyage_number?: string
  metadata?: any
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export class TrackingService {
  static async getAll(userId: string = 'demo-user-123'): Promise<Tracking[]> {
    try {
      console.log('🔍 TrackingService.getAll - Loading from Supabase for user:', userId)
      
      const { data, error } = await supabase
        .from('trackings')
        .select(`
          *,
          carriers (id, name),
          transport_modes (id, name),
          vehicle_types (id, name)
        `)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }
      
      console.log('✅ Trackings loaded from Supabase:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ TrackingService.getAll error:', error)
      
      // ❌ NON USARE FALLBACK - Forza risoluzione problemi
      throw new Error(`Database connection failed: ${error}`)
    }
  }

  // ✅ METODO MANCANTE - getByTrackingNumber
  static async getByTrackingNumber(trackingNumber: string, userId: string = 'demo-user-123'): Promise<Tracking | null> {
    try {
      console.log('🔍 TrackingService.getByTrackingNumber:', trackingNumber)
      
      const { data, error } = await supabase
        .from('trackings')
        .select(`
          *,
          carriers (id, name),
          transport_modes (id, name),
          vehicle_types (id, name)
        `)
        .eq('tracking_number', trackingNumber)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (normale se tracking non esiste)
        console.error('❌ Supabase error:', error)
        throw error
      }
      
      console.log('✅ Tracking found:', data?.id || 'none')
      return data || null
    } catch (error) {
      console.error('❌ TrackingService.getByTrackingNumber error:', error)
      
      // Se è un errore "not found", ritorna null invece di throwfare
      if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
        return null
      }
      
      throw error
    }
  }

  // ✅ METODO BULK PER PERFORMANCE
  static async getBulkByTrackingNumbers(trackingNumbers: string[], userId: string = 'demo-user-123'): Promise<Tracking[]> {
    try {
      console.log('🔍 TrackingService.getBulkByTrackingNumbers:', trackingNumbers.length, 'numbers')
      
      const { data, error } = await supabase
        .from('trackings')
        .select(`
          *,
          carriers (id, name),
          transport_modes (id, name),
          vehicle_types (id, name)
        `)
        .in('tracking_number', trackingNumbers)
        .eq('user_id', userId)
        .is('deleted_at', null)
      
      if (error) {
        console.error('❌ Supabase bulk error:', error)
        throw error
      }
      
      console.log('✅ Bulk trackings found:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ TrackingService.getBulkByTrackingNumbers error:', error)
      throw error
    }
  }

  static async create(trackingData: Partial<Tracking>, userId: string = 'demo-user-123'): Promise<Tracking> {
    try {
      console.log('🔄 Creating tracking:', trackingData.tracking_number)
      
      const validData = {
        user_id: userId,
        tracking_number: trackingData.tracking_number,
        tracking_type: trackingData.tracking_type || 'container',
        carrier_code: trackingData.carrier_code,
        carrier_name: trackingData.carrier_name,
        status: trackingData.status || 'registered',
        origin_port: trackingData.origin_port,
        destination_port: trackingData.destination_port,
        reference_number: trackingData.reference_number,
        vessel_name: trackingData.vessel_name,
        voyage_number: trackingData.voyage_number,
        origin: trackingData.origin,
        destination: trackingData.destination,
        eta: trackingData.eta,
        metadata: trackingData.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('trackings')
        .insert(validData)
        .select(`
          *,
          carriers (id, name),
          transport_modes (id, name),
          vehicle_types (id, name)
        `)
        .single()

      if (error) throw error

      console.log('✅ Tracking created:', data.id)
      
      // 🚀 Crea shipment automatico (ripristina funzionalità originale)
      await this.createShipmentFromTracking(data, userId)
      
      return data
    } catch (error) {
      console.error('❌ TrackingService.create error:', error)
      throw error
    }
  }

  // ✅ METODO BULK CREATE PER IMPORT MULTIPLI
  static async createBulk(trackingsData: Partial<Tracking>[], userId: string = 'demo-user-123'): Promise<Tracking[]> {
    try {
      console.log('🔄 Creating bulk trackings:', trackingsData.length)
      
      const validTrackings = trackingsData.map(trackingData => ({
        user_id: userId,
        tracking_number: trackingData.tracking_number,
        tracking_type: trackingData.tracking_type || 'container',
        carrier_code: trackingData.carrier_code,
        carrier_name: trackingData.carrier_name,
        status: trackingData.status || 'registered',
        origin_port: trackingData.origin_port,
        destination_port: trackingData.destination_port,
        reference_number: trackingData.reference_number,
        vessel_name: trackingData.vessel_name,
        voyage_number: trackingData.voyage_number,
        origin: trackingData.origin,
        destination: trackingData.destination,
        eta: trackingData.eta,
        metadata: trackingData.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { data, error } = await supabase
        .from('trackings')
        .insert(validTrackings)
        .select()

      if (error) throw error

      console.log('✅ Bulk trackings created:', data?.length || 0)
      
      // 🚀 Crea shipments automatici per tutti
      for (const tracking of (data || [])) {
        try {
          await this.createShipmentFromTracking(tracking, userId)
        } catch (error) {
          console.warn('⚠️ Shipment creation failed for tracking:', tracking.tracking_number, error)
        }
      }
      
      return data || []
    } catch (error) {
      console.error('❌ TrackingService.createBulk error:', error)
      throw error
    }
  }

  // 🚀 Ripristina creazione automatica shipment come nel vecchio sistema
  static async createShipmentFromTracking(tracking: Tracking, userId: string) {
    try {
      // Verifica se shipment esiste già
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

      // Crea shipment automaticamente
      const shipmentData = {
        user_id: userId,
        shipment_number: this.generateShipmentNumber(),
        tracking_number: tracking.tracking_number,
        status: tracking.status || 'planned',
        origin: tracking.origin_port,
        destination: tracking.destination_port,
        carrier_name: tracking.carrier_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: newShipment, error } = await supabase
        .from('shipments')
        .insert(shipmentData)
        .select()
        .single()

      if (error) {
        console.warn('⚠️ Shipment creation failed, continuing with tracking:', error)
        return null
      }

      console.log('✅ Shipment auto-created:', newShipment.id, 'for tracking:', tracking.tracking_number)
      return newShipment
    } catch (error) {
      console.warn('⚠️ Auto shipment creation failed:', error)
      // Non bloccare se shipment fallisce
      return null
    }
  }

  static generateShipmentNumber(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `SH-${year}${month}${day}-${random}`
  }

  static async update(id: string, updateData: Partial<Tracking>): Promise<Tracking> {
    try {
      const cleanUpdateData = { ...updateData }
      delete cleanUpdateData.id
      delete cleanUpdateData.created_at
      cleanUpdateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('trackings')
        .update(cleanUpdateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      console.log('✅ Tracking updated:', data.id)
      return data
    } catch (error) {
      console.error('❌ TrackingService.update error:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trackings')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      
      console.log('✅ Tracking soft deleted:', id)
      return true
    } catch (error) {
      console.error('❌ TrackingService.delete error:', error)
      throw error
    }
  }

  // ✅ METODO PER HARD DELETE (se necessario)
  static async hardDelete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trackings')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      console.log('✅ Tracking hard deleted:', id)
      return true
    } catch (error) {
      console.error('❌ TrackingService.hardDelete error:', error)
      throw error
    }
  }

  // ✅ METODO PER STATISTICHE
  static async getStats(userId: string = 'demo-user-123') {
    try {
      const { data, error } = await supabase
        .from('trackings')
        .select('status, tracking_type, carrier_name')
        .eq('user_id', userId)
        .is('deleted_at', null)

      if (error) throw error

      const stats = {
        total: data?.length || 0,
        byStatus: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        byCarrier: {} as Record<string, number>
      }

      data?.forEach(tracking => {
        // Count by status
        const status = tracking.status || 'unknown'
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1

        // Count by type
        const type = tracking.tracking_type || 'unknown'
        stats.byType[type] = (stats.byType[type] || 0) + 1

        // Count by carrier
        const carrier = tracking.carrier_name || 'unknown'
        stats.byCarrier[carrier] = (stats.byCarrier[carrier] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('❌ TrackingService.getStats error:', error)
      throw error
    }
  }
}

export default TrackingService