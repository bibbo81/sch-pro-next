'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

export interface Shipment {
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
  const supabase = createClient()

  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [filters, setFilters] = useState<ShipmentsFilters>({
    searchTerm: '',
    statusFilter: 'all',
    carrierFilter: 'all',
    dateRange: { from: '', to: '' },
    sortField: 'created_at',
    sortDirection: 'desc',
  })

  const loadShipments = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data: userOrgs, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)

      if (orgError) throw new Error(`Errore organizzazioni: ${orgError.message}`)
      if (!userOrgs?.length) {
        setShipments([])
        return
      }

      const orgIds = userOrgs.map((o: { organization_id: string }) => o.organization_id)

      const { data, error: queryError } = await supabase
        .from('shipments')
        .select(`
          *,
          shipment_items (id, name, sku, quantity, unit_cost, total_cost)
        `)
        .in('organization_id', orgIds)
        .is('discarded_at', null)
        .order('created_at', { ascending: false })

      if (queryError) throw new Error(`Errore database: ${queryError.message}`)

      const normalized: Shipment[] = (data || []).map((s: any) => ({
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

      setShipments(normalized)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    if (user?.id && !authLoading) {
      loadShipments()
    }
  }, [user?.id, authLoading, loadShipments])

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
      let aVal: any = a[sortField as keyof Shipment]
      let bVal: any = b[sortField as keyof Shipment]

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
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ status: newStatus })
        .in('id', Array.from(selectedIds))
      if (error) throw error
      await loadShipments()
      setSelectedIds(new Set())
    } catch {
      throw new Error('Errore durante l\'aggiornamento')
    }
  }, [selectedIds, supabase, loadShipments])

  const hasActiveFilters = filters.searchTerm !== '' ||
    filters.statusFilter !== 'all' ||
    filters.carrierFilter !== 'all' ||
    filters.dateRange.from !== '' ||
    filters.dateRange.to !== ''

  return {
    loading: authLoading || loading,
    error,
    user,
    shipments: filteredShipments,
    allShipments: shipments,
    stats,
    filters,
    selectedIds,
    availableCarriers,
    hasActiveFilters,
    refresh: loadShipments,
    updateFilter,
    resetFilters,
    toggleSort,
    toggleSelection,
    toggleAllSelection,
    bulkUpdateStatus,
  }
}
