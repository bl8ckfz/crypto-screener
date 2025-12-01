/**
 * API Configuration
 *
 * Note: Binance API has CORS restrictions for browser requests.
 * For development, we can:
 * 1. Use a CORS proxy (shown below)
 * 2. Run a local proxy server
 * 3. Use Binance's websocket API (no CORS)
 */

/**
 * CORS proxy options for development
 * Note: Binance blocks most CORS proxies due to geo-restrictions
 * For development, we'll rely on mock data fallback when CORS fails
 * 
 * To use a custom proxy, set VITE_CORS_PROXY in .env file
 */
const CORS_PROXY = import.meta.env.VITE_CORS_PROXY || ''

export const API_CONFIG = {
  // Use proxy if available, otherwise direct API URL
  baseUrl: CORS_PROXY 
    ? `${CORS_PROXY}${encodeURIComponent(import.meta.env.VITE_BINANCE_API_URL || 'https://api.binance.com/api/v3')}`
    : import.meta.env.VITE_BINANCE_API_URL || 'https://api.binance.com/api/v3',
  timeout: 10000,
  retries: 3,
  corsProxy: CORS_PROXY,
}

export const isUsingProxy = !!CORS_PROXY
