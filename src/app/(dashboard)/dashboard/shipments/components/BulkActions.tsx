'use client'

import { CheckSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'

interface Props {
  count: number
  onUpdateStatus: (status: string) => void
  onClear: () => void
}

export function BulkActions({ count, onUpdateStatus, onClear }: Props) {
  if (count === 0) return null

  return (
    <GlassCard className="p-3 border-primary/20">
      <GlassCardContent className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span className="font-medium">{count} selezionate</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            onChange={(e) => {
              if (e.target.value) {
                onUpdateStatus(e.target.value)
                e.target.value = ''
              }
            }}
            className="h-8 px-2 rounded-lg border border-input bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Cambia stato...</option>
            <option value="confirmed">Confermato</option>
            <option value="shipped">Spedito</option>
            <option value="delivered">Consegnato</option>
            <option value="cancelled">Annullato</option>
          </select>

          <Button variant="ghost" size="sm" onClick={onClear} className="gap-1 text-xs">
            <X className="h-3 w-3" />
            Deseleziona
          </Button>
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}
