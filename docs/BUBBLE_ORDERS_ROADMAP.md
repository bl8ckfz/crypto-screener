# Market Bubble Orders Alerting Roadmap

## Executive Summary

**Goal**: Extend the existing 1m candle-based alert engine with market bubble order detection using statistical volume analysis across 5m and 15m timeframes.

**Approach**: Leverage existing ring buffers and sliding window infrastructure to add volume-based anomaly detection without modifying core data aggregation.

**Key Benefits**:
- 🎯 **Detect Institutional Activity**: Identify large order flow using z-score analysis
- 🎯 **Real-time Detection**: Alert within 1 minute of bubble formation
- 🎯 **Multi-timeframe Analysis**: Track bubbles across 5m and 15m windows
- 🎯 **Visual Overlay**: Display bubbles on existing TradingView-style charts
- 🎯 **Zero Breaking Changes**: Pure extension of existing systems

**Trade-offs**:
- 📊 **Additional Memory**: ~1.5 KB per symbol (volume history arrays)
- 💾 **More Computation**: EMA/stdev calculations per closed candle
- 🔧 **New State**: Volume history tracking alongside existing metrics

**Timeline**: 3-4 days (20-25 hours)

---

## Architecture Overview

### Integration with Existing System

```
Current Flow:
Stream1mManager
├─ Candle1mRingBuffer (1440 candles × 200 symbols)
├─ SlidingWindowCalculator (running sums for 5m/15m/1h/8h/24h)
└─ WindowMetrics output (price changes, volumes per timeframe)

New Extension (Bubble Detection):
BubbleDetectionService (NEW)
├─ Consumes: WindowMetrics from existing calculator
├─ Adds: Volume history tracking (60 × 5m, 80 × 15m per symbol)
├─ Computes: EMA, stdev, z-scores for volume anomalies
└─ Emits: Bubble objects for chart overlay + alerts
```

**Integration Points**:
1. **Input**: Hook into `Stream1mManager` 'metrics' event
2. **Processing**: Add `BubbleDetectionService` as new service layer
3. **Output**: Emit 'bubble' events for chart rendering + alert system

---

## Data Structures

### 1. Volume History State (Per Symbol)

```typescript
/**
 * Volume history tracking for bubble detection
 * Stores historical volumes to compute EMA and standard deviation
 */
interface VolumeHistoryState {
  symbol: string
  
  // 5m timeframe tracking
  vol5mHistory: number[]      // Max length: 60 (last 5 hours of 5m windows)
  emaVol5m: number            // Exponential moving average
  stdVol5m: number            // Standard deviation
  
  // 15m timeframe tracking
  vol15mHistory: number[]     // Max length: 80 (last 20 hours of 15m windows)
  emaVol15m: number           // Exponential moving average
  stdVol15m: number           // Standard deviation
  
  lastUpdate5m: number        // Timestamp of last 5m window close
  lastUpdate15m: number       // Timestamp of last 15m window close
}

// Memory per symbol:
// - vol5mHistory: 60 × 8 bytes = 480 bytes
// - vol15mHistory: 80 × 8 bytes = 640 bytes
// - Other fields: ~40 bytes
// Total: ~1,160 bytes per symbol (~1.16 KB)
// For 200 symbols: ~232 KB (negligible overhead)
```

### 2. Bubble Object (Output)

```typescript
/**
 * Detected bubble (volume anomaly with directional bias)
 */
interface Bubble {
  // Identification
  id: string                           // Unique ID: `${symbol}-${timeframe}-${time}`
  symbol: string                       // e.g., 'BTCUSDT'
  timeframe: '5m' | '15m'             // Window size
  
  // Timing
  time: number                         // Window close timestamp (ms)
  windowStartTime: number              // Window start timestamp (ms)
  
  // Price context
  price: number                        // Placement price (high for buy, low for sell)
  startPrice: number                   // Window start price
  endPrice: number                     // Window end price
  priceChangePct: number              // Price change % during window
  
  // Volume metrics
  side: 'buy' | 'sell'                // Direction (based on price change)
  size: 'small' | 'medium' | 'large'  // Bubble size (based on z-score)
  zScore: number                       // Volume z-score (stdev from mean)
  quoteVolume: number                  // Absolute volume (USDT)
  volumeEMA: number                    // EMA at detection time
  volumeStdDev: number                 // StdDev at detection time
  
  // Optional metadata
  trades?: number                      // Number of trades (if available)
  highPrice?: number                   // Highest price in window
  lowPrice?: number                    // Lowest price in window
}
```

### 3. Bubble Configuration

```typescript
/**
 * Configuration for bubble detection thresholds
 */
interface BubbleConfig {
  // 5m timeframe thresholds
  thresholds5m: {
    largeZScore: number      // Default: 3.5
    mediumZScore: number     // Default: 2.5
    smallZScore: number      // Default: 1.5
    minPriceChangePct: number // Default: 0.1 (0.1%)
  }
  
  // 15m timeframe thresholds
  thresholds15m: {
    largeZScore: number      // Default: 3.0
    mediumZScore: number     // Default: 2.0
    smallZScore: number      // Default: 1.2
    minPriceChangePct: number // Default: 0.1 (0.1%)
  }
  
  // History lengths
  historyLength5m: number    // Default: 60 (5 hours)
  historyLength15m: number   // Default: 80 (20 hours)
  
  // EMA periods
  emaPeriod5m: number        // Default: 60
  emaPeriod15m: number       // Default: 80
  
  // Minimum history required before detection
  minHistoryLength5m: number  // Default: 20 (warm-up period)
  minHistoryLength15m: number // Default: 20 (warm-up period)
}
```

---

## Implementation Plan

### Phase 1: Core Service - Bubble Detection Logic (Day 1, 6-8 hours)

#### Task 1.1: Create BubbleDetectionService
**File**: `src/services/bubbleDetectionService.ts`

**Implementation**:
```typescript
/**
 * Bubble Detection Service
 * 
 * Detects volume anomalies (bubbles) using z-score analysis on sliding windows.
 * Integrates with existing Stream1mManager metrics output.
 */

import type { WindowMetrics } from '@/types/api'
import type { Bubble, BubbleConfig, VolumeHistoryState } from '@/types/bubble'

export class BubbleDetectionService {
  private volumeHistory: Map<string, VolumeHistoryState> = new Map()
  private config: BubbleConfig
  
  constructor(config?: Partial<BubbleConfig>) {
    this.config = {
      thresholds5m: {
        largeZScore: 3.5,
        mediumZScore: 2.5,
        smallZScore: 1.5,
        minPriceChangePct: 0.1,
      },
      thresholds15m: {
        largeZScore: 3.0,
        mediumZScore: 2.0,
        smallZScore: 1.2,
        minPriceChangePct: 0.1,
      },
      historyLength5m: 60,
      historyLength15m: 80,
      emaPeriod5m: 60,
      emaPeriod15m: 80,
      minHistoryLength5m: 20,
      minHistoryLength15m: 20,
      ...config,
    }
  }
  
  /**
   * Initialize volume history for a symbol
   */
  initializeSymbol(symbol: string): void {
    this.volumeHistory.set(symbol, {
      symbol,
      vol5mHistory: [],
      emaVol5m: 0,
      stdVol5m: 0,
      vol15mHistory: [],
      emaVol15m: 0,
      stdVol15m: 0,
      lastUpdate5m: 0,
      lastUpdate15m: 0,
    })
  }
  
  /**
   * Process window metrics and detect bubbles
   * Called on each 1m candle close
   * 
   * @param metrics - Window metrics from SlidingWindowCalculator
   * @returns Array of detected bubbles (0-2 bubbles: one for 5m, one for 15m)
   */
  detectBubbles(metrics: {
    symbol: string
    m5: WindowMetrics
    m15: WindowMetrics
    timestamp: number
  }): Bubble[] {
    const bubbles: Bubble[] = []
    
    // Get or create volume history state
    let state = this.volumeHistory.get(metrics.symbol)
    if (!state) {
      this.initializeSymbol(metrics.symbol)
      state = this.volumeHistory.get(metrics.symbol)!
    }
    
    // Process 5m window
    const bubble5m = this.processTimeframe(
      state,
      metrics.m5,
      '5m',
      metrics.timestamp
    )
    if (bubble5m) bubbles.push(bubble5m)
    
    // Process 15m window
    const bubble15m = this.processTimeframe(
      state,
      metrics.m15,
      '15m',
      metrics.timestamp
    )
    if (bubble15m) bubbles.push(bubble15m)
    
    return bubbles
  }
  
  /**
   * Process a single timeframe window
   */
  private processTimeframe(
    state: VolumeHistoryState,
    metrics: WindowMetrics,
    timeframe: '5m' | '15m',
    timestamp: number
  ): Bubble | null {
    const is5m = timeframe === '5m'
    const config = is5m ? this.config.thresholds5m : this.config.thresholds15m
    const historyLength = is5m ? this.config.historyLength5m : this.config.historyLength15m
    const minHistory = is5m ? this.config.minHistoryLength5m : this.config.minHistoryLength15m
    
    // Extract history and update arrays
    const history = is5m ? state.vol5mHistory : state.vol15mHistory
    const volume = metrics.quoteVolume
    
    // Add new volume to history
    history.push(volume)
    if (history.length > historyLength) {
      history.shift() // Remove oldest
    }
    
    // Need minimum history for reliable statistics
    if (history.length < minHistory) {
      return null
    }
    
    // Compute EMA and standard deviation
    const ema = this.calculateEMA(history, is5m ? this.config.emaPeriod5m : this.config.emaPeriod15m)
    const std = this.calculateStdDev(history, ema)
    
    // Update state
    if (is5m) {
      state.emaVol5m = ema
      state.stdVol5m = std
      state.lastUpdate5m = timestamp
    } else {
      state.emaVol15m = ema
      state.stdVol15m = std
      state.lastUpdate15m = timestamp
    }
    
    // Calculate z-score
    const zScore = std > 0 ? (volume - ema) / std : 0
    
    // Determine bubble size
    let size: 'small' | 'medium' | 'large' | null = null
    if (zScore >= config.largeZScore) {
      size = 'large'
    } else if (zScore >= config.mediumZScore) {
      size = 'medium'
    } else if (zScore >= config.smallZScore) {
      size = 'small'
    }
    
    if (!size) return null // No bubble detected
    
    // Calculate price change percentage
    const priceChangePct = ((metrics.endPrice - metrics.startPrice) / metrics.startPrice) * 100
    
    // Determine side (buy/sell) based on price movement
    let side: 'buy' | 'sell' | null = null
    if (Math.abs(priceChangePct) >= config.minPriceChangePct) {
      side = priceChangePct > 0 ? 'buy' : 'sell'
    }
    
    if (!side) return null // No clear direction
    
    // Create bubble object
    return {
      id: `${metrics.symbol}-${timeframe}-${timestamp}`,
      symbol: metrics.symbol,
      timeframe,
      time: timestamp,
      windowStartTime: metrics.windowStartTime,
      price: side === 'buy' ? metrics.endPrice : metrics.startPrice, // Simplified placement
      startPrice: metrics.startPrice,
      endPrice: metrics.endPrice,
      priceChangePct,
      side,
      size,
      zScore,
      quoteVolume: volume,
      volumeEMA: ema,
      volumeStdDev: std,
    }
  }
  
  /**
   * Calculate Exponential Moving Average
   */
  private calculateEMA(values: number[], period: number): number {
    if (values.length === 0) return 0
    
    // Use simple moving average for initial EMA
    if (values.length < period) {
      return values.reduce((sum, val) => sum + val, 0) / values.length
    }
    
    // EMA calculation
    const k = 2 / (period + 1)
    let ema = values.slice(0, period).reduce((sum, val) => sum + val, 0) / period
    
    for (let i = period; i < values.length; i++) {
      ema = values[i] * k + ema * (1 - k)
    }
    
    return ema
  }
  
  /**
   * Calculate Standard Deviation
   */
  private calculateStdDev(values: number[], mean: number): number {
    if (values.length < 2) return 0
    
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
    
    return Math.sqrt(variance)
  }
  
  /**
   * Get current state for a symbol (for debugging/monitoring)
   */
  getSymbolState(symbol: string): VolumeHistoryState | null {
    return this.volumeHistory.get(symbol) ?? null
  }
  
  /**
   * Clear all state
   */
  clear(): void {
    this.volumeHistory.clear()
  }
}
```

**Dependencies**:
- `@/types/api` (WindowMetrics)
- New types file: `@/types/bubble.ts` (created in Task 1.2)

**Testing Strategy**:
- Unit tests for EMA calculation
- Unit tests for standard deviation
- Integration test with mock volume data
- Edge cases: empty history, single value, high variance

---

#### Task 1.2: Create Bubble Types
**File**: `src/types/bubble.ts`

**Implementation**:
```typescript
/**
 * Bubble Detection Types
 * 
 * Type definitions for market bubble order detection and alerting.
 */

/**
 * Volume history tracking state per symbol
 */
export interface VolumeHistoryState {
  symbol: string
  
  // 5m timeframe
  vol5mHistory: number[]
  emaVol5m: number
  stdVol5m: number
  lastUpdate5m: number
  
  // 15m timeframe
  vol15mHistory: number[]
  emaVol15m: number
  stdVol15m: number
  lastUpdate15m: number
}

/**
 * Detected bubble (volume anomaly)
 */
export interface Bubble {
  // Identification
  id: string
  symbol: string
  timeframe: '5m' | '15m'
  
  // Timing
  time: number
  windowStartTime: number
  
  // Price context
  price: number
  startPrice: number
  endPrice: number
  priceChangePct: number
  
  // Volume metrics
  side: 'buy' | 'sell'
  size: 'small' | 'medium' | 'large'
  zScore: number
  quoteVolume: number
  volumeEMA: number
  volumeStdDev: number
  
  // Optional metadata
  trades?: number
  highPrice?: number
  lowPrice?: number
}

/**
 * Bubble size classification based on z-score
 */
export type BubbleSize = 'small' | 'medium' | 'large'

/**
 * Bubble side (buy or sell pressure)
 */
export type BubbleSide = 'buy' | 'sell'

/**
 * Bubble detection configuration
 */
export interface BubbleConfig {
  // 5m thresholds
  thresholds5m: {
    largeZScore: number
    mediumZScore: number
    smallZScore: number
    minPriceChangePct: number
  }
  
  // 15m thresholds
  thresholds15m: {
    largeZScore: number
    mediumZScore: number
    smallZScore: number
    minPriceChangePct: number
  }
  
  // History configuration
  historyLength5m: number
  historyLength15m: number
  emaPeriod5m: number
  emaPeriod15m: number
  minHistoryLength5m: number
  minHistoryLength15m: number
}

/**
 * Bubble statistics for monitoring
 */
export interface BubbleStats {
  totalDetected: number
  by5m: number
  by15m: number
  bySize: {
    small: number
    medium: number
    large: number
  }
  bySide: {
    buy: number
    sell: number
  }
  avgZScore: number
  maxZScore: number
}
```

**Export** via `src/types/index.ts`:
```typescript
// Add to existing exports
export type {
  Bubble,
  BubbleSize,
  BubbleSide,
  BubbleConfig,
  BubbleStats,
  VolumeHistoryState,
} from './bubble'
```

---

### Phase 2: Integration with Stream1mManager (Day 1-2, 4-6 hours)

#### Task 2.1: Hook Bubble Service into Stream1mManager
**File**: `src/services/stream1mManager.ts`

**Changes**:
1. Import `BubbleDetectionService`
2. Initialize service in constructor
3. Hook into 'metrics' emission to detect bubbles
4. Emit new 'bubble' events

**Implementation** (modify existing):
```typescript
import { BubbleDetectionService } from './bubbleDetectionService'
import type { Bubble } from '@/types/bubble'

// Add to class properties
private bubbleService: BubbleDetectionService

// In constructor
constructor() {
  super()
  this.calculator = new SlidingWindowCalculator()
  this.wsClient = new BinanceFuturesWebSocket()
  this.apiClient = new BinanceFuturesApiClient()
  this.bubbleService = new BubbleDetectionService() // NEW
}

// Modify handleCandle method (after metrics emission)
private handleCandle(symbol: string, candle: Candle1m): void {
  // ... existing code ...
  
  // Emit metrics (existing)
  this.emit('metrics', { symbol, metrics, timestamp })
  
  // NEW: Detect bubbles
  const bubbles = this.bubbleService.detectBubbles({
    symbol,
    m5: metrics.m5,
    m15: metrics.m15,
    timestamp,
  })
  
  // Emit bubble events
  bubbles.forEach(bubble => {
    this.emit('bubble', bubble)
  })
}
```

**Events to Add**:
```typescript
// In class documentation comment
/**
 * Events emitted by Stream1mManager:
 * 
 * - 'started' → { symbols: number }
 * - 'backfillProgress' → { completed: number, total: number, progress: number }
 * - 'metrics' → { symbol: string, metrics: AllTimeframeMetrics, timestamp: number }
 * - 'candle' → { symbol: string, candle: Candle1m, timestamp: number }
 * - 'bubble' → Bubble object  // NEW
 * - 'error' → Error object
 * - 'stopped' → void
 */
```

---

#### Task 2.2: Create Bubble Hook for React Components
**File**: `src/hooks/useBubbleStream.ts`

**Implementation**:
```typescript
/**
 * useBubbleStream Hook
 * 
 * Listens to bubble detection events from Stream1mManager
 * Maintains recent bubble history for chart overlay
 */

import { useEffect, useState } from 'react'
import type { Bubble } from '@/types/bubble'

interface UseBubbleStreamOptions {
  maxHistory?: number  // Max bubbles to keep in memory (default: 1000)
  symbolFilter?: string // Only track bubbles for specific symbol
}

export function useBubbleStream(options: UseBubbleStreamOptions = {}) {
  const { maxHistory = 1000, symbolFilter } = options
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [isActive, setIsActive] = useState(false)
  
  useEffect(() => {
    // Get stream manager instance (from global or context)
    const streamManager = window.__streamManager // Or use context
    if (!streamManager) return
    
    const handleBubble = (bubble: Bubble) => {
      // Filter by symbol if specified
      if (symbolFilter && bubble.symbol !== symbolFilter) {
        return
      }
      
      setBubbles(prev => {
        const updated = [...prev, bubble]
        // Keep only recent bubbles
        if (updated.length > maxHistory) {
          return updated.slice(-maxHistory)
        }
        return updated
      })
    }
    
    const handleStarted = () => setIsActive(true)
    const handleStopped = () => setIsActive(false)
    
    streamManager.on('bubble', handleBubble)
    streamManager.on('started', handleStarted)
    streamManager.on('stopped', handleStopped)
    
    return () => {
      streamManager.off('bubble', handleBubble)
      streamManager.off('started', handleStarted)
      streamManager.off('stopped', handleStopped)
    }
  }, [maxHistory, symbolFilter])
  
  const clearBubbles = () => setBubbles([])
  
  const getBubblesForSymbol = (symbol: string) => {
    return bubbles.filter(b => b.symbol === symbol)
  }
  
  const getBubblesInTimeRange = (startTime: number, endTime: number) => {
    return bubbles.filter(b => b.time >= startTime && b.time <= endTime)
  }
  
  return {
    bubbles,
    isActive,
    clearBubbles,
    getBubblesForSymbol,
    getBubblesInTimeRange,
  }
}
```

---

### Phase 3: Chart Overlay Integration (Day 2-3, 6-8 hours)

#### Task 3.1: Extend Chart Component with Bubble Markers
**File**: `src/components/coin/CoinChart.tsx` (or wherever charts are rendered)

**Requirements**:
- Use TradingView Lightweight Charts `createSeries()` with markers
- Map bubble size to marker radius
- Map bubble side to color (buy=green, sell=red)
- Differentiate 5m vs 15m with filled/outlined circles

**Implementation Pattern**:
```typescript
import { useBubbleStream } from '@/hooks/useBubbleStream'

function CoinChart({ symbol, ...props }) {
  const { bubbles } = useBubbleStream({ symbolFilter: symbol })
  
  useEffect(() => {
    if (!chartInstance || !bubbles.length) return
    
    // Convert bubbles to TradingView markers
    const markers = bubbles.map(bubble => ({
      time: Math.floor(bubble.time / 1000), // Convert to seconds
      position: bubble.side === 'buy' ? 'belowBar' : 'aboveBar',
      color: bubble.side === 'buy' ? '#10b981' : '#ef4444', // green/red
      shape: bubble.timeframe === '5m' ? 'circle' : 'arrowUp', // Differentiate
      size: bubble.size === 'large' ? 3 : bubble.size === 'medium' ? 2 : 1,
      text: `${bubble.size} (z=${bubble.zScore.toFixed(1)})`,
    }))
    
    // Apply markers to chart series
    candlestickSeries.setMarkers(markers)
  }, [bubbles, chartInstance])
  
  // ... rest of chart rendering
}
```

**Dependencies**:
- `lightweight-charts` (already in project)
- New hook: `useBubbleStream`

---

#### Task 3.2: Create Bubble Legend Component
**File**: `src/components/coin/BubbleLegend.tsx`

**Purpose**: Display legend explaining bubble markers on charts

**Implementation**:
```typescript
/**
 * BubbleLegend Component
 * 
 * Visual guide for bubble marker interpretation
 */

export function BubbleLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-gray-600">
      <div className="flex items-center gap-2">
        <span className="font-semibold">Bubbles:</span>
      </div>
      
      {/* Size legend */}
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span>Small</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span>Medium</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 rounded-full bg-green-500" />
        <span>Large</span>
      </div>
      
      {/* Side legend */}
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span>Buy Pressure</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span>Sell Pressure</span>
      </div>
      
      {/* Timeframe legend */}
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-blue-500" />
        <span>5m</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-transparent" />
        <span>15m</span>
      </div>
    </div>
  )
}
```

---

### Phase 4: Alert System Integration (Day 3, 4-6 hours)

#### Task 4.1: Add Bubble Alert Types
**File**: `src/types/alert.ts`

**Changes**:
```typescript
// Add new alert types
export type AlertType =
  | 'price_above'
  | 'price_below'
  // ... existing types ...
  | 'bubble_5m_large'      // NEW
  | 'bubble_5m_medium'     // NEW
  | 'bubble_15m_large'     // NEW
  | 'bubble_15m_medium'    // NEW
  | 'bubble_buy_pressure'  // NEW
  | 'bubble_sell_pressure' // NEW
```

---

#### Task 4.2: Create Bubble Alert Conditions
**File**: `src/services/alertEngine.ts`

**Add new evaluation logic**:
```typescript
/**
 * Evaluate bubble-based alert conditions
 */
function evaluateBubbleCondition(
  bubble: Bubble,
  condition: AlertCondition
): boolean {
  switch (condition.type) {
    case 'bubble_5m_large':
      return bubble.timeframe === '5m' && bubble.size === 'large'
      
    case 'bubble_5m_medium':
      return bubble.timeframe === '5m' && bubble.size === 'medium'
      
    case 'bubble_15m_large':
      return bubble.timeframe === '15m' && bubble.size === 'large'
      
    case 'bubble_15m_medium':
      return bubble.timeframe === '15m' && bubble.size === 'medium'
      
    case 'bubble_buy_pressure':
      return bubble.side === 'buy' && bubble.size !== 'small'
      
    case 'bubble_sell_pressure':
      return bubble.side === 'sell' && bubble.size !== 'small'
      
    default:
      return false
  }
}
```

---

#### Task 4.3: Create Bubble Alert Presets
**File**: `src/config/bubbleAlerts.ts`

**Implementation**:
```typescript
/**
 * Pre-configured bubble alert rules
 */

import type { AlertRule } from '@/types/alert'

export const BUBBLE_ALERT_PRESETS: AlertRule[] = [
  {
    id: 'bubble-large-5m',
    name: 'Large Volume Spike (5m)',
    description: 'Alert on large volume anomalies in 5-minute windows',
    enabled: false,
    symbols: [], // All symbols
    conditions: [
      {
        type: 'bubble_5m_large',
        field: 'size',
        operator: 'equals',
        value: 'large',
      },
    ],
    severity: 'high',
    cooldown: 300, // 5 minutes
  },
  {
    id: 'bubble-institutional-buy',
    name: 'Institutional Buy Signal',
    description: 'Large or medium buy pressure detected',
    enabled: false,
    symbols: [],
    conditions: [
      {
        type: 'bubble_buy_pressure',
        field: 'side',
        operator: 'equals',
        value: 'buy',
      },
    ],
    severity: 'medium',
    cooldown: 180,
  },
  {
    id: 'bubble-institutional-sell',
    name: 'Institutional Sell Signal',
    description: 'Large or medium sell pressure detected',
    enabled: false,
    symbols: [],
    conditions: [
      {
        type: 'bubble_sell_pressure',
        field: 'side',
        operator: 'equals',
        value: 'sell',
      },
    ],
    severity: 'medium',
    cooldown: 180,
  },
]
```

---

### Phase 5: UI Components & Configuration (Day 3-4, 4-6 hours)

#### Task 5.1: Create Bubble Stats Dashboard Component
**File**: `src/components/market/BubbleStats.tsx`

**Purpose**: Display real-time bubble detection statistics

**Implementation**:
```typescript
/**
 * BubbleStats Component
 * 
 * Real-time statistics for bubble detection across all symbols
 */

import { useBubbleStream } from '@/hooks/useBubbleStream'

export function BubbleStats() {
  const { bubbles, isActive } = useBubbleStream()
  
  // Calculate stats
  const stats = useMemo(() => {
    const total = bubbles.length
    const by5m = bubbles.filter(b => b.timeframe === '5m').length
    const by15m = bubbles.filter(b => b.timeframe === '15m').length
    const large = bubbles.filter(b => b.size === 'large').length
    const medium = bubbles.filter(b => b.size === 'medium').length
    const small = bubbles.filter(b => b.size === 'small').length
    const buy = bubbles.filter(b => b.side === 'buy').length
    const sell = bubbles.filter(b => b.side === 'sell').length
    
    const avgZScore = bubbles.length > 0
      ? bubbles.reduce((sum, b) => sum + b.zScore, 0) / bubbles.length
      : 0
    
    return {
      total,
      by5m,
      by15m,
      bySize: { large, medium, small },
      bySide: { buy, sell },
      avgZScore,
    }
  }, [bubbles])
  
  if (!isActive) {
    return (
      <div className="p-4 bg-gray-100 rounded text-gray-600">
        Bubble detection inactive
      </div>
    )
  }
  
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-semibold mb-3">Bubble Detection Stats</h3>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Total Detected</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        
        <div>
          <p className="text-gray-600">Avg Z-Score</p>
          <p className="text-2xl font-bold">{stats.avgZScore.toFixed(2)}</p>
        </div>
        
        <div>
          <p className="text-gray-600">By Timeframe</p>
          <p className="text-sm">
            5m: <span className="font-semibold">{stats.by5m}</span> | 
            15m: <span className="font-semibold">{stats.by15m}</span>
          </p>
        </div>
        
        <div>
          <p className="text-gray-600">By Side</p>
          <p className="text-sm">
            <span className="text-green-600 font-semibold">Buy: {stats.bySide.buy}</span> | 
            <span className="text-red-600 font-semibold">Sell: {stats.bySide.sell}</span>
          </p>
        </div>
        
        <div>
          <p className="text-gray-600">By Size</p>
          <p className="text-xs">
            L: {stats.bySize.large} | M: {stats.bySize.medium} | S: {stats.bySize.small}
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

#### Task 5.2: Create Bubble Configuration Panel
**File**: `src/components/controls/BubbleConfig.tsx`

**Purpose**: Allow users to adjust bubble detection thresholds

**Implementation**:
```typescript
/**
 * BubbleConfig Component
 * 
 * User interface for configuring bubble detection thresholds
 */

import { useState } from 'react'
import type { BubbleConfig } from '@/types/bubble'

interface BubbleConfigProps {
  initialConfig: BubbleConfig
  onSave: (config: BubbleConfig) => void
}

export function BubbleConfig({ initialConfig, onSave }: BubbleConfigProps) {
  const [config, setConfig] = useState(initialConfig)
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Bubble Detection Settings</h3>
      
      {/* 5m Thresholds */}
      <div>
        <h4 className="text-sm font-medium mb-2">5-Minute Timeframe</h4>
        <div className="space-y-2">
          <label className="block text-sm">
            Large Z-Score Threshold
            <input
              type="number"
              step="0.1"
              value={config.thresholds5m.largeZScore}
              onChange={e => setConfig({
                ...config,
                thresholds5m: {
                  ...config.thresholds5m,
                  largeZScore: parseFloat(e.target.value)
                }
              })}
              className="w-full mt-1 px-3 py-2 border rounded"
            />
          </label>
          {/* Similar inputs for medium, small, minPriceChangePct */}
        </div>
      </div>
      
      {/* 15m Thresholds */}
      <div>
        <h4 className="text-sm font-medium mb-2">15-Minute Timeframe</h4>
        {/* Similar structure as 5m */}
      </div>
      
      {/* History Settings */}
      <div>
        <h4 className="text-sm font-medium mb-2">History Settings</h4>
        {/* Inputs for history lengths, EMA periods */}
      </div>
      
      <button
        onClick={() => onSave(config)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Settings
      </button>
    </div>
  )
}
```

---

### Phase 6: Testing & Documentation (Day 4, 4-6 hours)

#### Task 6.1: Unit Tests for BubbleDetectionService
**File**: `tests/services/bubbleDetectionService.test.ts`

**Coverage**:
- EMA calculation accuracy
- Standard deviation calculation
- Z-score computation
- Bubble size classification
- Side determination logic
- Edge cases (empty history, single value)

#### Task 6.2: Integration Tests
**File**: `tests/integration/bubbleDetection.test.ts`

**Coverage**:
- Full pipeline: metrics → bubbles
- Volume spike detection
- Multi-symbol handling
- History accumulation
- Warm-up behavior

#### Task 6.3: Create Documentation
**File**: `docs/BUBBLE_DETECTION.md`

**Content**:
- Feature overview
- Statistical methodology (z-score, EMA, stdev)
- Configuration guide
- Chart interpretation guide
- Alert setup guide
- Performance considerations

---

## Technical Specifications

### Memory Footprint

```
Per Symbol:
- Volume history (5m): 60 × 8 bytes = 480 bytes
- Volume history (15m): 80 × 8 bytes = 640 bytes
- State (EMA, stdev, timestamps): ~40 bytes
Total: ~1,160 bytes

For 200 symbols:
- Total: ~232 KB (0.7% of 32 MB baseline)
```

### Performance Impact

**Per 1m Candle**:
- Volume history update: O(1)
- EMA calculation: O(n) where n = history length (~60-80)
- Stdev calculation: O(n)
- Total: ~140 operations per candle per symbol

**For 200 symbols**:
- Total operations: ~28,000 per minute
- Negligible CPU impact (<1ms on modern hardware)

### Integration Points

```
Stream1mManager (existing)
  ├─ Emits 'metrics' event
  └─ Hooks BubbleDetectionService
      ├─ Processes WindowMetrics
      ├─ Updates volume history
      ├─ Calculates z-scores
      └─ Emits 'bubble' events

Chart Component
  ├─ Subscribes to 'bubble' events
  └─ Renders markers on TradingView chart

Alert System
  ├─ Evaluates bubble conditions
  └─ Triggers notifications
```

---

## Configuration Examples

### Conservative (Fewer False Positives)

```typescript
{
  thresholds5m: {
    largeZScore: 4.0,
    mediumZScore: 3.0,
    smallZScore: 2.0,
    minPriceChangePct: 0.2,
  },
  thresholds15m: {
    largeZScore: 3.5,
    mediumZScore: 2.5,
    smallZScore: 1.5,
    minPriceChangePct: 0.2,
  },
}
```

### Aggressive (More Signals)

```typescript
{
  thresholds5m: {
    largeZScore: 3.0,
    mediumZScore: 2.0,
    smallZScore: 1.2,
    minPriceChangePct: 0.05,
  },
  thresholds15m: {
    largeZScore: 2.5,
    mediumZScore: 1.5,
    smallZScore: 1.0,
    minPriceChangePct: 0.05,
  },
}
```

---

## Migration Strategy

### Phase 1 (MVP): Detection Only
- Implement core detection service
- No UI, just console logging
- Validate accuracy with real data

### Phase 2: Chart Overlay
- Add markers to existing charts
- Basic legend
- No configuration UI

### Phase 3: Alerts
- Integrate with alert system
- Add preset rules
- Enable notifications

### Phase 4: Full Feature
- Configuration UI
- Statistics dashboard
- Documentation

---

## Success Metrics

- **Detection Accuracy**: >90% correlation with manual analysis
- **Performance**: <1ms overhead per candle
- **Memory**: <300 KB additional usage
- **False Positive Rate**: <10% for large bubbles
- **Latency**: Detection within 1 minute of event

---

## Future Enhancements

1. **Multi-asset Correlation**: Detect synchronized bubbles across assets
2. **Machine Learning**: Train models to improve classification
3. **Historical Analysis**: Replay and analyze past bubbles
4. **Custom Scoring**: User-defined bubble scoring algorithms
5. **Export/Import**: Save/load bubble configurations
6. **Advanced Filters**: Filter bubbles by symbol, size, time range

---

## Dependencies

### New Dependencies
None - uses existing infrastructure

### Modified Files
- `src/services/stream1mManager.ts` (add bubble service)
- `src/types/index.ts` (export new types)
- `src/types/alert.ts` (add bubble alert types)
- `src/services/alertEngine.ts` (add bubble conditions)

### New Files
- `src/services/bubbleDetectionService.ts`
- `src/types/bubble.ts`
- `src/hooks/useBubbleStream.ts`
- `src/components/market/BubbleStats.tsx`
- `src/components/controls/BubbleConfig.tsx`
- `src/components/coin/BubbleLegend.tsx`
- `src/config/bubbleAlerts.ts`
- `tests/services/bubbleDetectionService.test.ts`
- `tests/integration/bubbleDetection.test.ts`
- `docs/BUBBLE_DETECTION.md`

---

## Risk Mitigation

### Risk: High False Positive Rate
**Mitigation**: Start with conservative thresholds, allow user tuning

### Risk: Performance Degradation
**Mitigation**: Profile with 200 symbols, optimize EMA/stdev calculations

### Risk: Memory Leaks
**Mitigation**: Cap history arrays, implement cleanup on symbol removal

### Risk: Chart Clutter
**Mitigation**: Add filters to show/hide bubbles by size/timeframe

---

## Rollout Plan

### Week 1: Core Implementation
- Days 1-2: BubbleDetectionService + types
- Days 3-4: Integration with Stream1mManager
- Day 5: Basic testing

### Week 2: UI & Polish
- Days 1-2: Chart overlay
- Days 3-4: Alert integration
- Day 5: Configuration UI + documentation

### Week 3: Testing & Refinement
- Days 1-3: Comprehensive testing with real data
- Days 4-5: Performance optimization, bug fixes

---

## Conclusion

This roadmap extends the existing 1m sliding window infrastructure with minimal invasive changes. By hooking into the `Stream1mManager` 'metrics' event, the bubble detection system operates as a pure add-on layer that:

1. ✅ Preserves all existing functionality
2. ✅ Adds negligible performance/memory overhead
3. ✅ Integrates seamlessly with charts and alerts
4. ✅ Provides actionable institutional order flow insights

The phased approach ensures incremental delivery with testable milestones, allowing early validation before full UI integration.
