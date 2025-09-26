'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatStatus } from '@/lib/statusMapping'
import { Calendar, Hash, MapPin, Package, Plane, Truck, User } from 'lucide-react'

interface ShipmentCardProps {
  shipment: any
  onEdit?: (shipment: any) => void
  onDelete?: (id: string) => void
}

export default function ShipmentCard({ shipment, onEdit, onDelete }: ShipmentCardProps) {
  const { config } = formatStatus(shipment.status || shipment.current_status)

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('it-IT')
    } catch {
      return 'N/A'
    }
  }

  const getTransportIcon = () => {
    switch (shipment.transport_mode) {
      case 'air': return <Plane className="h-4 w-4" />
      case 'sea': return <Package className="h-4 w-4" />
      case 'road': return <Truck className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  return (
    <Card className="bg-card text-card-foreground border-border hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getTransportIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-card-foreground">
                {shipment.shipment_number}
              </h3>
              {shipment.tracking_number && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {shipment.tracking_number}
                </p>
              )}
            </div>
          </div>
          <Badge className={`${config.bgColor} ${config.color} border-0`}>
            <span className="mr-1">{config.icon}</span>
            {config.label}
          </Badge>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Origin/Destination */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              Rotta
            </div>
            <div className="text-sm text-card-foreground">
              <div>{shipment.origin_port || shipment.origin || 'N/A'}</div>
              <div className="text-muted-foreground">↓</div>
              <div>{shipment.destination_port || shipment.destination || 'N/A'}</div>
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-3 w-3 mr-1" />
              Fornitore
            </div>
            <div className="text-sm text-card-foreground">
              {shipment.supplier_name || 'N/A'}
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              Date
            </div>
            <div className="text-sm text-card-foreground">
              <div>Partenza: {formatDate(shipment.departure_date)}</div>
              <div>Arrivo: {formatDate(shipment.arrival_date || shipment.eta)}</div>
            </div>
          </div>

          {/* Value */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Valore</div>
            <div className="text-sm font-medium text-card-foreground">
              {shipment.total_value 
                ? `€${Number(shipment.total_value).toLocaleString()}`
                : 'N/A'
              }
            </div>
          </div>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-4 border-t border-border">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(shipment)}
                className="flex-1"
              >
                Modifica
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(shipment.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Elimina
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}