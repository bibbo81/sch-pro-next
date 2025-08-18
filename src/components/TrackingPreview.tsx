import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface TrackingPreviewProps {
  tracking: any
  onDelete?: (id: string) => void
  onUpdate?: (id: string, data: any) => void
}

export default function TrackingPreview({ tracking, onDelete, onUpdate }: TrackingPreviewProps) {
  const [deleting, setDeleting] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [editFormData, setEditFormData] = useState({
    tracking_number: tracking?.tracking_number || '',
    carrier_name: tracking?.carrier_name || '',
    origin_port: tracking?.origin_port || '',
    destination_port: tracking?.destination_port || '',
    eta: tracking?.eta ? new Date(tracking.eta).toISOString().slice(0, 16) : '',
    status: tracking?.status || 'SAILING',
    reference_number: tracking?.reference_number || '',
    transport_company: tracking?.transport_company || '',
    total_weight_kg: tracking?.total_weight_kg?.toString() || '',
    total_volume_cbm: tracking?.total_volume_cbm?.toString() || '',
    bl_number: tracking?.bl_number || '',
    flight_number: tracking?.flight_number || ''
  })
  
  if (!tracking) return null

  const isDelayed = tracking.eta && new Date(tracking.eta) < new Date() && 
    !['ARRIVED', 'DELIVERED'].includes(tracking.status)

  const inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  const selectClassName = "w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

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
        if (onDelete) {
          onDelete(tracking.id)
        } else {
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    
    try {
      const updateData = {
        tracking_number: editFormData.tracking_number,
        carrier_name: editFormData.carrier_name,
        origin_port: editFormData.origin_port,
        destination_port: editFormData.destination_port,
        eta: editFormData.eta || null,
        status: editFormData.status,
        reference_number: editFormData.reference_number,
        transport_company: editFormData.transport_company,
        total_weight_kg: editFormData.total_weight_kg ? parseFloat(editFormData.total_weight_kg) : null,
        total_volume_cbm: editFormData.total_volume_cbm ? parseFloat(editFormData.total_volume_cbm) : null,
        bl_number: editFormData.bl_number,
        flight_number: editFormData.flight_number
      }

      const response = await fetch(`/api/trackings/${tracking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()

      if (result.success) {
        if (onUpdate) {
          onUpdate(tracking.id, result.data)
        } else {
          window.location.reload()
        }
        setIsEditModalOpen(false)
        alert('Tracking aggiornato con successo!')
      } else {
        alert(`Errore: ${result.error}`)
      }
    } catch (error) {
      console.error('Errore aggiornamento:', error)
      alert('Errore di connessione')
    } finally {
      setUpdating(false)
    }
  }

  const handleEdit = () => {
    setEditFormData({
      tracking_number: tracking.tracking_number || '',
      carrier_name: tracking.carrier_name || '',
      origin_port: tracking.origin_port || '',
      destination_port: tracking.destination_port || '',
      eta: tracking.eta ? new Date(tracking.eta).toISOString().slice(0, 16) : '',
      status: tracking.status || 'SAILING',
      reference_number: tracking.reference_number || '',
      transport_company: tracking.transport_company || '',
      total_weight_kg: tracking.total_weight_kg?.toString() || '',
      total_volume_cbm: tracking.total_volume_cbm?.toString() || '',
      bl_number: tracking.bl_number || '',
      flight_number: tracking.flight_number || ''
    })
    setIsEditModalOpen(true)
  }

  return (
    <>
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

          <div className="pt-2">
            {tracking.metadata?.is_api_tracked ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                🔴 Live API
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                📝 Manuale
              </span>
            )}
          </div>
          
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

      {/* 🔧 MODALE MODIFICA NATIVA (senza Dialog UI) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Modifica Tracking</h3>
                  <p className="text-sm text-gray-600">
                    Modifica i dati del tracking {tracking.tracking_number}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  disabled={updating}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tracking Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numero Tracking *
                    </label>
                    <input
                      type="text"
                      value={editFormData.tracking_number}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, tracking_number: e.target.value }))}
                      className={inputClassName}
                      required
                    />
                  </div>

                  {/* Carrier */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spedizioniere
                    </label>
                    <input
                      type="text"
                      value={editFormData.carrier_name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, carrier_name: e.target.value }))}
                      className={inputClassName}
                      placeholder="es. MSC, MAERSK, DHL, FedEx"
                    />
                  </div>

                  {/* Origin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Porto/Hub Origine
                    </label>
                    <input
                      type="text"
                      value={editFormData.origin_port}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, origin_port: e.target.value }))}
                      className={inputClassName}
                      placeholder="es. SHANGHAI, MXP (Milano)"
                    />
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Porto/Hub Destinazione
                    </label>
                    <input
                      type="text"
                      value={editFormData.destination_port}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, destination_port: e.target.value }))}
                      className={inputClassName}
                      placeholder="es. CIVITAVECCHIA, LIN (Milano)"
                    />
                  </div>

                  {/* ETA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ETA
                    </label>
                    <input
                      type="datetime-local"
                      value={editFormData.eta}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, eta: e.target.value }))}
                      className={inputClassName}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                      className={selectClassName}
                    >
                      <option value="SAILING">🚢 In Navigazione</option>
                      <option value="IN_TRANSIT">🚛 In Transito</option>
                      <option value="ARRIVED">📍 Arrivato</option>
                      <option value="DELIVERED">✅ Consegnato</option>
                      <option value="EXCEPTION">⚠️ Eccezione</option>
                      <option value="PENDING">⏳ In Attesa</option>
                      <option value="LOADING">📦 In Carico</option>
                      <option value="CUSTOMS">🛃 In Dogana</option>
                    </select>
                  </div>

                  {/* Reference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Riferimento
                    </label>
                    <input
                      type="text"
                      value={editFormData.reference_number}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                      className={inputClassName}
                      placeholder="Es. PO-123, Cliente ABC"
                    />
                  </div>

                  {/* Transport Company */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compagnia Trasporto
                    </label>
                    <input
                      type="text"
                      value={editFormData.transport_company}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, transport_company: e.target.value }))}
                      className={inputClassName}
                      placeholder="Es. MSC, Lufthansa Cargo"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.total_weight_kg}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, total_weight_kg: e.target.value }))}
                      className={inputClassName}
                      placeholder="0.00"
                    />
                  </div>

                  {/* Volume */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Volume (cbm)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.total_volume_cbm}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, total_volume_cbm: e.target.value }))}
                      className={inputClassName}
                      placeholder="0.00"
                    />
                  </div>

                  {/* B/L */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      B/L Number
                    </label>
                    <input
                      type="text"
                      value={editFormData.bl_number}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, bl_number: e.target.value }))}
                      className={inputClassName}
                      placeholder="Solo per Marittimo"
                    />
                  </div>

                  {/* Flight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numero Volo
                    </label>
                    <input
                      type="text"
                      value={editFormData.flight_number}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, flight_number: e.target.value }))}
                      className={inputClassName}
                      placeholder="Solo per Aereo"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={updating}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updating ? '⏳ Salvando...' : '💾 Salva Modifiche'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}