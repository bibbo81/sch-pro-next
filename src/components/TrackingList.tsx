interface TrackingListProps {
  trackings: any[]
  onSelect: (tracking: any) => void
  selected: any
}

export default function TrackingList({ trackings, onSelect, selected }: TrackingListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SAILING':
      case 'IN_TRANSIT':
        return 'bg-yellow-100 text-yellow-800'
      case 'ARRIVED':
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Lista Tracking</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {trackings.map((tracking) => (
          <div
            key={tracking.id}
            onClick={() => onSelect(tracking)}
            className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
              selected?.id === tracking.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {tracking.tracking_number}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tracking.status)}`}>
                    {tracking.status}
                  </span>
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Spedizioniere:</span> {tracking.carrier_name || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Tipo:</span> {tracking.tracking_type}
                  </div>
                  <div>
                    <span className="font-medium">Da:</span> {tracking.origin_port || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">A:</span> {tracking.destination_port || 'N/A'}
                  </div>
                </div>
                
                {tracking.eta && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">ETA:</span> {new Date(tracking.eta).toLocaleDateString('it-IT')}
                  </div>
                )}
              </div>
              
              <div className="ml-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {trackings.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          <p>Nessun tracking presente</p>
        </div>
      )}
    </div>
  )
}