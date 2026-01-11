import { useCallback } from 'react'
import { ThemeToggle } from '@/components/controls'
import { AuthModal, UserMenu } from '@/components/auth'
import { SettingsButton } from '@/components/settings'
import { useStore } from '@/hooks/useStore'

interface HeaderProps {
  title?: string
  subtitle?: string
  onOpenSettings?: () => void
}

export function Header({ title = 'Screener', subtitle, onOpenSettings }: HeaderProps) {
  const isAuthModalOpen = useStore((state) => state.isAuthModalOpen)
  const setAuthModalOpen = useStore((state) => state.setAuthModalOpen)

  // Memoize callbacks to prevent AuthModal from re-rendering
  const handleOpenAuth = useCallback(() => setAuthModalOpen(true), [setAuthModalOpen])
  const handleCloseAuth = useCallback(() => setAuthModalOpen(false), [setAuthModalOpen])

  return (
    <>
      <header className="sticky top-0 z-50 bg-gray-900/95 border-b border-gray-800 backdrop-blur-sm">
        <div className="w-full max-w-[1920px] mx-auto px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <UserMenu onSignIn={handleOpenAuth} />
              {onOpenSettings && <SettingsButton onClick={onOpenSettings} />}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuth}
      />
    </>
  )
}
