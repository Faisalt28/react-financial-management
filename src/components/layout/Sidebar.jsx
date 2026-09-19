import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ArrowRightLeft, Wallet, Target, BarChart3,
  Settings, LogOut, TrendingUp, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore.js'
import { cn } from '../../lib/utils.js'
import logo from '../../assets/logo.png'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowRightLeft, label: 'Transaksi' },
  { to: '/accounts', icon: Wallet, label: 'Akun & Dompet' },
  { to: '/budget', icon: TrendingUp, label: 'Anggaran' },
  { to: '/goals', icon: Target, label: 'Tabungan' },
  { to: '/reports', icon: BarChart3, label: 'Laporan' },
]

export function Sidebar({ collapsed = false }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className="flex flex-col h-full bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800/80 transition-colors"
      style={{
        width: collapsed ? '72px' : '240px',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ minHeight: '72px' }}>
        <img
          src={logo}
          alt="AcheeZ Logo"
          className="w-9 h-9 object-contain flex-shrink-0"
        />
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">AcheeZ</p>
            <p className="text-xs text-zinc-500">Manajemen Keuangan</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            id={`nav-${to.slice(1)}`}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group',
                isActive
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-medium shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={cn('flex-shrink-0 transition-colors', isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200')} />
                {!collapsed && <span className="flex-1 truncate">{label}</span>}
                {!collapsed && isActive && <ChevronRight size={14} className="text-zinc-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80">
        <NavLink
          to="/settings"
          id="nav-settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group mb-1',
              isActive
                ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-medium shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
            )
          }
        >
          <Settings size={18} className="flex-shrink-0" />
          {!collapsed && <span>Pengaturan</span>}
        </NavLink>

        <div className={cn('flex items-center gap-3 px-3 py-2.5', collapsed && 'justify-center')}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs"
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200 truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              id="logout-btn"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Keluar"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
