'use client'

import { useState, useEffect } from 'react'
import { Users, Search, Filter, Download, Ban, UserX, UserCheck, Shield, Activity, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  is_active: boolean
  is_banned: boolean
  memberships: Array<{
    organization_name: string
    role: string
  }>
  activity_stats: {
    total_activities: number
    last_activity_at: string | null
  }
}

interface Stats {
  total: number
  active: number
  inactive: number
  banned: number
  with_activity: number
}

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0, banned: 0, with_activity: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [search, statusFilter, roleFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (roleFilter !== 'all') params.append('role', roleFilter)

      const res = await fetch(`/api/super-admin/users?${params.toString()}`)
      const data = await res.json()

      if (res.ok) {
        setUsers(data.users)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const selectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set())
      setShowBulkActions(false)
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)))
      setShowBulkActions(true)
    }
  }

  const handleBulkAction = async (operation: string, data?: any) => {
    if (selectedUsers.size === 0) return

    const confirmMessage = {
      ban: 'Sei sicuro di voler bannare questi utenti?',
      unban: 'Sei sicuro di voler sbannare questi utenti?',
      delete: 'ATTENZIONE: Questa azione è irreversibile! Confermi eliminazione?'
    }[operation]

    if (confirmMessage && !confirm(confirmMessage)) return

    try {
      const res = await fetch('/api/super-admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          user_ids: Array.from(selectedUsers),
          data
        })
      })

      const result = await res.json()

      if (res.ok) {
        alert(`Operazione completata: ${result.results.successful} successo, ${result.results.failed} falliti`)
        setSelectedUsers(new Set())
        setShowBulkActions(false)
        fetchUsers()
      } else {
        alert(`Errore: ${result.error}`)
      }
    } catch (error) {
      console.error('Bulk action error:', error)
      alert('Errore durante operazione bulk')
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-8 w-8" />
              Gestione Utenti
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestione completa utenti cross-organizzazione
            </p>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Esporta CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Totale Utenti</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-700 dark:text-green-400">Attivi</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-300">{stats.active}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="text-sm text-gray-600 dark:text-gray-400">Inattivi</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inactive}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="text-sm text-red-700 dark:text-red-400">Bannati</div>
          <div className="text-2xl font-bold text-red-900 dark:text-red-300">{stats.banned}</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-700 dark:text-blue-400">Con Attività</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-300">{stats.with_activity}</div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
          <div className="text-blue-900 dark:text-blue-300 font-medium">
            {selectedUsers.size} utenti selezionati
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('ban', { ban_duration: 24 })}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <Ban className="h-4 w-4" />
              Banna (24h)
            </button>
            <button
              onClick={() => handleBulkAction('unban')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Sbanna
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <UserX className="h-4 w-4" />
              Elimina
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per email o organizzazione..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tutti gli stati</option>
              <option value="active">Attivi</option>
              <option value="inactive">Inattivi</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tutti i ruoli</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === users.length && users.length > 0}
                    onChange={selectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Organizzazioni
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Attività
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ultimo Accesso
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Caricamento...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Nessun utente trovato
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.email}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Creato: {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {user.memberships.map((m, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {m.organization_name}
                            </span>
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                              {m.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.activity_stats.total_activities} azioni
                      </div>
                      {user.activity_stats.last_activity_at && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Ultima: {formatDate(user.activity_stats.last_activity_at)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {formatDate(user.last_sign_in_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/super-admin/users/${user.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-sm"
                      >
                        <Activity className="h-4 w-4" />
                        Dettagli
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
