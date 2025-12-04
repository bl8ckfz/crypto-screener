import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Vercel Serverless Function: Binance Futures API Proxy
 * 
 * Purpose: Proxy requests to Binance Futures API to avoid CORS restrictions
 * and region blocking (403 Forbidden errors)
 * 
 * Endpoints supported:
 * - /fapi/v1/ticker/24hr (24-hour ticker data)
 * - /fapi/v1/klines (kline/candlestick data)
 * - /fapi/v1/exchangeInfo (exchange information)
 * 
 * Usage:
 * GET /api/binance-futures?endpoint=/fapi/v1/ticker/24hr
 * GET /api/binance-futures?endpoint=/fapi/v1/klines&symbol=BTCUSDT&interval=1h&limit=2
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { endpoint, ...params } = req.query

    // Validate endpoint
    if (!endpoint || typeof endpoint !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid endpoint parameter' })
    }

    // Whitelist allowed endpoints (security)
    const allowedEndpoints = [
      '/fapi/v1/ticker/24hr',
      '/fapi/v1/klines',
      '/fapi/v1/exchangeInfo',
    ]

    if (!allowedEndpoints.includes(endpoint)) {
      return res.status(403).json({ error: 'Endpoint not allowed' })
    }

    // Build Binance API URL
    const baseUrl = 'https://fapi.binance.com'
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = String(value)
        return acc
      }, {} as Record<string, string>)
    ).toString()

    const binanceUrl = `${baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`

    // Fetch from Binance Futures API
    const response = await fetch(binanceUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Binance API error: ${response.status} ${errorText}`)
      return res.status(response.status).json({
        error: 'Binance API error',
        status: response.status,
        message: errorText,
      })
    }

    // Parse and return JSON
    const data = await response.json()

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate')

    return res.status(200).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
