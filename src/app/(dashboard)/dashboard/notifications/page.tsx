'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  title: string
  message: string
  notification_type: string
  related_type: string | null
  related_id: string | null
  action_url: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams()
      if (filter === 'unread') params.append('unread_only', 'true')

      const response = await fetch(`/api/notifications?${params}`)
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST'
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }

    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ticket_response':
        return '💬'
      case 'ticket_status':
        return '📋'
      case 'system':
        return '⚙️'
      default:
        return '🔔'
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifiche</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {unreadCount > 0
                ? `Hai ${unreadCount} notifiche non lette`
                : 'Tutte le notifiche sono state lette'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              Tutte
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
            >
              Non lette
            </Button>
            {unreadCount > 0 && (
              <Button variant="ghost" onClick={markAllAsRead}>
                <CheckCheck className="w-4 h-4 mr-2" />
                Segna tutte come lette
              </Button>
            )}
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nessuna Notifica</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'unread'
                ? 'Non hai notifiche non lette'
                : 'Non hai ancora ricevuto notifiche'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer hover:shadow-lg transition-shadow ${
                !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getNotificationIcon(notification.notification_type)}</span>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1 flex items-center gap-2">
                        {notification.title}
                        {!notification.is_read && (
                          <Badge variant="default" className="text-xs">Nuovo</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {notification.message}
                      </CardDescription>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(notification.created_at).toLocaleString('it-IT')}
                      </p>
                    </div>
                  </div>

                  {notification.action_url && (
                    <ExternalLink className="w-5 h-5 text-gray-400 ml-4" />
                  )}
                </div>
              </CardHeader>

              {!notification.is_read && (
                <CardContent className="pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      markAsRead(notification.id)
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Segna come letta
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
