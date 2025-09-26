import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { X, Filter } from 'lucide-react'

interface ShipmentFiltersProps {
  statusFilter: string
  setStatusFilter: (value: string) => void
  transportModeFilter: string
  setTransportModeFilter: (value: string) => void
  supplierFilter: string
  setSupplierFilter: (value: string) => void
  onClearFilters: () => void
}

export default function ShipmentFilters({
  statusFilter,
  setStatusFilter,
  transportModeFilter,
  setTransportModeFilter,
  supplierFilter,
  setSupplierFilter,
  onClearFilters
}: ShipmentFiltersProps) {
  const hasActiveFilters = statusFilter !== 'all' || 
                          transportModeFilter !== 'all' || 
                          supplierFilter.trim() !== ''

  const activeFiltersCount = [
    statusFilter !== 'all' ? 'Stato' : null,
    transportModeFilter !== 'all' ? 'Trasporto' : null,
    supplierFilter.trim() !== '' ? 'Fornitore' : null
  ].filter(Boolean).length

  return (
    <Card className="bg-card text-card-foreground border-border">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-card-foreground">
              <Filter className="h-5 w-5" />
              Filtri
            </h3>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearFilters} 
                className="gap-2 hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Rimuovi filtri
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter" className="text-card-foreground">Stato</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background text-foreground border-border focus:ring-ring">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card text-card-foreground border-border">
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="registered">📝 Registrato</SelectItem>
                  <SelectItem value="in_transit">🚛 In Transito</SelectItem>
                  <SelectItem value="arrived">🏢 Arrivato</SelectItem>
                  <SelectItem value="customs_hold">🛃 In Dogana</SelectItem>
                  <SelectItem value="customs_cleared">✅ Sdoganato</SelectItem>
                  <SelectItem value="out_for_delivery">🚚 In Consegna</SelectItem>
                  <SelectItem value="delivered">✅ Consegnato</SelectItem>
                  <SelectItem value="delayed">⚠️ In Ritardo</SelectItem>
                  <SelectItem value="exception">❌ Eccezione</SelectItem>
                  <SelectItem value="cancelled">🚫 Annullato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transport Mode Filter */}
            <div className="space-y-2">
              <Label htmlFor="transport-filter" className="text-card-foreground">Modalità Trasporto</Label>
              <Select value={transportModeFilter} onValueChange={setTransportModeFilter}>
                <SelectTrigger className="bg-background text-foreground border-border focus:ring-ring">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card text-card-foreground border-border">
                  <SelectItem value="all">Tutte le modalità</SelectItem>
                  <SelectItem value="sea">🚢 Mare</SelectItem>
                  <SelectItem value="air">✈️ Aereo</SelectItem>
                  <SelectItem value="road">🚛 Strada</SelectItem>
                  <SelectItem value="rail">🚂 Treno</SelectItem>
                  <SelectItem value="courier">📦 Corriere</SelectItem>
                  <SelectItem value="multimodal">🔄 Multimodale</SelectItem>
                  <SelectItem value="express">⚡ Express</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Supplier Filter */}
            <div className="space-y-2">
              <Label htmlFor="supplier-filter" className="text-card-foreground">Fornitore</Label>
              <Input
                id="supplier-filter"
                value={supplierFilter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSupplierFilter(e.target.value)}
                placeholder="Cerca per fornitore..."
                className="bg-background text-foreground border-border focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>

            {/* Active Filters Indicator */}
            <div className="flex items-end">
              {hasActiveFilters ? (
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-md border border-primary/20">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro attivo' : 'filtri attivi'}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground px-3 py-2">
                  Nessun filtro applicato
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}