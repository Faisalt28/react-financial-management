import { Outlet } from 'react-router-dom'
import { Header } from './Header.jsx'

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-foreground transition-colors duration-200">
      {/* Top Navigation Bar */}
      <Header />

      {/* Main Content Area — Full width, no sidebar */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60 py-4 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          <span>AcheeZ &copy; {new Date().getFullYear()} — Manajemen Keuangan Pribadi</span>
        </div>
      </footer>
    </div>
  )
}
