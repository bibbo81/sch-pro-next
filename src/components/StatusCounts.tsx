import { formatStatus } from '@/lib/statusMapping'

interface StatusCountsProps {
  trackings: any[]
}

export default function StatusCounts({ trackings }: StatusCountsProps) {
  // 🔧 USA IL MAPPING UNIFICATO
  const statusCounts: Record<string, number> = {}
  
  trackings.forEach(tracking => {
    const rawStatus = tracking.status || tracking.current_status || 'registered'
    const { normalized } = formatStatus(rawStatus)
    statusCounts[normalized] = (statusCounts[normalized] || 0) + 1
  })

  const inTransit = statusCounts.in_transit || 0
  const arrived = statusCounts.arrived || 0
  const delivered = statusCounts.delivered || 0
  
  // 🔧 CALCOLA RITARDI CON STATI NORMALIZZATI
  const delayed = trackings.filter(t => {
    if (!t.eta) return false
    const { normalized } = formatStatus(t.status || t.current_status)
    const isLate = new Date(t.eta) < new Date()
    const notDelivered = !['delivered', 'cancelled'].includes(normalized)
    return isLate && notDelivered
  }).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-3.5M4 13h3.5"/>
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Totale</p>
            <p className="text-2xl font-semibold text-gray-900">{trackings.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">In Transito</p>
            <p className="text-2xl font-semibold text-gray-900">{inTransit}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Arrivati/Consegnati</p>
            <p className="text-2xl font-semibold text-gray-900">{arrived + delivered}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">In Ritardo</p>
            <p className="text-2xl font-semibold text-gray-900">{delayed}</p>
          </div>
        </div>
      </div>
    </div>
  )
}