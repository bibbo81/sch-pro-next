import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Database } from '@/types/database.types'

type Tracking = Database['public']['Tables']['trackings']['Row']
type TrackingInsert = Database['public']['Tables']['trackings']['Insert']
type TrackingUpdate = Database['public']['Tables']['trackings']['Update']

export function useTrackings() {
  const { user } = useAuth()
  console.log('🔍 useTrackings: Loading organization trackings for user:', user?.id)
  const [trackings, setTrackings] = useState<Tracking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const loadedRef = useRef(false)
  const currentUserRef = useRef<string | null>(null)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  // ✅ LOAD TRACKINGS per organizzazione
  const loadTrackings = useCallback(async (forceReload = false) => {
    if (!user?.id) {
      console.log('🔍 useTrackings: No user found')
      setTrackings([])
      setError('User not authenticated')
      loadedRef.current = false
      return
    }

    if (loading && !forceReload) {
      console.log('🔍 useTrackings: Already loading, skipping...')
      return
    }

    if (loadedRef.current && currentUserRef.current === user.id && !forceReload) {
      console.log('🔍 useTrackings: Already loaded for this user, skipping...')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔍 useTrackings: Loading organization trackings for user:', user.id)
      
      // ✅ QUERY SENZA FILTRI - RLS gestisce l'accesso per organizzazione
      const { data, error: supabaseError } = await supabase
        .from('trackings')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (supabaseError) {
        console.error('🔍 useTrackings: Supabase error:', supabaseError)
        throw supabaseError
      }

      console.log('🔍 useTrackings: Loaded organization trackings:', data?.length || 0, 'items')
      setTrackings(data || [])
      setError(null)
      loadedRef.current = true
      currentUserRef.current = user.id
    } catch (err: any) {
      console.error('🔍 useTrackings: Error loading trackings:', err)
      setError(err?.message || 'Errore nel caricamento dei tracking')
      setTrackings([])
      loadedRef.current = false
    } finally {
      setLoading(false)
    }
  }, [user?.id, loading, supabase])

  useEffect(() => {
    if (user?.id && currentUserRef.current !== user.id) {
      loadedRef.current = false
      loadTrackings()
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) {
      setTrackings([])
      setError(null)
      loadedRef.current = false
      currentUserRef.current = null
    }
  }, [user?.id])

  // ✅ ADD TRACKING con organization_id
  const addTracking = useCallback(async (trackingData: Partial<TrackingInsert>) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    console.log('🔍 useTrackings: Adding tracking:', trackingData.tracking_number)

    try {
      // ✅ OTTIENI ORGANIZATION_ID dell'utente
      const { data: membershipData, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      if (membershipError || !membershipData) {
        throw new Error('Utente non appartiene a nessuna organizzazione')
      }

      // Verifica duplicati nella organizzazione
      const { data: existingData } = await supabase
        .from('trackings')
        .select('id')
        .eq('tracking_number', trackingData.tracking_number!)
        .is('deleted_at', null)
        .maybeSingle()

      if (existingData) {
        throw new Error(`Tracking ${trackingData.tracking_number} già esistente`)
      }

      const insertData: TrackingInsert = {
        user_id: user.id,
        organization_id: membershipData.organization_id, // ✅ AGGIUNGI ORGANIZATION_ID
        tracking_number: trackingData.tracking_number!,
        tracking_type: trackingData.tracking_type || 'container',
        carrier_code: trackingData.carrier_code,
        carrier_name: trackingData.carrier_name,
        carrier: trackingData.carrier,
        origin: trackingData.origin,
        destination: trackingData.destination,
        origin_port: trackingData.origin_port,
        destination_port: trackingData.destination_port,
        origin_country: trackingData.origin_country,
        destination_country: trackingData.destination_country,
        status: trackingData.status || 'registered',
        reference_number: trackingData.reference_number,
        booking_number: trackingData.booking_number,
        bl_number: trackingData.bl_number,
        flight_number: trackingData.flight_number,
        vessel_name: trackingData.vessel_name,
        vessel_imo: trackingData.vessel_imo,
        voyage_number: trackingData.voyage_number,
        container_size: trackingData.container_size,
        container_type: trackingData.container_type,
        container_count: trackingData.container_count,
        // ✅ ENHANCED: Recupero automatico peso/volume da ShipsGo
        total_weight_kg: trackingData.weight_kg || trackingData.total_weight_kg,
        total_volume_cbm: trackingData.volume_cbm || trackingData.total_volume_cbm,
        transport_company: trackingData.transport_company,
        eta: trackingData.eta,
        estimated_delivery: trackingData.estimated_delivery,
        shipped_date: trackingData.shipped_date,
        updated_by_robot: trackingData.updated_by_robot || false,
        created_by: user.id,
        // ✅ ENHANCED: Salva dati completi da ShipsGo nel metadata
        metadata: {
          ...trackingData.metadata,
          // Dati ShipsGo originali per riferimento
          shipsgo_transport_mode: trackingData.transport_mode,
          shipsgo_awb_number: trackingData.awb_number,
          shipsgo_container_number: trackingData.container_number,
          shipsgo_pieces: trackingData.pieces,
          shipsgo_last_update: trackingData.last_update,
          shipsgo_events: trackingData.events
        } || {}
      }

      const { data, error: supabaseError } = await supabase
        .from('trackings')
        .insert([insertData])
        .select()

      if (supabaseError) {
        console.error('🔍 useTrackings: Error adding tracking:', supabaseError)
        throw supabaseError
      }

      console.log('🔍 useTrackings: Tracking added successfully:', data?.[0]?.id)
      await loadTrackings(true)
      return data?.[0]
    } catch (err: any) {
      console.error('🔍 useTrackings: Error in addTracking:', err)
      throw err
    }
  }, [user?.id, supabase, loadTrackings])

  const deleteTracking = useCallback(async (trackingId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    console.log('🔍 useTrackings: Deleting tracking:', trackingId)

    try {
      const updateData: TrackingUpdate = {
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: supabaseError } = await supabase
        .from('trackings')
        .update(updateData)
        .eq('id', trackingId)
        // ✅ RLS policy gestisce l'accesso

      if (supabaseError) {
        console.error('🔍 useTrackings: Error deleting tracking:', supabaseError)
        throw supabaseError
      }

      console.log('🔍 useTrackings: Tracking deleted successfully')
      await loadTrackings(true)
    } catch (err: any) {
      console.error('🔍 useTrackings: Error in deleteTracking:', err)
      throw err
    }
  }, [user?.id, supabase, loadTrackings])

  const updateTracking = useCallback(async (trackingId: string, updates: TrackingUpdate) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      const updateData: TrackingUpdate = {
        ...updates,
        // ✅ ENHANCED: Recupero automatico peso/volume da ShipsGo per aggiornamenti
        total_weight_kg: updates.weight_kg || updates.total_weight_kg,
        total_volume_cbm: updates.volume_cbm || updates.total_volume_cbm,
        // ✅ ENHANCED: Preserva/aggiorna metadata ShipsGo
        metadata: {
          ...updates.metadata,
          // Aggiungi nuovi dati ShipsGo se presenti
          ...(updates.transport_mode && { shipsgo_transport_mode: updates.transport_mode }),
          ...(updates.awb_number && { shipsgo_awb_number: updates.awb_number }),
          ...(updates.container_number && { shipsgo_container_number: updates.container_number }),
          ...(updates.pieces && { shipsgo_pieces: updates.pieces }),
          ...(updates.last_update && { shipsgo_last_update: updates.last_update }),
          ...(updates.events && { shipsgo_events: updates.events })
        },
        updated_at: new Date().toISOString()
      }

      const { data, error: supabaseError } = await supabase
        .from('trackings')
        .update(updateData)
        .eq('id', trackingId)
        // ✅ RLS policy gestisce l'accesso
        .select()

      if (supabaseError) {
        throw supabaseError
      }

      await loadTrackings(true)
      return data?.[0]
    } catch (err: any) {
      console.error('🔍 useTrackings: Error in updateTracking:', err)
      throw err
    }
  }, [user?.id, supabase, loadTrackings])

  return {
    trackings,
    loading,
    error,
    loadTrackings: useCallback(() => loadTrackings(true), [loadTrackings]),
    addTracking,
    deleteTracking,
    updateTracking
  }
}