import { describe, it, expect } from 'vitest'
import { evaluateAlertRules } from '@/services/alertEngine'
import type { AlertRule } from '@/types/alert'
import type { Coin } from '@/types/coin'

function coinBase(): Coin {
  const now = Date.now()
  return {
    id: 1,
    symbol: 'XYZ',
    fullSymbol: 'XYZUSDT',
    pair: 'USDT',
    lastPrice: 100,
    openPrice: 100,
    highPrice: 105,
    lowPrice: 95,
    prevClosePrice: 99,
    weightedAvgPrice: 100,
    priceChange: 1,
    priceChangePercent: 1.0,
    volume: 100000,
    quoteVolume: 300000,
    bidPrice: 99.5,
    bidQty: 10,
    askPrice: 100.5,
    askQty: 11,
    count: 600,
    openTime: now - 60000,
    closeTime: now,
    indicators: {
      vcp: 0.2,
      priceToWeightedAvg: 1.0,
      priceToHigh: 100/105,
      lowToPrice: 95/100,
      highToLow: 105/95,
      askToVolume: 11/100000,
      priceToVolume: 100/100000,
      quoteToCount: 300000/600,
      tradesPerVolume: 600/100000,
      fibonacci: {
        resistance1: 110, resistance0618: 106, resistance0382: 103,
        support0382: 97, support0618: 94, support1: 90, pivot: 100,
      },
      pivotToWeightedAvg: 1.0,
      pivotToPrice: 1.0,
      priceChangeFromWeightedAvg: 1.0,
      priceChangeFromPrevClose: 1.0,
      ethDominance: 1,
      btcDominance: 1,
      paxgDominance: 1,
    },
    history: {
      '1m': { price: 99.5, volume: 200000, weightedAvg: 99.5, priceToWA: 1, vcp: 0.15, timestamp: now-60000 },
      '3m': { price: 98.5, volume: 150000, weightedAvg: 98.5, priceToWA: 1, vcp: 0.12, timestamp: now-180000 },
      '5m': { price: 97.5, volume: 140000, weightedAvg: 97.5, priceToWA: 1, vcp: 0.10, timestamp: now-300000 },
      '15m': { price: 96.5, volume: 100000, weightedAvg: 96.5, priceToWA: 1, vcp: 0.08, timestamp: now-900000 },
    },
    lastUpdated: now,
  }
}

const pumpRule: AlertRule = {
  id: 'pump', name: 'Price Pump', enabled: true, symbols: [],
  conditions: [ { type: 'price_pump', threshold: 0.8, comparison: 'greater_than', timeframe: '3m' } ],
  severity: 'high', notificationEnabled: true, soundEnabled: false, createdAt: Date.now()
}

const dumpRule: AlertRule = {
  id: 'dump', name: 'Price Dump', enabled: true, symbols: [],
  conditions: [ { type: 'price_dump', threshold: 0.8, comparison: 'greater_than', timeframe: '3m' } ],
  severity: 'high', notificationEnabled: true, soundEnabled: false, createdAt: Date.now()
}

const volSpikeRule: AlertRule = {
  id: 'volSpike', name: 'Volume Spike', enabled: true, symbols: [],
  conditions: [ { type: 'volume_spike', threshold: 80, comparison: 'greater_than', timeframe: '3m' } ],
  severity: 'medium', notificationEnabled: true, soundEnabled: false, createdAt: Date.now()
}

const volDropRule: AlertRule = {
  id: 'volDrop', name: 'Volume Drop', enabled: true, symbols: [],
  conditions: [ { type: 'volume_drop', threshold: 50000, comparison: 'greater_than', timeframe: '3m' } ],
  severity: 'medium', notificationEnabled: true, soundEnabled: false, createdAt: Date.now()
}

const vcpRule: AlertRule = {
  id: 'vcp', name: 'VCP Signal', enabled: true, symbols: [],
  conditions: [ { type: 'vcp_signal', threshold: 0.15, comparison: 'greater_than', timeframe: '1m' } ],
  severity: 'medium', notificationEnabled: true, soundEnabled: false, createdAt: Date.now()
}

const fibBreakRule: AlertRule = {
  id: 'fib', name: 'Fibonacci Break', enabled: true, symbols: [],
  conditions: [ { type: 'fibonacci_break', threshold: 103, comparison: 'greater_than' } ],
  severity: 'medium', notificationEnabled: true, soundEnabled: false, createdAt: Date.now()
}

const bottomHunterRule: AlertRule = {
  id: 'bottom', name: 'Bottom Hunter', enabled: true, symbols: [],
  conditions: [ { type: 'bottom_hunter', threshold: 0, comparison: 'greater_than' } ],
  severity: 'high', notificationEnabled: true, soundEnabled: false, createdAt: Date.now()
}

const topHunterRule: AlertRule = {
  id: 'top', name: 'Top Hunter', enabled: true, symbols: [],
  conditions: [ { type: 'top_hunter', threshold: 0, comparison: 'greater_than' } ],
  severity: 'high', notificationEnabled: true, soundEnabled: false, createdAt: Date.now()
}

describe('Core Signal Alerts', () => {
  it('triggers price pump based on 3m gain', () => {
    const coin = coinBase()
    const alerts = evaluateAlertRules([coin], [pumpRule], 'bull')
    expect(alerts.some(a => a.type === 'price_pump')).toBe(true)
  })

  it('does not trigger price dump when overall rising', () => {
    const coin = coinBase()
    const alerts = evaluateAlertRules([coin], [dumpRule], 'bear')
    expect(alerts.some(a => a.type === 'price_dump')).toBe(false)
  })

  it('triggers volume spike on 3m delta', () => {
    const coin = coinBase()
    const alerts = evaluateAlertRules([coin], [volSpikeRule], 'bull')
    expect(alerts.some(a => a.type === 'volume_spike')).toBe(true)
  })

  it('does not trigger volume drop when current > 3m', () => {
    const coin = coinBase()
    const alerts = evaluateAlertRules([coin], [volDropRule], 'bear')
    expect(alerts.some(a => a.type === 'volume_drop')).toBe(false)
  })

  it('triggers VCP signal when 1m snapshot above threshold', () => {
    const coin = coinBase()
    const alerts = evaluateAlertRules([coin], [vcpRule], 'bull')
    expect(alerts.some(a => a.type === 'vcp_signal')).toBe(true)
  })

  it('triggers Fibonacci break when price crosses resistance', () => {
    const coin = coinBase()
    // Set lastPrice over resistance0382 (threshold 103)
    coin.lastPrice = 104
    const alerts = evaluateAlertRules([coin], [fibBreakRule], 'bull')
    expect(alerts.some(a => a.type === 'fibonacci_break')).toBe(true)
  })

  it('triggers bottom hunter under reversal pattern', () => {
    const coin = coinBase()
    // Force reversal: 15m highest, 3m lower than 15m but higher than current, 1m slightly below current
    if (coin.history['15m']) coin.history['15m'].price = 104
    if (coin.history['3m']) coin.history['3m'].price = 103
    if (coin.history['1m']) coin.history['1m'].price = 101.5
    // Ensure volume pattern: 15m < 3m < 5m < current
    if (coin.history['15m']) coin.history['15m'].volume = 100000
    if (coin.history['3m']) coin.history['3m'].volume = 140000
    if (coin.history['5m']) coin.history['5m'].volume = 200000
    coin.quoteVolume = 300000
    coin.lastPrice = 102.0
    const alerts = evaluateAlertRules([coin], [bottomHunterRule], 'bull')
    expect(alerts.some(a => a.type === 'bottom_hunter')).toBe(true)
  })

  it('triggers top hunter under peak pattern', () => {
    const coin = coinBase()
    // Force top: 15m low, 3m higher, current above both; 1m slightly below current to indicate slowing
    if (coin.history['15m']) coin.history['15m'].price = 95
    if (coin.history['3m']) coin.history['3m'].price = 100
    if (coin.history['1m']) coin.history['1m'].price = 99
    // Ensure volume pattern: 15m < 3m < 5m < current
    if (coin.history['15m']) coin.history['15m'].volume = 100000
    if (coin.history['3m']) coin.history['3m'].volume = 140000
    if (coin.history['5m']) coin.history['5m'].volume = 200000
    coin.quoteVolume = 300000
    coin.lastPrice = 106
    const alerts = evaluateAlertRules([coin], [topHunterRule], 'bear')
    expect(alerts.some(a => a.type === 'top_hunter')).toBe(true)
  })
})
