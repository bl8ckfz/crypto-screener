import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  formatPercent,
  formatVolume,
  formatNumber,
  formatTimeAgo,
} from '@/utils/format'

describe('Format Utilities', () => {
  describe('formatPrice', () => {
    it('should format large prices with comma separators', () => {
      expect(formatPrice(50000)).toBe('50,000.00')
      expect(formatPrice(1234567.89)).toBe('1,234,567.89')
    })

    it('should format small prices with appropriate decimals', () => {
      expect(formatPrice(0.00001234)).toBe('0.00001234')
      expect(formatPrice(0.123456)).toBe('0.12')
    })

    it('should handle zero', () => {
      expect(formatPrice(0)).toBe('0.00')
    })

    it('should handle negative prices', () => {
      expect(formatPrice(-1234.56)).toBe('-1,234.56')
    })

    it('should use custom decimal places', () => {
      expect(formatPrice(123.456789, 4)).toBe('123.4568')
      expect(formatPrice(123.456789, 0)).toBe('123')
    })
  })

  describe('formatPercent', () => {
    it('should format positive percentages with + sign', () => {
      expect(formatPercent(5.5)).toBe('+5.50%')
      expect(formatPercent(0.12)).toBe('+0.12%')
    })

    it('should format negative percentages', () => {
      expect(formatPercent(-2.34)).toBe('-2.34%')
      expect(formatPercent(-10.5)).toBe('-10.50%')
    })

    it('should handle zero', () => {
      expect(formatPercent(0)).toBe('0.00%')
    })

    it('should format very small percentages', () => {
      expect(formatPercent(0.001)).toBe('+0.00%')
      expect(formatPercent(-0.001)).toBe('-0.00%')
    })

    it('should use custom decimal places', () => {
      expect(formatPercent(5.5555, 3)).toBe('+5.556%')
      expect(formatPercent(5.5555, 1)).toBe('+5.6%')
    })
  })

  describe('formatVolume', () => {
    it('should format billions with B suffix', () => {
      expect(formatVolume(1500000000)).toBe('1.50B')
      expect(formatVolume(10000000000)).toBe('10.00B')
    })

    it('should format millions with M suffix', () => {
      expect(formatVolume(1500000)).toBe('1.50M')
      expect(formatVolume(999999999)).toBe('1000.00M')
    })

    it('should format thousands with K suffix', () => {
      expect(formatVolume(1500)).toBe('1.50K')
      expect(formatVolume(999999)).toBe('1000.00K')
    })

    it('should format small numbers without suffix', () => {
      expect(formatVolume(500)).toBe('500')
      expect(formatVolume(999)).toBe('999')
    })

    it('should handle zero', () => {
      expect(formatVolume(0)).toBe('0')
    })

    it('should handle negative volumes', () => {
      expect(formatVolume(-1500000)).toBe('-1.50M')
    })
  })

  describe('formatNumber', () => {
    it('should format large numbers with comma separators', () => {
      expect(formatNumber(1234567)).toBe('1,234,567')
      expect(formatNumber(1000000)).toBe('1,000,000')
    })

    it('should format decimals with specified precision', () => {
      expect(formatNumber(1234.5678, 2)).toBe('1,234.57')
      expect(formatNumber(1234.5678, 0)).toBe('1,235')
    })

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0')
    })

    it('should handle small numbers', () => {
      expect(formatNumber(123)).toBe('123')
      expect(formatNumber(12.34, 2)).toBe('12.34')
    })

    it('should handle negative numbers', () => {
      expect(formatNumber(-1234567)).toBe('-1,234,567')
    })
  })

  describe('formatTimeAgo', () => {
    const now = Date.now()

    it('should format seconds ago', () => {
      const fiveSecondsAgo = now - 5000
      expect(formatTimeAgo(fiveSecondsAgo)).toBe('5s ago')
    })

    it('should format minutes ago', () => {
      const threeMinutesAgo = now - 180000
      expect(formatTimeAgo(threeMinutesAgo)).toBe('3m ago')
    })

    it('should format hours ago', () => {
      const twoHoursAgo = now - 7200000
      expect(formatTimeAgo(twoHoursAgo)).toBe('2h ago')
    })

    it('should format days ago', () => {
      const threeDaysAgo = now - 259200000
      expect(formatTimeAgo(threeDaysAgo)).toBe('3d ago')
    })

    it('should handle just now', () => {
      expect(formatTimeAgo(now)).toBe('just now')
      expect(formatTimeAgo(now - 500)).toBe('just now')
    })

    it('should handle future timestamps gracefully', () => {
      const future = now + 10000
      // Should show as just now or handle gracefully
      const result = formatTimeAgo(future)
      expect(typeof result).toBe('string')
    })

    it('should handle Date objects', () => {
      const fiveMinutesAgo = new Date(now - 300000)
      expect(formatTimeAgo(fiveMinutesAgo)).toBe('5m ago')
    })
  })
})
