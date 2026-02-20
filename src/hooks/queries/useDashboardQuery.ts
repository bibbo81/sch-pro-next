'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from './keys'
import {
  DashboardMetrics,
  ControlShipment,
  ChartData,
  calculateMetrics,
  buildControlShipments,
  prepareChartData,
} from '@/app/(dashboard)/dashboard/lib/calculations'

interface DashboardData {
  metrics: DashboardMetrics
  controlShipments: ControlShipment[]
  chartData: ChartData
  shipmentCount: number
}

async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const supabase = createClient()

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)
    .single()

  const orgId = membership?.organization_id

  let shipmentsQ = supabase.from('shipments').select('*')
  let costsQ = supabase.from('additional_costs').select('*')

  if (orgId) {
    shipmentsQ = shipmentsQ.eq('organization_id', orgId)
    costsQ = costsQ.eq('organization_id', orgId)
  }

  const [shipmentsRes, costsRes] = await Promise.allSettled([
    shipmentsQ.order('created_at', { ascending: false }).limit(2000),
    costsQ.order('created_at', { ascending: false }).limit(2000),
  ])

  const shipments = shipmentsRes.status === 'fulfilled' ? shipmentsRes.value.data || [] : []
  const additionalCosts = costsRes.status === 'fulfilled' ? costsRes.value.data || [] : []

  return {
    metrics: calculateMetrics(shipments, additionalCosts),
    controlShipments: buildControlShipments(shipments),
    chartData: prepareChartData(shipments, additionalCosts),
    shipmentCount: shipments.length,
  }
}

export function useDashboardQuery() {
  const { user } = useAuth()

  const query = useQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: () => fetchDashboardData(user!.id),
    enabled: !!user?.id,
    staleTime: 60 * 1000, // Dashboard data can be stale for 1 minute
  })

  return {
    data: query.data ?? null,
    metrics: query.data?.metrics ?? null,
    controlShipments: query.data?.controlShipments ?? [],
    chartData: query.data?.chartData ?? null,
    shipmentCount: query.data?.shipmentCount ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  }
}
