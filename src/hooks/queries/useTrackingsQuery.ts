'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { queryKeys } from './keys'

type Tracking = Database['public']['Tables']['trackings']['Row']
type TrackingInsert = Database['public']['Tables']['trackings']['Insert']
type TrackingUpdate = Database['public']['Tables']['trackings']['Update']

async function fetchTrackings(): Promise<Tracking[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('trackings')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export function useTrackingsQuery() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.trackings.all,
    queryFn: fetchTrackings,
    enabled: !!user?.id,
  })

  const addMutation = useMutation({
    mutationFn: async (trackingData: Partial<TrackingInsert>) => {
      const supabase = createClient()

      if (!user?.id) throw new Error('User not authenticated')

      const { data: membershipData, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      if (membershipError || !membershipData) {
        throw new Error('Utente non appartiene a nessuna organizzazione')
      }

      // Check duplicates
      const { data: existing } = await supabase
        .from('trackings')
        .select('id')
        .eq('tracking_number', trackingData.tracking_number!)
        .is('deleted_at', null)
        .maybeSingle()

      if (existing) {
        throw new Error(`Tracking ${trackingData.tracking_number} già esistente`)
      }

      const insertData: TrackingInsert = {
        user_id: user.id,
        organization_id: membershipData.organization_id,
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
        total_weight_kg: trackingData.weight_kg || trackingData.total_weight_kg,
        total_volume_cbm: trackingData.volume_cbm || trackingData.total_volume_cbm,
        transport_company: trackingData.transport_company,
        eta: trackingData.eta,
        estimated_delivery: trackingData.estimated_delivery,
        shipped_date: trackingData.shipped_date,
        updated_by_robot: trackingData.updated_by_robot || false,
        created_by: user.id,
        metadata: {
          ...trackingData.metadata,
          shipsgo_transport_mode: trackingData.transport_mode,
          shipsgo_awb_number: trackingData.awb_number,
          shipsgo_container_number: trackingData.container_number,
          shipsgo_pieces: trackingData.pieces,
          shipsgo_last_update: trackingData.last_update,
          shipsgo_events: trackingData.events
        } || {}
      }

      const { data, error } = await supabase
        .from('trackings')
        .insert([insertData])
        .select()

      if (error) throw error
      return data?.[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trackings.all })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (trackingId: string) => {
      const supabase = createClient()

      const { error } = await supabase
        .from('trackings')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', trackingId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trackings.all })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TrackingUpdate }) => {
      const supabase = createClient()

      const updateData: TrackingUpdate = {
        ...updates,
        total_weight_kg: updates.weight_kg || updates.total_weight_kg,
        total_volume_cbm: updates.volume_cbm || updates.total_volume_cbm,
        metadata: {
          ...updates.metadata,
          ...(updates.transport_mode && { shipsgo_transport_mode: updates.transport_mode }),
          ...(updates.awb_number && { shipsgo_awb_number: updates.awb_number }),
          ...(updates.container_number && { shipsgo_container_number: updates.container_number }),
          ...(updates.pieces && { shipsgo_pieces: updates.pieces }),
          ...(updates.last_update && { shipsgo_last_update: updates.last_update }),
          ...(updates.events && { shipsgo_events: updates.events })
        },
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('trackings')
        .update(updateData)
        .eq('id', id)
        .select()

      if (error) throw error
      return data?.[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trackings.all })
    },
  })

  return {
    trackings: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    addTracking: addMutation.mutateAsync,
    deleteTracking: deleteMutation.mutateAsync,
    updateTracking: (id: string, updates: TrackingUpdate) =>
      updateMutation.mutateAsync({ id, updates }),
    isAdding: addMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}
