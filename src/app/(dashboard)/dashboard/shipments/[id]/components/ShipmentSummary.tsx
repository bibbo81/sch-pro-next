'use client'

import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { formatCurrency, formatNumber, formatWeight, formatVolume } from '@/lib/formatters'

interface Totals {
  weight: number
  volume: number
  productsCost: number
  dutiesCost: number
  transportCost: number
  additionalCost: number
  totalCost: number
  itemCount: number
}

interface Props {
  totals: Totals
}

const metrics = [
  { key: 'itemCount' as const, label: 'Prodotti', format: (v: number) => formatNumber(v) },
  { key: 'weight' as const, label: 'Peso', format: (v: number) => formatWeight(v) },
  { key: 'volume' as const, label: 'Volume', format: (v: number) => formatVolume(v) },
  { key: 'productsCost' as const, label: 'Merce', format: (v: number) => formatCurrency(v) },
  { key: 'dutiesCost' as const, label: 'Dazi', format: (v: number) => formatCurrency(v) },
  { key: 'transportCost' as const, label: 'Trasporto', format: (v: number) => formatCurrency(v) },
  { key: 'additionalCost' as const, label: 'Extra', format: (v: number) => formatCurrency(v) },
  { key: 'totalCost' as const, label: 'Totale', format: (v: number) => formatCurrency(v), highlight: true },
]

export function ShipmentSummary({ totals }: Props) {
  return (
    <GlassCard className="p-4">
      <GlassCardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {metrics.map(({ key, label, format, highlight }) => (
            <div key={key} className="text-center">
              <p className={`text-lg font-bold ${highlight ? 'text-primary' : ''}`}>
                {format(totals[key])}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}
