'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from './keys'

export interface ShipmentRow {
  id: string
  tracking_number: string | null
  shipment_number: string | null
  status: string
  recipient_name: string | null
  total_value: number | null
  created_at: string | null
  updated_at: string | null
  organization_id: string | null
  user_id: string
  notes: string | null
  origin: string | null
  destination: string | null
  origin_port: string | null
  destination_port: string | null
  carrier_name: string | null
  eta: string | null
  shipment_items: Array<{
    id: string
    name: string | null
    sku: string | null
    quantity: number | null
    unit_cost: number | null
    total_cost: number | null
  }>
}

async function fetchShipments(userId: string): Promise<ShipmentRow[]> {
  const supabase = createClient()

  const { data: userOrgs, error: orgError } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)

  if (orgError) throw new Error(`Errore organizzazioni: ${orgError.message}`)
  if (!userOrgs?.length) return []

  const orgIds = userOrgs.map((o: { organization_id: string }) => o.organization_id)

  const { data, error } = await supabase
    .from('shipments')
    .select(`*, shipment_items (id, name, sku, quantity, unit_cost, total_cost)`)
    .in('organization_id', orgIds)
    .is('discarded_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Errore database: ${error.message}`)

  return (data || []).map((s: any) => ({
    id: s.id,
    tracking_number: s.tracking_number || s.tracking_id || null,
    shipment_number: s.shipment_number || null,
    status: s.status || 'draft',
    recipient_name: s.destination || s.destination_country || null,
    total_value: typeof s.total_value === 'number' ? s.total_value
      : typeof s.total_cost === 'number' ? s.total_cost
      : typeof s.total_value === 'string' ? parseFloat(s.total_value) || 0
      : 0,
    created_at: s.created_at,
    updated_at: s.updated_at,
    organization_id: s.organization_id,
    user_id: s.user_id,
    notes: s.booking || s.bl_number || null,
    origin: s.origin || s.origin_country || s.origin_port || null,
    destination: s.destination || s.destination_country || null,
    origin_port: s.origin_port || s.origin || null,
    destination_port: s.destination_port || s.destination || null,
    carrier_name: s.carrier || s.carrier_name || s.vessel_name || null,
    eta: s.eta || s.arrival_date || s.ata || null,
    shipment_items: s.shipment_items || [],
  }))
}

export function useShipmentsQuery() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.shipments.all,
    queryFn: () => fetchShipments(user!.id),
    enabled: !!user?.id,
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('shipments')
        .update({ status })
        .in('id', ids)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all })
    },
  })

  return {
    shipments: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  }
}
