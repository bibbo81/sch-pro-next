import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
  formatPercent,
  formatDecimal,
  formatWeight,
  formatVolume,
  formatDate,
  formatDateTime,
  formatDateFull,
} from '../formatters'

describe('formatCurrency', () => {
  it('formats a positive number', () => {
    const result = formatCurrency(1234.56)
    // Intl output varies by environment; check it contains the value and EUR symbol
    expect(result).toContain('1234,56')
    expect(result).toContain('€')
  })

  it('returns zero for null', () => {
    expect(formatCurrency(null)).toContain('0,00')
  })

  it('returns zero for undefined', () => {
    expect(formatCurrency(undefined)).toContain('0,00')
  })

  it('returns zero for NaN', () => {
    expect(formatCurrency(NaN)).toContain('0,00')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toContain('0,00')
  })
})

describe('formatCurrencyCompact', () => {
  it('formats large numbers compactly', () => {
    const result = formatCurrencyCompact(1500000)
    expect(result).toBeTruthy()
  })

  it('returns zero for null', () => {
    expect(formatCurrencyCompact(null)).toContain('0')
  })
})

describe('formatNumber', () => {
  it('formats with locale separators', () => {
    const result = formatNumber(1234567)
    expect(result).toContain('1.234.567')
  })

  it('returns 0 for null', () => {
    expect(formatNumber(null)).toBe('0')
  })

  it('returns 0 for NaN', () => {
    expect(formatNumber(NaN)).toBe('0')
  })
})

describe('formatPercent', () => {
  it('formats percentage from 0-100 scale', () => {
    const result = formatPercent(75)
    expect(result).toContain('75')
    expect(result).toContain('%')
  })

  it('returns 0% for null', () => {
    expect(formatPercent(null)).toBe('0%')
  })
})

describe('formatDecimal', () => {
  it('formats with default 2 digits', () => {
    expect(formatDecimal(3.14159)).toBe('3.14')
  })

  it('formats with custom digits', () => {
    expect(formatDecimal(3.14159, 3)).toBe('3.142')
  })

  it('returns 0 for null', () => {
    expect(formatDecimal(null)).toBe('0')
  })
})

describe('formatWeight', () => {
  it('formats small weights in kg', () => {
    expect(formatWeight(500)).toBe('500.0 kg')
  })

  it('converts to tonnes for >= 1000', () => {
    expect(formatWeight(2500)).toBe('2.5 t')
  })

  it('returns 0 kg for null', () => {
    expect(formatWeight(null)).toBe('0 kg')
  })
})

describe('formatVolume', () => {
  it('formats volume', () => {
    expect(formatVolume(12.5)).toBe('12.50 m³')
  })

  it('returns 0 m³ for null', () => {
    expect(formatVolume(null)).toBe('0 m³')
  })
})

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2025-06-15')
    expect(result).toBeTruthy()
    expect(result).not.toBe('-')
  })

  it('returns - for null', () => {
    expect(formatDate(null)).toBe('-')
  })

  it('returns - for undefined', () => {
    expect(formatDate(undefined)).toBe('-')
  })

  it('returns - for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('-')
  })
})

describe('formatDateTime', () => {
  it('formats a date-time string', () => {
    const result = formatDateTime('2025-06-15T14:30:00Z')
    expect(result).toBeTruthy()
    expect(result).not.toBe('-')
  })

  it('returns - for null', () => {
    expect(formatDateTime(null)).toBe('-')
  })
})

describe('formatDateFull', () => {
  it('formats a date with full month', () => {
    const result = formatDateFull('2025-06-15')
    expect(result).toBeTruthy()
    expect(result).not.toBe('-')
  })
})
