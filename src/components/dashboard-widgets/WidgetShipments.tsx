'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import Link from 'next/link'

interface WidgetShipmentsProps {
  title: string
  metric_type: string
  data_config: any
}

interface Shipment {
  id: string
  reference_number: string
  status: string
  origin: string
  destination: string
  created_at: string
}

export default function WidgetShipments({ title, metric_type, data_config }: WidgetShipmentsProps) {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)

  const limit = data_config?.limit || 5

  useEffect(() => {
    fetchShipments()
  }, [])

  const fetchShipments = async () => {
    try {
      const response = await fetch(`/api/shipments?limit=${limit}&sort=created_at:desc`)
      const data = await response.json()
      setShipments(data.shipments || [])
    } catch (error) {
      console.error('Error fetching shipments:', error)
      setShipments([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'in_transit':
      case 'in transit':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'Consegnata'
      case 'in_transit':
      case 'in transit':
        return 'In Transito'
      case 'pending':
        return 'In Attesa'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!shipments || shipments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-2" />
            <p>Nessuna spedizione trovata</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {shipments.map((shipment) => (
            <Link
              key={shipment.id}
              href={`/dashboard/shipments/${shipment.id}`}
              className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">
                    {shipment.reference_number}
                  </div>
                  <div className="text-xs text-gray-600">
                    {shipment.origin} → {shipment.destination}
                  </div>
                </div>
                <Badge className={getStatusColor(shipment.status)}>
                  {getStatusLabel(shipment.status)}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
        <Link
          href="/dashboard/shipments"
          className="block mt-4 text-sm text-blue-600 hover:text-blue-800 text-center"
        >
          Vedi tutte le spedizioni →
        </Link>
      </CardContent>
    </Card>
  )
}
