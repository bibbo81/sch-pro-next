'use client'

import { Card, CardContent } from '@/components/ui/card'

interface StatusCountsProps {
  trackings: any[]
}

export default function StatusCounts({ trackings }: StatusCountsProps) {
  const counts = trackings.reduce((acc, tracking) => {
    const status = tracking.status || 'unknown'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statuses = [
    { key: 'registered', label: 'Registrati', color: 'text-gray-600', emoji: '📝' },
    { key: 'in_transit', label: 'In Transito', color: 'text-blue-600', emoji: '🚛' },
    { key: 'delivered', label: 'Consegnati', color: 'text-green-600', emoji: '✅' },
    { key: 'delayed', label: 'Ritardati', color: 'text-yellow-600', emoji: '⏰' },
    { key: 'exception', label: 'Eccezioni', color: 'text-red-600', emoji: '⚠️' }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statuses.map((status) => (
        <Card key={status.key}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{counts[status.key] || 0}</p>
                <p className={`text-sm ${status.color}`}>{status.label}</p>
              </div>
              <div className="text-2xl">{status.emoji}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}