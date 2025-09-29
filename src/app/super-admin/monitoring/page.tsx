'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, RefreshCw, Activity, Database, Mail, Ship, CheckCircle2, XCircle, AlertCircle, Clock, Bell, BellOff } from 'lucide-react'
import Link from 'next/link'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'down' | 'checking'
  responseTime?: number
  lastCheck?: string
  message?: string
  icon: any
}

interface HealthCheckResponse {
  database: {
    status: 'healthy' | 'degraded' | 'down'
    responseTime: number
    message?: string
  }
  smtp: {
    status: 'healthy' | 'degraded' | 'down'
    responseTime: number
    message?: string
  }
  shipsGo: {
    status: 'healthy' | 'degraded' | 'down'
    responseTime: number
    message?: string
  }
  timestamp: string
}

interface Alert {
  id: string
  service: string
  status: 'degraded' | 'down'
  message: string
  timestamp: Date
  acknowledged: boolean
}

export default function MonitoringPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Database', status: 'checking', icon: Database },
    { name: 'SMTP Server', status: 'checking', icon: Mail },
    { name: 'ShipsGo API', status: 'checking', icon: Ship },
  ])
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [showAlerts, setShowAlerts] = useState(false)
  const previousServicesRef = useRef<ServiceStatus[]>([])

  const createAlert = (service: string, status: 'degraded' | 'down', message: string) => {
    if (!alertsEnabled) return

    const alert: Alert = {
      id: `${service}-${Date.now()}`,
      service,
      status,
      message,
      timestamp: new Date(),
      acknowledged: false,
    }

    setAlerts((prev) => [alert, ...prev])

    // Play sound for critical alerts
    if (status === 'down') {
      try {
        const audio = new Audio('/alert.mp3') // You can add a sound file or use browser beep
        audio.play().catch(() => {
          // Fallback: browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('System Alert', {
              body: `${service} is ${status}: ${message}`,
              icon: '/favicon.ico',
            })
          }
        })
      } catch (e) {
        console.log('Could not play alert sound')
      }
    }

    // Show alerts panel
    setShowAlerts(true)
  }

  const fetchHealthChecks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/super-admin/health-check')
      const data: HealthCheckResponse = await response.json()

      const newServices = [
        {
          name: 'Database',
          status: data.database.status,
          responseTime: data.database.responseTime,
          message: data.database.message,
          lastCheck: data.timestamp,
          icon: Database,
        },
        {
          name: 'SMTP Server',
          status: data.smtp.status,
          responseTime: data.smtp.responseTime,
          message: data.smtp.message,
          lastCheck: data.timestamp,
          icon: Mail,
        },
        {
          name: 'ShipsGo API',
          status: data.shipsGo.status,
          responseTime: data.shipsGo.responseTime,
          message: data.shipsGo.message,
          lastCheck: data.timestamp,
          icon: Ship,
        },
      ]

      // Check for status changes and create alerts
      if (previousServicesRef.current.length > 0) {
        newServices.forEach((service, index) => {
          const previousService = previousServicesRef.current[index]
          if (previousService && previousService.status !== service.status) {
            if (service.status === 'degraded' || service.status === 'down') {
              createAlert(
                service.name,
                service.status,
                service.message || `Status changed from ${previousService.status} to ${service.status}`
              )
            }
          }
        })
      }

      previousServicesRef.current = newServices
      setServices(newServices)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching health checks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthChecks()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchHealthChecks()
    }, 10000) // Refresh every 10 seconds for live monitoring

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Healthy</Badge>
      case 'degraded':
        return <Badge className="bg-yellow-500"><AlertCircle className="w-3 h-3 mr-1" />Degraded</Badge>
      case 'down':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Down</Badge>
      case 'checking':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1 animate-pulse" />Checking...</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'border-green-500'
      case 'degraded':
        return 'border-yellow-500'
      case 'down':
        return 'border-red-500'
      default:
        return 'border-gray-300'
    }
  }

  const overallHealth = services.every(s => s.status === 'healthy') ? 'healthy' :
                        services.some(s => s.status === 'down') ? 'down' : 'degraded'

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    )
  }

  const clearAllAlerts = () => {
    setAlerts([])
  }

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            System Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time health status of all system services
          </p>
        </div>
        <Link href="/super-admin">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Overall Status Card */}
      <Card className={`mb-8 border-2 ${getStatusColor(overallHealth)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Overall System Status</CardTitle>
              <CardDescription className="mt-2">
                {lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : 'Loading...'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={alertsEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setAlertsEnabled(!alertsEnabled)}
              >
                {alertsEnabled ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}
                Alerts {alertsEnabled ? 'On' : 'Off'}
              </Button>
              {unacknowledgedAlerts.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowAlerts(!showAlerts)}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {unacknowledgedAlerts.length} Alert{unacknowledgedAlerts.length > 1 ? 's' : ''}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? 'Disable Live Updates' : 'Enable Live Updates'}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={fetchHealthChecks}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {getStatusBadge(overallHealth)}
            <span className="text-lg">
              {overallHealth === 'healthy' && 'All systems operational'}
              {overallHealth === 'degraded' && 'Some systems experiencing issues'}
              {overallHealth === 'down' && 'Critical services are down'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <Card key={service.name} className={`border-2 ${getStatusColor(service.status)}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <CardTitle>{service.name}</CardTitle>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {service.responseTime !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Response Time:</span>
                      <span className="font-medium">{service.responseTime}ms</span>
                    </div>
                  )}
                  {service.lastCheck && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Check:</span>
                      <span className="font-medium">
                        {new Date(service.lastCheck).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  {service.message && (
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                      {service.message}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Alerts Panel */}
      {showAlerts && alerts.length > 0 && (
        <Card className="mt-8 border-2 border-red-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                System Alerts ({unacknowledgedAlerts.length} unacknowledged)
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearAllAlerts}>
                  Clear All
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAlerts(false)}>
                  Hide
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded border-2 ${
                    alert.status === 'down'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950'
                      : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                  } ${alert.acknowledged ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {alert.status === 'down' ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="font-semibold">{alert.service}</span>
                        <Badge
                          className={
                            alert.status === 'down' ? 'bg-red-500' : 'bg-yellow-500'
                          }
                        >
                          {alert.status}
                        </Badge>
                        {alert.acknowledged && (
                          <Badge variant="outline">Acknowledged</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="mt-8 text-center text-sm text-gray-500">
          <Activity className="inline h-4 w-4 mr-1 animate-pulse" />
          Live monitoring active - Refreshing every 10 seconds
        </div>
      )}
    </div>
  )
}