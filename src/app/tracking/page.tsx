'use client'

import { useState, useEffect } from 'react'
import TrackingForm from '@/components/TrackingForm'
import TrackingList from '@/components/TrackingList'
import TrackingPreview from '@/components/TrackingPreview'
import StatusCounts from '@/components/StatusCounts'

// Definisci il tipo per i tracking
interface Tracking {
  id: string
  tracking_number: string
  status: string
  carrier_name?: string
  tracking_type: string
  origin_port?: string
  destination_port?: string
  eta?: string
  created_at: string
  updated_at: string
  [key: string]: any // Per altre proprietà dinamiche
}

export default function TrackingPage() {
  const [trackings, setTrackings] = useState<Tracking[]>([])
  const [selectedTracking, setSelectedTracking] = useState<Tracking | null>(null)
  const [loading, setLoading] = useState(true)

  // Carica i tracking dall'API
  const loadTrackings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/trackings')
      const result = await response.json()
      
      if (result.success) {
        setTrackings(result.data)
      } else {
        console.error('Errore caricamento trackings:', result.error)
        setTrackings([])
      }
    } catch (error) {
      console.error('Errore nella richiesta:', error)
      setTrackings([])
    } finally {
      setLoading(false)
    }
  }

  // Carica i tracking al mount del componente
  useEffect(() => {
    loadTrackings()
  }, [])

  // Aggiungi nuovo tracking
  const handleAddTracking = async (newTrackingData: any) => {
    try {
      const response = await fetch('/api/trackings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTrackingData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Aggiorna la lista locale
        setTrackings(prev => [...prev, result.data])
        alert('Tracking aggiunto con successo!')
      } else {
        alert(`Errore: ${result.error}`)
      }
    } catch (error) {
      console.error('Errore aggiunta tracking:', error)
      alert('Errore di connessione')
    }
  }

  // Batch add trackings
  const handleBatchAdd = async (newTrackings: any[]) => {
    try {
      // Aggiungi ogni tracking singolarmente
      for (const trackingData of newTrackings) {
        await handleAddTracking(trackingData)
      }
      
      // Ricarica tutti i tracking per essere sicuri
      await loadTrackings()
    } catch (error) {
      console.error('Errore batch add:', error)
      alert('Errore nell\'aggiunta multipla')
    }
  }

  // Callback per eliminazione tracking
  const handleTrackingDeleted = (deletedId: string) => {
    // Rimuovi dalla lista locale
    setTrackings(prev => prev.filter(t => t.id !== deletedId))
    
    // Se era selezionato, deseleziona
    if (selectedTracking?.id === deletedId) {
      setSelectedTracking(null)
    }
  }

  // Aggiorna tracking selezionato quando la lista cambia
  useEffect(() => {
    if (selectedTracking) {
      const updatedTracking = trackings.find(t => t.id === selectedTracking.id)
      if (updatedTracking) {
        setSelectedTracking(updatedTracking)
      } else {
        setSelectedTracking(null)
      }
    }
  }, [trackings, selectedTracking])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento tracking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestione Tracking</h1>
          <button 
            onClick={loadTrackings}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            🔄 Ricarica
          </button>
        </div>
        
        {/* Status Counts */}
        <StatusCounts trackings={trackings} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <TrackingForm 
              onAdd={handleAddTracking} 
              onBatchAdd={handleBatchAdd}
            />
          </div>
          
          {/* List + Preview */}
          <div className="lg:col-span-2 space-y-6">
            <TrackingList 
              trackings={trackings}
              onSelect={setSelectedTracking}
              selected={selectedTracking}
            />
            
            {selectedTracking && (
              <TrackingPreview 
                tracking={selectedTracking}
                onDelete={handleTrackingDeleted}
              />
            )}
          </div>
        </div>
        
        {/* Footer con statistiche */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Totale tracking: {trackings.length}</span>
            <span>Ultimo aggiornamento: {new Date().toLocaleString('it-IT')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}