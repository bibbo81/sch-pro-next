'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth()
  const [updating, setUpdating] = useState(false)

  const handleSignOut = async () => {
    setUpdating(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Errore durante il logout:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="p-6">Caricamento...</div>
  if (!user) return <div className="p-6">Accesso richiesto</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Impostazioni</h1>

      {/* Sezione Profilo */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Profilo Utente</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 p-3 bg-gray-50 rounded border">
              {user.email}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Utente</label>
            <div className="mt-1 p-3 bg-gray-50 rounded border font-mono text-xs">
              {user.id}
            </div>
          </div>
        </div>
      </div>

      {/* Sezione Account */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Account</h2>
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleSignOut}
            disabled={updating}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {updating ? 'Disconnessione...' : 'Disconnetti'}
          </button>
        </div>
      </div>

      {/* Sezione Info App */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Informazioni App</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Versione:</strong> 1.0.0</p>
          <p><strong>Ambiente:</strong> {process.env.NODE_ENV}</p>
          <p><strong>Ultima build:</strong> {new Date().toLocaleDateString('it-IT')}</p>
        </div>
      </div>
    </div>
  )
}