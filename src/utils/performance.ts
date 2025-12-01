/**
 * Performance optimization utilities
 */

/**
 * Simple memoization cache with LRU eviction
 */
class MemoCache<K, V> {
  private cache: Map<string, { value: V; timestamp: number }> = new Map()
  private maxSize: number
  private maxAge: number // in milliseconds

  constructor(maxSize: number = 100, maxAge: number = 60000) {
    this.maxSize = maxSize
    this.maxAge = maxAge
  }

  get(key: K): V | undefined {
    const keyStr = JSON.stringify(key)
    const entry = this.cache.get(keyStr)

    if (!entry) return undefined

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(keyStr)
      return undefined
    }

    return entry.value
  }

  set(key: K, value: V): void {
    const keyStr = JSON.stringify(key)

    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(keyStr, {
      value,
      timestamp: Date.now(),
    })
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

/**
 * Memoize a function with argument-based caching
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: { maxSize?: number; maxAge?: number } = {}
): T {
  const cache = new MemoCache<Parameters<T>, ReturnType<T>>(options.maxSize, options.maxAge)

  return ((...args: Parameters<T>): ReturnType<T> => {
    const cached = cache.get(args)
    if (cached !== undefined) {
      return cached as ReturnType<T>
    }

    const result = fn(...args)
    cache.set(args, result)
    return result
  }) as T
}

/**
 * Debounce a function to limit execution rate
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Throttle a function to limit execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Check if tab is visible (for smart polling)
 */
export function isTabVisible(): boolean {
  return document.visibilityState === 'visible'
}

/**
 * Add listener for tab visibility changes
 */
export function onVisibilityChange(callback: (isVisible: boolean) => void): () => void {
  const handler = () => {
    callback(isTabVisible())
  }

  document.addEventListener('visibilitychange', handler)

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handler)
  }
}

/**
 * Request idle callback polyfill
 */
export function requestIdleCallback(callback: () => void, timeout: number = 1000): number {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout })
  }

  // Fallback to setTimeout
  return setTimeout(callback, 1) as unknown as number
}

/**
 * Cancel idle callback polyfill
 */
export function cancelIdleCallback(id: number): void {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}
