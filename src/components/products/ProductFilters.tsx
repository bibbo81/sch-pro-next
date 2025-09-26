'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { X, Filter, RefreshCw, Package, AlertTriangle } from 'lucide-react';
import { FilterState } from '@/types/product';

// ✅ INTERFACE CORRETTA
export interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: string[];
}

export default function ProductFilters({
  filters,
  onFiltersChange,
  categories
}: ProductFiltersProps) {
  
  const resetFilters = () => {
    onFiltersChange({
      search: '',
      category: '',
      priceRange: [0, 10000],
      active: null
    });
  };

  const updateFilter = <K extends keyof FilterState>(
    key: K, 
    value: FilterState[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const activeFiltersCount = [
    filters.category !== '',
    filters.active !== null,
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000,
    filters.lowStock,
    filters.outOfStock
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Filtri Avanzati</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="glass" className="text-xs">
              {activeFiltersCount} attivi
            </Badge>
          )}
        </div>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="glass"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* Main Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Categoria Filter */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Package className="h-4 w-4" />
            Categoria
          </label>
          <Select 
            value={filters.category} 
            onValueChange={(value) => updateFilter('category', value === 'all' ? '' : value)}
          >
            <SelectTrigger className="glass border-0">
              <SelectValue placeholder="Tutte le categorie" />
            </SelectTrigger>
            <SelectContent>
  <SelectItem value="all">Tutte le categorie</SelectItem>
  {categories.map(category => (
    <SelectItem key={category} value={category}>
      {category}
    </SelectItem>
  ))}
</SelectContent>
          </Select>
          
          {filters.category && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs glass">
                {filters.category}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-2 hover:bg-destructive/20"
                  onClick={() => updateFilter('category', '')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Stato Prodotto
          </label>
          <Select 
            value={filters.active === null ? 'all' : filters.active ? 'active' : 'inactive'} 
            onValueChange={(value) => {
              const newActive = value === 'all' ? null : value === 'active';
              updateFilter('active', newActive);
            }}
          >
            <SelectTrigger className="glass border-0">
              <SelectValue placeholder="Tutti gli stati" />
            </SelectTrigger>
            <SelectContent>
  <SelectItem value="all">Tutti gli stati</SelectItem>
  <SelectItem value="active">
    <span className="flex items-center gap-2">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      Attivo
    </span>
  </SelectItem>
  <SelectItem value="inactive">
    <span className="flex items-center gap-2">
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      Inattivo
    </span>
  </SelectItem>
</SelectContent>
          </Select>
          
          {filters.active !== null && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs glass">
                {filters.active ? 'Attivi' : 'Inattivi'}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-2 hover:bg-destructive/20"
                  onClick={() => updateFilter('active', null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Fascia di Prezzo
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={10000}
              step={100}
              value={filters.priceRange[1]}
              onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>€0</span>
              <span>€{filters.priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Filtri Rapidi</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.active === true && !filters.category ? 'primary' : 'outline'}
            size="sm"
            className="glass text-xs"
            onClick={() => {
              updateFilter('category', '');
              updateFilter('active', true);
            }}
          >
            <Package className="h-3 w-3 mr-1" />
            Solo Attivi
          </Button>
          
          <Button
            variant={filters.active === false && !filters.category ? 'primary' : 'outline'}
            size="sm"
            className="glass text-xs"
            onClick={() => {
              updateFilter('category', '');
              updateFilter('active', false);
            }}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Solo Inattivi
          </Button>

          {/* Top 3 Categories */}
          {categories.slice(0, 3).map(category => (
            <Button
              key={category}
              variant={filters.category === category ? 'primary' : 'outline'}
              size="sm"
              className="glass text-xs"
              onClick={() => updateFilter('category', category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="pt-4 border-t border-border/20">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{categories.length}</div>
            <div className="text-xs text-muted-foreground">Categorie disponibili</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{activeFiltersCount}</div>
            <div className="text-xs text-muted-foreground">Filtri attivi</div>
          </div>
        </div>
      </div>
    </div>
  );
}