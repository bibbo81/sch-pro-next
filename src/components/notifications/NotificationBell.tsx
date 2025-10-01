'use client'

import { useEffect, useState } from 'react'
import { Bell, MessageSquare, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
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

  useEffect(() => {
    fetchNotifications()
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [type])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=10&unread_only=false')
      const data = await response.json()

      // Filter by type
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
    return type === 'messages'
      ? 'Nessun messaggio'
      : 'Nessun aggiornamento tracking'
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          {getIcon()}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">
            {type === 'messages' ? 'Messaggi' : 'Tracking'}
          </h3>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} nuovi</Badge>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              {getIcon()}
              <p className="mt-2 text-sm">{getEmptyMessage()}</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-accent cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
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
        </ScrollArea>

        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              router.push('/dashboard/notifications')
              setIsOpen(false)
            }}
          >
            Vedi tutte le notifiche
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
