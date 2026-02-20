'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  DashboardMetrics,
  ControlShipment,
  ChartData,
  calculateMetrics,
  buildControlShipments,
  filterControlShipments as filterControl,
  prepareChartData,
} from './calculations'

export type ControlFilterType = 'all' | 'in_transit' | 'recent_arrived'

interface DashboardState {
  loading: boolean
  error: string | null
  refreshing: boolean
  metrics: DashboardMetrics | null
  controlShipments: ControlShipment[]
  filteredControlShipments: ControlShipment[]
  controlFilter: ControlFilterType
  chartData: ChartData | null
  shipmentCount: number
}

export function useDashboardData() {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [state, setState] = useState<DashboardState>({
    loading: true,
    error: null,
    refreshing: false,
    metrics: null,
    controlShipments: [],
    filteredControlShipments: [],
    controlFilter: 'all',
    chartData: null,
    shipmentCount: 0,
  })

  const loadData = useCallback(async () => {
    if (!user) return

    try {
      setState(prev => ({ ...prev, error: null }))

      // Get organization ID
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      const orgId = membership?.organization_id

      // Build queries
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

      const metrics = calculateMetrics(shipments, additionalCosts)
      const control = buildControlShipments(shipments)
      const chartData = prepareChartData(shipments, additionalCosts)

      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        metrics,
        controlShipments: control,
        filteredControlShipments: filterControl(control, prev.controlFilter),
        chartData,
        shipmentCount: shipments.length,
      }))
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: err.message || 'Errore nel caricamento dei dati',
      }))
    }
  }, [user, supabase])

  // Initial load
  useEffect(() => {
    if (user && !authLoading) {
      loadData()
    }
  }, [user, authLoading, loadData])

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true }))
    await loadData()
  }, [loadData])

  const setControlFilter = useCallback((filterType: ControlFilterType) => {
    setState(prev => ({
      ...prev,
      controlFilter: filterType,
      filteredControlShipments: filterControl(prev.controlShipments, filterType),
    }))
  }, [])

  return {
    ...state,
    authLoading,
    user,
    refresh,
    setControlFilter,
  }
}
