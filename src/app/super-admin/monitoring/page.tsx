'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, RefreshCw, Activity, Database, Mail, Ship, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react'
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

export default function MonitoringPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Database', status: 'checking', icon: Database },
    { name: 'SMTP Server', status: 'checking', icon: Mail },
    { name: 'ShipsGo API', status: 'checking', icon: Ship },
  ])
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchHealthChecks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/super-admin/health-check')
      const data: HealthCheckResponse = await response.json()

      setServices([
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
      ])

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
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

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
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? 'Disable Auto-refresh' : 'Enable Auto-refresh'}
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

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="mt-8 text-center text-sm text-gray-500">
          <Clock className="inline h-4 w-4 mr-1" />
          Auto-refreshing every 30 seconds
        </div>
      )}
    </div>
  )
}