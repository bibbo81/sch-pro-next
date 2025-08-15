import { useState } from 'react'

interface TrackingPreviewProps {
  tracking: any
  onDelete?: (id: string) => void // Callback per aggiornare la lista padre
}

export default function TrackingPreview({ tracking, onDelete }: TrackingPreviewProps) {
  const [deleting, setDeleting] = useState(false)
  
  if (!tracking) return null

  const isDelayed = tracking.eta && new Date(tracking.eta) < new Date() && 
    !['ARRIVED', 'DELIVERED'].includes(tracking.status)

  const handleDelete = async () => {
    if (!confirm(`Sei sicuro di voler eliminare il tracking ${tracking.tracking_number}?`)) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/trackings?id=${tracking.id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Chiama il callback per aggiornare la lista padre
        if (onDelete) {
          onDelete(tracking.id)
        } else {
          // Se non c'è callback, ricarica la pagina
          window.location.reload()
        }
        
        alert('Tracking eliminato con successo!')
      } else {
        alert(`Errore: ${result.error}`)
      }
    } catch (error) {
      console.error('Errore eliminazione:', error)
      alert('Errore di connessione')
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = () => {
    // TODO: Implementa la modifica
    alert('Funzione modifica non ancora implementata')
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Preview Live</h2>
        {isDelayed && (
          <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
            In Ritardo
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tracking Number</label>
            <p className="mt-1 text-lg font-mono text-gray-900">{tracking.tracking_number}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <p className="mt-1 text-lg text-gray-900">{tracking.status}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Spedizioniere</label>
            <p className="mt-1 text-gray-900">{tracking.carrier_name || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <p className="mt-1 text-gray-900">{tracking.tracking_type}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Porto Origine</label>
            <p className="mt-1 text-gray-900">{tracking.origin_port || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Porto Destinazione</label>
            <p className="mt-1 text-gray-900">{tracking.destination_port || 'N/A'}</p>
          </div>
        </div>
        
        {tracking.eta && (
          <div>
            <label className="block text-sm font-medium text-gray-700">ETA</label>
            <p className="mt-1 text-gray-900">
              {new Date(tracking.eta).toLocaleString('it-IT')}
            </p>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <button 
              onClick={handleEdit}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              ✏️ Modifica
            </button>
            <button 
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? '⏳ Eliminando...' : '🗑️ Elimina'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}