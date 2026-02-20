export interface ControlShipment {
  id: string
  tracking_number: string
  status: string
  carrier_name: string
  destination: string
  eta: string
}

export interface DashboardMetrics {
  totalShipments: number
  inTransitCount: number
  deliveredThisMonth: number
  totalCosts: number
  avgCostPerShipment: number
  totalWeight: number
  avgDeliveryTime: number
}

export interface ChartData {
  shipmentsByStatus: Array<{ status: string; count: number; color: string }>
  monthlyTrends: Array<{ period: string; value: number }>
  topCarriers: Array<{ label: string; value: number }>
  costMetrics: Array<{ label: string; value: number }>
  volumeMetrics: Array<{ period: string; value: number }>
}

// --- Transport mode detection ---

export function detectShipmentMode(shipment: any): string {
  const transportMode = shipment.transport_mode?.toLowerCase() || ''
  const carrierName = shipment.carrier_name?.toLowerCase() || ''
  const containerNum = shipment.container_number || ''
  const blNumber = shipment.bl_number || ''
  const awbNumber = shipment.awb_number || ''

  if (transportMode) {
    if (transportMode.match(/sea|maritime|mare|ocean/)) return 'sea'
    if (transportMode.match(/air|aereo|flight/)) return 'air'
    if (transportMode.match(/road|truck|stradale|camion/)) return 'road'
    if (transportMode.match(/parcel|corriere|courier|express/)) return 'parcel'
  }

  if (containerNum || blNumber) return 'sea'
  if (awbNumber) return 'air'

  if (carrierName.match(/(msc|maersk|cosco|evergreen|cma|cgm|hapag|lloyd|one|yang ming|zim|hmm|wan hai|oocl)/i)) return 'sea'
  if (carrierName.match(/(lufthansa|emirates|klm|qatar|etihad|singapore|cathay|turkish|korean)/i)) return 'air'
  if (carrierName.match(/(ups|dhl|fedex|tnt|gls|sda|bartolini|brt|aramex|dpd)/i)) return 'parcel'
  if (carrierName.match(/(truck|trasporti|logistics|spedizioni|autotrasporti|transport)/i)) return 'road'

  const weight = parseFloat(shipment.total_weight_kg) || 0
  const volume = parseFloat(shipment.total_volume_cbm) || 0
  if (volume > 30 || weight > 3000) return 'sea'
  if (weight < 50 && volume < 0.5) return 'parcel'
  if (weight < 500 && volume < 5) return 'air'

  return 'road'
}

// --- Metrics calculation ---

function sumShipmentCosts(shipments: any[], additionalCosts: any[]): number {
  const shipmentIds = new Set(shipments.map(s => s.id))
  let total = 0

  shipments.forEach(s => {
    total += (parseFloat(s.freight_cost) || 0)
    total += (parseFloat(s.other_costs) || 0)
    total += (parseFloat(s.insurance_cost) || 0)
    total += (parseFloat(s.customs_cost) || 0)
  })

  additionalCosts
    .filter(c => shipmentIds.has(c.shipment_id))
    .forEach(c => { total += (parseFloat(c.amount) || 0) })

  return total
}

function countByStatus(shipments: any[], patterns: string[]): number {
  return shipments.filter(s => {
    const status = s.status?.toLowerCase() || ''
    return patterns.some(p => status.includes(p))
  }).length
}

function calcAvgDeliveryTime(shipments: any[]): number {
  const times: number[] = []

  shipments.forEach(s => {
    const status = s.status?.toLowerCase() || ''
    const isCompleted = status.includes('discharged') || status.includes('delivered') ||
                       status.includes('completed') || status.includes('arrived')

    if (isCompleted && s.created_at && s.updated_at) {
      const created = new Date(s.created_at)
      const updated = new Date(s.updated_at)
      if (created.getTime() !== updated.getTime()) {
        const days = Math.abs(updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        if (days >= 0.1 && days <= 300) {
          times.push(days)
        }
      }
    }
  })

  return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
}

export function calculateMetrics(shipments: any[], additionalCosts: any[]): DashboardMetrics {
  const totalCosts = sumShipmentCosts(shipments, additionalCosts)
  const totalWeight = shipments.reduce((sum, s) => sum + (parseFloat(s.total_weight_kg) || 0), 0)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const deliveredThisMonth = shipments.filter(s => {
    const status = s.status?.toLowerCase() || ''
    const isDelivered = status.includes('delivered') || status.includes('completed')
    if (!isDelivered) return false
    const date = new Date(s.updated_at || s.created_at)
    return date >= monthStart
  }).length

  return {
    totalShipments: shipments.length,
    inTransitCount: countByStatus(shipments, ['in_transit', 'sailing', 'departed', 'shipped']),
    deliveredThisMonth,
    totalCosts,
    avgCostPerShipment: shipments.length > 0 ? totalCosts / shipments.length : 0,
    totalWeight,
    avgDeliveryTime: calcAvgDeliveryTime(shipments),
  }
}

// --- Control shipments ---

const TRANSIT_STATES = ['in_transit', 'sailing', 'departed', 'shipped']
const ARRIVED_STATES = ['arrived', 'delivered', 'discharged', 'completed']

export function buildControlShipments(shipments: any[]): ControlShipment[] {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  return shipments
    .filter(s => {
      const status = (s.status || '').toLowerCase()
      if (TRANSIT_STATES.some(st => status.includes(st))) return true

      if (ARRIVED_STATES.some(st => status.includes(st))) {
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
      destination: s.destination || s.destination_port || '-',
      eta: s.eta || '',
    }))
}

export function filterControlShipments(
  shipments: ControlShipment[],
  filterType: 'all' | 'in_transit' | 'recent_arrived'
): ControlShipment[] {
  if (filterType === 'all') return shipments

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  return shipments.filter(s => {
    const status = s.status.toLowerCase()

    if (filterType === 'in_transit') {
      return TRANSIT_STATES.some(st => status.includes(st))
    }

    if (filterType === 'recent_arrived') {
      const isArrived = ARRIVED_STATES.some(st => status.includes(st))
      if (isArrived && s.eta) {
        return new Date(s.eta) >= sevenDaysAgo
      }
    }
    return false
  })
}

// --- Chart data preparation ---

export function prepareChartData(shipments: any[], additionalCosts: any[]): ChartData {
  const statusConfig: Record<string, { label: string; color: string }> = {
    in_transit: { label: 'In Transito', color: '#3b82f6' },
    sailing: { label: 'In Navigazione', color: '#0ea5e9' },
    delivered: { label: 'Consegnato', color: '#22c55e' },
    departed: { label: 'Partito', color: '#6366f1' },
    discharged: { label: 'Scaricato', color: '#8b5cf6' },
    completed: { label: 'Completato', color: '#10b981' },
    cancelled: { label: 'Annullato', color: '#6b7280' },
    arrived: { label: 'Arrivato', color: '#a855f7' },
    pending: { label: 'In Attesa', color: '#f59e0b' },
    registered: { label: 'Registrato', color: '#94a3b8' },
  }

  // Shipments by status
  const statusCounts: Record<string, number> = {}
  shipments.forEach(s => {
    const status = (s.status || 'unknown').toLowerCase()
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })

  const labelCounts: Record<string, { count: number; color: string }> = {}
  Object.entries(statusCounts).forEach(([status, count]) => {
    const cfg = statusConfig[status] || { label: status, color: '#6b7280' }
    if (labelCounts[cfg.label]) {
      labelCounts[cfg.label].count += count
    } else {
      labelCounts[cfg.label] = { count, color: cfg.color }
    }
  })

  const shipmentsByStatus = Object.entries(labelCounts)
    .map(([status, data]) => ({ status, count: data.count, color: data.color }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)

  // Monthly trends (last 6 months)
  const now = new Date()
  const monthlyTrends: Array<{ period: string; value: number }> = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const count = shipments.filter(s => {
      const d = new Date(s.created_at)
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
    }).length
    monthlyTrends.push({
      period: date.toLocaleDateString('it-IT', { month: 'short' }),
      value: count,
    })
  }

  // Top carriers
  const carrierCounts: Record<string, number> = {}
  shipments.forEach(s => {
    const carrier = s.carrier_name || 'Sconosciuto'
    carrierCounts[carrier] = (carrierCounts[carrier] || 0) + 1
  })
  const topCarriers = Object.entries(carrierCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([label, value]) => ({ label, value }))

  // Cost metrics
  const shipmentIds = new Set(shipments.map(s => s.id))
  const filteredCosts = additionalCosts.filter(c => shipmentIds.has(c.shipment_id))
  const totalCosts = filteredCosts.reduce((sum, c) => sum + (c.amount || 0), 0)
  const avgCost = shipments.length > 0 ? totalCosts / shipments.length : 0

  const costMetrics = [
    { label: 'Costi Totali', value: totalCosts },
    { label: 'Costo Medio', value: avgCost },
    { label: 'Costi Trasporto', value: totalCosts * 0.85 },
    { label: 'Costi Accessori', value: totalCosts * 0.15 },
  ]

  // Volume metrics
  const volumeMetrics = monthlyTrends.map((trend, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const vol = shipments
      .filter(s => {
        const d = new Date(s.created_at)
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
      })
      .reduce((sum, s) => sum + (parseFloat(s.total_volume_cbm) || 0), 0)
    return { period: trend.period, value: vol }
  })

  return { shipmentsByStatus, monthlyTrends, topCarriers, costMetrics, volumeMetrics }
}
