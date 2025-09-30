'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Search,
  Building2,
  Calendar,
  CreditCard,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  Filter
} from 'lucide-react'
import Link from 'next/link'

interface Subscription {
  id: string
  status: 'active' | 'cancelled' | 'suspended' | 'trial' | 'expired'
  billing_cycle: 'monthly' | 'yearly' | 'lifetime'
  current_period_start: string
  current_period_end: string
  trial_start?: string
  trial_end?: string
  cancelled_at?: string
  created_at: string
  organization: {
    id: string
    name: string
    slug: string
  }
  plan: {
    id: string
    name: string
    slug: string
    price_monthly: number
    price_yearly: number
  }
}

interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number
}

interface Organization {
  id: string
  name: string
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newSubscription, setNewSubscription] = useState({
    organization_id: '',
    plan_id: '',
    billing_cycle: 'monthly' as 'monthly' | 'yearly' | 'lifetime',
    trial_days: 10,
    status: 'trial' as 'active' | 'trial'
  })

  useEffect(() => {
    fetchSubscriptions()
    fetchPlans()
    fetchOrganizations()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      const data = await response.json()
      setSubscriptions(data.subscriptions || [])
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription-plans')
      const data = await response.json()
      setPlans(data.plans || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations')
      const data = await response.json()
      setOrganizations(data.organizations || [])
    } catch (error) {
      console.error('Error fetching organizations:', error)
    }
  }

  const handleCreateSubscription = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubscription)
      })

      if (response.ok) {
        setIsCreateOpen(false)
        fetchSubscriptions()
        setNewSubscription({
          organization_id: '',
          plan_id: '',
          billing_cycle: 'monthly',
          trial_days: 10,
          status: 'trial'
        })
      } else {
        const error = await response.json()
        alert(`Errore: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert('Errore durante la creazione dell\'abbonamento')
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4" />
      case 'trial':
        return <Clock className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      case 'suspended':
        return <Ban className="w-4 h-4" />
      case 'expired':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'trial':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'suspended':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.organization.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.plan.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === 'active').length,
    trial: subscriptions.filter((s) => s.status === 'trial').length,
    revenue: subscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => {
        const price = s.billing_cycle === 'monthly' ? s.plan.price_monthly : s.plan.price_yearly / 12
        return sum + price
      }, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/super-admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Gestione Abbonamenti
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monitora e gestisci gli abbonamenti attivi
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Abbonamento
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Totale Abbonamenti</CardDescription>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Attivi</CardDescription>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>In Prova</CardDescription>
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.trial}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>MRR</CardDescription>
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatPrice(stats.revenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">Monthly Recurring Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per organizzazione o piano..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'active', 'trial', 'cancelled', 'suspended'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}
                  >
                    {status === 'all' ? 'Tutti' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nessun abbonamento trovato</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredSubscriptions.map((sub) => {
              const daysRemaining = getDaysRemaining(sub.current_period_end)
              const price =
                sub.billing_cycle === 'monthly' ? sub.plan.price_monthly : sub.plan.price_yearly

              return (
                <Card
                  key={sub.id}
                  className="hover:shadow-md transition-all duration-200 hover:border-purple-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                          <h3 className="text-lg font-semibold">{sub.organization.name}</h3>
                          <Badge className={`${getStatusColor(sub.status)} flex items-center gap-1`}>
                            {getStatusIcon(sub.status)}
                            {sub.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Piano</p>
                            <p className="font-medium">{sub.plan.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(price)}/{sub.billing_cycle === 'monthly' ? 'mese' : 'anno'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Periodo Corrente</p>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <p className="text-sm">
                                {formatDate(sub.current_period_start)} - {formatDate(sub.current_period_end)}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Giorni Rimanenti</p>
                            <p className="text-lg font-bold">
                              {daysRemaining > 0 ? (
                                <span className={daysRemaining < 7 ? 'text-orange-600' : 'text-green-600'}>
                                  {daysRemaining} giorni
                                </span>
                              ) : (
                                <span className="text-red-600">Scaduto</span>
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Creato il</p>
                            <p className="text-sm">{formatDate(sub.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          Dettagli
                        </Button>
                        <Button variant="outline" size="sm">
                          Modifica
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Subscription Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crea Nuovo Abbonamento</DialogTitle>
            <DialogDescription>
              Assegna un abbonamento a un'organizzazione
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Organizzazione *</Label>
              <Select
                value={newSubscription.organization_id}
                onValueChange={(value) => setNewSubscription({ ...newSubscription, organization_id: value })}
              >
                <SelectTrigger id="organization">
                  <SelectValue placeholder="Seleziona organizzazione" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Piano *</Label>
              <Select
                value={newSubscription.plan_id}
                onValueChange={(value) => setNewSubscription({ ...newSubscription, plan_id: value })}
              >
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Seleziona piano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - €{plan.price_monthly}/mese
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_cycle">Ciclo di Fatturazione *</Label>
              <Select
                value={newSubscription.billing_cycle}
                onValueChange={(value: 'monthly' | 'yearly' | 'lifetime') => {
                  const updates: any = { billing_cycle: value }
                  // For lifetime, automatically set to active with no trial
                  if (value === 'lifetime') {
                    updates.status = 'active'
                    updates.trial_days = 0
                  }
                  setNewSubscription({ ...newSubscription, ...updates })
                }}
              >
                <SelectTrigger id="billing_cycle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensile</SelectItem>
                  <SelectItem value="yearly">Annuale</SelectItem>
                  <SelectItem value="lifetime">🎁 Lifetime (Gratuito Permanente)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newSubscription.billing_cycle !== 'lifetime' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="status">Stato Iniziale *</Label>
                  <Select
                    value={newSubscription.status}
                    onValueChange={(value: 'active' | 'trial') => setNewSubscription({ ...newSubscription, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial (Prova)</SelectItem>
                      <SelectItem value="active">Active (Attivo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newSubscription.status === 'trial' && (
                  <div className="space-y-2">
                    <Label htmlFor="trial_days">Giorni di Prova</Label>
                    <Input
                      id="trial_days"
                      type="number"
                      min="0"
                      value={newSubscription.trial_days}
                      onChange={(e) => setNewSubscription({ ...newSubscription, trial_days: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">0 = nessun trial period</p>
                  </div>
                )}
              </>
            )}

            {newSubscription.billing_cycle === 'lifetime' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  ✨ Piano Lifetime selezionato
                </p>
                <p className="text-xs text-green-700 mt-1">
                  L'organizzazione avrà accesso permanente e gratuito senza scadenza.
                  Perfetto per partner e organizzazioni VIP.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>
              Annulla
            </Button>
            <Button
              onClick={handleCreateSubscription}
              disabled={!newSubscription.organization_id || !newSubscription.plan_id || isCreating}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {isCreating ? 'Creazione...' : 'Crea Abbonamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}