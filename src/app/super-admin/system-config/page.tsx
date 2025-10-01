'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Flag,
  Key,
  Clock,
  Database,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Upload
} from 'lucide-react'

interface FeatureFlag {
  id: string
  feature_key: string
  feature_name: string
  description: string
  category: string
  scope: string
  is_enabled: boolean
  organization_id: string | null
}

interface ApiKey {
  id: string
  key_name: string
  service_name: string
  description: string
  scope: string
  is_active: boolean
  last_used_at: string | null
  decrypted_value?: string
}

interface RateLimit {
  id: string
  limit_name: string
  endpoint_pattern: string
  max_requests: number
  window_seconds: number
  is_active: boolean
  scope: string
}

interface ConfigBackup {
  id: string
  backup_name: string
  description: string
  backup_type: string
  created_at: string
  is_restored: boolean
  status: string
}

export default function SystemConfigPage() {
  const [activeTab, setActiveTab] = useState<'flags' | 'keys' | 'limits' | 'backups'>('flags')
  const [loading, setLoading] = useState(true)

  // Feature Flags state
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [flagsStats, setFlagsStats] = useState<any>({})

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [keysStats, setKeysStats] = useState<any>({})
  const [showValues, setShowValues] = useState(false)

  // Rate Limits state
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([])
  const [limitsStats, setLimitsStats] = useState<any>({})

  // Backups state
  const [backups, setBackups] = useState<ConfigBackup[]>([])
  const [backupsStats, setBackupsStats] = useState<any>({})

  useEffect(() => {
    loadData()
  }, [activeTab, showValues])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'flags') {
        const res = await fetch('/api/super-admin/feature-flags')
        const data = await res.json()
        setFlags(data.flags || [])
        setFlagsStats(data.stats || {})
      } else if (activeTab === 'keys') {
        const res = await fetch(`/api/super-admin/api-keys?show_values=${showValues}`)
        const data = await res.json()
        setApiKeys(data.keys || [])
        setKeysStats(data.stats || {})
      } else if (activeTab === 'limits') {
        const res = await fetch('/api/super-admin/rate-limits')
        const data = await res.json()
        setRateLimits(data.limits || [])
        setLimitsStats(data.stats || {})
      } else if (activeTab === 'backups') {
        const res = await fetch('/api/super-admin/config-backups')
        const data = await res.json()
        setBackups(data.backups || [])
        setBackupsStats(data.stats || {})
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFlag = async (flagId: string, currentState: boolean) => {
    try {
      await fetch(`/api/super-admin/feature-flags/${flagId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: !currentState })
      })
      loadData()
    } catch (error) {
      console.error('Error toggling flag:', error)
    }
  }

  const createBackup = async () => {
    const name = prompt('Nome backup:')
    if (!name) return

    try {
      await fetch('/api/super-admin/config-backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backup_name: name,
          description: 'Manual backup from UI'
        })
      })
      loadData()
      alert('Backup creato con successo!')
    } catch (error) {
      console.error('Error creating backup:', error)
      alert('Errore creazione backup')
    }
  }

  const restoreBackup = async (backupId: string) => {
    if (!confirm('ATTENZIONE: Questa azione ripristinerà la configurazione. Continuare?')) return

    try {
      await fetch(`/api/super-admin/config-backups/${backupId}/restore`, {
        method: 'POST'
      })
      alert('Backup ripristinato con successo!')
      loadData()
    } catch (error) {
      console.error('Error restoring backup:', error)
      alert('Errore ripristino backup')
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Mai'
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/super-admin"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ArrowLeft className="h-6 w-6 text-gray-900 dark:text-white" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              System Configuration
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestione feature flags, API keys, rate limiting e backup
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('flags')}
            className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'flags'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Flag className="h-4 w-4" />
            Feature Flags
            {flagsStats.total > 0 && (
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-0.5 rounded-full text-xs">
                {flagsStats.total}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'keys'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Key className="h-4 w-4" />
            API Keys
            {keysStats.total > 0 && (
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-0.5 rounded-full text-xs">
                {keysStats.total}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('limits')}
            className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'limits'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock className="h-4 w-4" />
            Rate Limits
            {limitsStats.total > 0 && (
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-0.5 rounded-full text-xs">
                {limitsStats.total}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('backups')}
            className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'backups'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Database className="h-4 w-4" />
            Backups
            {backupsStats.total > 0 && (
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-0.5 rounded-full text-xs">
                {backupsStats.total}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Feature Flags Tab */}
      {activeTab === 'flags' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Abilitate:</span>
                <span className="ml-2 font-bold text-green-600 dark:text-green-400">{flagsStats.enabled || 0}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Disabilitate:</span>
                <span className="ml-2 font-bold text-gray-900 dark:text-white">{flagsStats.disabled || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Feature</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Categoria</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Scope</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stato</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Caricamento...</td></tr>
                ) : flags.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nessun feature flag</td></tr>
                ) : (
                  flags.map((flag) => (
                    <tr key={flag.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">{flag.feature_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{flag.feature_key}</div>
                        {flag.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{flag.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                          {flag.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900 dark:text-white">{flag.scope}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleFlag(flag.id, flag.is_enabled)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            flag.is_enabled
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {flag.is_enabled ? 'Abilitata' : 'Disabilitata'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'keys' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Attive:</span>
                <span className="ml-2 font-bold text-green-600 dark:text-green-400">{keysStats.active || 0}</span>
              </div>
            </div>
            <button
              onClick={() => setShowValues(!showValues)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              {showValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showValues ? 'Nascondi Valori' : 'Mostra Valori'}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Servizio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Scope</th>
                  {showValues && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Valore</th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ultimo Uso</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr><td colSpan={showValues ? 6 : 5} className="px-4 py-8 text-center text-gray-500">Caricamento...</td></tr>
                ) : apiKeys.length === 0 ? (
                  <tr><td colSpan={showValues ? 6 : 5} className="px-4 py-8 text-center text-gray-500">Nessuna API key</td></tr>
                ) : (
                  apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">{key.key_name}</div>
                        {key.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{key.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{key.service_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{key.scope}</td>
                      {showValues && (
                        <td className="px-4 py-3">
                          <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                            {key.decrypted_value || '***'}
                          </code>
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(key.last_used_at)}</td>
                      <td className="px-4 py-3">
                        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rate Limits Tab */}
      {activeTab === 'limits' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Attivi:</span>
              <span className="ml-2 font-bold text-green-600 dark:text-green-400">{limitsStats.active || 0}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Endpoint</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Limite</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Scope</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Caricamento...</td></tr>
                ) : rateLimits.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nessun rate limit</td></tr>
                ) : (
                  rateLimits.map((limit) => (
                    <tr key={limit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{limit.limit_name}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                          {limit.endpoint_pattern}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {limit.max_requests} req / {limit.window_seconds}s
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{limit.scope}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          limit.is_active
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {limit.is_active ? 'Attivo' : 'Inattivo'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Totali:</span>
                <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">{backupsStats.total || 0}</span>
              </div>
            </div>
            <button
              onClick={createBackup}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Crea Backup
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Creato</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stato</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Caricamento...</td></tr>
                ) : backups.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nessun backup</td></tr>
                ) : (
                  backups.map((backup) => (
                    <tr key={backup.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">{backup.backup_name}</div>
                        {backup.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{backup.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                          {backup.backup_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(backup.created_at)}</td>
                      <td className="px-4 py-3">
                        {backup.is_restored ? (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                            Ripristinato
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                            Disponibile
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => restoreBackup(backup.id)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 flex items-center gap-1 text-sm"
                        >
                          <Upload className="h-4 w-4" />
                          Ripristina
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
