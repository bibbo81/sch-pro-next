const LOCALE = 'it-IT'

// === Currency ===

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const currencyCompactFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '€ 0,00'
  return currencyFormatter.format(value)
}

export function formatCurrencyCompact(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '€ 0'
  return currencyCompactFormatter.format(value)
}

// === Numbers ===

const numberFormatter = new Intl.NumberFormat(LOCALE)

const percentFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatNumber(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '0'
  return numberFormatter.format(value)
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '0%'
  return percentFormatter.format(value / 100)
}

export function formatDecimal(value: number | null | undefined, digits = 2): string {
  if (value == null || isNaN(value)) return '0'
  return value.toFixed(digits)
}

export function formatWeight(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '0 kg'
  if (value >= 1000) return `${formatDecimal(value / 1000, 1)} t`
  return `${formatDecimal(value, 1)} kg`
}

export function formatVolume(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '0 m³'
  return `${formatDecimal(value, 2)} m³`
}

// === Dates ===

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const dateFullFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const relativeTimeFormatter = new Intl.RelativeTimeFormat(LOCALE, {
  numeric: 'auto',
})

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'
  return dateFormatter.format(d)
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'
  return dateTimeFormatter.format(d)
}

export function formatDateFull(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'
  return dateFullFormatter.format(d)
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'

  const now = Date.now()
  const diffMs = d.getTime() - now
  const diffSeconds = Math.round(diffMs / 1000)
  const diffMinutes = Math.round(diffMs / 60000)
  const diffHours = Math.round(diffMs / 3600000)
  const diffDays = Math.round(diffMs / 86400000)

  if (Math.abs(diffSeconds) < 60) return relativeTimeFormatter.format(diffSeconds, 'second')
  if (Math.abs(diffMinutes) < 60) return relativeTimeFormatter.format(diffMinutes, 'minute')
  if (Math.abs(diffHours) < 24) return relativeTimeFormatter.format(diffHours, 'hour')
  return relativeTimeFormatter.format(diffDays, 'day')
}
