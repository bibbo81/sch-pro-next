'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  Shield,
  Activity,
  Ban,
  UserCheck,
  Trash2,
  Building2
} from 'lucide-react'
import Link from 'next/link'

interface UserDetails {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  is_active: boolean
  is_banned: boolean
  memberships: Array<{
    organization_name: string
    organization_slug: string
    role: string
    restrict_to_own_records: boolean
    joined_at: string
  }>
  activity_stats: {
    total_activities: number
    successful_activities: number
    failed_activities: number
    last_activity_at: string | null
  }
}

interface ActivityLog {
  id: string
  action: string
  resource_type: string
  resource_id: string | null
  status: string
  created_at: string
  duration_ms: number | null
  details: any
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<UserDetails | null>(null)
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [activityStats, setActivityStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activityFilter, setActivityFilter] = useState<string>('all')

  useEffect(() => {
    if (userId) {
      fetchUserDetails()
      fetchUserActivity()
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchUserActivity()
    }
  }, [activityFilter])

  const fetchUserDetails = async () => {
    try {
      const res = await fetch(`/api/super-admin/users/${userId}`)
      const data = await res.json()

      if (res.ok) {
        setUser(data.user)
      } else {
        alert('Errore caricamento utente')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserActivity = async () => {
    try {
      const params = new URLSearchParams()
      if (activityFilter !== 'all') {
        params.append('status', activityFilter)
      }

      const res = await fetch(`/api/super-admin/users/${userId}/activity?${params.toString()}`)
      const data = await res.json()

      if (res.ok) {
        setActivities(data.activities)
        setActivityStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching activity:', error)
    }
  }

  const handleBanUser = async () => {
    if (!confirm('Sei sicuro di voler bannare questo utente per 24 ore?')) return

    try {
      const res = await fetch(`/api/super-admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ban_duration: 24 })
      })

      if (res.ok) {
        alert('Utente bannato con successo')
        fetchUserDetails()
      } else {
        alert('Errore durante ban')
      }
    } catch (error) {
      console.error('Error banning user:', error)
    }
  }

  const handleUnbanUser = async () => {
    try {
      const res = await fetch(`/api/super-admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ban_duration: null })
      })

      if (res.ok) {
        alert('Utente sbannato con successo')
        fetchUserDetails()
      } else {
        alert('Errore durante unban')
      }
    } catch (error) {
      console.error('Error unbanning user:', error)
    }
  }

  const handleDeleteUser = async () => {
    if (!confirm('ATTENZIONE: Eliminazione permanente! Confermi?')) return
    if (!confirm('Sei ASSOLUTAMENTE SICURO? Questa azione è IRREVERSIBILE!')) return

    try {
      const res = await fetch(`/api/super-admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('Utente eliminato')
        router.push('/super-admin/users')
      } else {
        alert('Errore durante eliminazione')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
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

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'text-green-600 dark:text-green-400'
    if (action.includes('update')) return 'text-blue-600 dark:text-blue-400'
    if (action.includes('delete')) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      failed: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
      error: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
    }
    return colors[status as keyof typeof colors] || colors.success
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Caricamento...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Utente non trovato</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/super-admin/users"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {user.email}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Dettagli utente e cronologia attività
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {user.is_banned ? (
            <button
              onClick={handleUnbanUser}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Sbanna Utente
            </button>
          ) : (
            <button
              onClick={handleBanUser}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <Ban className="h-4 w-4" />
              Banna (24h)
            </button>
          )}
          <button
            onClick={handleDeleteUser}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Elimina
          </button>
        </div>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Informazioni Base
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
              <div className="text-gray-900 dark:text-white font-medium">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Stato</div>
              <div>
                {user.is_banned ? (
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-xs font-medium">
                    Bannato
                  </span>
                ) : user.is_active ? (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                    Attivo
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                    Inattivo
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Creato il</div>
              <div className="text-gray-900 dark:text-white">{formatDate(user.created_at)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ultimo Accesso</div>
              <div className="text-gray-900 dark:text-white">{formatDate(user.last_sign_in_at)}</div>
            </div>
          </div>
        </div>

        {/* Organizations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organizzazioni ({user.memberships.length})
          </h2>
          <div className="space-y-3">
            {user.memberships.map((m, idx) => (
              <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white">{m.organization_name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                    {m.role}
                  </span>
                  {m.restrict_to_own_records && (
                    <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs">
                      Restricted
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Membro dal: {formatDate(m.joined_at)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Statistiche Attività
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Totale Azioni</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.activity_stats.total_activities}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Successi</div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {user.activity_stats.successful_activities}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Errori</div>
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {user.activity_stats.failed_activities}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ultima Attività</div>
              <div className="text-gray-900 dark:text-white text-sm">
                {formatDate(user.activity_stats.last_activity_at)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Cronologia Attività
            </h2>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tutte</option>
              <option value="success">Solo Successi</option>
              <option value="failed">Solo Falliti</option>
              <option value="error">Solo Errori</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nessuna attività trovata
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${getActionColor(activity.action)}`}>
                        {activity.action}
                      </span>
                      {activity.resource_type && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          on {activity.resource_type}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(activity.created_at)}
                      {activity.duration_ms && (
                        <span className="ml-2">• {activity.duration_ms}ms</span>
                      )}
                    </div>
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer">
                          Mostra dettagli
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                          {JSON.stringify(activity.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
