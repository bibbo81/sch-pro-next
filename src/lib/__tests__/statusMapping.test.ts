import { describe, it, expect } from 'vitest'
import {
  normalizeStatus,
  getStatusConfig,
  formatStatus,
  STATUS_MAPPING,
  STATUS_CONFIG,
} from '../statusMapping'

describe('normalizeStatus', () => {
  it('maps known statuses correctly', () => {
    expect(normalizeStatus('pending')).toBe('registered')
    expect(normalizeStatus('in_transit')).toBe('in_transit')
    expect(normalizeStatus('delivered')).toBe('delivered')
    expect(normalizeStatus('completed')).toBe('delivered')
    expect(normalizeStatus('customs_clearance')).toBe('customs_hold')
    expect(normalizeStatus('cancelled')).toBe('cancelled')
    expect(normalizeStatus('void')).toBe('cancelled')
  })

  it('is case-insensitive', () => {
    expect(normalizeStatus('IN_TRANSIT')).toBe('in_transit')
    expect(normalizeStatus('Delivered')).toBe('delivered')
  })

  it('trims whitespace', () => {
    expect(normalizeStatus('  delivered  ')).toBe('delivered')
  })

  it('defaults to registered for unknown statuses', () => {
    expect(normalizeStatus('unknown_xyz')).toBe('registered')
  })

  it('defaults to registered for empty string', () => {
    expect(normalizeStatus('')).toBe('registered')
  })
})

describe('getStatusConfig', () => {
  it('returns config for known statuses', () => {
    const config = getStatusConfig('in_transit')
    expect(config.label).toBe('In Transito')
    expect(config.priority).toBe(2)
  })

  it('returns registered config as fallback', () => {
    const config = getStatusConfig('nonexistent')
    expect(config.label).toBe('Registrato')
  })

  it('includes all required fields', () => {
    const config = getStatusConfig('delivered')
    expect(config).toHaveProperty('label')
    expect(config).toHaveProperty('color')
    expect(config).toHaveProperty('bgColor')
    expect(config).toHaveProperty('icon')
    expect(config).toHaveProperty('priority')
    expect(config).toHaveProperty('badgeVariant')
  })
})

describe('formatStatus', () => {
  it('returns normalized status and config', () => {
    const result = formatStatus('completed')
    expect(result.normalized).toBe('delivered')
    expect(result.config.label).toBe('Consegnato')
  })
})

describe('STATUS_MAPPING', () => {
  it('has all expected entries', () => {
    expect(Object.keys(STATUS_MAPPING).length).toBeGreaterThan(10)
  })
})

describe('STATUS_CONFIG', () => {
  it('has all expected statuses', () => {
    const expectedStatuses = [
      'registered', 'in_transit', 'arrived', 'customs_hold',
      'customs_cleared', 'out_for_delivery', 'delivered',
      'delayed', 'exception', 'cancelled'
    ]
    expectedStatuses.forEach(status => {
      expect(STATUS_CONFIG).toHaveProperty(status)
    })
  })

  it('has increasing priorities', () => {
    const priorities = Object.values(STATUS_CONFIG).map(c => c.priority)
    for (let i = 1; i < priorities.length; i++) {
      expect(priorities[i]).toBeGreaterThanOrEqual(priorities[i - 1])
    }
  })
})
