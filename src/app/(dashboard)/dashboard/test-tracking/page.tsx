'use client'

/**
 * Tracking System Test Page
 * Development tool to test Phase 6 tracking system
 * Path: /dashboard/test-tracking
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface TrackingTestResult {
  success: boolean
  data?: any
  meta?: {
    provider: string
    fallback_used: boolean
    response_time_ms: number
    cached: boolean
  }
  error?: string
}

export default function TestTrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('MSCU1234567')
  const [carrier, setCarrier] = useState('')
  const [forceRefresh, setForceRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TrackingTestResult | null>(null)

  const handleTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/tracking/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_number: trackingNumber,
          carrier: carrier || undefined,
          force_refresh: forceRefresh,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  const getProviderColor = (provider?: string) => {
    switch (provider) {
      case 'web_scraping':
        return 'bg-green-500'
      case 'jsoncargo':
        return 'bg-yellow-500'
      case 'shipsgo':
        return 'bg-blue-500'
      case 'cache':
        return 'bg-gray-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-600'
      case 'in_transit':
        return 'bg-blue-600'
      case 'at_port':
        return 'bg-yellow-600'
      case 'loaded':
        return 'bg-indigo-600'
      case 'booked':
        return 'bg-purple-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tracking System Test</h1>
        <p className="text-muted-foreground">
          Test Phase 6 3-Layer Hybrid Tracking System
        </p>
      </div>

      {/* Test Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Tracking</CardTitle>
          <CardDescription>
            Enter a tracking number to test the orchestrator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tracking Number
            </label>
            <Input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="MSCU1234567"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Examples: MSCU1234567 (MSC), MAEU1234567 (Maersk), CMAU1234567 (CMA CGM)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Carrier (optional)
            </label>
            <Input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="msc, maersk, cma_cgm..."
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty for auto-detection
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="forceRefresh"
              checked={forceRefresh}
              onChange={(e) => setForceRefresh(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="forceRefresh" className="text-sm">
              Force Refresh (skip cache)
            </label>
          </div>

          <Button onClick={handleTest} disabled={loading} className="w-full">
            {loading ? 'Testing...' : 'Test Tracking'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Results</span>
              {result.success ? (
                <Badge className="bg-green-600">Success</Badge>
              ) : (
                <Badge variant="destructive">Failed</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Meta Information */}
            {result.meta && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Provider</p>
                  <Badge className={getProviderColor(result.meta.provider)}>
                    {result.meta.provider}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Response Time</p>
                  <p className="font-mono">{result.meta.response_time_ms}ms</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fallback Used</p>
                  <p>{result.meta.fallback_used ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cached</p>
                  <p>{result.meta.cached ? 'Yes' : 'No'}</p>
                </div>
              </div>
            )}

            {/* Tracking Data */}
            {result.success && result.data && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Carrier</p>
                    <p className="font-medium">{result.data.carrier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(result.data.status)}>
                      {result.data.status}
                    </Badge>
                  </div>
                </div>

                {result.data.origin && (
                  <div>
                    <p className="text-sm text-muted-foreground">Origin</p>
                    <p className="font-medium">{result.data.origin.port}</p>
                  </div>
                )}

                {result.data.destination && (
                  <div>
                    <p className="text-sm text-muted-foreground">Destination</p>
                    <p className="font-medium">{result.data.destination.port}</p>
                  </div>
                )}

                {result.data.vessel && (
                  <div>
                    <p className="text-sm text-muted-foreground">Vessel</p>
                    <p className="font-medium">{result.data.vessel.name}</p>
                  </div>
                )}

                {result.data.eta && (
                  <div>
                    <p className="text-sm text-muted-foreground">ETA</p>
                    <p className="font-medium">
                      {new Date(result.data.eta).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {result.data.events && result.data.events.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Events ({result.data.events.length})
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {result.data.events.map((event: any, i: number) => (
                        <div key={i} className="p-3 bg-muted rounded text-sm">
                          <p className="font-medium">{event.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()} • {event.location}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {result.error && (
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm text-destructive font-medium">Error</p>
                <p className="text-sm text-destructive/80">{result.error}</p>
              </div>
            )}

            {/* Raw JSON */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium mb-2">
                View Raw JSON
              </summary>
              <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Layer Status */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>3-Layer System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <div>
                <p className="font-medium">Layer 1: Web Scraping</p>
                <p className="text-xs text-muted-foreground">11 carriers • Priority 1</p>
              </div>
              <Badge className="bg-green-500">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <div>
                <p className="font-medium">Layer 2: JSONCargo</p>
                <p className="text-xs text-muted-foreground">150+ carriers • Priority 2</p>
              </div>
              <Badge variant="outline">Not Implemented</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <div>
                <p className="font-medium">Layer 3: ShipsGo</p>
                <p className="text-xs text-muted-foreground">115+ carriers • Priority 3</p>
              </div>
              <Badge className="bg-blue-500">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
