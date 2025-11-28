/**
 * API Configuration
 *
 * Note: Binance API has CORS restrictions for browser requests.
 * For development, we can:
 * 1. Use a CORS proxy (shown below)
 * 2. Run a local proxy server
 * 3. Use Binance's websocket API (no CORS)
 */

const isDevelopment = import.meta.env.DEV

// CORS proxy for development (use with caution, not for production)
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

export const API_CONFIG = {
  // Use CORS proxy in development, direct API in production (with backend)
  baseUrl: isDevelopment
    ? `${CORS_PROXY}https://api.binance.com/api/v3`
    : import.meta.env.VITE_BINANCE_API_URL || 'https://api.binance.com/api/v3',
  timeout: 10000,
  retries: 3,
}

export const isUsingProxy = isDevelopment
