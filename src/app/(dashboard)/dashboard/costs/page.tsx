'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  RefreshCw, 
  DollarSign, 
  AlertCircle,
  Construction
} from 'lucide-react'

export default function CostsPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleRefresh = useCallback(() => {
    setLoading(true)
    // Simula caricamento
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accesso Richiesto</h2>
          <p className="text-gray-600">Devi effettuare il login per accedere alla gestione costi.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Costi</h1>
          <p className="text-gray-600 mt-2">
            Sistema di gestione costi • Utente: {user.email}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
        </div>
      </div>

      {/* Under Construction */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-12 text-center">
          <Construction className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">
            Sezione in Costruzione
          </h2>
          <p className="text-yellow-700 mb-6 max-w-md mx-auto">
            La gestione costi sarà integrata dal vecchio progetto HTML/JS/CSS. 
            Questa sezione verrà completata nelle prossime versioni.
          </p>
          <div className="space-y-2 text-sm text-yellow-600">
            <p>✅ Struttura base implementata</p>
            <p>🔄 Integrazione sistema legacy in corso</p>
            <p>📊 Dashboard finanziaria in sviluppo</p>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-400">---</div>
                <div className="text-sm text-gray-500">Spese Totali</div>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-400">---</div>
                <div className="text-sm text-gray-500">Ricavi</div>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-400">---</div>
                <div className="text-sm text-gray-500">Profitto</div>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-400">---</div>
                <div className="text-sm text-gray-500">Budget</div>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Development Status */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">🔧 Modalità Sviluppo</h3>
              <div className="text-xs text-blue-700 mt-1">
                <p>• User: {user.email}</p>
                <p>• Status: Pagina minimale attiva</p>
                <p>• Next: Integrazione sistema legacy HTML/JS/CSS</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}