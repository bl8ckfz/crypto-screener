import { describe, it, expect } from 'vitest'
import {
  calculateVCP,
  calculateFibonacciPivots,
  calculateMarketDominance,
} from '@/utils/indicators'
import type { Coin } from '@/types/coin'

describe('Technical Indicators', () => {
  describe('calculateVCP', () => {
    it('should calculate VCP correctly for valid coin data', () => {
      const coin: Partial<Coin> = {
        symbol: 'BTCUSDT',
        price: 51000, // Above midpoint to get positive VCP
        weightedAvgPrice: 49500,
        low: 48000,
        high: 52000,
      }

      const vcp = calculateVCP(coin as Coin)

      expect(vcp).toBeGreaterThan(0)
      expect(typeof vcp).toBe('number')
      expect(isFinite(vcp)).toBe(true)
    })

    it('should return 0 for invalid data (zero high-low range)', () => {
      const coin: Partial<Coin> = {
        symbol: 'BTCUSDT',
        price: 50000,
        weightedAvgPrice: 50000,
        low: 50000,
        high: 50000, // Same as low
      }

      const vcp = calculateVCP(coin as Coin)

      expect(vcp).toBe(0)
    })

    it('should handle edge case where close is at low', () => {
      const coin: Partial<Coin> = {
        symbol: 'BTCUSDT',
        price: 48000, // At low
        weightedAvgPrice: 49000,
        low: 48000,
        high: 52000,
      }

      const vcp = calculateVCP(coin as Coin)

      // When price is at low, VCP will be negative (bearish signal)
      expect(vcp).toBeLessThan(0)
      expect(isFinite(vcp)).toBe(true)
    })

    it('should handle edge case where close is at high', () => {
      const coin: Partial<Coin> = {
        symbol: 'BTCUSDT',
        price: 52000, // At high
        weightedAvgPrice: 51000,
        low: 48000,
        high: 52000,
      }

      const vcp = calculateVCP(coin as Coin)

      expect(vcp).toBeGreaterThanOrEqual(0)
      expect(isFinite(vcp)).toBe(true)
    })
  })

  describe('calculateFibonacciPivots', () => {
    it('should calculate all 7 Fibonacci levels correctly', () => {
      const coin: Partial<Coin> = {
        symbol: 'BTCUSDT',
        price: 50000,
        high: 52000,
        low: 48000,
      }

      const pivots = calculateFibonacciPivots(coin as Coin)

      // Check all levels exist
      expect(pivots).toHaveProperty('r3')
      expect(pivots).toHaveProperty('r2')
      expect(pivots).toHaveProperty('r1')
      expect(pivots).toHaveProperty('pivot')
      expect(pivots).toHaveProperty('s1')
      expect(pivots).toHaveProperty('s2')
      expect(pivots).toHaveProperty('s3')

      // All values should be numbers
      Object.values(pivots).forEach((value) => {
        expect(typeof value).toBe('number')
        expect(isFinite(value)).toBe(true)
      })

      // Logical ordering: r3 > r2 > r1 > pivot > s1 > s2 > s3
      expect(pivots.r3).toBeGreaterThan(pivots.r2)
      expect(pivots.r2).toBeGreaterThan(pivots.r1)
      expect(pivots.r1).toBeGreaterThan(pivots.pivot)
      expect(pivots.pivot).toBeGreaterThan(pivots.s1)
      expect(pivots.s1).toBeGreaterThan(pivots.s2)
      expect(pivots.s2).toBeGreaterThan(pivots.s3)
    })

    it('should calculate pivot as average of high, low, and close', () => {
      const coin: Partial<Coin> = {
        symbol: 'BTCUSDT',
        price: 50000,
        high: 60000,
        low: 40000,
      }

      const pivots = calculateFibonacciPivots(coin as Coin)

      // Pivot = (H + L + C) / 3
      const expectedPivot = (60000 + 40000 + 50000) / 3
      expect(pivots.pivot).toBeCloseTo(expectedPivot, 2)
    })

    it('should handle symmetric price range', () => {
      const coin: Partial<Coin> = {
        symbol: 'BTCUSDT',
        price: 50000,
        high: 50000,
        low: 50000,
      }

      const pivots = calculateFibonacciPivots(coin as Coin)

      // When H = L = C, all pivots should equal price
      expect(pivots.pivot).toBe(50000)
      expect(pivots.r1).toBe(50000)
      expect(pivots.s1).toBe(50000)
    })
  })

  describe('calculateMarketDominance', () => {
    it('should calculate dominance percentages for BTC, ETH, and PAXG', () => {
      const coins: Partial<Coin>[] = [
        { symbol: 'BTCUSDT', quoteVolume: 1000000000 }, // 1B
        { symbol: 'ETHUSDT', quoteVolume: 500000000 }, // 500M
        { symbol: 'PAXGUSDT', quoteVolume: 250000000 }, // 250M
        { symbol: 'ADAUSDT', quoteVolume: 250000000 }, // 250M
      ]

      const dominance = calculateMarketDominance(coins as Coin[])

      // Total volume = 2B
      expect(dominance.btcDominance).toBeCloseTo(50, 1) // 1B/2B = 50%
      expect(dominance.ethDominance).toBeCloseTo(25, 1) // 500M/2B = 25%
      expect(dominance.paxgDominance).toBeCloseTo(12.5, 1) // 250M/2B = 12.5%

      // Sum should be reasonable (BTC + ETH dominance)
      expect(dominance.btcDominance + dominance.ethDominance).toBeCloseTo(75, 1)
    })

    it('should return 0 for missing coins', () => {
      const coins: Partial<Coin>[] = [
        { symbol: 'ADAUSDT', quoteVolume: 1000000000 },
        { symbol: 'SOLUSDT', quoteVolume: 500000000 },
      ]

      const dominance = calculateMarketDominance(coins as Coin[])

      expect(dominance.btcDominance).toBe(0)
      expect(dominance.ethDominance).toBe(0)
      expect(dominance.paxgDominance).toBe(0)
    })

    it('should handle empty coin array', () => {
      const dominance = calculateMarketDominance([])

      expect(dominance.btcDominance).toBe(0)
      expect(dominance.ethDominance).toBe(0)
      expect(dominance.paxgDominance).toBe(0)
    })

    it('should calculate 100% dominance for single coin', () => {
      const coins: Partial<Coin>[] = [
        { symbol: 'BTCUSDT', quoteVolume: 1000000000 },
      ]

      const dominance = calculateMarketDominance(coins as Coin[])

      expect(dominance.btcDominance).toBeCloseTo(100, 1)
      expect(dominance.ethDominance).toBe(0)
      expect(dominance.paxgDominance).toBe(0)
    })
  })
})
