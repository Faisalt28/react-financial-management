import { useEffect, useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTransactionStore } from '../../store/transactionStore.js'
import { Card, CardHeader, CardTitle, StatCard } from '@/components/ui'
import { formatCurrency, formatCompact, CATEGORIES } from '../../lib/constants.js'
import { getCategoryById, getLastNMonths } from '../../lib/utils.js'
import { getMonth, getYear, subMonths, format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 text-xs shadow-xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-400 mb-1.5 font-medium">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    )
  }
  return null
}

export function ReportsPage() {
  const { transactions, fetchTransactions, getMonthSummary } = useTransactionStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const month = getMonth(currentDate)
  const year = getYear(currentDate)

  useEffect(() => { fetchTransactions() }, [])

  const monthTx = useMemo(() => transactions.filter(tx => {
    const d = new Date(tx.date)
    return getMonth(d) === month && getYear(d) === year
  }), [transactions, month, year])

  const summary = getMonthSummary(month, year)

  // Spending by category
  const spendingMap = {}
  monthTx.filter(t => t.type === 'expense').forEach(t => {
    spendingMap[t.categoryId] = (spendingMap[t.categoryId] || 0) + t.amount
  })
  const categoryData = Object.entries(spendingMap)
    .map(([id, amount]) => ({ ...getCategoryById(id), amount }))
    .sort((a, b) => b.amount - a.amount)

  // Last 6 months
  const months6 = getLastNMonths(6)
  const trendData = months6.map(({ month: m, year: y, label }) => {
    const s = getMonthSummary(m, y)
    return { name: label, Pemasukan: s.income, Pengeluaran: s.expense, Net: s.net }
  })

  // Daily spending this month
  const dailyMap = {}
  monthTx.filter(t => t.type === 'expense').forEach(t => {
    const day = new Date(t.date).getDate()
    dailyMap[day] = (dailyMap[day] || 0) + t.amount
  })
  const dailyData = Object.entries(dailyMap)
    .map(([day, amount]) => ({ name: `${day}`, Pengeluaran: amount }))
    .sort((a, b) => Number(a.name) - Number(b.name))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Month navigation */}
      <div className="flex items-center justify-between p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(d => subMonths(d, 1))}
            id="rep-prev-month"
            className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white min-w-[160px] sm:min-w-[180px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: idLocale })}
          </span>
          <button
            onClick={() => setCurrentDate(d => {
              const next = new Date(d)
              next.setMonth(next.getMonth() + 1)
              return next
            })}
            id="rep-next-month"
            className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 stagger-children">
        <StatCard icon="📥" label="Pemasukan" value={formatCompact(summary.income)}
          sub={formatCurrency(summary.income)} color="#10b981" />
        <StatCard icon="📤" label="Pengeluaran" value={formatCompact(summary.expense)}
          sub={formatCurrency(summary.expense)} color="#f43f5e" />
        <StatCard icon="💹" label="Net" value={formatCompact(summary.net)}
          sub={formatCurrency(summary.net)} color={summary.net >= 0 ? '#6366f1' : '#f43f5e'} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart 6 months */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Tren 6 Bulan Terakhir</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trendData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#64748b' }} />
              <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie chart by category */}
        <Card>
          <CardHeader><CardTitle>Per Kategori</CardTitle></CardHeader>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-600 text-sm">Tidak ada data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={70} dataKey="amount" paddingAngle={2}>
                    {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {categoryData.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                      <span className="text-slate-400">{c.icon} {c.name}</span>
                    </div>
                    <span className="text-slate-300">{formatCompact(c.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Daily spending */}
      {dailyData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Pengeluaran Harian</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Pengeluaran" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Category breakdown table */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Rincian per Kategori</CardTitle></CardHeader>
          <div className="space-y-2">
            {categoryData.map(c => {
              const pct = Math.round((c.amount / summary.expense) * 100)
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-lg w-7 text-center">{c.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{c.name}</span>
                      <span className="text-slate-300">{formatCompact(c.amount)} ({pct}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: c.color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
