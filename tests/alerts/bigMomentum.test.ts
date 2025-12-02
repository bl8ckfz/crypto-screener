import { describe, it, expect } from 'vitest'
import { evaluateAlertRules } from '@/services/alertEngine'
import type { AlertRule } from '@/types/alert'
import type { Coin } from '@/types/coin'

function coinBase(): Coin {
  return {
    id: 1,
    symbol: 'AAA',
    fullSymbol: 'AAAUSDT',
    pair: 'USDT',
    lastPrice: 100,
    openPrice: 99,
    highPrice: 101,
    lowPrice: 98,
    prevClosePrice: 99.5,
    weightedAvgPrice: 99.5,
    priceChange: 1,
    priceChangePercent: 1,
    volume: 100000,
    quoteVolume: 200000,
    bidPrice: 99.8,
    bidQty: 10,
    askPrice: 100.2,
    askQty: 12,
    count: 500,
    openTime: Date.now() - 60000,
    closeTime: Date.now(),
    indicators: {
      vcp: 0,
      priceToWeightedAvg: 1.005,
      priceToHigh: 100/101,
      lowToPrice: 98/100,
      highToLow: 101/98,
      askToVolume: 12/100000,
      priceToVolume: 100/100000,
      quoteToCount: 200000/500,
      tradesPerVolume: 500/100000,
      fibonacci: {
        resistance1: 0, resistance0618: 0, resistance0382: 0,
        support0382: 0, support0618: 0, support1: 0, pivot: 0,
      },
      pivotToWeightedAvg: 0,
      pivotToPrice: 0,
      priceChangeFromWeightedAvg: 0.5,
      priceChangeFromPrevClose: 0.5,
      ethDominance: 1,
      btcDominance: 1,
      paxgDominance: 1,
    },
    history: {
      '1m': { price: 99.5, volume: 150000, weightedAvg: 99.5, priceToWA: 1, vcp: 0, timestamp: Date.now()-60000 },
      '3m': { price: 99, volume: 130000, weightedAvg: 99, priceToWA: 1, vcp: 0, timestamp: Date.now()-180000 },
      '5m': { price: 98.8, volume: 120000, weightedAvg: 98.8, priceToWA: 1, vcp: 0, timestamp: Date.now()-300000 },
      '15m': { price: 98.5, volume: 100000, weightedAvg: 98.5, priceToWA: 1, vcp: 0, timestamp: Date.now()-900000 },
    },
    lastUpdated: Date.now(),
  }
}

const big5mBullRule: AlertRule = {
  id: 'b5bull',
  name: '5m Big Bull',
  enabled: true,
  symbols: [],
  conditions: [ { type: '5m_big_bull', threshold: 0, comparison: 'greater_than' } ],
  severity: 'high',
  notificationEnabled: true,
  soundEnabled: false,
  createdAt: Date.now(),
}

const big5mBearRule: AlertRule = {
  id: 'b5bear',
  name: '5m Big Bear',
  enabled: true,
  symbols: [],
  conditions: [ { type: '5m_big_bear', threshold: 0, comparison: 'greater_than' } ],
  severity: 'high',
  notificationEnabled: true,
  soundEnabled: false,
  createdAt: Date.now(),
}

const big15mBullRule: AlertRule = {
  id: 'b15bull',
  name: '15m Big Bull',
  enabled: true,
  symbols: [],
  conditions: [ { type: '15m_big_bull', threshold: 0, comparison: 'greater_than' } ],
  severity: 'high',
  notificationEnabled: true,
  soundEnabled: false,
  createdAt: Date.now(),
}

const big15mBearRule: AlertRule = {
  id: 'b15bear',
  name: '15m Big Bear',
  enabled: true,
  symbols: [],
  conditions: [ { type: '15m_big_bear', threshold: 0, comparison: 'greater_than' } ],
  severity: 'high',
  notificationEnabled: true,
  soundEnabled: false,
  createdAt: Date.now(),
}

describe('Big Momentum Alerts', () => {
  it('triggers 5m big bull when price ascending and volume deltas large', () => {
    const coin = coinBase()
    // Ensure ascending volumes: 3m < 1m < 5m < current
    if (coin.history['3m']) coin.history['3m'].volume = 100000
    if (coin.history['1m']) coin.history['1m'].volume = 150000
    if (coin.history['5m']) coin.history['5m'].volume = 200000
    coin.quoteVolume = 260000 // deltas: 60k (1m), 160k (3m), 60k (5m)
    const alerts = evaluateAlertRules([coin], [big5mBullRule], 'bull')
    expect(alerts.some(a => a.type === '5m_big_bull')).toBe(true)
  })

  it('does not trigger 5m big bull if ascending pattern breaks', () => {
    const coin = coinBase()
    // break ascending price: make 1m lower than 3m
    if (coin.history['1m'] && coin.history['3m']) {
      coin.history['1m'].price = coin.history['3m'].price - 0.2
    }
    const alerts = evaluateAlertRules([coin], [big5mBullRule], 'bull')
    expect(alerts.some(a => a.type === '5m_big_bull')).toBe(false)
  })

  it('triggers 15m big bull when 5m>15m and volume conditions met', () => {
    const coin = coinBase()
    // 5m > 15m price chain already set; adjust volumes for deltas
    if (coin.history['15m']) coin.history['15m'].volume = 100000
    if (coin.history['3m']) coin.history['3m'].volume = 250000
    if (coin.history['5m']) coin.history['5m'].volume = 300000
    if (coin.history['1m']) coin.history['1m'].volume = 320000 // 1m > 3m per evaluator
    coin.quoteVolume = 520000 // deltas: 15m +420k (>400k), 3m +270k (>100k)
    const alerts = evaluateAlertRules([coin], [big15mBullRule], 'bull')
    expect(alerts.some(a => a.type === '15m_big_bull')).toBe(true)
  })

  it('triggers 5m big bear when inverted pattern and volume deltas large', () => {
    const coin = coinBase()
    // Bear scenario: lower current price vs 5m/15m & descending conditions
    coin.lastPrice = 97.5
    coin.priceChangePercent = -2.0
    if (coin.history['1m']) coin.history['1m'].price = 98.5
    if (coin.history['5m']) coin.history['5m'].price = 99
    if (coin.history['15m']) coin.history['15m'].price = 100
    // Volumes: current high, 5m lower, 15m lower to create deltas
    if (coin.history['3m']) coin.history['3m'].volume = 140000
    if (coin.history['1m']) coin.history['1m'].volume = 180000
    if (coin.history['5m']) coin.history['5m'].volume = 220000
    if (coin.history['15m']) coin.history['15m'].volume = 200000
    coin.quoteVolume = 280000 // deltas: 3m +140k (>100k), 5m +60k (>50k)
    const alerts = evaluateAlertRules([coin], [big5mBearRule], 'bear')
    expect(alerts.some(a => a.type === '5m_big_bear')).toBe(true)
  })

  it('triggers 15m big bear similarly for longer horizon', () => {
    const coin = coinBase()
    coin.lastPrice = 97
    coin.priceChangePercent = -2.5
    if (coin.history['5m']) coin.history['5m'].price = 99
    if (coin.history['15m']) coin.history['15m'].price = 100.5
    if (coin.history['3m']) coin.history['3m'].volume = 260000
    if (coin.history['1m']) coin.history['1m'].volume = 300000
    if (coin.history['5m']) coin.history['5m'].volume = 320000
    if (coin.history['15m']) coin.history['15m'].volume = 100000
    coin.quoteVolume = 520000 // deltas: 15m +420k, 3m +260k
    const alerts = evaluateAlertRules([coin], [big15mBearRule], 'bear')
    expect(alerts.some(a => a.type === '15m_big_bear')).toBe(true)
  })
})
