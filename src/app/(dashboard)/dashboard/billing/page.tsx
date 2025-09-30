'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Zap, Crown, Loader2, ExternalLink } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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
  stripe_price_id_monthly: string | null
  stripe_price_id_yearly: string | null
  is_active: boolean
  sort_order: number
}

export default function BillingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('monthly')

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

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan.slug === 'free') return

    setCheckoutLoading(plan.id)

    try {
      const priceId = selectedBilling === 'monthly'
        ? plan.stripe_price_id_monthly
        : plan.stripe_price_id_yearly

      if (!priceId) {
        alert('Price ID non disponibile')
        return
      }

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price_id: priceId,
          billing_cycle: selectedBilling
        })
      })

      const data = await response.json()

      if (data.error) {
        alert(data.error)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url

    } catch (error: any) {
      console.error('Error creating checkout:', error)
      alert('Errore durante la creazione della sessione di checkout')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error opening portal:', error)
    }
  }

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'free':
        return <Sparkles className="w-8 h-8 text-blue-500" />
      case 'pro':
        return <Zap className="w-8 h-8 text-purple-500" />
      case 'enterprise':
        return <Crown className="w-8 h-8 text-amber-500" />
      default:
        return null
    }
  }

  const getPlanColor = (slug: string) => {
    switch (slug) {
      case 'free':
        return 'from-blue-500 to-cyan-500'
      case 'pro':
        return 'from-purple-500 to-pink-500'
      case 'enterprise':
        return 'from-amber-500 to-orange-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatLimit = (value: number) => {
    if (value === -1) return 'Illimitato'
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Scegli il tuo piano</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Inizia con 10 giorni di prova gratuita. Nessuna carta richiesta.
        </p>

        {/* Billing Toggle */}
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
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              selectedBilling === 'yearly'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Annuale
            <Badge className="ml-2 bg-green-500 text-white text-xs">Risparmia 17%</Badge>
          </button>
        </div>

        <Button
          variant="outline"
          onClick={handleManageSubscription}
          className="mt-4"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Gestisci Abbonamento
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const price = selectedBilling === 'monthly' ? plan.price_monthly : plan.price_yearly
            const isPro = plan.slug === 'pro'
            const isFree = plan.slug === 'free'

            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  isPro ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 shadow-lg">
                      🔥 Più Popolare
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.slug)}
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="text-center py-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold">{formatPrice(price)}</span>
                      <span className="text-muted-foreground">
                        /{selectedBilling === 'monthly' ? 'mese' : 'anno'}
                      </span>
                    </div>
                    {selectedBilling === 'yearly' && price > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        Risparmi {formatPrice((plan.price_monthly * 12) - plan.price_yearly)} all'anno
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isFree || checkoutLoading === plan.id}
                    className={`w-full py-6 text-lg font-semibold ${
                      isFree
                        ? 'bg-gray-400 cursor-not-allowed'
                        : `bg-gradient-to-r ${getPlanColor(plan.slug)} hover:opacity-90`
                    }`}
                  >
                    {checkoutLoading === plan.id ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Caricamento...
                      </>
                    ) : isFree ? (
                      'Piano Attuale'
                    ) : (
                      `Inizia Prova di 10 Giorni`
                    )}
                  </Button>

                  {/* Features */}
                  <div className="space-y-3 pt-4 border-t">
                    <p className="font-semibold text-sm uppercase tracking-wide">Include:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{formatLimit(plan.limits.max_shipments_per_month)} spedizioni/mese</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{formatLimit(plan.limits.max_products)} prodotti</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{formatLimit(plan.limits.max_users)} utenti</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{formatLimit(plan.limits.api_calls_per_month)} chiamate API/mese</span>
                      </li>
                      {Object.entries(plan.features).filter(([_, value]) => value).slice(0, 4).map(([key]) => (
                        <li key={key} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}