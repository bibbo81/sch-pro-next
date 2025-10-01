'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, MessageSquare, Package, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  created_at: string
}

interface NotificationBellProps {
  type: 'messages' | 'tracking'
  icon?: React.ReactNode
}

export default function NotificationBell({ type, icon }: NotificationBellProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [type])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=10&unread_only=false')
      const data = await response.json()

      const filteredNotifications = (data.notifications || []).filter((n: Notification) => {
        if (type === 'messages') {
          return n.notification_type === 'ticket_response' || n.notification_type === 'ticket_status'
        } else {
          return n.notification_type === 'tracking_update'
        }
      })

      setNotifications(filteredNotifications)
      setUnreadCount(filteredNotifications.filter((n: Notification) => !n.is_read).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    if (notification.action_url) {
      router.push(notification.action_url)
    }
    setIsOpen(false)
  }

  const getIcon = () => {
    if (icon) return icon
    return type === 'messages' ? (
      <MessageSquare className="h-5 w-5" />
    ) : (
      <Package className="h-5 w-5" />
    )
  }

  const getEmptyMessage = () => {
    return type === 'messages' ? 'Nessun messaggio' : 'Nessun aggiornamento tracking'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
      >
        {getIcon()}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {type === 'messages' ? 'Messaggi' : 'Tracking'}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-medium rounded-full">
                  {unreadCount} nuovi
                </span>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                {getIcon()}
                <p className="mt-2 text-sm">{getEmptyMessage()}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString('it-IT', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                router.push('/dashboard/notifications')
                setIsOpen(false)
              }}
              className="w-full py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              Vedi tutte le notifiche
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
