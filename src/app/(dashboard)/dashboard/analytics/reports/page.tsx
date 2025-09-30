'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Plus,
  Calendar,
  Mail,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface ScheduledReport {
  id: string
  name: string
  description: string
  report_type: string
  frequency: string
  schedule_day: number | null
  schedule_time: string
  timezone: string
  recipients: string[]
  metrics: string[]
  date_range: string
  format: string
  is_active: boolean
  last_sent_at: string | null
  next_scheduled_at: string | null
  created_at: string
}

export default function ScheduledReportsPage() {
  const [reports, setReports] = useState<ScheduledReport[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    report_type: 'monthly_summary',
    frequency: 'monthly',
    schedule_day: 1,
    schedule_time: '09:00',
    timezone: 'Europe/Rome',
    recipients: '',
    metrics: ['shipments', 'products', 'costs'],
    date_range: 'last_month',
    format: 'pdf'
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analytics/reports')
      const data = await response.json()
      setReports(data.reports || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReport = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newReport,
          recipients: newReport.recipients.split(',').map(e => e.trim()).filter(e => e)
        })
      })

      if (response.ok) {
        setIsCreateOpen(false)
        fetchReports()
        setNewReport({
          name: '',
          description: '',
          report_type: 'monthly_summary',
          frequency: 'monthly',
          schedule_day: 1,
          schedule_time: '09:00',
          timezone: 'Europe/Rome',
          recipients: '',
          metrics: ['shipments', 'products', 'costs'],
          date_range: 'last_month',
          format: 'pdf'
        })
      } else {
        const error = await response.json()
        alert(`Errore: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating report:', error)
      alert('Errore durante la creazione del report')
    } finally {
      setIsCreating(false)
    }
  }

  const handleToggleActive = async (reportId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/analytics/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (response.ok) {
        fetchReports()
      }
    } catch (error) {
      console.error('Error toggling report:', error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Mai'
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: 'Giornaliero',
      weekly: 'Settimanale',
      monthly: 'Mensile',
      quarterly: 'Trimestrale'
    }
    return labels[frequency] || frequency
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Report Automatici</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configura report periodici inviati automaticamente via email
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/analytics">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Report
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
              Nessun report configurato
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Crea il tuo primo report automatico
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crea Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id} className={report.is_active ? '' : 'opacity-60'}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{report.name}</h3>
                      <Badge variant={report.is_active ? 'default' : 'secondary'}>
                        {report.is_active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Attivo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Disattivato
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline">
                        {getFrequencyLabel(report.frequency)}
                      </Badge>
                    </div>

                    {report.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {report.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">Orario</span>
                        </div>
                        <p className="font-medium">{report.schedule_time}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Mail className="w-4 h-4" />
                          <span className="text-xs">Destinatari</span>
                        </div>
                        <p className="font-medium">{report.recipients.length} email</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs">Ultimo invio</span>
                        </div>
                        <p className="font-medium">{formatDate(report.last_sent_at)}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs">Prossimo invio</span>
                        </div>
                        <p className="font-medium">
                          {report.is_active ? formatDate(report.next_scheduled_at) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {report.format.toUpperCase()}
                      </Badge>
                      {report.metrics.map((metric) => (
                        <Badge key={metric} variant="outline" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(report.id, report.is_active)}
                    >
                      {report.is_active ? 'Disattiva' : 'Attiva'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Report Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crea Nuovo Report Automatico</DialogTitle>
            <DialogDescription>
              Configura un report che verrà generato e inviato automaticamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Report *</Label>
              <Input
                id="name"
                placeholder="es. Report Mensile Spedizioni"
                value={newReport.name}
                onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                placeholder="Breve descrizione del report"
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequenza *</Label>
                <Select
                  value={newReport.frequency}
                  onValueChange={(value) => setNewReport({ ...newReport, frequency: value })}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Giornaliero</SelectItem>
                    <SelectItem value="weekly">Settimanale</SelectItem>
                    <SelectItem value="monthly">Mensile</SelectItem>
                    <SelectItem value="quarterly">Trimestrale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule_time">Orario Invio *</Label>
                <Input
                  id="schedule_time"
                  type="time"
                  value={newReport.schedule_time}
                  onChange={(e) => setNewReport({ ...newReport, schedule_time: e.target.value })}
                />
              </div>
            </div>

            {newReport.frequency !== 'daily' && (
              <div className="space-y-2">
                <Label htmlFor="schedule_day">
                  {newReport.frequency === 'weekly' ? 'Giorno della settimana' : 'Giorno del mese'}
                </Label>
                <Select
                  value={newReport.schedule_day.toString()}
                  onValueChange={(value) => setNewReport({ ...newReport, schedule_day: parseInt(value) })}
                >
                  <SelectTrigger id="schedule_day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {newReport.frequency === 'weekly' ? (
                      <>
                        <SelectItem value="1">Lunedì</SelectItem>
                        <SelectItem value="2">Martedì</SelectItem>
                        <SelectItem value="3">Mercoledì</SelectItem>
                        <SelectItem value="4">Giovedì</SelectItem>
                        <SelectItem value="5">Venerdì</SelectItem>
                        <SelectItem value="6">Sabato</SelectItem>
                        <SelectItem value="7">Domenica</SelectItem>
                      </>
                    ) : (
                      Array.from({ length: 28 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="recipients">Email Destinatari * (separate da virgola)</Label>
              <Textarea
                id="recipients"
                placeholder="email1@example.com, email2@example.com"
                value={newReport.recipients}
                onChange={(e) => setNewReport({ ...newReport, recipients: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_range">Periodo Dati</Label>
              <Select
                value={newReport.date_range}
                onValueChange={(value) => setNewReport({ ...newReport, date_range: value })}
              >
                <SelectTrigger id="date_range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_week">Ultima settimana</SelectItem>
                  <SelectItem value="last_month">Ultimo mese</SelectItem>
                  <SelectItem value="last_quarter">Ultimo trimestre</SelectItem>
                  <SelectItem value="last_year">Ultimo anno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Formato</Label>
              <Select
                value={newReport.format}
                onValueChange={(value) => setNewReport({ ...newReport, format: value })}
              >
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>
              Annulla
            </Button>
            <Button
              onClick={handleCreateReport}
              disabled={!newReport.name || !newReport.recipients || isCreating}
            >
              {isCreating ? 'Creazione...' : 'Crea Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="mt-8 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-lg">💡 Come Funzionano i Report Automatici</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• I report vengono generati e inviati automaticamente secondo lo scheduling configurato</p>
          <p>• Puoi attivare/disattivare i report in qualsiasi momento</p>
          <p>• I destinatari riceveranno il report via email all'orario specificato</p>
          <p>• Il formato PDF include grafici e tabelle con i dati del periodo</p>
        </CardContent>
      </Card>
    </div>
  )
}
