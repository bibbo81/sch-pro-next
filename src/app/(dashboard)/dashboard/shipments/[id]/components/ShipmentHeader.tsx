'use client'

import { ArrowLeft, Edit, Save, Ship, Truck, Plane, Package, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { normalizeStatus, getStatusConfig } from '@/lib/statusMapping'
import { useState } from 'react'

interface Shipment {
  id: string
  status: string
  transport_mode: string
  reference_number?: string
  shipment_number?: string
  supplier_name?: string
  carrier?: string
  carrier_name?: string
  [key: string]: any
}

interface Props {
  shipment: Shipment
  autoUpdating: boolean
  onBack: () => void
  onStatusChange: (newStatus: string) => Promise<void>
  onAutoUpdate: () => void
}

const TRANSPORT_ICONS: Record<string, typeof Ship> = {
  sea: Ship,
  road: Truck,
  air: Plane,
  rail: Package,
}

export function ShipmentHeader({ shipment, autoUpdating, onBack, onStatusChange, onAutoUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(shipment.status || 'pending')

  const normalized = normalizeStatus(shipment.status || 'pending')
  const statusCfg = getStatusConfig(normalized)
  const TransportIcon = TRANSPORT_ICONS[shipment.transport_mode] || Package

  const handleSave = async () => {
    await onStatusChange(editValue)
    setEditing(false)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 shrink-0 mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <TransportIcon className="h-5 w-5 text-primary shrink-0" />
            <h1 className="text-xl font-bold tracking-tight">
              {shipment.reference_number || shipment.shipment_number || 'Spedizione'}
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {!editing ? (
              <>
                <Badge variant={statusCfg.badgeVariant as any}>
                  {statusCfg.label}
                </Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditing(true); setEditValue(shipment.status || 'pending') }}>
                  <Edit className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Select value={editValue} onValueChange={setEditValue}>
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">In attesa</SelectItem>
                    <SelectItem value="registered">Registrato</SelectItem>
                    <SelectItem value="in_transit">In transito</SelectItem>
                    <SelectItem value="delivered">Consegnato</SelectItem>
                    <SelectItem value="exception">Eccezione</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave}>
                  <Save className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            {shipment.supplier_name && (
              <span className="text-xs text-muted-foreground">{shipment.supplier_name}</span>
            )}
            {(shipment.carrier || shipment.carrier_name) && (
              <span className="text-xs text-muted-foreground">&middot; {shipment.carrier || shipment.carrier_name}</span>
            )}
          </div>
        </div>
      </div>

      <Button
        variant="glass"
        size="sm"
        onClick={onAutoUpdate}
        disabled={autoUpdating}
        className="gap-2"
      >
        {autoUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        Aggiorna
      </Button>
    </div>
  )
}
