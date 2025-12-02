import type { Coin, Timeframe } from '@/types/coin'

/**
 * Safely get timeframe snapshot data.
 */
export function tf(coin: Coin, timeframe: Timeframe) {
  return coin.history[timeframe]
}

/**
 * Common price ratios used by pioneer alerts (bull direction).
 */
export function pioneerBullRatios(coin: Coin) {
  const price5m = tf(coin, '5m')?.price
  const price15m = tf(coin, '15m')?.price
  const prevClose = coin.prevClosePrice
  if (!price5m || !price15m || !prevClose) return null
  return {
    priceRatio5m: coin.lastPrice / price5m,
    priceRatio15m: coin.lastPrice / price15m,
    priceRatioPrev: coin.lastPrice / prevClose,
  }
}

/**
 * Common price ratios used by pioneer alerts (bear direction, inverted).
 */
export function pioneerBearRatios(coin: Coin) {
  const price5m = tf(coin, '5m')?.price
  const price15m = tf(coin, '15m')?.price
  const prevClose = coin.prevClosePrice
  if (!price5m || !price15m || !prevClose) return null
  return {
    priceRatio5mInv: price5m / coin.lastPrice,
    priceRatio15mInv: price15m / coin.lastPrice,
    priceRatioPrevInv: prevClose / coin.lastPrice,
  }
}

/**
 * Volume ratio check replicating legacy condition: 2*volCurrent/vol5m > volCurrent/vol15m
 */
export function volumeAcceleration(coin: Coin) {
  const volume5m = tf(coin, '5m')?.volume
  const volume15m = tf(coin, '15m')?.volume
  if (!volume5m || !volume15m) return false
  return (2 * coin.quoteVolume) / volume5m > coin.quoteVolume / volume15m
}

/**
 * Gating thresholds derived from legacy fast.html (approximate simplification).
 */
export function pioneerBullGate(coin: Coin) {
  const volume5m = tf(coin, '5m')?.volume
  const price5m = tf(coin, '5m')?.price
  const price15m = tf(coin, '15m')?.price
  if (!volume5m || !price5m || !price15m) return false
  const volumeDelta = coin.quoteVolume - volume5m
  return volumeDelta > 5000 && coin.lastPrice / price5m > 1 && coin.lastPrice / price15m > 1
}

export function pioneerBearGate(coin: Coin) {
  const volume5m = tf(coin, '5m')?.volume
  const price5m = tf(coin, '5m')?.price
  const price15m = tf(coin, '15m')?.price
  if (!volume5m || !price5m || !price15m) return false
  const volumeDelta = coin.quoteVolume - volume5m
  return volumeDelta > 1000 && price5m / coin.lastPrice > 1 && price15m / coin.lastPrice > 1
}

/**
 * Validate history isn't stale (5m != 15m snapshot price).
 */
export function hasDistinctHistory(coin: Coin) {
  const price5m = tf(coin, '5m')?.price
  const price15m = tf(coin, '15m')?.price
  return price5m != null && price15m != null && price5m !== price15m
}
