'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Clock, CheckCircle, XCircle, ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'

interface TicketMessage {
  id: string
  message: string
  sender_type: string
  sender_id: string
  created_at: string
  is_internal_note: boolean
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
  organization_id: string
  first_response_at: string | null
  resolved_at: string | null
  closed_at: string | null
  organizations: { name: string }
  ticket_messages: TicketMessage[]
}

export default function SuperAdminTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyMessage, setReplyMessage] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchTicket()
    }
  }, [params.id])

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/super-admin/support-tickets/${params.id}`)
      const data = await response.json()
      setTicket(data.ticket)
    } catch (error) {
      console.error('Error fetching ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return

    setSending(true)
    try {
      const response = await fetch(`/api/super-admin/support-tickets/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyMessage,
          is_internal_note: isInternalNote
        })
      })

      if (response.ok) {
        setReplyMessage('')
        setIsInternalNote(false)
        fetchTicket()
      }
    } catch (error) {
      console.error('Error sending reply:', error)
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/super-admin/support-tickets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchTicket()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    try {
      const response = await fetch(`/api/super-admin/support-tickets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority })
      })

      if (response.ok) {
        fetchTicket()
      }
    } catch (error) {
      console.error('Error updating priority:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-5 h-5 text-blue-500" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-500" />
      default:
        return <AlertCircle className="w-5 h-5" />
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

  if (!ticket) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ticket Non Trovato</h3>
            <Link href="/super-admin/support-tickets">
              <Button>Torna alla Lista</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/super-admin/support-tickets">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Lista
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm text-gray-600">{ticket.ticket_number}</span>
              <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
              <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{ticket.subject}</h1>
            <p className="text-gray-600">
              Organizzazione: <span className="font-semibold">{ticket.organizations.name}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Select value={ticket.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Aperto</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Risolto</SelectItem>
                <SelectItem value="closed">Chiuso</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ticket.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Bassa</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Ticket Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{ticket.category}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Creato il</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {new Date(ticket.created_at).toLocaleDateString('it-IT')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Prima Risposta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {ticket.first_response_at
                ? new Date(ticket.first_response_at).toLocaleDateString('it-IT')
                : 'Nessuna risposta'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Conversazione</CardTitle>
          <CardDescription>
            {ticket.ticket_messages?.length || 0} messaggi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Initial ticket description */}
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-600">Cliente (Apertura Ticket)</span>
                <span className="text-sm text-gray-500">
                  {new Date(ticket.created_at).toLocaleString('it-IT')}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* Messages */}
            {ticket.ticket_messages
              ?.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((msg) => (
                <div
                  key={msg.id}
                  className={`border-l-4 pl-4 py-2 ${
                    msg.sender_type === 'agent'
                      ? msg.is_internal_note
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-green-500'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`font-semibold ${
                        msg.sender_type === 'agent'
                          ? msg.is_internal_note
                            ? 'text-purple-600'
                            : 'text-green-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {msg.sender_type === 'agent'
                        ? msg.is_internal_note
                          ? 'Nota Interna'
                          : 'Agente di Supporto'
                        : 'Cliente'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(msg.created_at).toLocaleString('it-IT')}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      {ticket.status !== 'closed' && (
        <Card>
          <CardHeader>
            <CardTitle>Rispondi al Ticket</CardTitle>
            <CardDescription>
              Scrivi una risposta al cliente o aggiungi una nota interna
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Scrivi la tua risposta..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={6}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="internal-note"
                    checked={isInternalNote}
                    onCheckedChange={(checked) => setIsInternalNote(checked as boolean)}
                  />
                  <label
                    htmlFor="internal-note"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Nota interna (non visibile al cliente)
                  </label>
                </div>

                <Button onClick={handleSendReply} disabled={sending || !replyMessage.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? 'Invio...' : 'Invia Risposta'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
