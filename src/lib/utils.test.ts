import { afterEach, describe, expect, it, vi } from 'vitest'
import { cn, formatCurrency, toISO, sanitizeInput, sanitizeCsvValue, coerceBoolean, getSafeRedirectPath } from './utils'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('utils', () => {
  describe('cn', () => {
    it('merges tailwind classes correctly', () => {
      expect(cn('px-2 py-2', 'px-4')).toBe('py-2 px-4')
    })
  })

  describe('formatCurrency', () => {
    it('formats USD correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000')
    })

    it('formats other currencies correctly', () => {
      expect(formatCurrency(1000, 'EUR')).toBe('€1,000')
    })
  })

  describe('toISO', () => {
    it('converts Date to ISO string', () => {
      const date = new Date('2024-01-01T00:00:00Z')
      expect(toISO(date)).toBe('2024-01-01T00:00:00.000Z')
    })

    it('converts ISO string to ISO string', () => {
      const iso = '2024-01-01T00:00:00.000Z'
      expect(toISO(iso)).toBe(iso)
    })

    it('returns null for invalid inputs', () => {
      expect(toISO(null)).toBeNull()
      expect(toISO(undefined)).toBeNull()
    })
  })

  describe('sanitizeInput', () => {
    it('strips HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>Hello')).toBe('alert("xss")Hello')
    })
  })

  describe('sanitizeCsvValue', () => {
    it('prefixes sensitive characters to prevent CSV injection', () => {
      expect(sanitizeCsvValue('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)")
      expect(sanitizeCsvValue('+123')).toBe("'+123")
      expect(sanitizeCsvValue('-123')).toBe("'-123")
      expect(sanitizeCsvValue('@user')).toBe("'@user")
    })

    it('does not prefix normal values', () => {
      expect(sanitizeCsvValue('Hello')).toBe('Hello')
      expect(sanitizeCsvValue('123')).toBe('123')
    })
  })

  describe('coerceBoolean', () => {
    it('coerces various inputs to boolean', () => {
      expect(coerceBoolean(true)).toBe(true)
      expect(coerceBoolean('true')).toBe(true)
      expect(coerceBoolean('1')).toBe(true)
      expect(coerceBoolean('yes')).toBe(true)
      expect(coerceBoolean('on')).toBe(true)
      expect(coerceBoolean(1)).toBe(true)
      
      expect(coerceBoolean(false)).toBe(false)
      expect(coerceBoolean('false')).toBe(false)
      expect(coerceBoolean('0')).toBe(false)
      expect(coerceBoolean(0)).toBe(false)
      expect(coerceBoolean(null)).toBe(false)
    })
  })

  describe('getSafeRedirectPath', () => {
    it('keeps internal relative redirects unchanged', () => {
      expect(getSafeRedirectPath('/dashboard?tab=overview')).toBe('/dashboard?tab=overview')
    })

    it('normalizes same-origin absolute redirects to internal paths', () => {
      vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://cohorts.test')

      expect(getSafeRedirectPath('https://cohorts.test/dashboard?tab=overview#activity')).toBe(
        '/dashboard?tab=overview#activity',
      )
    })

    it('rejects external redirects', () => {
      vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://cohorts.test')

      expect(getSafeRedirectPath('https://evil.example/phish')).toBeNull()
    })
  })
})
