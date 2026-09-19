import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, startOfMonth, endOfMonth, subMonths, parseISO, isValid } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { CATEGORIES } from './constants.js'

// Merge class names (standard shadcn cn helper)
export const cn = (...inputs) => twMerge(clsx(inputs))

// Parse transaction date safely without UTC timezone shift
export const parseTxDate = (dateVal) => {
  if (!dateVal) return new Date()
  if (dateVal instanceof Date) return dateVal
  if (typeof dateVal === 'string') {
    const match = dateVal.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    }
  }
  return new Date(dateVal)
}

// Format tanggal
export const formatDate = (date, fmt = 'dd MMM yyyy') => {
  if (!date) return '-'
  const d = parseTxDate(date)
  if (!isValid(d)) return '-'
  return format(d, fmt, { locale: idLocale })
}

// Format datetime
export const formatDateTime = (date) => formatDate(date, 'dd MMM yyyy, HH:mm')

// Get current month range
export const getCurrentMonthRange = () => {
  const now = new Date()
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  }
}

// Get last N months
export const getLastNMonths = (n = 6) => {
  const months = []
  for (let i = n - 1; i >= 0; i--) {
    const d = subMonths(new Date(), i)
    months.push({
      month: d.getMonth(),
      year: d.getFullYear(),
      label: format(d, 'MMM', { locale: idLocale }),
      fullLabel: format(d, 'MMMM yyyy', { locale: idLocale }),
    })
  }
  return months
}

// Get category by id
export const getCategoryById = (id) => {
  const targetId = id === 'other' ? 'other_expense' : id
  const found = CATEGORIES.find(c => c.id === targetId)
  if (found) return found
  return { id: id || 'other_expense', name: 'Lainnya', icon: '💸', color: '#94a3b8', type: 'expense' }
}

// Generate unique ID
export const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

// Calculate progress percentage
export const calcProgress = (current, target) => {
  if (!target || target === 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

// Get progress color based on percentage
export const getProgressColor = (pct) => {
  if (pct >= 90) return '#f43f5e'
  if (pct >= 70) return '#f59e0b'
  return '#6366f1'
}

// Get budget status
export const getBudgetStatus = (spent, budget) => {
  const pct = calcProgress(spent, budget)
  if (pct >= 100) return { label: 'Terlampaui', color: '#f43f5e' }
  if (pct >= 90) return { label: 'Hampir Habis', color: '#f59e0b' }
  if (pct >= 70) return { label: 'Perhatian', color: '#fbbf24' }
  return { label: 'Aman', color: '#10b981' }
}

// Estimate months to reach goal
export const estimateMonthsToGoal = (remaining, monthlyContribution) => {
  if (!monthlyContribution || monthlyContribution <= 0) return null
  return Math.ceil(remaining / monthlyContribution)
}
