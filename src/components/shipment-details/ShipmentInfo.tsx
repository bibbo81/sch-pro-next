'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shipment } from '@/types/shipment';
import {
  Ship,
  MapPin,
  Calendar,
  Hash,
  Building,
  Package,
  Globe,
  DollarSign,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useShipmentDetails } from '@/hooks/useShipmentDetails';

interface ShipmentInfoProps {
  shipment: Shipment;
}

export default function ShipmentInfo({ shipment }: ShipmentInfoProps) {
  const { refreshShipsGoData, autoUpdating } = useShipmentDetails(shipment.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Informazioni Generali */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Informazioni Spedizione
            </div>
            {shipment.tracking_number && (
              <Button
                variant="outline"
                size="sm"
                onClick={refreshShipsGoData}
                disabled={autoUpdating}
                className="flex items-center gap-2"
              >
                {autoUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {autoUpdating ? 'Aggiornando...' : 'Aggiorna da ShipsGo'}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge className={getStatusColor(shipment.status || '')}>
              {shipment.status?.toUpperCase() || 'N/A'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tracking Number</span>
              </div>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                {shipment.tracking_number || 'N/A'}
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Reference</span>
              </div>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                {shipment.reference_number || 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Spedizioniere</span>
              </div>
              <p className="text-sm bg-muted p-2 rounded">
                {shipment.forwarder_name || 'Non assegnato'}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Ship className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Modalità di Trasporto</span>
              </div>
              <p className="text-sm bg-muted p-2 rounded">
                {shipment.transport_mode || 'N/A'}
              </p>
            </div>
          </div>

          {(shipment.vessel_name || shipment.voyage_number) && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Ship className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Dettagli Trasporto</span>
              </div>
              <div className="space-y-1">
                {shipment.vessel_name && (
                  <p className="text-sm text-muted-foreground">
                    Vessel: {shipment.vessel_name}
                  </p>
                )}
                {shipment.voyage_number && (
                  <p className="text-sm text-muted-foreground">
                    Voyage: {shipment.voyage_number}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route & Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Route & Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Route</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-muted px-3 py-2 rounded">
                {shipment.origin_port || 'N/A'}
              </span>
              <span>→</span>
              <span className="bg-muted px-3 py-2 rounded">
                {shipment.destination_port || 'N/A'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Departure:</span>
              </div>
              <span className="text-sm font-medium">
                {formatDate(shipment.departure_date)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">ETA:</span>
              </div>
              <span className="text-sm font-medium">
                {formatDate(shipment.eta)}
              </span>
            </div>
            
            {shipment.ata && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Actual Arrival:</span>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {formatDate(shipment.ata)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Container & Cargo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Dettagli Container e Merce
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {shipment.container_number && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Tipo Container:</span>
                <p className="text-sm font-medium">{shipment.container_type || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Seal Number:</span>
                <p className="text-sm font-mono">{shipment.seal_number || 'N/A'}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Peso Totale (kg):</span>
              <p className="text-sm font-medium">
                {shipment.total_weight_kg ? `${shipment.total_weight_kg} kg` : '0 kg'}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Volume Totale (cbm):</span>
              <p className="text-sm font-medium">
                {shipment.total_volume_m3 ? `${shipment.total_volume_m3} m³` : '75 m³'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commercial Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Commercial Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm text-muted-foreground">Shipper:</span>
            <p className="text-sm font-medium">{shipment.supplier_name || 'N/A'}</p>
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground">Consignee:</span>
            <p className="text-sm font-medium">{shipment.recipient_name || 'N/A'}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Total Value:</span>
            </div>
            <span className="text-sm font-bold text-green-600">
              {formatCurrency(shipment.total_value, shipment.currency)}
            </span>
          </div>

          {shipment.incoterm && (
            <div>
              <span className="text-sm text-muted-foreground">Incoterms:</span>
              <p className="text-sm font-medium">{shipment.incoterm}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}