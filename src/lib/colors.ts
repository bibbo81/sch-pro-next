// Sistema di colori centralizzato per consistenza across tutte le pagine

export const colorScheme = {
  // Colori primari per icone e stati
  primary: {
    blue: 'text-blue-500',
    green: 'text-green-500',
    orange: 'text-orange-500',
    red: 'text-red-500',
    purple: 'text-purple-500',
    yellow: 'text-yellow-500',
    cyan: 'text-cyan-500',
    indigo: 'text-indigo-500',
    gray: 'text-gray-500'
  },

  // Background colors per badges e stati
  background: {
    blue: 'bg-blue-50 dark:bg-blue-950',
    green: 'bg-green-50 dark:bg-green-950',
    orange: 'bg-orange-50 dark:bg-orange-950',
    red: 'bg-red-50 dark:bg-red-950',
    purple: 'bg-purple-50 dark:bg-purple-950',
    yellow: 'bg-yellow-50 dark:bg-yellow-950',
    cyan: 'bg-cyan-50 dark:bg-cyan-950',
    indigo: 'bg-indigo-50 dark:bg-indigo-950',
    gray: 'bg-gray-50 dark:bg-gray-950'
  },

  // Text colors per badges e stati
  text: {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    gray: 'text-gray-600 dark:text-gray-400'
  },

  // Border colors
  border: {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    orange: 'border-l-orange-500',
    red: 'border-l-red-500',
    purple: 'border-l-purple-500',
    yellow: 'border-l-yellow-500',
    cyan: 'border-l-cyan-500',
    indigo: 'border-l-indigo-500',
    gray: 'border-l-gray-500'
  }
}

// Mappatura specifica per tipi di entità
export const entityColors = {
  // Spedizioni
  shipments: {
    total: colorScheme.primary.blue,
    in_transit: colorScheme.primary.orange,
    value: colorScheme.primary.green,
    packages: colorScheme.primary.blue,
    destinations: colorScheme.primary.green,
    tracking: colorScheme.primary.purple
  },

  // Prodotti
  products: {
    total: colorScheme.primary.blue,
    active: colorScheme.primary.green,
    low_stock: colorScheme.primary.yellow,
    out_of_stock: colorScheme.primary.red,
    value: colorScheme.primary.purple,
    categories: colorScheme.primary.indigo
  },

  // Tracking
  tracking: {
    total: colorScheme.primary.blue,
    in_transit: colorScheme.primary.orange,
    delivered: colorScheme.primary.green,
    delayed: colorScheme.primary.red
  },

  // Carriers/Forwarders
  carriers: {
    shipments: colorScheme.primary.green,
    spent: colorScheme.primary.purple,
    active: colorScheme.primary.orange
  },

  // Stati spedizioni
  status: {
    created: colorScheme.primary.blue,
    confirmed: colorScheme.primary.cyan,
    in_progress: colorScheme.primary.orange,
    shipped: colorScheme.primary.purple,
    in_transit: colorScheme.primary.yellow,
    delivered: colorScheme.primary.green,
    completed: colorScheme.primary.green,
    cancelled: colorScheme.primary.red,
    delayed: colorScheme.primary.red,
    unknown: colorScheme.primary.gray
  }
}

// Helper function per ottenere colore basato su tipo e categoria
export function getEntityColor(type: keyof typeof entityColors, category: string): string {
  const typeColors = entityColors[type] as Record<string, string>
  return typeColors[category] || colorScheme.primary.gray
}

// Colori hex per grafici e chart
export const hexColors = {
  blue: '#3b82f6',
  green: '#10b981',
  orange: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  yellow: '#eab308',
  cyan: '#06b6d4',
  indigo: '#6366f1',
  gray: '#6b7280',
  lime: '#84cc16'
}

// Status config per grafici
export const statusConfig = {
  'sailing': { label: 'In navigazione', color: hexColors.blue },
  'in_transit': { label: 'In transito', color: hexColors.cyan },
  'departed': { label: 'Partite', color: hexColors.purple },
  'delivered': { label: 'Consegnate', color: hexColors.green },
  'discharged': { label: 'Scaricate', color: hexColors.orange },
  'completed': { label: 'Completate', color: hexColors.lime },
  'cancelled': { label: 'Cancellate', color: hexColors.red },
  'unknown': { label: 'Sconosciuto', color: hexColors.gray }
}

// Helper per status mapping
export function getStatusColor(status: string): string {
  const statusKey = status.toLowerCase().replace(/[^a-z_]/g, '_') as keyof typeof entityColors.status
  return entityColors.status[statusKey] || colorScheme.primary.gray
}