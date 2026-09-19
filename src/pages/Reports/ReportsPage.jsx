import { useEffect, useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react'
import { useTransactionStore } from '../../store/transactionStore.js'
import { Card, CardHeader, CardTitle, StatCard } from '@/components/ui'
import { formatCurrency, formatCompact } from '../../lib/constants.js'
import { getCategoryById, getLastNMonths, parseTxDate } from '../../lib/utils.js'
import { getMonth, getYear, subMonths, addMonths, format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 text-xs shadow-xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-400 mb-1.5 font-medium">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {formatCurrency(p.value)}
          </p>
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

  useEffect(() => {
    fetchTransactions()
  }, [])

  // Filter transactions for selected month and year using safe date parsing
  const monthTx = useMemo(() => {
    return transactions.filter(tx => {
      const d = parseTxDate(tx.date)
      return getMonth(d) === month && getYear(d) === year
    })
  }, [transactions, month, year])

  // Summary computed directly from monthTx for 100% synchronization
  const summary = useMemo(() => {
    const income = monthTx
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + (Number(t.amount) || 0), 0)
    const expense = monthTx
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + (Number(t.amount) || 0), 0)
    return {
      income,
      expense,
      net: income - expense,
      count: monthTx.length,
    }
  }, [monthTx])

  // Spending by category - fully synchronized with summary.expense
  const categoryData = useMemo(() => {
    const spendingMap = {}
    monthTx
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const catId = t.categoryId === 'other' ? 'other_expense' : (t.categoryId || 'other_expense')
        spendingMap[catId] = (spendingMap[catId] || 0) + (Number(t.amount) || 0)
      })

    return Object.entries(spendingMap)
      .map(([id, amount]) => {
        const cat = getCategoryById(id)
        return {
          ...cat,
          id,
          name: cat.name,
          color: cat.color || '#94a3b8',
          amount,
        }
      })
      .sort((a, b) => b.amount - a.amount)
  }, [monthTx])

  // Last 6 months trend
  const months6 = useMemo(() => getLastNMonths(6), [])
  const trendData = useMemo(() => {
    return months6.map(({ month: m, year: y, label }) => {
      const s = getMonthSummary(m, y)
      return {
        name: label,
        Pemasukan: s.income,
        Pengeluaran: s.expense,
        'Sisa Bersih': s.net
      }
    })
  }, [months6, transactions, getMonthSummary])

  // Daily spending this month
  const dailyData = useMemo(() => {
    const dailyMap = {}
    monthTx
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const d = parseTxDate(t.date)
        const day = d.getDate()
        dailyMap[day] = (dailyMap[day] || 0) + (Number(t.amount) || 0)
      })
    return Object.entries(dailyMap)
      .map(([day, amount]) => ({ name: `Tgl ${day}`, Pengeluaran: amount }))
      .sort((a, b) => Number(a.name.replace('Tgl ', '')) - Number(b.name.replace('Tgl ', '')))
  }, [monthTx])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Month navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(d => subMonths(d, 1))}
            id="rep-prev-month"
            className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white min-w-[160px] sm:min-w-[180px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: idLocale })}
          </span>
          <button
            onClick={() => setCurrentDate(d => addMonths(d, 1))}
            id="rep-next-month"
            className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <button
          onClick={() => setCurrentDate(new Date())}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
        >
          Bulan Ini
        </button>
      </div>

      {/* Summary stats - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 stagger-children">
        <StatCard
          icon="📥"
          label="Pemasukan"
          value={formatCompact(summary.income)}
          sub={formatCurrency(summary.income)}
          color="#10b981"
        />
        <StatCard
          icon="📤"
          label="Pengeluaran"
          value={formatCompact(summary.expense)}
          sub={formatCurrency(summary.expense)}
          color="#f43f5e"
        />
        <StatCard
          icon="⚖️"
          label="Sisa Bersih (Net)"
          value={`${summary.net >= 0 ? '+' : ''}${formatCompact(summary.net)}`}
          sub={`${summary.net >= 0 ? '+' : ''}${formatCurrency(summary.net)}`}
          color={summary.net >= 0 ? '#10b981' : '#f43f5e'}
        />
      </div>

      {/* Explanation Banner for Net / Sisa Bersih */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-400">
        <HelpCircle size={16} className="text-zinc-400 mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">Catatan Sisa Bersih (Net):</strong> Nilai ini diperoleh dari total <strong>Pemasukan dikurangi Pengeluaran</strong> selama bulan {format(currentDate, 'MMMM yyyy', { locale: idLocale })}. Jika bernilai positif (hijau), kondisi keuangan surplus. Jika bernilai negatif (merah), pengeluaran melebihi pemasukan (defisit).
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart 6 months */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tren 6 Bulan Terakhir</CardTitle>
          </CardHeader>
          <div className="p-6 pt-0">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trendData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#71717a' }} />
                <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie chart by category */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Proporsi Pengeluaran</CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 flex-1 flex flex-col justify-between">
            {categoryData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-400 text-sm gap-2">
                <span className="text-3xl">📊</span>
                <p>Belum ada pengeluaran pada bulan ini</p>
              </div>
            ) : (
              <>
                <div className="w-full h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="name"
                      >
                        {categoryData.map((e) => (
                          <Cell key={e.id} fill={e.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => [formatCurrency(Number(v) || 0), 'Pengeluaran']}
                        contentStyle={{
                          borderRadius: '0.75rem',
                          border: '1px solid rgba(255,255,255,0.1)',
                          backgroundColor: '#18181b',
                          color: '#f4f4f5',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  {categoryData.slice(0, 5).map(c => {
                    const pct = summary.expense > 0 ? Math.round((c.amount / summary.expense) * 100) : 0
                    return (
                      <div key={c.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                          <span className="text-zinc-600 dark:text-zinc-400 truncate">{c.icon} {c.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(c.amount)}</span>
                          <span className="text-[10px] text-zinc-400 font-medium">({pct}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Daily spending */}
      {dailyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pengeluaran Harian Bulan Ini</CardTitle>
          </CardHeader>
          <div className="p-6 pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="Pengeluaran"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ fill: '#f43f5e', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Category breakdown table */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Rincian Pengeluaran per Kategori</CardTitle>
              <span className="text-xs text-zinc-400 font-medium">
                Total: {formatCurrency(summary.expense)}
              </span>
            </div>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4">
            {categoryData.map(c => {
              const pct = summary.expense > 0 ? Math.round((c.amount / summary.expense) * 100) : 0
              return (
                <div key={c.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <span className="text-base">{c.icon}</span> {c.name}
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(c.amount)} <span className="text-zinc-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: c.color }}
                    />
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
