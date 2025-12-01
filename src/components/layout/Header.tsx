import { ThemeToggle } from '@/components/controls'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({ title = 'Crypto Screener', subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              <span className="text-bullish">●</span> Live
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
