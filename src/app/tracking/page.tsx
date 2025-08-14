'use client'

import { useState } from 'react'
import TrackingForm from '@/components/TrackingForm'
import TrackingList from '@/components/TrackingList'
import TrackingPreview from '@/components/TrackingPreview'
import StatusCounts from '@/components/StatusCounts'

export default function TrackingPage() {
  const [trackings, setTrackings] = useState([
    {
      id: '1',
      tracking_number: 'MEDU7905689',
      status: 'SAILING',
      carrier_name: 'MSC',
      origin_port: 'SHANGHAI',
      destination_port: 'CIVITAVECCHIA',
      eta: '2025-08-16T10:00:00Z',
      tracking_type: 'container'
    },
    {
      id: '2', 
      tracking_number: 'MRKU2556409',
      status: 'ARRIVED',
      carrier_name: 'MAERSK LINE',
      origin_port: 'TANJUNG PELEPAS',
      destination_port: 'SAN JUAN',
      eta: '2025-09-10T16:00:00Z',
      tracking_type: 'container'
    }
  ])

  const [selectedTracking, setSelectedTracking] = useState<any>(null)

  // ✅ AGGIUNGI IL TIPO AL PARAMETRO
  const handleAddTracking = (newTracking: any) => {
    setTrackings([...trackings, { ...newTracking, id: Date.now().toString() }])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestione Tracking</h1>
        
        {/* Status Counts */}
        <StatusCounts trackings={trackings} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <TrackingForm onAdd={handleAddTracking} />
          </div>
          
          {/* List + Preview */}
          <div className="lg:col-span-2 space-y-6">
            <TrackingList 
              trackings={trackings}
              onSelect={setSelectedTracking}
              selected={selectedTracking}
            />
            
            {selectedTracking && (
              <TrackingPreview tracking={selectedTracking} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}