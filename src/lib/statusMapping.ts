export interface StatusConfig {
  label: string
  color: string
  bgColor: string
  icon: string
  priority: number
}

export const STATUS_MAPPING: Record<string, string> = {
  // Stati grezzi → Stati normalizzati
  'pending': 'registered',
  'registered': 'registered',
  'accepted': 'registered',
  'ready_for_pickup': 'registered',
  'picked_up': 'in_transit',
  'in_transit': 'in_transit',
  'on_the_way': 'in_transit',
  'departed': 'in_transit',
  'arrived_at_port': 'arrived',
  'arrived': 'arrived',
  'at_destination': 'arrived',
  'customs_clearance': 'customs_hold',
  'customs_hold': 'customs_hold',
  'cleared_customs': 'customs_cleared',
  'customs_cleared': 'customs_cleared',
  'out_for_delivery': 'out_for_delivery',
  'delivery_attempt': 'out_for_delivery',
  'delivered': 'delivered',
  'completed': 'delivered',
  'exception': 'exception',
  'delayed': 'delayed',
  'returned': 'exception',
  'cancelled': 'cancelled',
  'void': 'cancelled'
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  registered: {
    label: 'Registrato',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: '📝',
    priority: 1
  },
  in_transit: {
    label: 'In Transito',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: '🚛',
    priority: 2
  },
  arrived: {
    label: 'Arrivato',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: '🏢',
    priority: 3
  },
  customs_hold: {
    label: 'In Dogana',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: '🛃',
    priority: 4
  },
  customs_cleared: {
    label: 'Sdoganato',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '✅',
    priority: 5
  },
  out_for_delivery: {
    label: 'In Consegna',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: '🚚',
    priority: 6
  },
  delivered: {
    label: 'Consegnato',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '✅',
    priority: 7
  },
  delayed: {
    label: 'In Ritardo',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '⚠️',
    priority: 8
  },
  exception: {
    label: 'Eccezione',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '❌',
    priority: 9
  },
  cancelled: {
    label: 'Annullato',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: '🚫',
    priority: 10
  }
}

export function normalizeStatus(rawStatus: string): string {
  if (!rawStatus) return 'registered'
  
  const normalized = rawStatus.toLowerCase().trim()
  return STATUS_MAPPING[normalized] || 'registered'
}

export function getStatusConfig(normalizedStatus: string): StatusConfig {
  return STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG['registered']
}

export function formatStatus(rawStatus: string): { 
  normalized: string
  config: StatusConfig 
} {
  const normalized = normalizeStatus(rawStatus)
  const config = getStatusConfig(normalized)
  return { normalized, config }
}