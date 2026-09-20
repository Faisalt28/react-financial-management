import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ArrowRightLeft, Wallet, TrendingUp, Target,
  BarChart3, Settings, LogOut, Plus, Sun, Moon, Menu, X
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore.js'
import { useThemeStore } from '@/store/themeStore.js'
import { Button } from '@/components/ui'
import { TransactionModal } from '../forms/TransactionModal.jsx'
import logo from '@/assets/logo.png'
import { cn } from '@/lib/utils.js'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transaksi', icon: ArrowRightLeft },
  { to: '/accounts', label: 'Akun & Dompet', icon: Wallet },
  { to: '/budget', label: 'Anggaran', icon: TrendingUp },
  { to: '/goals', label: 'Tabungan', icon: Target },
  { to: '/reports', label: 'Laporan', icon: BarChart3 },
]

export function Header() {
  const [showTxModal, setShowTxModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const { isDark, toggle } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-2 border-zinc-950 dark:border-zinc-800 bg-white/95 dark:bg-black/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-6 lg:gap-8">
              <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
                <div className="p-1 rounded-lg border-2 border-zinc-950 dark:border-zinc-800 bg-purple-50 dark:bg-purple-950/40 shadow-[2px_2px_0px_0px_#9333ea]">
                  <img
                    src={logo}
                    alt="AcheeZ"
                    className="w-7 h-7 object-contain transition-transform group-hover:scale-105"
                  />
                </div>
                <span className="font-black text-lg tracking-tight text-zinc-900 dark:text-white uppercase">
                  AcheeZ
                </span>
              </NavLink>

              {/* Desktop Nav Items */}
              <nav className="hidden md:flex items-center gap-1.5">
                {navLinks.map(({ to, label, icon: Icon }) => {
                  const isActive = location.pathname === to
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150',
                        isActive
                          ? 'bg-purple-600 text-white border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#9333ea]'
                          : 'text-zinc-700 dark:text-zinc-300 border-2 border-transparent hover:border-zinc-950 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      )}
                    >
                      <Icon size={15} className={cn(isActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400')} />
                      <span>{label}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Add Transaction Button */}
              <Button
                onClick={() => setShowTxModal(true)}
                size="sm"
                id="header-add-tx"
                className="gap-1.5 bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700 border-2 border-zinc-950 dark:border-zinc-700 font-bold h-9 px-3.5 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
              >
                <Plus size={16} />
                <span className="hidden sm:inline uppercase tracking-wide text-xs">Transaksi</span>
              </Button>

              {/* Theme Toggle */}
              <button
                onClick={toggle}
                id="header-theme-toggle"
                title={isDark ? 'Mode Terang' : 'Mode Gelap'}
                className="p-2 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 shadow-[2px_2px_0px_0px_#9333ea] transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* User Avatar / Profile Menu */}
              <NavLink
                to="/settings"
                title="Pengaturan Akun"
                className="flex items-center gap-2 p-1 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[2px_2px_0px_0px_#9333ea] hover:translate-y-[-1px] transition-all"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center font-bold text-xs bg-purple-600 text-white dark:bg-purple-600 dark:text-white">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <span className="hidden lg:inline text-xs font-bold text-zinc-900 dark:text-zinc-100 max-w-[100px] truncate pr-1">
                  {user?.name || 'User'}
                </span>
              </NavLink>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Keluar"
                className="p-2 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#9333ea] transition-colors"
              >
                <LogOut size={16} />
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(open => !open)}
                className="p-2 md:hidden rounded-xl border-2 border-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 shadow-[2px_2px_0px_0px_#000]"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-3 pb-4 space-y-1.5 animate-fade-in shadow-xl">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
                    isActive
                      ? 'bg-purple-600 text-white border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_#000]'
                      : 'text-zinc-700 dark:text-zinc-300 border-2 border-transparent hover:border-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  )}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </NavLink>
              )
            })}
            <NavLink
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 border-2 border-transparent hover:border-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Settings size={16} />
              <span>Pengaturan</span>
            </NavLink>
          </div>
        )}
      </header>

      <TransactionModal isOpen={showTxModal} onClose={() => setShowTxModal(false)} />
    </>
  )
}
