interface TrackingPreviewProps {
  tracking: any
}

export default function TrackingPreview({ tracking }: TrackingPreviewProps) {
  if (!tracking) return null

  const isDelayed = tracking.eta && new Date(tracking.eta) < new Date() && 
    !['ARRIVED', 'DELIVERED'].includes(tracking.status)

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
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              Modifica
            </button>
            <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
              Elimina
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}