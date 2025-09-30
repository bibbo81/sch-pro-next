'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Send, User, Clock } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  message: string
  sender_id: string
  sender_type: string
  created_at: string
  sender: {
    email: string
  }
}

interface Ticket {
  id: string
  ticket_number: string
  subject: string
  description: string
  category: string
  priority: string
  status: string
  created_at: string
  ticket_messages: Message[]
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchTicket()
  }, [ticketId])

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/support-tickets/${ticketId}`)
      const data = await response.json()

      if (!response.ok) {
        router.push('/dashboard/support')
        return
      }

      setTicket(data.ticket)
    } catch (error) {
      console.error('Error fetching ticket:', error)
      router.push('/dashboard/support')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setSending(true)
    try {
      const response = await fetch(`/api/support-tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage })
      })

      if (response.ok) {
        setNewMessage('')
        fetchTicket()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return null
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/support">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna ai Ticket
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm text-gray-600">
                {ticket.ticket_number}
              </span>
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold">{ticket.subject}</h1>
            <p className="text-gray-600 mt-2">
              Categoria: {ticket.category} • Aperto il{' '}
              {new Date(ticket.created_at).toLocaleDateString('it-IT')}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="space-y-4 mb-6">
        {/* Initial description */}
        <Card>
          <CardHeader className="bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Tu</p>
                <p className="text-sm text-gray-600">
                  {new Date(ticket.created_at).toLocaleString('it-IT')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="whitespace-pre-wrap">{ticket.description}</p>
          </CardContent>
        </Card>

        {/* Messages */}
        {ticket.ticket_messages && ticket.ticket_messages.length > 0 && (
          <>
            {ticket.ticket_messages.map((message) => (
              <Card key={message.id}>
                <CardHeader className={
                  message.sender_type === 'agent'
                    ? 'bg-green-50'
                    : 'bg-gray-50'
                }>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      message.sender_type === 'agent'
                        ? 'bg-green-100'
                        : 'bg-blue-100'
                    }`}>
                      <User className={`w-5 h-5 ${
                        message.sender_type === 'agent'
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {message.sender_type === 'agent'
                          ? 'Operatore Supporto'
                          : 'Tu'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(message.created_at).toLocaleString('it-IT')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="whitespace-pre-wrap">{message.message}</p>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Reply Box */}
      {ticket.status !== 'closed' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aggiungi Messaggio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Scrivi il tuo messaggio qui..."
                rows={4}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Invio...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Invia Messaggio
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {ticket.status === 'closed' && (
        <Card className="bg-gray-50">
          <CardContent className="py-8 text-center text-gray-600">
            Questo ticket è stato chiuso. Non è possibile aggiungere nuovi messaggi.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
