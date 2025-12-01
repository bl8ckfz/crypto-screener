import { describe, it, expect } from 'vitest'
import { sortCoins, sortCoinsByList } from '@/utils/sort'
import type { Coin } from '@/types/coin'

describe('Sorting Utilities', () => {
  const mockCoins: Partial<Coin>[] = [
    {
      symbol: 'BTCUSDT',
      lastPrice: 50000,
      priceChangePercent: 5.5,
      quoteVolume: 1000000000,
      indicators: {
        vcp: 0.8,
        priceToWeightedAvg: 1.01,
      } as any,
    },
    {
      symbol: 'ETHUSDT',
      lastPrice: 3000,
      priceChangePercent: -2.3,
      quoteVolume: 500000000,
      indicators: {
        vcp: 0.6,
        priceToWeightedAvg: 0.98,
      } as any,
    },
    {
      symbol: 'ADAUSDT',
      lastPrice: 0.5,
      priceChangePercent: 10.2,
      quoteVolume: 250000000,
      indicators: {
        vcp: 0.9,
        priceToWeightedAvg: 1.05,
      } as any,
    },
  ]

  describe('sortCoins', () => {
    it('should sort by VCP descending by default', () => {
      const sorted = sortCoins(mockCoins as Coin[], { field: 'vcp', direction: 'desc' })

      expect(sorted[0].symbol).toBe('ADAUSDT') // vcp: 0.9
      expect(sorted[1].symbol).toBe('BTCUSDT') // vcp: 0.8
      expect(sorted[2].symbol).toBe('ETHUSDT') // vcp: 0.6
    })

    it('should sort by VCP ascending', () => {
      const sorted = sortCoins(mockCoins as Coin[], { field: 'vcp', direction: 'asc' })

      expect(sorted[0].symbol).toBe('ETHUSDT') // vcp: 0.6
      expect(sorted[1].symbol).toBe('BTCUSDT') // vcp: 0.8
      expect(sorted[2].symbol).toBe('ADAUSDT') // vcp: 0.9
    })

    it('should sort by price change percent descending', () => {
      const sorted = sortCoins(mockCoins as Coin[], { field: 'priceChangePercent', direction: 'desc' })

      expect(sorted[0].symbol).toBe('ADAUSDT') // +10.2%
      expect(sorted[1].symbol).toBe('BTCUSDT') // +5.5%
      expect(sorted[2].symbol).toBe('ETHUSDT') // -2.3%
    })

    it('should sort by volume descending', () => {
      const sorted = sortCoins(mockCoins as Coin[], { field: 'quoteVolume', direction: 'desc' })

      expect(sorted[0].symbol).toBe('BTCUSDT') // 1B
      expect(sorted[1].symbol).toBe('ETHUSDT') // 500M
      expect(sorted[2].symbol).toBe('ADAUSDT') // 250M
    })

    it('should sort by symbol alphabetically ascending', () => {
      const sorted = sortCoins(mockCoins as Coin[], { field: 'symbol', direction: 'asc' })

      expect(sorted[0].symbol).toBe('ADAUSDT')
      expect(sorted[1].symbol).toBe('BTCUSDT')
      expect(sorted[2].symbol).toBe('ETHUSDT')
    })

    it('should sort by price ascending', () => {
      const sorted = sortCoins(mockCoins as Coin[], { field: 'lastPrice', direction: 'asc' })

      expect(sorted[0].symbol).toBe('ADAUSDT') // 0.5
      expect(sorted[1].symbol).toBe('ETHUSDT') // 3000
      expect(sorted[2].symbol).toBe('BTCUSDT') // 50000
    })

    it('should handle empty array', () => {
      const sorted = sortCoins([], { field: 'vcp', direction: 'desc' })
      expect(sorted).toEqual([])
    })

    it('should not mutate original array', () => {
      const original = [...mockCoins]
      sortCoins(mockCoins as Coin[], { field: 'vcp', direction: 'desc' })

      // Original should be unchanged
      expect(mockCoins).toEqual(original)
    })
  })

  describe('sortCoinsByList', () => {
    it('should sort by screening list 0 (bull mode, VCP desc)', () => {
      const sorted = sortCoinsByList(mockCoins as Coin[], 0)

      // List 0: bull mode, sorted by VCP descending
      // Should return all coins in sorted order
      expect(sorted.length).toBe(mockCoins.length)
      
      // Verify sorted by VCP descending: ADAUSDT (0.9) > BTCUSDT (0.8) > ETHUSDT (0.6)
      expect(sorted[0].symbol).toBe('ADAUSDT')
      expect(sorted[1].symbol).toBe('BTCUSDT')
      expect(sorted[2].symbol).toBe('ETHUSDT')
    })

    it('should sort by screening list 300 with bear mode flag', () => {
      // Explicitly test with isBull: false parameter
      const sortedBear = sortCoinsByList(mockCoins as Coin[], 300, 'vcp', false)
      
      // Bear mode (isBull: false) should sort ascending
      expect(sortedBear.length).toBe(mockCoins.length)
      expect(sortedBear[0].symbol).toBe('ETHUSDT') // vcp: 0.6 (lowest)
      expect(sortedBear[1].symbol).toBe('BTCUSDT') // vcp: 0.8
      expect(sortedBear[2].symbol).toBe('ADAUSDT') // vcp: 0.9 (highest)
      
      // Bull mode (default) should sort descending
      const sortedBull = sortCoinsByList(mockCoins as Coin[], 0, 'vcp', true)
      expect(sortedBull[0].symbol).toBe('ADAUSDT') // vcp: 0.9 (highest)
    })

    it('should handle invalid list number', () => {
      const sorted = sortCoinsByList(mockCoins as Coin[], 9999)

      // Invalid list should return all coins sorted by VCP
      expect(sorted.length).toBe(mockCoins.length)
    })

    it('should handle empty coin array', () => {
      const sorted = sortCoinsByList([], 0)
      expect(sorted).toEqual([])
    })

    it('should return sorted results', () => {
      const sorted = sortCoinsByList(mockCoins as Coin[], 0)

      // Results should be sorted by VCP descending
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].indicators.vcp).toBeGreaterThanOrEqual(sorted[i + 1].indicators.vcp)
      }
    })
  })
})
