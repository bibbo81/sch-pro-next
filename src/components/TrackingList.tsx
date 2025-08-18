'use client'

import { formatStatus } from '@/lib/statusMapping'

interface TrackingListProps {
  trackings: any[]
  onSelect: (tracking: any) => void
  selected?: any
}

export default function TrackingList({ trackings, onSelect, selected }: TrackingListProps) {
  if (!trackings.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">Nessun tracking trovato</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Lista Tracking ({trackings.length})
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {trackings.map((tracking) => {
          const { normalized, config } = formatStatus(tracking.status || tracking.current_status)
          
          return (
            <div
              key={tracking.id}
              onClick={() => onSelect(tracking)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selected?.id === tracking.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-medium text-sm">
                      {tracking.tracking_number}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                      <span className="mr-1">{config.icon}</span>
                      {config.label}
                    </span>
                  </div>
                  
                  <div className="mt-1 text-sm text-gray-500">
                    {tracking.carrier_name && (
                      <span className="mr-4">{tracking.carrier_name}</span>
                    )}
                    {tracking.origin_port && tracking.destination_port && (
                      <span>{tracking.origin_port} → {tracking.destination_port}</span>
                    )}
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-400">
                  <div>{new Date(tracking.created_at).toLocaleDateString('it-IT')}</div>
                  {tracking.eta && (
                    <div className="text-xs">
                      ETA: {new Date(tracking.eta).toLocaleDateString('it-IT')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}