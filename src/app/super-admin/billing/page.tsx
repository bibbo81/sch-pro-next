'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, DollarSign, CreditCard, Users, TrendingUp, Package, Zap } from 'lucide-react'
import Link from 'next/link'

export default function BillingPage() {
  const [stats, setStats] = useState({
    totalPlans: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    mrr: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [plansRes, subsRes] = await Promise.all([
        fetch('/api/subscription-plans'),
        fetch('/api/subscriptions')
      ])

      const plansData = await plansRes.json()
      const subsData = await subsRes.json()

      const plans = plansData.plans || []
      const subscriptions = subsData.subscriptions || []
      const active = subscriptions.filter((s: any) => s.status === 'active')

      // Calculate MRR
      const mrr = active.reduce((sum: number, sub: any) => {
        const price = sub.billing_cycle === 'monthly'
          ? sub.plan.price_monthly
          : sub.plan.price_yearly / 12
        return sum + price
      }, 0)

      setStats({
        totalPlans: plans.length,
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: active.length,
        mrr
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/super-admin">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Billing & Subscriptions
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestione completa piani e abbonamenti
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Piani Attivi</CardDescription>
                <Package className="w-4 h-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
              ) : (
                <div className="text-3xl font-bold">{stats.totalPlans}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Tot. Abbonamenti</CardDescription>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
              ) : (
                <div className="text-3xl font-bold">{stats.totalSubscriptions}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Abbonamenti Attivi</CardDescription>
                <Zap className="w-4 h-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
              ) : (
                <div className="text-3xl font-bold">{stats.activeSubscriptions}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>MRR</CardDescription>
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{formatCurrency(stats.mrr)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Monthly Recurring Revenue</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300 hover:border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Subscription Plans</CardTitle>
                  <CardDescription>Gestisci i piani di abbonamento</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Crea, modifica ed elimina i piani di abbonamento. Configura prezzi, limiti e funzionalità per ciascun piano.
              </p>
              <Link href="/super-admin/billing/plans">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Gestisci Piani
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Subscriptions</CardTitle>
                  <CardDescription>Monitora gli abbonamenti attivi</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Visualizza tutti gli abbonamenti, monitora lo stato, gestisci trial e rinnovi. Analizza MRR e metriche di business.
              </p>
              <Link href="/super-admin/billing/subscriptions">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Gestisci Abbonamenti
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg">💡 Informazioni Sistema Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Piani disponibili:</strong> Free (€0), Pro (€49/mese), Enterprise (€199/mese)
            </p>
            <p>
              <strong>Funzionalità implementate:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Gestione completa piani e abbonamenti</li>
              <li>Tracking utilizzo e limiti per organizzazione</li>
              <li>Trial period di 14 giorni</li>
              <li>Supporto cicli mensili e annuali</li>
            </ul>
            <p className="pt-2">
              <strong>Da implementare:</strong> Payment gateway, fatturazione automatica, upgrade/downgrade
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}