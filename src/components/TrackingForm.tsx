'use client'

import { useState } from 'react'

interface TrackingFormProps {
  onAdd: (tracking: any) => void
}

export default function TrackingForm({ onAdd }: TrackingFormProps) {
  const [formData, setFormData] = useState({
    tracking_number: '',
    carrier_name: '',
    origin_port: '',
    destination_port: '',
    eta: '',
    tracking_type: 'container',
    status: 'SAILING'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.tracking_number) return
    
    onAdd(formData)
    setFormData({
      tracking_number: '',
      carrier_name: '',
      origin_port: '',
      destination_port: '',
      eta: '',
      tracking_type: 'container',
      status: 'SAILING'
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Aggiungi Tracking</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numero Tracking *
          </label>
          <input
            type="text"
            name="tracking_number"
            value={formData.tracking_number}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="es. MEDU7905689"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spedizioniere
          </label>
          <input
            type="text"
            name="carrier_name"
            value={formData.carrier_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="es. MSC, MAERSK"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Porto Origine
          </label>
          <input
            type="text"
            name="origin_port"
            value={formData.origin_port}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="es. SHANGHAI"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Porto Destinazione
          </label>
          <input
            type="text"
            name="destination_port"
            value={formData.destination_port}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="es. CIVITAVECCHIA"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ETA
          </label>
          <input
            type="datetime-local"
            name="eta"
            value={formData.eta}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <select
            name="tracking_type"
            value={formData.tracking_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="container">Container</option>
            <option value="parcel">Pacco</option>
            <option value="awb">AWB</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="SAILING">In Navigazione</option>
            <option value="IN_TRANSIT">In Transito</option>
            <option value="ARRIVED">Arrivato</option>
            <option value="DELIVERED">Consegnato</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Aggiungi Tracking
        </button>
      </form>
    </div>
  )
}