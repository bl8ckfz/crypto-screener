import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface LayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  onOpenSettings?: () => void
}

export function Layout({ children, title, subtitle, onOpenSettings }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header title={title} subtitle={subtitle} onOpenSettings={onOpenSettings} />
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-6 py-6 animate-fade-in">
        {children}
      </main>
      <Footer />
    </div>
  )
}
