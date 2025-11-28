import type { Coin } from '@/types/coin'

export interface ExternalLinksProps {
  coin: Coin
}

/**
 * ExternalLinks component provides links to external trading/analysis tools
 */
export function ExternalLinks({ coin }: ExternalLinksProps) {
  const { fullSymbol, symbol } = coin

  // External service URLs
  const coinglassUrl = `https://coinglass.com/tv/Binance_${fullSymbol}`
  const aggTradeUrl = `https://aggr.trade/#?q=binance:${fullSymbol.toLowerCase()}`
  const binanceUrl = `https://www.binance.com/en/trade/${fullSymbol}`
  const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${fullSymbol}`

  const links = [
    {
      name: 'CoinGlass',
      url: coinglassUrl,
      description: 'Liquidation heatmap and data',
      icon: '📊',
    },
    {
      name: 'Aggr.trade',
      url: aggTradeUrl,
      description: 'Real-time order flow',
      icon: '📈',
    },
    {
      name: 'Binance',
      url: binanceUrl,
      description: 'Trade on Binance',
      icon: '💱',
    },
    {
      name: 'TradingView',
      url: tradingViewUrl,
      description: 'Advanced charting',
      icon: '📉',
    },
  ]

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        External Tools
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {links.map((link) => (
          <button
            key={link.name}
            onClick={() => handleLinkClick(link.url)}
            className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{link.icon}</span>
              <div className="text-left">
                <div className="text-white font-medium group-hover:text-blue-400 transition-colors">
                  {link.name}
                </div>
                <div className="text-xs text-gray-400">
                  {link.description}
                </div>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </button>
        ))}
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <svg
            className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs text-gray-300">
            External links open in a new tab. Use these tools for deeper market
            analysis and real-time trading data for {symbol}.
          </p>
        </div>
      </div>
    </div>
  )
}
