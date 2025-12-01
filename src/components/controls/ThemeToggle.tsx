import { Sun, Moon } from 'lucide-react'
import { useStore } from '@/hooks/useStore'

export function ThemeToggle() {
  const theme = useStore((state) => state.theme)
  const setTheme = useStore((state) => state.setTheme)

  const isDark = theme === 'dark'

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-blue-400" />
      )}
    </button>
  )
}
