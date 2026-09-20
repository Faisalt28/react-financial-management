import * as React from 'react'
import { cn, calcProgress, getProgressColor } from '@/lib/utils'

export interface ProgressBarProps {
  current: number
  target: number
  className?: string
  showLabel?: boolean
  color?: string
}

export function ProgressBar({ current, target, className = '', showLabel = true, color }: ProgressBarProps) {
  const pct = calcProgress(current, target)
  const barColor = color || (pct >= 100 ? '#f43f5e' : pct >= 80 ? '#f59e0b' : '#9333ea')

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{pct}%</span>
        </div>
      )}
      <div className="h-3 w-full rounded-full border-2 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 overflow-hidden p-[1px]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
        />
      </div>
    </div>
  )
}

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'income' | 'expense' | 'transfer' | 'warning' | 'success' | 'danger'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-950 dark:border-zinc-800',
    income: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-2 border-zinc-950 dark:border-zinc-800',
    expense: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-2 border-zinc-950 dark:border-zinc-800',
    transfer: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-2 border-zinc-950 dark:border-zinc-800',
    warning: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-2 border-zinc-950 dark:border-zinc-800',
    success: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-2 border-zinc-950 dark:border-zinc-800',
    danger: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-2 border-zinc-950 dark:border-zinc-800',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-tight shadow-[2px_2px_0px_0px_#9333ea]', variants[variant] || variants.default, className)}>
      {children}
    </span>
  )
}

export interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color?: string
  trend?: number
}

export function StatCard({ icon, label, value, sub, color = '#9333ea', trend }: StatCardProps) {
  return (
    <div className="rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-[4px_4px_0px_0px_#9333ea] transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#9333ea]">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl border-2 border-zinc-950 dark:border-zinc-800 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 font-black shadow-[2px_2px_0px_0px_#9333ea]"
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span className={cn('text-xs font-bold px-2 py-0.5 rounded border border-zinc-950 dark:border-zinc-700 shadow-[1px_1px_0px_0px_#000]', trend >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300')}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
      <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{value}</p>
      {sub && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">{sub}</p>}
    </div>
  )
}

export interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4 opacity-40">{icon}</div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-200 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">{description}</p>
      {action}
    </div>
  )
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={cn('border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white rounded-full animate-spin', sizes[size])} />
  )
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl">💰</div>
        <Spinner size="lg" />
        <p className="text-zinc-500 text-sm">Memuat...</p>
      </div>
    </div>
  )
}
