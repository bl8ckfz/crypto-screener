import { describe, it, expect } from 'vitest'
import { evaluateAlertRules } from '@/services/alertEngine'
import type { AlertRule } from '@/types/alert'
import type { Coin } from '@/types/coin'

function makeCoinBull(): Coin {
  return {
    id: 1,
    symbol: 'TEST',
    fullSymbol: 'TESTUSDT',
    pair: 'USDT',
    lastPrice: 101,
    openPrice: 100,
    highPrice: 102,
    lowPrice: 99,
    prevClosePrice: 100,
    weightedAvgPrice: 100,
    priceChange: 1,
    priceChangePercent: 1,
    volume: 100000,
    quoteVolume: 200000,
    bidPrice: 100.5,
    bidQty: 10,
    askPrice: 101.5,
    askQty: 12,
    count: 500,
    openTime: Date.now() - 60000,
    closeTime: Date.now(),
    indicators: {
      vcp: 0,
      priceToWeightedAvg: 1.01,
      priceToHigh: 101/102,
      lowToPrice: 99/101,
      highToLow: 102/99,
      askToVolume: 12/100000,
      priceToVolume: 101/100000,
      quoteToCount: 200000/500,
      tradesPerVolume: 500/100000,
      fibonacci: {
        resistance1: 0, resistance0618: 0, resistance0382: 0,
        support0382: 0, support0618: 0, support1: 0, pivot: 0,
      },
      pivotToWeightedAvg: 0,
      pivotToPrice: 0,
      priceChangeFromWeightedAvg: 1,
      priceChangeFromPrevClose: 1,
      ethDominance: 1,
      btcDominance: 1,
      paxgDominance: 1,
    },
    history: {
      '5m': { price: 99.5, volume: 150000, weightedAvg: 99.5, priceToWA: 1, vcp: 0, timestamp: Date.now()-300000 },
      '15m': { price: 99, volume: 300000, weightedAvg: 99, priceToWA: 1, vcp: 0, timestamp: Date.now()-900000 },
    },
    lastUpdated: Date.now(),
  }
}

function makeCoinBear(): Coin {
  return {
    id: 2,
    symbol: 'BEAR',
    fullSymbol: 'BEARUSDT',
    pair: 'USDT',
    lastPrice: 99,
    openPrice: 100,
    highPrice: 101,
    lowPrice: 98,
    prevClosePrice: 100,
    weightedAvgPrice: 100,
    priceChange: -1,
    priceChangePercent: -1,
    volume: 80000,
    quoteVolume: 160000,
    bidPrice: 98.8,
    bidQty: 15,
    askPrice: 99.2,
    askQty: 14,
    count: 400,
    openTime: Date.now() - 60000,
    closeTime: Date.now(),
    indicators: {
      vcp: 0,
      priceToWeightedAvg: 0.99,
      priceToHigh: 99/101,
      lowToPrice: 98/99,
      highToLow: 101/98,
      askToVolume: 14/80000,
      priceToVolume: 99/80000,
      quoteToCount: 160000/400,
      tradesPerVolume: 400/80000,
      fibonacci: {
        resistance1: 0, resistance0618: 0, resistance0382: 0,
        support0382: 0, support0618: 0, support1: 0, pivot: 0,
      },
      pivotToWeightedAvg: 0,
      pivotToPrice: 0,
      priceChangeFromWeightedAvg: -1,
      priceChangeFromPrevClose: -1,
      ethDominance: 1,
      btcDominance: 1,
      paxgDominance: 1,
    },
    history: {
      '5m': { price: 100, volume: 100000, weightedAvg: 100, priceToWA: 1, vcp: 0, timestamp: Date.now()-300000 },
      '15m': { price: 100.5, volume: 140000, weightedAvg: 100.5, priceToWA: 1, vcp: 0, timestamp: Date.now()-900000 },
    },
    lastUpdated: Date.now(),
  }
}

const pioneerBullRule: AlertRule = {
  id: 'r1',
  name: 'Pioneer Bull',
  enabled: true,
  symbols: [],
  conditions: [ { type: 'pioneer_bull', threshold: 0, comparison: 'greater_than' } ],
  severity: 'critical',
  notificationEnabled: true,
  soundEnabled: false,
  createdAt: Date.now(),
}

const pioneerBearRule: AlertRule = {
  id: 'r2',
  name: 'Pioneer Bear',
  enabled: true,
  symbols: [],
  conditions: [ { type: 'pioneer_bear', threshold: 0, comparison: 'greater_than' } ],
  severity: 'critical',
  notificationEnabled: true,
  soundEnabled: false,
  createdAt: Date.now(),
}

describe('Pioneer Alerts', () => {
  it('triggers pioneer bull under gating', () => {
    const coin = makeCoinBull()
    const alerts = evaluateAlertRules([coin], [pioneerBullRule], 'bull')
    expect(alerts.some(a => a.type === 'pioneer_bull')).toBe(true)
  })

  it('does not trigger bull if volume delta too low', () => {
    const coin = makeCoinBull()
    // Reduce volume5m to near current to break gating (>5000 required)
    if (coin.history['5m']) coin.history['5m'].volume = coin.quoteVolume - 4000
    const alerts = evaluateAlertRules([coin], [pioneerBullRule], 'bull')
    expect(alerts.some(a => a.type === 'pioneer_bull')).toBe(false)
  })

  it('triggers pioneer bear under gating', () => {
    const coin = makeCoinBear()
    const alerts = evaluateAlertRules([coin], [pioneerBearRule], 'bear')
    expect(alerts.some(a => a.type === 'pioneer_bear')).toBe(true)
  })

  it('does not trigger bear if volume delta too low', () => {
    const coin = makeCoinBear()
    if (coin.history['5m']) coin.history['5m'].volume = coin.quoteVolume - 500 // <1000 delta
    const alerts = evaluateAlertRules([coin], [pioneerBearRule], 'bear')
    expect(alerts.some(a => a.type === 'pioneer_bear')).toBe(false)
  })
})
