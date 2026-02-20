'use client'

import { RefreshCw, Plus, AlertCircle, Ship, Download, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { useShipmentsData } from './lib/useShipmentsData'
import { ShipmentsStatsRow } from './components/ShipmentsStats'
import { ShipmentsFilters } from './components/ShipmentsFilters'
import { ShipmentCard } from './components/ShipmentCard'
import { BulkActions } from './components/BulkActions'

export default function ShipmentsPage() {
  const router = useRouter()
  const {
    loading,
    error,
    user,
    shipments,
    stats,
    filters,
    selectedIds,
    availableCarriers,
    hasActiveFilters,
    refresh,
    updateFilter,
    resetFilters,
    toggleSort,
    toggleSelection,
    toggleAllSelection,
    bulkUpdateStatus,
  } = useShipmentsData()

  // Loading
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <GlassCard key={i} className="p-4">
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </GlassCard>
          ))}
        </div>
        <GlassCard className="p-6">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </GlassCard>
      </div>
    )
  }

  // Auth guard
  if (!user) {
    return (
      <GlassCard className="p-12 text-center">
        <Ship className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Accesso Richiesto</h2>
        <p className="text-muted-foreground">Effettua il login per gestire le spedizioni.</p>
      </GlassCard>
    )
  }

  const exportCsv = () => {
    if (!shipments.length) return
    const rows = shipments.map(s => ({
      'Tracking': s.tracking_number || '',
      'Spedizione': s.shipment_number || '',
      'Stato': s.status,
      'Carrier': s.carrier_name || '',
      'Origine': s.origin_port || s.origin || '',
      'Destinazione': s.destination_port || s.destination || '',
      'Valore': s.total_value || 0,
      'Data': s.created_at || '',
      'ETA': s.eta || '',
    }))
    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => `"${String((r as any)[h] ?? '')}"`).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `spedizioni_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Spedizioni</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.total} spedizioni totali
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="glass" size="sm" onClick={refresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Aggiorna
          </Button>
          <Button variant="glass" size="sm" onClick={exportCsv} className="gap-2">
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/dashboard/tracking')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuova
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <GlassCard className="border-destructive/30 bg-destructive/5">
          <GlassCardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Errore nel caricamento</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <button onClick={refresh} className="text-xs text-primary underline mt-2">Riprova</button>
            </div>
          </GlassCardContent>
        </GlassCard>
      )}

      {/* Stats */}
      <ShipmentsStatsRow stats={stats} />

      {/* Filters */}
      <ShipmentsFilters
        filters={filters}
        availableCarriers={availableCarriers}
        hasActiveFilters={hasActiveFilters}
        onUpdateFilter={updateFilter}
        onResetFilters={resetFilters}
      />

      {/* Bulk actions */}
      <BulkActions
        count={selectedIds.size}
        onUpdateStatus={async (status) => {
          try {
            await bulkUpdateStatus(status)
          } catch {
            // TODO: toast error
          }
        }}
        onClear={toggleAllSelection}
      />

      {/* Sort bar + count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {shipments.length} di {stats.total} spedizioni
        </p>
        <div className="flex gap-1">
          {(['created_at', 'status', 'total_value'] as const).map(field => {
            const labels: Record<string, string> = { created_at: 'Data', status: 'Stato', total_value: 'Valore' }
            const isActive = filters.sortField === field
            return (
              <Button
                key={field}
                variant="ghost"
                size="sm"
                onClick={() => toggleSort(field)}
                className="text-xs gap-1 h-7"
              >
                {labels[field]}
                {isActive && (
                  filters.sortDirection === 'asc'
                    ? <ArrowUp className="h-3 w-3" />
                    : <ArrowDown className="h-3 w-3" />
                )}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Shipment cards */}
      <div className="space-y-3">
        {shipments.map(shipment => (
          <ShipmentCard
            key={shipment.id}
            shipment={shipment}
            isSelected={selectedIds.has(shipment.id)}
            onToggleSelect={toggleSelection}
          />
        ))}
      </div>

      {/* Empty state */}
      {shipments.length === 0 && !loading && (
        <GlassCard className="p-12 text-center">
          <Ship className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nessuna spedizione trovata</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {stats.total === 0
              ? 'Non hai ancora spedizioni. Inizia aggiungendo un tracking.'
              : 'Nessuna spedizione corrisponde ai filtri selezionati.'}
          </p>
          {stats.total === 0 && (
            <Button variant="primary" onClick={() => router.push('/dashboard/tracking')} className="gap-2">
              <Plus className="h-4 w-4" />
              Aggiungi Tracking
            </Button>
          )}
        </GlassCard>
      )}
    </div>
  )
}
