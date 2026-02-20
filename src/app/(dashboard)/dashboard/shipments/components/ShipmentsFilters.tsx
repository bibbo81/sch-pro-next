'use client'

import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import type { ShipmentsFilters as FiltersType } from '../lib/useShipmentsData'

interface Props {
  filters: FiltersType
  availableCarriers: string[]
  hasActiveFilters: boolean
  onUpdateFilter: <K extends keyof FiltersType>(key: K, value: FiltersType[K]) => void
  onResetFilters: () => void
}

export function ShipmentsFilters({ filters, availableCarriers, hasActiveFilters, onUpdateFilter, onResetFilters }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <GlassCard className="p-4">
      <GlassCardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca tracking, spedizione, carrier..."
              value={filters.searchTerm}
              onChange={(e) => onUpdateFilter('searchTerm', e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status filter */}
          <select
            value={filters.statusFilter}
            onChange={(e) => onUpdateFilter('statusFilter', e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tutti gli stati</option>
            <option value="draft">Bozza</option>
            <option value="planned">Pianificato</option>
            <option value="confirmed">Confermato</option>
            <option value="shipped">Spedito</option>
            <option value="sailing">In Navigazione</option>
            <option value="in_transit">In Transito</option>
            <option value="delivered">Consegnato</option>
            <option value="cancelled">Annullato</option>
          </select>

          {/* Toggle advanced filters */}
          <Button
            variant="glass"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtri</span>
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="gap-1 text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/30">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Vettore</label>
              <select
                value={filters.carrierFilter}
                onChange={(e) => onUpdateFilter('carrierFilter', e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Tutti i vettori</option>
                {availableCarriers.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Da</label>
              <input
                type="date"
                value={filters.dateRange.from}
                onChange={(e) => onUpdateFilter('dateRange', { ...filters.dateRange, from: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">A</label>
              <input
                type="date"
                value={filters.dateRange.to}
                onChange={(e) => onUpdateFilter('dateRange', { ...filters.dateRange, to: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}
