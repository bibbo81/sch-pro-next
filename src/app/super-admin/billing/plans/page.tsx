'use client'

// Subscription plans management page for super-admin
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, Plus, Edit, Trash2, Check, X, Sparkles, TrendingUp, Crown, Zap } from 'lucide-react'
import Link from 'next/link'

interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description: string
  price_monthly: number
  price_yearly: number
  currency: string
  features: Record<string, boolean>
  limits: {
    max_shipments_per_month: number
    max_products: number
    max_users: number
    max_trackings_per_day: number
    max_storage_mb: number
    api_calls_per_month: number
  }
  is_active: boolean
  sort_order: number
}

export default function BillingPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newPlan, setNewPlan] = useState({
    name: '',
    slug: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    max_shipments_per_month: 100,
    max_products: 100,
    max_users: 5,
    max_trackings_per_day: 50,
    max_storage_mb: 1000,
    api_calls_per_month: 10000
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription-plans')
      const data = await response.json()
      setPlans(data.plans || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'free':
        return <Sparkles className="w-6 h-6 text-blue-500" />
      case 'pro':
        return <Zap className="w-6 h-6 text-purple-500" />
      case 'enterprise':
        return <Crown className="w-6 h-6 text-amber-500" />
      default:
        return <TrendingUp className="w-6 h-6 text-gray-500" />
    }
  }

  const getPlanColor = (slug: string) => {
    switch (slug) {
      case 'free':
        return 'border-blue-200 hover:border-blue-300 hover:shadow-blue-100'
      case 'pro':
        return 'border-purple-200 hover:border-purple-300 hover:shadow-purple-100 ring-2 ring-purple-500 ring-offset-2'
      case 'enterprise':
        return 'border-amber-200 hover:border-amber-300 hover:shadow-amber-100'
      default:
        return 'border-gray-200 hover:border-gray-300'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatLimit = (value: number) => {
    if (value === -1) return 'Illimitato'
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  const handleCreatePlan = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/subscription-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlan.name,
          slug: newPlan.slug,
          description: newPlan.description,
          price_monthly: newPlan.price_monthly,
          price_yearly: newPlan.price_yearly,
          limits: {
            max_shipments_per_month: newPlan.max_shipments_per_month,
            max_products: newPlan.max_products,
            max_users: newPlan.max_users,
            max_trackings_per_day: newPlan.max_trackings_per_day,
            max_storage_mb: newPlan.max_storage_mb,
            api_calls_per_month: newPlan.api_calls_per_month
          },
          features: {
            tracking: true,
            products: true,
            analytics: newPlan.price_monthly > 0,
            priority_support: newPlan.price_monthly > 50
          }
        })
      })

      if (response.ok) {
        setIsCreateOpen(false)
        fetchPlans()
        // Reset form
        setNewPlan({
          name: '',
          slug: '',
          description: '',
          price_monthly: 0,
          price_yearly: 0,
          max_shipments_per_month: 100,
          max_products: 100,
          max_users: 5,
          max_trackings_per_day: 50,
          max_storage_mb: 1000,
          api_calls_per_month: 10000
        })
      } else {
        const error = await response.json()
        alert(`Errore: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating plan:', error)
      alert('Errore durante la creazione del piano')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Link href="/super-admin/billing">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Gestione Piani
              </h1>
              <p className="text-sm text-muted-foreground">
                Configura i piani di abbonamento disponibili
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Piano
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-4 p-1 bg-white rounded-lg border shadow-sm">
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                selectedBilling === 'monthly'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensile
            </button>
            <button
              onClick={() => setSelectedBilling('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                selectedBilling === 'yearly'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annuale
              <Badge className="ml-2 bg-green-500 text-white text-xs">-17%</Badge>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const price = selectedBilling === 'monthly' ? plan.price_monthly : plan.price_yearly
              const isPro = plan.slug === 'pro'

              return (
                <Card
                  key={plan.id}
                  className={`relative transition-all duration-300 hover:shadow-lg ${getPlanColor(plan.slug)} ${
                    isPro ? 'transform scale-105' : ''
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 shadow-lg">
                        🔥 Più Popolare
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      {getPlanIcon(plan.slug)}
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                        {plan.is_active ? 'Attivo' : 'Inattivo'}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Price */}
                    <div className="py-4 border-y">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{formatPrice(price)}</span>
                        <span className="text-muted-foreground">
                          /{selectedBilling === 'monthly' ? 'mese' : 'anno'}
                        </span>
                      </div>
                      {selectedBilling === 'yearly' && price > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatPrice(price / 12)}/mese fatturati annualmente
                        </p>
                      )}
                    </div>

                    {/* Limits */}
                    <div className="space-y-3">
                      <p className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Limiti & Risorse
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-lg border">
                          <p className="text-xs text-muted-foreground">Spedizioni/mese</p>
                          <p className="text-lg font-bold">{formatLimit(plan.limits.max_shipments_per_month)}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border">
                          <p className="text-xs text-muted-foreground">Prodotti</p>
                          <p className="text-lg font-bold">{formatLimit(plan.limits.max_products)}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border">
                          <p className="text-xs text-muted-foreground">Utenti</p>
                          <p className="text-lg font-bold">{formatLimit(plan.limits.max_users)}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border">
                          <p className="text-xs text-muted-foreground">API calls/mese</p>
                          <p className="text-lg font-bold">{formatLimit(plan.limits.api_calls_per_month)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      <p className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Funzionalità
                      </p>
                      <div className="space-y-2">
                        {Object.entries(plan.features).slice(0, 6).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            {value ? (
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                            )}
                            <span className={`text-sm ${value ? 'text-gray-700' : 'text-gray-400'}`}>
                              {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Modifica
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Plan Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crea Nuovo Piano</DialogTitle>
            <DialogDescription>
              Configura un nuovo piano di abbonamento con limiti e prezzi personalizzati
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Piano *</Label>
                <Input
                  id="name"
                  placeholder="es. Premium"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="es. premium"
                  value={newPlan.slug}
                  onChange={(e) => setNewPlan({ ...newPlan, slug: e.target.value.toLowerCase() })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                placeholder="Descrizione del piano..."
                value={newPlan.description}
                onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_monthly">Prezzo Mensile (€)</Label>
                <Input
                  id="price_monthly"
                  type="number"
                  min="0"
                  value={newPlan.price_monthly}
                  onChange={(e) => setNewPlan({ ...newPlan, price_monthly: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_yearly">Prezzo Annuale (€)</Label>
                <Input
                  id="price_yearly"
                  type="number"
                  min="0"
                  value={newPlan.price_yearly}
                  onChange={(e) => setNewPlan({ ...newPlan, price_yearly: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-3">Limiti Risorse</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_shipments">Spedizioni/Mese</Label>
                  <Input
                    id="max_shipments"
                    type="number"
                    min="-1"
                    value={newPlan.max_shipments_per_month}
                    onChange={(e) => setNewPlan({ ...newPlan, max_shipments_per_month: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">-1 = illimitato</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_products">Prodotti Max</Label>
                  <Input
                    id="max_products"
                    type="number"
                    min="-1"
                    value={newPlan.max_products}
                    onChange={(e) => setNewPlan({ ...newPlan, max_products: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_users">Utenti Max</Label>
                  <Input
                    id="max_users"
                    type="number"
                    min="1"
                    value={newPlan.max_users}
                    onChange={(e) => setNewPlan({ ...newPlan, max_users: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_trackings">Tracking/Giorno</Label>
                  <Input
                    id="max_trackings"
                    type="number"
                    min="-1"
                    value={newPlan.max_trackings_per_day}
                    onChange={(e) => setNewPlan({ ...newPlan, max_trackings_per_day: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_storage">Storage (MB)</Label>
                  <Input
                    id="max_storage"
                    type="number"
                    min="-1"
                    value={newPlan.max_storage_mb}
                    onChange={(e) => setNewPlan({ ...newPlan, max_storage_mb: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_calls">API Calls/Mese</Label>
                  <Input
                    id="api_calls"
                    type="number"
                    min="-1"
                    value={newPlan.api_calls_per_month}
                    onChange={(e) => setNewPlan({ ...newPlan, api_calls_per_month: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>
              Annulla
            </Button>
            <Button
              onClick={handleCreatePlan}
              disabled={!newPlan.name || !newPlan.slug || isCreating}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {isCreating ? 'Creazione...' : 'Crea Piano'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}