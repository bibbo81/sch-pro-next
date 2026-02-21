'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { useDashboardData } from './lib/useDashboardData'
import { DashboardKPIs } from './components/DashboardKPIs'
import { DashboardQuickActions } from './components/DashboardQuickActions'
import { ControlTower } from './components/ControlTower'

export default function DashboardPage() {
  const {
    loading,
    authLoading,
    error,
    refreshing,
    user,
    metrics,
    filteredControlShipments,
    controlShipments,
    controlFilter,
    chartData,
    refresh,
    setControlFilter,
  } = useDashboardData()

  // Loading skeleton
  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <DashboardKPIs metrics={null} loading />
        <GlassCard className="p-6">
          <Skeleton className="h-64 w-full" />
        </GlassCard>
      </div>
    )
  }

  // Auth guard
  if (!user) {
    return (
      <GlassCard className="p-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Accesso Richiesto</h2>
        <p className="text-muted-foreground">Effettua il login per accedere alla dashboard.</p>
      </GlassCard>
    )
  }

  const greeting = getGreeting()
  const firstName = user.user_metadata?.name?.split(' ')[0] || 'Utente'

  return (
    <div className="space-y-6">
      {/* Hero / Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ecco il riepilogo delle tue spedizioni
          </p>
        </div>
        <Button
          variant="glass"
          size="sm"
          onClick={refresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Aggiorna
        </Button>
      </div>

      {/* Error */}
      {error && (
        <GlassCard className="border-destructive/30 bg-destructive/5">
          <GlassCardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Errore nel caricamento</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <button
                onClick={refresh}
                className="text-xs text-primary underline mt-2 hover:no-underline"
              >
                Riprova
              </button>
            </div>
          </GlassCardContent>
        </GlassCard>
      )}

      {/* KPI Cards */}
      <DashboardKPIs metrics={metrics} loading={false} />

      {/* Quick Actions */}
      <DashboardQuickActions />

      {/* Control Tower */}
      <ControlTower
        shipments={filteredControlShipments}
        allShipments={controlShipments}
        controlFilter={controlFilter}
        onFilterChange={setControlFilter}
      />

      {/* Charts */}
      {chartData && (
        <DashboardCharts data={chartData} isLoading={false} />
      )}
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buongiorno'
  if (hour < 18) return 'Buon pomeriggio'
  return 'Buonasera'
}
