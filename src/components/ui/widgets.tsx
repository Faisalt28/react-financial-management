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
  const barColor = color || getProgressColor(pct)

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{pct}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
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
    default: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700',
    income: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    expense: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    transfer: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant] || variants.default, className)}>
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

export function StatCard({ icon, label, value, sub, color = '#6366f1', trend }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-5 shadow-xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span className={cn('text-xs font-medium', trend >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-zinc-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{sub}</p>}
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
