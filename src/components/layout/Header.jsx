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
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-black/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
                <img
                  src={logo}
                  alt="AcheeZ"
                  className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
                />
                <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-white">
                  AcheeZ
                </span>
              </NavLink>

              {/* Desktop Nav Items */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map(({ to, label, icon: Icon }) => {
                  const isActive = location.pathname === to
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150',
                        isActive
                          ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-medium shadow-2xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                      )}
                    >
                      <Icon size={16} className={cn(isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400')} />
                      <span>{label}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2.5">
              {/* Add Transaction Button */}
              <Button
                onClick={() => setShowTxModal(true)}
                size="sm"
                id="header-add-tx"
                className="gap-1.5 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-medium h-9 px-3.5 shadow-2xs"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Transaksi</span>
              </Button>

              {/* Theme Toggle */}
              <button
                onClick={toggle}
                id="header-theme-toggle"
                title={isDark ? 'Mode Terang' : 'Mode Gelap'}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* User Avatar / Profile Menu */}
              <NavLink
                to="/settings"
                title="Pengaturan Akun"
                className="flex items-center gap-2 p-1 pl-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden lg:inline text-xs font-medium text-zinc-700 dark:text-zinc-300 max-w-[100px] truncate">
                  {user?.name || 'User'}
                </span>
              </NavLink>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Keluar"
                className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut size={16} />
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(open => !open)}
                className="p-2 md:hidden rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-4 pt-2 pb-4 space-y-1 animate-fade-in">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-medium'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                  )}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              )
            })}
            <NavLink
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
            >
              <Settings size={18} />
              <span>Pengaturan</span>
            </NavLink>
          </div>
        )}
      </header>

      <TransactionModal isOpen={showTxModal} onClose={() => setShowTxModal(false)} />
    </>
  )
}
