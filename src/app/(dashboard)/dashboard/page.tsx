'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateInput } from '@/components/ui/date-input'
import {
  Package, Ship, TrendingUp, Activity, Clock, AlertCircle,
  RefreshCw, Eye, CheckCircle, HelpCircle,
  Globe, Calculator, Weight, Box, Timer, Plane, Truck,
  Building, Calendar, Tag, Info
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/utils/supabase/client'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'

// Dashboard moderno che replica il vecchio progetto Solarium
interface KPIConfig {
  id: string
  name: string
  icon: string
  color: string
  calculation: string
  format: 'number' | 'currency' | 'weight' | 'volume' | 'days'
}

interface ControlShipment {
  id: string
  tracking_number: string
  status: string
  carrier_name: string
  reference_number: string
  origin: string
  destination: string
  departure_date: string
  eta: string
  arrival_date: string
}

interface DashboardFilters {
  company: string
  carrier: string
  status: string
  dateFrom: string
  dateTo: string
}

interface ProcessedMetrics {
  kpis: { [key: string]: number }
  trends: any
  transportModes: any
  carriersPerformance: any[]
  calculatedAt: string
}

export default function AdvancedDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  // State management
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoUpdating, setAutoUpdating] = useState(false)

  // Data state
  const [rawData, setRawData] = useState<any>({})
  const [processedMetrics, setProcessedMetrics] = useState<ProcessedMetrics | null>(null)
  const [controlShipments, setControlShipments] = useState<ControlShipment[]>([])
  const [filteredControlShipments, setFilteredControlShipments] = useState<ControlShipment[]>([])

  // Filter state - temporary filters that user is setting
  const [filters, setFilters] = useState<DashboardFilters>({
    company: 'all',
    carrier: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  })

  // Applied filters - filters that trigger data reload
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>({
    company: 'all',
    carrier: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  })


  // Control shipments filter
  const [controlFilter, setControlFilter] = useState<'all' | 'in_transit' | 'recent_arrived'>('all')

  // KPI Configuration - COMPLETO dal vecchio progetto + nuovi avanzati
  const KPI_CONFIG: KPIConfig[] = [
    // === KPI PRINCIPALI ===
    {
      id: 'total_shipments',
      name: 'Spedizioni Totali',
      icon: 'Ship',
      color: '#3b82f6',
      calculation: 'count_shipments',
      format: 'number'
    },
    {
      id: 'total_costs',
      name: 'Costi Totali',
      icon: 'Calculator',
      color: '#ef4444',
      calculation: 'sum_costs',
      format: 'currency'
    },
    {
      id: 'avg_cost_per_shipment',
      name: 'Costo Medio',
      icon: 'TrendingUp',
      color: '#f59e0b',
      calculation: 'avg_cost_shipment',
      format: 'currency'
    },
    {
      id: 'total_weight',
      name: 'Peso Totale',
      icon: 'Weight',
      color: '#10b981',
      calculation: 'sum_weight',
      format: 'weight'
    },
    {
      id: 'total_volume',
      name: 'Volume Totale',
      icon: 'Box',
      color: '#8b5cf6',
      calculation: 'sum_volume',
      format: 'volume'
    },
    {
      id: 'avg_delivery_time',
      name: 'Tempo Medio Consegna',
      icon: 'Timer',
      color: '#06b6d4',
      calculation: 'avg_delivery_time',
      format: 'days'
    },

    // === TEMPI MEDI PER MODALITÀ ===
    {
      id: 'avg_sea_delivery_time',
      name: 'Tempo Medio Via Mare',
      icon: 'Ship',
      color: '#0891b2',
      calculation: 'avg_sea_delivery_time',
      format: 'days'
    },
    {
      id: 'avg_air_delivery_time',
      name: 'Tempo Medio Via Aerea',
      icon: 'Plane',
      color: '#f59e0b',
      calculation: 'avg_air_delivery_time',
      format: 'days'
    },
    {
      id: 'avg_road_delivery_time',
      name: 'Tempo Medio Stradale',
      icon: 'Truck',
      color: '#64748b',
      calculation: 'avg_road_delivery_time',
      format: 'days'
    },
    {
      id: 'avg_parcel_delivery_time',
      name: 'Tempo Medio Corriere',
      icon: 'Package',
      color: '#8b5cf6',
      calculation: 'avg_parcel_delivery_time',
      format: 'days'
    },

    // === COSTI PER MODALITÀ ===
    {
      id: 'sea_total_cost',
      name: 'Costo Totale Mare',
      icon: 'Ship',
      color: '#0891b2',
      calculation: 'sea_total_cost',
      format: 'currency'
    },
    {
      id: 'air_total_cost',
      name: 'Costo Totale Aereo',
      icon: 'Plane',
      color: '#f59e0b',
      calculation: 'air_total_cost',
      format: 'currency'
    },
    {
      id: 'road_total_cost',
      name: 'Costo Totale Stradale',
      icon: 'Truck',
      color: '#64748b',
      calculation: 'road_total_cost',
      format: 'currency'
    },
    {
      id: 'parcel_total_cost',
      name: 'Costo Totale Corriere',
      icon: 'Package',
      color: '#8b5cf6',
      calculation: 'parcel_total_cost',
      format: 'currency'
    },
    {
      id: 'other_total_cost',
      name: 'Costo Non Classificato',
      icon: 'HelpCircle',
      color: '#6b7280',
      calculation: 'other_total_cost',
      format: 'currency'
    },

    // === KPI FINANZIARI AVANZATI ===
    {
      id: 'cost_per_kg',
      name: 'Costo per Kg',
      icon: 'Weight',
      color: '#16a34a',
      calculation: 'cost_per_kg',
      format: 'currency'
    },
    {
      id: 'cost_per_cbm',
      name: 'Costo per m³',
      icon: 'Box',
      color: '#dc2626',
      calculation: 'cost_per_cbm',
      format: 'currency'
    },

    // === PERFORMANCE OPERATIVA ===
    {
      id: 'on_time_delivery_rate',
      name: 'Consegne Puntuali',
      icon: 'Clock',
      color: '#059669',
      calculation: 'on_time_delivery_rate',
      format: 'number'
    },
    {
      id: 'in_transit_count',
      name: 'In Transito',
      icon: 'Activity',
      color: '#2563eb',
      calculation: 'in_transit_count',
      format: 'number'
    }
  ]


  // Format functions
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('it-IT').format(value)
  }

  const formatWeight = (value: number): string => {
    return `${formatNumber(value)} kg`
  }

  const formatVolume = (value: number): string => {
    return `${formatNumber(value)} m³`
  }

  const formatDays = (value: number): string => {
    return `${Math.round(value)} giorni`
  }

  const formatKPIValue = (value: number, format: string): string => {
    switch (format) {
      case 'currency': return formatCurrency(value)
      case 'weight': return formatWeight(value)
      case 'volume': return formatVolume(value)
      case 'days': return formatDays(value)
      case 'currency_per_unit': return `${formatCurrency(value)}/unità`
      case 'percentage': return `${formatNumber(value)}%`
      default: return formatNumber(value)
    }
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const formatStatus = (status: string): string => {
    const statusLabels: { [key: string]: string } = {
      pending: 'In attesa',
      registered: 'Registrato',
      in_transit: 'In transito',
      IN_TRANSIT: 'In transito',
      delivered: 'Consegnate',
      Consegnato: 'Consegnate',
      exception: 'Eccezione',
      delayed: 'Ritardato',
      arrived: 'Arrivate',
      out_for_delivery: 'In consegna',
      SAILING: 'In navigazione',
      sailing: 'In navigazione',
      DEPARTED: 'Partite',
      departed: 'Partite',
      DISCHARGED: 'Scaricate',
      discharged: 'Scaricate',
      COMPLETED: 'Completate',
      completed: 'Completate',
      customs_hold: 'Fermo dogana',
      customs_cleared: 'Sdoganato'
    }
    return statusLabels[status] || status
  }

  const getStatusVariant = (status: string): any => {
    const statusMap: { [key: string]: string } = {
      pending: 'pending',
      registered: 'registered',
      in_transit: 'in_transit',
      IN_TRANSIT: 'in_transit',
      delivered: 'delivered',
      Consegnato: 'delivered',
      exception: 'exception',
      delayed: 'delayed',
      arrived: 'delivered',
      out_for_delivery: 'in_transit',
      SAILING: 'sailing',
      sailing: 'sailing',
      DEPARTED: 'in_transit',
      departed: 'in_transit',
      DISCHARGED: 'delivered',
      discharged: 'delivered',
      COMPLETED: 'delivered',
      completed: 'delivered',
      customs_hold: 'warning',
      customs_cleared: 'success'
    }
    return statusMap[status] || 'pending'
  }

  // Get icon component
  const getIconComponent = (iconName: string) => {
    const iconProps = { className: "h-5 w-5" }
    switch (iconName) {
      case 'Ship': return <Ship {...iconProps} />
      case 'Calculator': return <Calculator {...iconProps} />
      case 'TrendingUp': return <TrendingUp {...iconProps} />
      case 'Weight': return <Weight {...iconProps} />
      case 'Box': return <Box {...iconProps} />
      case 'Timer': return <Timer {...iconProps} />
      case 'Plane': return <Plane {...iconProps} />
      case 'Truck': return <Truck {...iconProps} />
      case 'Clock': return <Clock {...iconProps} />
      case 'Activity': return <Activity {...iconProps} />
      case 'HelpCircle': return <HelpCircle {...iconProps} />
      default: return <Package {...iconProps} />
    }
  }

  // Load dashboard data with debouncing to prevent excessive re-renders
  const loadDashboardData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      console.log('🚀 Loading advanced dashboard data...')

      // Get organization ID
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      const organizationId = membership?.organization_id

      // Load shipments, trackings, costs data
      let shipmentsQuery = supabase.from('shipments').select('*')
      let trackingsQuery = supabase.from('trackings').select('*')
      let costsQuery = supabase.from('additional_costs').select('*')
      let carriersQuery = supabase.from('carriers').select('*')

      if (organizationId) {
        shipmentsQuery = shipmentsQuery.eq('organization_id', organizationId)
        trackingsQuery = trackingsQuery.eq('organization_id', organizationId)
        costsQuery = costsQuery.eq('organization_id', organizationId)
        carriersQuery = carriersQuery.eq('organization_id', organizationId)
      }

      // Apply filters (use appliedFilters instead of filters)
      if (appliedFilters.company && appliedFilters.company !== 'all') {
        shipmentsQuery = shipmentsQuery.ilike('carrier_name', `%${appliedFilters.company}%`)
      }
      if (appliedFilters.status && appliedFilters.status !== 'all') {
        shipmentsQuery = shipmentsQuery.eq('status', appliedFilters.status)
      }
      if (appliedFilters.dateFrom) {
        shipmentsQuery = shipmentsQuery.gte('created_at', appliedFilters.dateFrom + 'T00:00:00.000Z')
      }
      if (appliedFilters.dateTo) {
        shipmentsQuery = shipmentsQuery.lte('created_at', appliedFilters.dateTo + 'T23:59:59.999Z')
      }

      const [shipmentsResult, trackingsResult, costsResult, carriersResult] = await Promise.allSettled([
        shipmentsQuery.order('created_at', { ascending: false }).limit(2000),
        trackingsQuery.order('created_at', { ascending: false }).limit(5000),
        costsQuery.order('created_at', { ascending: false }).limit(2000),
        carriersQuery.order('name', { ascending: true }).limit(500)
      ])

      // Extract data
      const shipments = shipmentsResult.status === 'fulfilled' ? shipmentsResult.value.data || [] : []
      const trackings = trackingsResult.status === 'fulfilled' ? trackingsResult.value.data || [] : []
      const additionalCosts = costsResult.status === 'fulfilled' ? costsResult.value.data || [] : []
      const carriers = carriersResult.status === 'fulfilled' ? carriersResult.value.data || [] : []

      // Store raw data
      const newRawData = {
        shipments,
        trackings,
        additionalCosts,
        carriers,
        loadedAt: new Date().toISOString()
      }
      setRawData(newRawData)

      // Calculate metrics
      const metrics = calculateAllMetrics(newRawData)
      setProcessedMetrics(metrics)

      // Load control shipments - always load all shipments for control, ignore filters
      let allShipmentsQuery = supabase.from('shipments').select('*')
      if (organizationId) {
        allShipmentsQuery = allShipmentsQuery.eq('organization_id', organizationId)
      }
      const allShipmentsResult = await allShipmentsQuery.order('created_at', { ascending: false }).limit(2000)
      const allShipments = allShipmentsResult.data || []
      await loadControlShipments(allShipments)

      console.log('✅ Advanced dashboard data loaded:', {
        shipments: shipments.length,
        trackings: trackings.length,
        costs: additionalCosts.length,
        carriers: carriers.length
      })

    } catch (err: any) {
      console.error('❌ Error loading dashboard data:', err)
      setError(err.message || 'Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }, [user, appliedFilters])

  // Calculate all metrics
  const calculateAllMetrics = (data: any): ProcessedMetrics => {
    const { shipments, additionalCosts } = data

    const kpis: { [key: string]: number } = {}

    // Calculate Base KPIs
    kpis.total_shipments = shipments.length
    kpis.total_costs = sumCosts(shipments, additionalCosts)
    kpis.avg_cost_per_shipment = shipments.length > 0 ? kpis.total_costs / shipments.length : 0
    kpis.total_weight = sumWeight(shipments)
    kpis.total_volume = sumVolume(shipments)
    kpis.avg_delivery_time = avgDeliveryTime(shipments)

    // Calculate Delivery Times by Mode
    kpis.avg_sea_delivery_time = avgDeliveryTimeByMode(shipments, 'sea')
    kpis.avg_air_delivery_time = avgDeliveryTimeByMode(shipments, 'air')
    kpis.avg_road_delivery_time = avgDeliveryTimeByMode(shipments, 'road')
    kpis.avg_parcel_delivery_time = avgDeliveryTimeByMode(shipments, 'parcel')

    // Calculate Costs by Mode
    kpis.sea_total_cost = sumCostsByMode(shipments, additionalCosts, 'sea')
    kpis.air_total_cost = sumCostsByMode(shipments, additionalCosts, 'air')
    kpis.road_total_cost = sumCostsByMode(shipments, additionalCosts, 'road')
    kpis.parcel_total_cost = sumCostsByMode(shipments, additionalCosts, 'parcel')

    // Calculate unclassified costs (total - sum of all classified)
    const classifiedTotal = kpis.sea_total_cost + kpis.air_total_cost + kpis.road_total_cost + kpis.parcel_total_cost
    kpis.other_total_cost = kpis.total_costs - classifiedTotal

    // Debug log to understand classification
    console.log('🔍 Cost Classification Debug:', {
      total: kpis.total_costs,
      sea: kpis.sea_total_cost,
      air: kpis.air_total_cost,
      road: kpis.road_total_cost,
      parcel: kpis.parcel_total_cost,
      unclassified: kpis.other_total_cost,
      unclassifiedPercentage: ((kpis.other_total_cost / kpis.total_costs) * 100).toFixed(2) + '%'
    })

    // Calculate Advanced Financial KPIs
    kpis.cost_per_kg = kpis.total_weight > 0 ? kpis.total_costs / kpis.total_weight : 0
    kpis.cost_per_cbm = kpis.total_volume > 0 ? kpis.total_costs / kpis.total_volume : 0

    // Calculate Operational Performance KPIs
    kpis.on_time_delivery_rate = calculateOnTimeDeliveryRate(shipments)
    kpis.in_transit_count = countInTransitShipments(shipments)

    return {
      kpis,
      trends: {},
      transportModes: {},
      carriersPerformance: [],
      calculatedAt: new Date().toISOString()
    }
  }

  // Calculation functions
  const sumCosts = (shipments: any[], additionalCosts: any[]): number => {
    let total = 0

    // Get IDs of filtered shipments only
    const shipmentIds = shipments.map(s => s.id)

    // Calculate base costs from shipments
    shipments.forEach(s => {
      total += (parseFloat(s.freight_cost) || 0)
      total += (parseFloat(s.other_costs) || 0)
      total += (parseFloat(s.insurance_cost) || 0)
      total += (parseFloat(s.customs_cost) || 0)
    })

    // Only include additional costs for filtered shipments
    const filteredAdditionalCosts = additionalCosts.filter(c =>
      shipmentIds.includes(c.shipment_id)
    )

    filteredAdditionalCosts.forEach(c => {
      total += (parseFloat(c.amount) || 0)
    })

    // Enhanced debug logging
    console.log('🔍 Enhanced Cost Calculation Debug:', {
      totalShipments: shipments.length,
      shipmentIds: shipmentIds.slice(0, 3),
      totalAdditionalCosts: additionalCosts.length,
      filteredAdditionalCosts: filteredAdditionalCosts.length,
      shipmentCosts: shipments.reduce((sum, s) => sum + (parseFloat(s.freight_cost) || 0) + (parseFloat(s.other_costs) || 0) + (parseFloat(s.insurance_cost) || 0) + (parseFloat(s.customs_cost) || 0), 0),
      additionalCostsTotal: filteredAdditionalCosts.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0),
      finalTotal: total,
      sampleAdditionalCost: filteredAdditionalCosts[0] || null
    })

    return total
  }

  const sumWeight = (shipments: any[]): number => {
    return shipments.reduce((sum, s) => sum + (parseFloat(s.total_weight_kg) || 0), 0)
  }

  const sumVolume = (shipments: any[]): number => {
    return shipments.reduce((sum, s) => sum + (parseFloat(s.total_volume_cbm) || 0), 0)
  }

  // Helper function to get departure date from various fields
  const getDepartureDate = (shipment: any): Date | null => {
    // Priority order for departure date
    const dateFields = [
      shipment.departure_date,
      shipment.etd,  // Estimated Time of Departure
      shipment.sailed_date,
      shipment.pickup_date,
      shipment.loading_date,
      shipment.created_at  // Fallback - always available
    ]

    for (const dateField of dateFields) {
      if (dateField) {
        const date = new Date(dateField)
        if (!isNaN(date.getTime())) {
          return date
        }
      }
    }
    return null
  }

  // Helper function to get delivery date from various fields
  const getDeliveryDate = (shipment: any): Date | null => {
    // Priority order for delivery date
    const dateFields = [
      shipment.actual_delivery,
      shipment.delivery_date,
      shipment.arrival_date,
      shipment.ata,  // Actual Time of Arrival
      shipment.discharged_date,
      shipment.completed_date,
      shipment.updated_at  // Fallback for delivered shipments
    ]

    for (const dateField of dateFields) {
      if (dateField) {
        const date = new Date(dateField)
        if (!isNaN(date.getTime())) {
          return date
        }
      }
    }

    // NO ESTIMATES - only real data from database

    return null
  }

  const avgDeliveryTime = (shipments: any[]): number => {
    const deliveredTimes: number[] = []

    console.log(`🔍 DETAILED ANALYSIS for ${shipments.length} shipments`)

    // Prima analizziamo tutti gli status e le date disponibili
    const statusAnalysis: { [key: string]: number } = {}
    const dateFieldsAnalysis = { hasCreatedAt: 0, hasUpdatedAt: 0, hasBothDates: 0 }

    shipments.forEach((shipment, index) => {
      const status = shipment.status?.toLowerCase() || 'no_status'
      statusAnalysis[status] = (statusAnalysis[status] || 0) + 1

      if (shipment.created_at) dateFieldsAnalysis.hasCreatedAt++
      if (shipment.updated_at) dateFieldsAnalysis.hasUpdatedAt++
      if (shipment.created_at && shipment.updated_at) dateFieldsAnalysis.hasBothDates++

      // Log i primi 3 shipment per debug
      if (index < 3) {
        console.log(`📦 Shipment ${index + 1}:`, {
          id: shipment.id,
          status: shipment.status,
          carrier: shipment.carrier_name,
          created_at: shipment.created_at,
          updated_at: shipment.updated_at,
          mode: detectShipmentMode(shipment)
        })
      }
    })

    console.log('📊 Status Analysis:', statusAnalysis)
    console.log('📅 Date Fields Analysis:', dateFieldsAnalysis)

    shipments.forEach((shipment) => {
      const status = shipment.status?.toLowerCase() || ''

      // Espandi i criteri per status completato - includi anche "sailing" finale
      const isCompleted = status.includes('discharged') ||
                         status.includes('delivered') ||
                         status.includes('completed') ||
                         status.includes('arrived') ||
                         status === 'consegnato' ||
                         status.includes('scaricate') ||
                         status.includes('arrivate')

      if (isCompleted && shipment.created_at && shipment.updated_at) {
        const createdDate = new Date(shipment.created_at)
        const updatedDate = new Date(shipment.updated_at)

        // Skip if dates are the same (no real transit time)
        if (createdDate.getTime() === updatedDate.getTime()) {
          console.log(`⏭️ Skipped same dates: ${shipment.id}`)
          return
        }

        const days = Math.abs(updatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
        const mode = detectShipmentMode(shipment)

        // Validazione MOLTO permissiva - accetta quasi tutti i valori realistici
        let minDays = 0.1, maxDays = 300

        switch (mode) {
          case 'air': minDays = 0.1; maxDays = 60; break  // Aereo: da 2 ore a 2 mesi
          case 'parcel': minDays = 0.1; maxDays = 45; break  // Corriere: da 2 ore a 6 settimane
          case 'road': minDays = 0.1; maxDays = 90; break  // Strada: da 2 ore a 3 mesi
          case 'sea': minDays = 1; maxDays = 300; break  // Mare: da 1 giorno a 10 mesi
        }

        if (days >= minDays && days <= maxDays) {
          deliveredTimes.push(days)
          console.log(`✅ Valid (${mode}): ${shipment.id} = ${days.toFixed(1)} days, status: ${status}, carrier: ${shipment.carrier_name}`)
        } else {
          console.log(`⚠️ Invalid time (${mode}): ${days.toFixed(1)} days for ${shipment.carrier_name}, status: ${status}`)
        }
      } else {
        if (!isCompleted) {
          console.log(`⏭️ Not completed: ${shipment.id}, status: ${status}`)
        }
        if (!shipment.created_at || !shipment.updated_at) {
          console.log(`⏭️ Missing dates: ${shipment.id}, created_at: ${!!shipment.created_at}, updated_at: ${!!shipment.updated_at}`)
        }
      }
    })

    const average = deliveredTimes.length > 0
      ? deliveredTimes.reduce((a, b) => a + b, 0) / deliveredTimes.length
      : 0

    console.log(`📊 FINAL RESULT: ${average.toFixed(1)} days from ${deliveredTimes.length} valid shipments out of ${shipments.length} total`)
    console.log(`📈 Valid times distribution:`, deliveredTimes.map(d => Math.round(d)).sort((a,b) => a-b))

    return average
  }

  const avgDeliveryTimeByMode = (shipments: any[], mode: string): number => {
    const modeShipments = shipments.filter(s => detectShipmentMode(s) === mode)

    console.log(`🚢 Mode Analysis for ${mode}:`)
    console.log(`   Found ${modeShipments.length} shipments of ${shipments.length} total`)

    // Debug: mostra alcuni esempi di come vengono classificate le spedizioni
    if (modeShipments.length > 0) {
      console.log(`   Sample ${mode} shipments:`)
      modeShipments.slice(0, 3).forEach((s, i) => {
        console.log(`     ${i+1}. ID: ${s.id}, Carrier: ${s.carrier_name}, Transport: ${s.transport_mode}, Status: ${s.status}`)
      })
    } else {
      console.log(`   No shipments found for mode ${mode}`)
      // Debug: mostra tutte le modalità rilevate
      const allModes: { [key: string]: number } = {}
      shipments.forEach(s => {
        const detectedMode = detectShipmentMode(s)
        allModes[detectedMode] = (allModes[detectedMode] || 0) + 1
      })
      console.log(`   All detected modes:`, allModes)
    }

    // ONLY real data - no hard-coded fallbacks
    return avgDeliveryTime(modeShipments)
  }

  // Determine transport mode for a shipment with better detection
  const detectShipmentMode = (shipment: any): string => {
    const transportMode = shipment.transport_mode?.toLowerCase() || ''
    const carrierName = shipment.carrier_name?.toLowerCase() || ''
    const status = shipment.status?.toLowerCase() || ''
    const containerNum = shipment.container_number || ''
    const blNumber = shipment.bl_number || ''
    const awbNumber = shipment.awb_number || ''

    // Priority 1: Check explicit transport mode field
    if (transportMode) {
      if (transportMode.includes('sea') || transportMode.includes('maritime') ||
          transportMode.includes('mare') || transportMode.includes('ocean')) return 'sea'
      if (transportMode.includes('air') || transportMode.includes('aereo') ||
          transportMode.includes('flight')) return 'air'
      if (transportMode.includes('road') || transportMode.includes('truck') ||
          transportMode.includes('stradale') || transportMode.includes('camion')) return 'road'
      if (transportMode.includes('parcel') || transportMode.includes('corriere') ||
          transportMode.includes('courier') || transportMode.includes('express')) return 'parcel'
    }

    // Priority 2: Check for container/BL numbers (Sea)
    if (containerNum || blNumber) return 'sea'

    // Priority 3: Check for AWB number (Air)
    if (awbNumber) return 'air'

    // Priority 4: Check carrier name patterns
    // Sea carriers
    if (carrierName.match(/(msc|maersk|cosco|evergreen|cma|cgm|hapag|lloyd|one|yang ming|zim|hmm|wan hai|oocl|mol|nyk|k.line|pil|seaboard|sealand|hamburg.sud|mediterranean)/i)) {
      return 'sea'
    }

    // Air carriers - ESCLUDI "AIR CHINA" perché spesso fanno anche marittimo
    if (carrierName.match(/(lufthansa|emirates|klm|alitalia|qatar|etihad|singapore|cathay|united|delta|american|british|iberia|air france|turkish|korean|japan|ana|china airlines)/i) && !carrierName.includes('air china')) {
      return 'air'
    }

    // Controllo specifico per AIR CHINA - se ha tempi lunghi (>15 giorni) è probabilmente mare
    if (carrierName.includes('air china')) {
      // Se abbiamo i dati temporali, usiamo quelli per decidere
      if (shipment.created_at && shipment.updated_at) {
        const createdDate = new Date(shipment.created_at)
        const updatedDate = new Date(shipment.updated_at)
        const days = Math.abs(updatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)

        // Se più di 15 giorni, probabilmente è trasporto marittimo gestito da Air China
        if (days > 15) {
          return 'sea'
        }
      }
      return 'air'
    }

    // Parcel/Courier carriers
    if (carrierName.match(/(ups|dhl|fedex|tnt|gls|sda|bartolini|brt|nexive|poste|aramex|dpd|hermes|purolator|chronopost|colissimo)/i)) {
      return 'parcel'
    }

    // Road/Truck carriers
    if (carrierName.match(/(truck|trasporti|logistics|spedizioni|autotrasporti|transport|freight|haulage|camion|tir)/i)) {
      return 'road'
    }

    // Priority 5: Check status for mode hints
    if (status.includes('sailing') || status.includes('vessel') || status.includes('port') ||
        status.includes('discharged') || status.includes('berthed')) return 'sea'
    if (status.includes('flight') || status.includes('airport') || status.includes('airway')) return 'air'

    // Priority 6: Volume/Weight heuristics
    const weight = parseFloat(shipment.total_weight_kg) || 0
    const volume = parseFloat(shipment.total_volume_cbm) || 0

    if (volume > 30 || weight > 3000) return 'sea'  // Large shipments likely sea
    if (weight < 50 && volume < 0.5) return 'parcel'  // Small shipments likely parcel
    if (weight < 500 && volume < 5) return 'air'  // Medium light shipments likely air

    // Default to road for everything else
    return 'road'
  }

  // Sum costs by transport mode
  const sumCostsByMode = (shipments: any[], additionalCosts: any[], mode: string): number => {
    const modeShipments = shipments.filter(s => detectShipmentMode(s) === mode)

    // Debug logging for unclassified shipments
    if (mode === 'sea') {
      const unclassifiedShipments = shipments.filter(s => {
        const detectedMode = detectShipmentMode(s)
        return detectedMode !== 'sea' && detectedMode !== 'air' &&
               detectedMode !== 'road' && detectedMode !== 'parcel'
      })

      if (unclassifiedShipments.length > 0) {
        console.log('⚠️ Sample unclassified shipments:', unclassifiedShipments.slice(0, 3).map(s => ({
          id: s.id,
          carrier_name: s.carrier_name,
          transport_mode: s.transport_mode,
          status: s.status,
          weight: s.total_weight_kg,
          volume: s.total_volume_cbm
        })))
      }
    }

    // Get IDs of filtered shipments
    const shipmentIds = modeShipments.map(s => s.id)

    // Filter additional costs for these shipments
    const modeAdditionalCosts = additionalCosts.filter(c =>
      shipmentIds.includes(c.shipment_id)
    )

    return sumCosts(modeShipments, modeAdditionalCosts)
  }

  // Calculate on-time delivery rate
  const calculateOnTimeDeliveryRate = (shipments: any[]): number => {
    const deliveredShipments = shipments.filter(s => {
      const status = s.status?.toLowerCase() || ''
      return status.includes('delivered') || status.includes('consegnato') ||
             status.includes('completed') || status.includes('arrivato')
    })

    if (deliveredShipments.length === 0) return 0

    const onTimeShipments = deliveredShipments.filter(s => {
      if (!s.eta || !s.delivery_date) return false
      const eta = new Date(s.eta)
      const deliveryDate = new Date(s.delivery_date)
      // Consider on-time if delivered within 2 days of ETA
      const diffDays = Math.abs(deliveryDate.getTime() - eta.getTime()) / (1000 * 60 * 60 * 24)
      return diffDays <= 2
    })

    return (onTimeShipments.length / deliveredShipments.length) * 100
  }

  // Count in-transit shipments
  const countInTransitShipments = (shipments: any[]): number => {
    return shipments.filter(s => {
      const status = s.status?.toLowerCase() || ''
      return status.includes('in_transit') || status.includes('in transito') ||
             status.includes('sailing') || status.includes('departed') ||
             status.includes('shipped') || status.includes('loading')
    }).length
  }

  // Load control shipments
  const loadControlShipments = async (shipments: any[]) => {
    try {
      // Filter shipments for control (in transit + recent arrivals)
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))

      const inTransitStates = ['in_transit', 'sailing', 'departed', 'shipped']
      const arrivedStates = ['arrived', 'delivered', 'discharged', 'completed']

      const controlData: ControlShipment[] = shipments
        .filter(s => {
          const status = (s.status || '').toLowerCase()
          const isInTransit = inTransitStates.some(state => status.includes(state))

          if (isInTransit) return true

          const isArrived = arrivedStates.some(state => status.includes(state))
          if (isArrived) {
            const arrivalDate = new Date(s.delivery_date || s.updated_at || s.created_at)
            return arrivalDate >= sevenDaysAgo
          }

          return false
        })
        .map(s => ({
          id: s.id,
          tracking_number: s.tracking_number || s.tracking_code || '-',
          status: s.status || 'unknown',
          carrier_name: s.carrier_name || '-',
          reference_number: s.reference_number || s.shipment_number || '-',
          origin: s.origin || s.origin_port || '-',
          destination: s.destination || s.destination_port || '-',
          departure_date: s.departure_date || s.created_at || '',
          eta: s.eta || '',
          arrival_date: s.delivery_date || s.arrival_date || ''
        }))

      setControlShipments(controlData)
      setFilteredControlShipments(controlData)

    } catch (error) {
      console.error('Error loading control shipments:', error)
    }
  }

  // Filter control shipments
  const filterControlShipments = (filterType: 'all' | 'in_transit' | 'recent_arrived') => {
    setControlFilter(filterType)

    if (filterType === 'all') {
      setFilteredControlShipments(controlShipments)
      return
    }

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))

    const filtered = controlShipments.filter(s => {
      const status = s.status.toLowerCase()

      if (filterType === 'in_transit') {
        const transitStates = ['in_transit', 'sailing', 'departed', 'shipped', 'loading']
        return transitStates.some(state => status.includes(state))
      }

      if (filterType === 'recent_arrived') {
        const arrivedStates = ['arrived', 'delivered', 'discharged', 'completed']
        const isArrived = arrivedStates.some(state => status.includes(state))

        if (isArrived && s.arrival_date) {
          const arrivalDate = new Date(s.arrival_date)
          return arrivalDate >= sevenDaysAgo
        }
      }

      return false
    })

    setFilteredControlShipments(filtered)
  }

  // Apply date preset
  const applyDatePreset = (preset: string) => {
    const now = new Date()
    let dateFrom = ''
    let dateTo = ''

    switch (preset) {
      case 'today':
        dateFrom = dateTo = now.toISOString().split('T')[0]
        break
      case 'last3days':
        dateFrom = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        dateTo = now.toISOString().split('T')[0]
        break
      case 'week':
        dateFrom = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        dateTo = now.toISOString().split('T')[0]
        break
      case 'month':
        dateFrom = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        dateTo = now.toISOString().split('T')[0]
        break
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        dateFrom = lastMonth.toISOString().split('T')[0]
        dateTo = lastMonthEnd.toISOString().split('T')[0]
        break
    }

    // Update both filters and applied filters for immediate effect on presets
    setFilters(prev => ({ ...prev, dateFrom, dateTo }))
    setAppliedFilters(prev => ({ ...prev, dateFrom, dateTo }))
  }

  // Apply current filters
  const applyFilters = () => {
    setAppliedFilters(filters)
  }

  // Reset filters
  const resetFilters = () => {
    const resetState = {
      company: 'all',
      carrier: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: ''
    }
    setFilters(resetState)
    setAppliedFilters(resetState)
  }

  // Refresh data
  const refreshData = async () => {
    setAutoUpdating(true)
    await loadDashboardData()
    setAutoUpdating(false)
  }

  // Load data on mount and filter changes
  useEffect(() => {
    if (user && !authLoading) {
      loadDashboardData()
    }
  }, [user, authLoading, loadDashboardData])

  // Reload data when applied filters change (not when filters change)
  useEffect(() => {
    if (user && !authLoading) {
      loadDashboardData()
    }
  }, [appliedFilters, user, authLoading, loadDashboardData])

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-muted rounded mb-2"></div>
          <div className="h-4 w-48 bg-muted rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Accesso Richiesto</h2>
            <p className="text-muted-foreground">Effettua il login per accedere alla dashboard.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Count control shipments by filter
  const controlCounts = {
    all: controlShipments.length,
    in_transit: controlShipments.filter(s => {
      const status = s.status.toLowerCase()
      const transitStates = ['in_transit', 'sailing', 'departed', 'shipped']
      return transitStates.some(state => status.includes(state))
    }).length,
    recent_arrived: controlShipments.filter(s => {
      const status = s.status.toLowerCase()
      const arrivedStates = ['arrived', 'delivered', 'discharged', 'completed']
      const isArrived = arrivedStates.some(state => status.includes(state))

      if (isArrived && s.arrival_date) {
        const arrivalDate = new Date(s.arrival_date)
        const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000))
        return arrivalDate >= sevenDaysAgo
      }
      return false
    }).length
  }

  // Prepare data for charts
  const prepareDashboardChartData = () => {
    if (!rawData.shipments) return null

    // Function to normalize status
    const normalizeStatus = (status: string): string => {
      const statusNormalization: { [key: string]: string } = {
        'IN_TRANSIT': 'in_transit',
        'in_transit': 'in_transit',
        'SAILING': 'sailing',
        'sailing': 'sailing',
        'DELIVERED': 'delivered',
        'delivered': 'delivered',
        'Consegnato': 'delivered',
        'DEPARTED': 'departed',
        'departed': 'departed',
        'DISCHARGED': 'discharged',
        'discharged': 'discharged',
        'COMPLETED': 'completed',
        'completed': 'completed',
        'CANCELLED': 'cancelled',
        'cancelled': 'cancelled'
      }
      return statusNormalization[status] || status.toLowerCase()
    }

    // Shipments by status (normalized)
    const statusCounts: { [key: string]: number } = {}
    const rawStatuses: string[] = []
    rawData.shipments.forEach((shipment: any) => {
      const originalStatus = shipment.status || 'unknown'
      rawStatuses.push(originalStatus)
      const normalizedStatus = normalizeStatus(originalStatus)
      statusCounts[normalizedStatus] = (statusCounts[normalizedStatus] || 0) + 1
    })


    // Define status colors and order
    const statusConfig = {
      'sailing': { label: 'In navigazione', color: '#3b82f6' },
      'in_transit': { label: 'In transito', color: '#06b6d4' },
      'departed': { label: 'Partite', color: '#8b5cf6' },
      'delivered': { label: 'Consegnate', color: '#10b981' },
      'discharged': { label: 'Scaricate', color: '#f59e0b' },
      'completed': { label: 'Completate', color: '#84cc16' },
      'cancelled': { label: 'Cancellate', color: '#ef4444' },
      'unknown': { label: 'Sconosciuto', color: '#6b7280' }
    }

    // Group by final label to eliminate duplicates
    const labelCounts: { [label: string]: { count: number, color: string } } = {}

    Object.entries(statusCounts).forEach(([status, count]) => {
      const config = statusConfig[status as keyof typeof statusConfig]
      const label = config?.label || status
      const color = config?.color || '#6b7280'

      if (labelCounts[label]) {
        labelCounts[label].count += count
      } else {
        labelCounts[label] = { count, color }
      }
    })

    const shipmentsByStatus = Object.entries(labelCounts)
      .map(([label, data]) => ({
        status: label,
        count: data.count,
        color: data.color
      }))
      .filter(item => item.count > 0) // Remove empty statuses
      .sort((a, b) => b.count - a.count) // Sort by count descending

    // Monthly trends (last 6 months)
    const monthlyTrends: Array<{ period: string; value: number }> = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthShipments = rawData.shipments.filter((shipment: any) => {
        const shipmentDate = new Date(shipment.created_at)
        return shipmentDate.getMonth() === date.getMonth() &&
               shipmentDate.getFullYear() === date.getFullYear()
      })

      monthlyTrends.push({
        period: date.toLocaleDateString('it-IT', { month: 'short' }),
        value: monthShipments.length
      })
    }

    // Top carriers
    const carrierCounts: { [key: string]: number } = {}
    rawData.shipments.forEach((shipment: any) => {
      const carrier = shipment.carrier_name || 'Sconosciuto'
      carrierCounts[carrier] = (carrierCounts[carrier] || 0) + 1
    })

    const topCarriers = Object.entries(carrierCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([label, value]) => ({ label, value }))

    // Cost metrics - filter costs based on filtered shipments
    const shipmentIds = rawData.shipments.map((s: any) => s.id)
    const filteredCosts = rawData.additionalCosts?.filter((cost: { shipment_id: string; amount: number }) =>
      shipmentIds.includes(cost.shipment_id)
    ) || []

    // Debug logging
    console.log('🔍 Cost Calculation Debug:', {
      totalShipments: rawData.shipments.length,
      shipmentIds: shipmentIds.slice(0, 5), // first 5 IDs
      totalAdditionalCosts: rawData.additionalCosts?.length || 0,
      filteredCostsCount: filteredCosts.length,
      filteredCostAmounts: filteredCosts.map((c: { amount: number }) => c.amount),
    })

    const totalCosts = filteredCosts.reduce((sum: number, cost: { amount: number }) => sum + (cost.amount || 0), 0)
    const avgCostPerShipment = rawData.shipments.length > 0 ? totalCosts / rawData.shipments.length : 0

    const costMetrics = [
      { label: 'Costi Totali', value: totalCosts },
      { label: 'Costo Medio/Spedizione', value: avgCostPerShipment },
      { label: 'Costi Accessori', value: totalCosts * 0.15 },
      { label: 'Costi Trasporto', value: totalCosts * 0.85 }
    ]

    // Volume metrics (last 6 months)
    const volumeMetrics = monthlyTrends.map(trend => {
      const monthShipments = rawData.shipments.filter((shipment: any) => {
        const shipmentDate = new Date(shipment.created_at)
        const trendDate = new Date()
        trendDate.setMonth(trendDate.getMonth() - (5 - monthlyTrends.indexOf(trend)))
        return shipmentDate.getMonth() === trendDate.getMonth()
      })

      const totalVolume = monthShipments.reduce((sum: number, shipment: any) =>
        sum + (parseFloat(shipment.total_volume_cbm) || 0), 0)

      return {
        period: trend.period,
        value: totalVolume
      }
    })

    return {
      shipmentsByStatus,
      monthlyTrends,
      topCarriers,
      costMetrics,
      volumeMetrics
    }
  }

  const chartData = prepareDashboardChartData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Sistema unificato di metriche e analisi</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={autoUpdating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${autoUpdating ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-destructive/10 border-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-center text-destructive">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Errore nel caricamento</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={refreshData}
                  className="mt-2 text-sm underline hover:no-underline"
                  disabled={autoUpdating}
                >
                  Riprova
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Shipments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Spedizioni in Controllo
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">In viaggio + Arrivate negli ultimi 7 giorni</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Filter buttons */}
              <div className="btn-group flex gap-1">
                <Button
                  variant={controlFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => filterControlShipments('all')}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  Tutti ({controlCounts.all})
                </Button>
                <Button
                  variant={controlFilter === 'in_transit' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => filterControlShipments('in_transit')}
                  className="flex items-center gap-1"
                >
                  <Ship className="h-4 w-4" />
                  In Viaggio ({controlCounts.in_transit})
                </Button>
                <Button
                  variant={controlFilter === 'recent_arrived' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => filterControlShipments('recent_arrived')}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Arrivati 7gg ({controlCounts.recent_arrived})
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={autoUpdating}
                title="Aggiorna dati"
              >
                <RefreshCw className={`h-4 w-4 ${autoUpdating ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredControlShipments.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">Nessuna spedizione trovata</h3>
              <p className="text-muted-foreground">Non ci sono spedizioni corrispondenti ai criteri selezionati</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Tag className="h-4 w-4 inline mr-1" />
                      Tracking Number
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Info className="h-4 w-4 inline mr-1" />
                      Stato
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Building className="h-4 w-4 inline mr-1" />
                      Carrier
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Tag className="h-4 w-4 inline mr-1" />
                      Riferimento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Globe className="h-4 w-4 inline mr-1" />
                      Origine
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Globe className="h-4 w-4 inline mr-1" />
                      Destinazione
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Partenza
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <Clock className="h-4 w-4 inline mr-1" />
                      ETA
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      Arrivo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {filteredControlShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-foreground">
                        {shipment.tracking_number}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Badge variant={getStatusVariant(shipment.status)}>
                          {formatStatus(shipment.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {shipment.carrier_name}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {shipment.reference_number}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {shipment.origin}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        {shipment.destination}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground text-center">
                        {formatDate(shipment.departure_date)}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground text-center">
                        {formatDate(shipment.eta)}
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground text-center">
                        {formatDate(shipment.arrival_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters Section */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <Label htmlFor="companyFilter">Compagnia</Label>
              <Select value={filters.company} onValueChange={(value) => setFilters(prev => ({ ...prev, company: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutte le compagnie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le compagnie</SelectItem>
                  {/* Add dynamic options here */}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="carrierFilter">Spedizioniere</Label>
              <Select value={filters.carrier} onValueChange={(value) => setFilters(prev => ({ ...prev, carrier: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti gli spedizionieri" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli spedizionieri</SelectItem>
                  {/* Add dynamic options here */}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="statusFilter">Stato</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="delivered">Consegnato</SelectItem>
                  <SelectItem value="in_transit">In transito</SelectItem>
                  <SelectItem value="pending">In attesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFromFilter">Da:</Label>
              <DateInput
                id="dateFromFilter"
                value={filters.dateFrom}
                onChange={(value) => {
                  setFilters(prev => ({ ...prev, dateFrom: value }))
                }}
              />
            </div>

            <div>
              <Label htmlFor="dateToFilter">A:</Label>
              <DateInput
                id="dateToFilter"
                value={filters.dateTo}
                onChange={(value) => {
                  setFilters(prev => ({ ...prev, dateTo: value }))
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex gap-1 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => applyDatePreset('today')}>Oggi</Button>
                <Button variant="outline" size="sm" onClick={() => applyDatePreset('last3days')}>3gg</Button>
                <Button variant="outline" size="sm" onClick={() => applyDatePreset('week')}>7gg</Button>
              </div>
              <div className="flex gap-1 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => applyDatePreset('month')}>30gg</Button>
                <Button variant="outline" size="sm" onClick={() => applyDatePreset('lastMonth')}>Mese Scorso</Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={applyFilters}
                  className="font-medium"
                >
                  Applica Filtri
                </Button>
                <Button variant="outline" size="sm" onClick={resetFilters}>Reset</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards - Sezione Principale */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Metriche Principali</CardTitle>
            <Badge variant="outline" className="text-xs">
              {KPI_CONFIG.filter(k => k.id.includes('total') || k.id.includes('avg')).length} KPI Attivi
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {KPI_CONFIG.slice(0, 6).map((kpi) => {
              const value = processedMetrics?.kpis[kpi.id] || 0
              return (
                <div
                  key={kpi.id}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="p-3 rounded-xl bg-primary/10"
                    >
                      <div className="text-primary">
                        {getIconComponent(kpi.icon)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.name}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatKPIValue(value, kpi.format)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards - Tempi di Consegna per Modalità */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Tempi Medi di Consegna per Modalità
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {KPI_CONFIG.filter(k => k.id.includes('delivery_time')).map((kpi) => {
              const value = processedMetrics?.kpis[kpi.id] || 0
              return (
                <div
                  key={kpi.id}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-secondary/50">
                      <div className="text-secondary-foreground">
                        {getIconComponent(kpi.icon)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.name}</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatKPIValue(value, kpi.format)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards - Costi per Modalità */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Costi per Modalità di Trasporto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {KPI_CONFIG.filter(k => k.id.includes('_total_cost')).map((kpi) => {
              const value = processedMetrics?.kpis[kpi.id] || 0
              return (
                <div
                  key={kpi.id}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-secondary/50">
                      <div className="text-secondary-foreground">
                        {getIconComponent(kpi.icon)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.name}</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatKPIValue(value, kpi.format)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards - Metriche Avanzate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Metriche Avanzate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {KPI_CONFIG.filter(k => k.id.includes('cost_per') || k.id.includes('rate') || k.id === 'in_transit_count').map((kpi) => {
              const value = processedMetrics?.kpis[kpi.id] || 0
              return (
                <div
                  key={kpi.id}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-secondary/50">
                      <div className="text-secondary-foreground">
                        {getIconComponent(kpi.icon)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.name}</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatKPIValue(value, kpi.format)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      {chartData && (
        <DashboardCharts
          data={chartData}
          isLoading={loading}
        />
      )}

      {/* System Status */}
      <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="text-sm font-medium text-emerald-900 dark:text-emerald-100">✅ Advanced Dashboard Operativa</h3>
              <div className="text-xs text-emerald-800 dark:text-emerald-200 mt-1 space-y-1">
                <p>• Spedizioni: {rawData.shipments?.length || 0}</p>
                <p>• Trackings: {rawData.trackings?.length || 0}</p>
                <p>• Controllo Spedizioni: {controlShipments.length}</p>
                <p>• Metriche Calcolate: {processedMetrics ? Object.keys(processedMetrics.kpis).length : 0} KPI</p>
                <p>• Sistema Unificato: Attivo ✅</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}