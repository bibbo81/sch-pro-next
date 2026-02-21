'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboardQuery } from '@/hooks/queries/useDashboardQuery'
import { filterControlShipments as filterControl } from './calculations'

export type ControlFilterType = 'all' | 'in_transit' | 'recent_arrived'

export function useDashboardData() {
  const { user, loading: authLoading } = useAuth()
  const {
    metrics,
    controlShipments,
    chartData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useDashboardQuery()

  const [controlFilter, setControlFilterState] = useState<ControlFilterType>('all')

  const filteredControlShipments = filterControl(controlShipments, controlFilter)

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  const setControlFilter = useCallback((filterType: ControlFilterType) => {
    setControlFilterState(filterType)
  }, [])

  return {
    loading: isLoading,
    authLoading,
    error,
    refreshing: isFetching && !isLoading,
    user,
    metrics,
    controlShipments,
    filteredControlShipments,
    controlFilter,
    chartData,
    refresh,
    setControlFilter,
  }
}
