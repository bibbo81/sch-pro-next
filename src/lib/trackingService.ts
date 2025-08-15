import { supabase } from './supabase'

export interface Tracking {
  id?: string
  user_id: string
  tracking_number: string
  tracking_type: string
  carrier_code?: string
  carrier_name?: string
  reference_number?: string
  status?: string
  origin_port?: string
  origin_country?: string
  destination_port?: string
  destination_country?: string
  eta?: string
  ata?: string
  last_event_date?: string
  last_event_location?: string
  last_event_description?: string
  metadata?: any
  vessel_name?: string
  vessel_imo?: string
  voyage_number?: string
  container_size?: string
  container_type?: string
  container_count?: number
  date_of_loading?: string
  date_of_departure?: string
  date_of_discharge?: string
  booking_number?: string
  bl_number?: string
  flight_number?: string
  organization_id?: string
  created_at?: string
  updated_at?: string
}

export class TrackingService {
  // Ottieni tutti i tracking per user
  static async getAll(userId: string): Promise<Tracking[]> {
    const { data, error } = await supabase
      .from('trackings')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching trackings:', error)
      throw error
    }

    return data || []
  }

  // Ottieni tracking per numero
  static async getByTrackingNumber(trackingNumber: string, userId: string): Promise<Tracking | null> {
    const { data, error } = await supabase
      .from('trackings')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching tracking:', error)
      throw error
    }

    return data
  }

  // Controlla se tracking esiste
  static async exists(trackingNumber: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('trackings')
      .select('id')
      .eq('tracking_number', trackingNumber)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    return !error && !!data
  }

  // Crea nuovo tracking
  static async create(tracking: Partial<Tracking>): Promise<Tracking> {
    const { data, error } = await supabase
      .from('trackings')
      .insert([tracking])
      .select()
      .single()

    if (error) {
      console.error('Error creating tracking:', error)
      throw error
    }

    return data
  }

  // Crea tracking multipli
  static async createMany(trackings: Partial<Tracking>[]): Promise<Tracking[]> {
    const { data, error } = await supabase
      .from('trackings')
      .insert(trackings)
      .select()

    if (error) {
      console.error('Error creating trackings:', error)
      throw error
    }

    return data || []
  }

  // Aggiorna tracking
  static async update(id: string, updates: Partial<Tracking>): Promise<Tracking> {
    const { data, error } = await supabase
      .from('trackings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating tracking:', error)
      throw error
    }

    return data
  }

  // Soft delete tracking
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('trackings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error deleting tracking:', error)
      throw error
    }
  }

  // Ottieni statistiche per user
  static async getStats(userId: string) {
    const { data, error } = await supabase
      .from('trackings')
      .select('status')
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (error) {
      console.error('Error fetching stats:', error)
      throw error
    }

    const stats = data.reduce((acc: any, tracking: any) => {
      const status = tracking.status || 'UNKNOWN'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return stats
  }
}