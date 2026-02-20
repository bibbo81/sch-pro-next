'use client'

import { useState, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useShipmentsQuery, ShipmentRow } from '@/hooks/queries/useShipmentsQuery'

export type { ShipmentRow as Shipment }

type SortField = 'created_at' | 'updated_at' | 'tracking_number' | 'status' | 'total_value'
type SortDirection = 'asc' | 'desc'

export interface ShipmentsFilters {
  searchTerm: string
  statusFilter: string
  carrierFilter: string
  dateRange: { from: string; to: string }
  sortField: SortField
  sortDirection: SortDirection
}

export interface ShipmentsStats {
  total: number
  inTransit: number
  totalValue: number
  delivered: number
  shipped: number
}

export function useShipmentsData() {
  const { user, loading: authLoading } = useAuth()
  const {
    shipments,
    isLoading,
    isFetching,
    error,
    refetch,
    updateStatus,
    isUpdating,
  } = useShipmentsQuery()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [filters, setFilters] = useState<ShipmentsFilters>({
    searchTerm: '',
    statusFilter: 'all',
    carrierFilter: 'all',
    dateRange: { from: '', to: '' },
    sortField: 'created_at',
    sortDirection: 'desc',
  })

  const filteredShipments = useMemo(() => {
    const { searchTerm, statusFilter, carrierFilter, dateRange, sortField, sortDirection } = filters

    let filtered = shipments.filter(s => {
      const matchesSearch = !searchTerm ||
        [s.tracking_number, s.shipment_number, s.recipient_name, s.carrier_name]
          .some(f => f?.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === 'all' ||
        (s.status || '').toLowerCase() === statusFilter.toLowerCase()

      const matchesCarrier = carrierFilter === 'all' ||
        (s.carrier_name || '').toLowerCase().includes(carrierFilter.toLowerCase())

      const matchesDate = (!dateRange.from || !s.created_at || new Date(s.created_at) >= new Date(dateRange.from)) &&
        (!dateRange.to || !s.created_at || new Date(s.created_at) <= new Date(dateRange.to))

      return matchesSearch && matchesStatus && matchesCarrier && matchesDate
    })

    filtered.sort((a, b) => {
      let aVal: any = a[sortField as keyof ShipmentRow]
      let bVal: any = b[sortField as keyof ShipmentRow]

      if (!aVal) aVal = ''
      if (!bVal) bVal = ''

      if (sortField === 'created_at' || sortField === 'updated_at') {
        aVal = aVal ? new Date(aVal).getTime() : 0
        bVal = bVal ? new Date(bVal).getTime() : 0
      }
      if (sortField === 'total_value') {
        aVal = Number(aVal) || 0
        bVal = Number(bVal) || 0
      }
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [shipments, filters])

  const stats: ShipmentsStats = useMemo(() => ({
    total: shipments.length,
    inTransit: shipments.filter(s => ['in_transit', 'sailing', 'shipped'].includes((s.status || '').toLowerCase())).length,
    totalValue: shipments.reduce((sum, s) => sum + (s.total_value || 0), 0),
    delivered: shipments.filter(s => (s.status || '').toLowerCase() === 'delivered').length,
    shipped: shipments.filter(s => ['shipped', 'sailing'].includes((s.status || '').toLowerCase())).length,
  }), [shipments])

  const availableCarriers = useMemo(() => {
    const carriers = new Set<string>()
    shipments.forEach(s => { if (s.carrier_name) carriers.add(s.carrier_name) })
    return Array.from(carriers).sort()
  }, [shipments])

  const updateFilter = useCallback(<K extends keyof ShipmentsFilters>(key: K, value: ShipmentsFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      statusFilter: 'all',
      carrierFilter: 'all',
      dateRange: { from: '', to: '' },
      sortField: 'created_at',
      sortDirection: 'desc',
    })
  }, [])

  const toggleSort = useCallback((field: SortField) => {
    setFilters(prev => ({
      ...prev,
      sortField: field,
      sortDirection: prev.sortField === field && prev.sortDirection === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAllSelection = useCallback(() => {
    if (selectedIds.size === filteredShipments.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredShipments.map(s => s.id)))
    }
  }, [selectedIds.size, filteredShipments])

  const bulkUpdateStatus = useCallback(async (newStatus: string) => {
    if (selectedIds.size === 0) return
    await updateStatus({ ids: Array.from(selectedIds), status: newStatus })
    setSelectedIds(new Set())
  }, [selectedIds, updateStatus])

  const hasActiveFilters = filters.searchTerm !== '' ||
    filters.statusFilter !== 'all' ||
    filters.carrierFilter !== 'all' ||
    filters.dateRange.from !== '' ||
    filters.dateRange.to !== ''

  return {
    loading: authLoading || isLoading,
    error,
    user,
    shipments: filteredShipments,
    allShipments: shipments,
    stats,
    filters,
    selectedIds,
    availableCarriers,
    hasActiveFilters,
    refresh: refetch,
    updateFilter,
    resetFilters,
    toggleSort,
    toggleSelection,
    toggleAllSelection,
    bulkUpdateStatus,
  }
}
