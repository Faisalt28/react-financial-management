import { useEffect, useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react'
import { useTransactionStore } from '../../store/transactionStore.js'
import { Card, CardHeader, CardTitle, StatCard } from '@/components/ui'
import { formatCurrency, formatCompact } from '../../lib/constants.js'
import { getCategoryById, getLastNMonths, parseTxDate, cn } from '../../lib/utils.js'
import { getMonth, getYear, subMonths, addMonths, format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

// Curated 2D Manga / Anime high-contrast color palette for financial proportions
const MANGA_PIE_COLORS = [
  '#9333ea', // 0: Vivid Manga Purple (signature accent)
  '#f43f5e', // 1: Rose Coral
  '#06b6d4', // 2: Cyber Cyan
  '#f59e0b', // 3: Golden Amber
  '#10b981', // 4: Emerald Mint
  '#3b82f6', // 5: Electric Sapphire
  '#ec4899', // 6: Hot Magenta Pink
  '#84cc16', // 7: Lime Punch
  '#f97316', // 8: Bright Tangerine
  '#6366f1', // 9: Neon Indigo
  '#14b8a6', // 10: Mint Teal
  '#e11d48', // 11: Crimson Red
  '#8b5cf6', // 12: Light Violet
  '#eab308', // 13: Solar Yellow
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3.5 rounded-xl border-2 border-zinc-950 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_#9333ea] space-y-2 min-w-[190px] pointer-events-none">
        <p className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white pb-1.5 border-b-2 border-zinc-100 dark:border-zinc-800">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map(p => (
            <div key={p.name} className="flex items-center justify-between text-xs font-bold gap-3">
              <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-xs border border-zinc-950" style={{ backgroundColor: p.color }} />
                {p.name}:
              </span>
              <span className="font-black text-zinc-900 dark:text-white">
                {formatCurrency(p.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

const MangaPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="p-3.5 rounded-xl border-2 border-zinc-950 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_#9333ea] space-y-2 min-w-[210px] pointer-events-none">
        <div className="flex items-center gap-2 pb-1.5 border-b-2 border-zinc-200 dark:border-zinc-800">
          <span className="text-xl">{item.icon}</span>
          <span className="font-black text-sm text-zinc-950 dark:text-white uppercase tracking-tight truncate">
            {item.name}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
          <span>Nominal:</span>
          <span className="font-black text-sm text-zinc-950 dark:text-white">
            {formatCurrency(item.amount)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
          <span>Persentase:</span>
          <span
            className="px-2 py-0.5 rounded-md text-xs font-black text-white border-2 border-zinc-950 shadow-[1px_1px_0px_0px_#000]"
            style={{ backgroundColor: item.color }}
          >
            {item.pct}%
          </span>
        </div>
      </div>
    )
  }
  return null
}

export function ReportsPage() {
  const { transactions, fetchTransactions, getMonthSummary } = useTransactionStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [pieMode, setPieMode] = useState('expense') // 'expense' | 'income'
  const [hoveredPieIndex, setHoveredPieIndex] = useState(null)
  const [showAllPieCategories, setShowAllPieCategories] = useState(false)

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

  // Spending by category - fully synchronized with summary.expense & distinct manga colors
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
          icon: cat.icon || '💸',
          amount,
        }
      })
      .sort((a, b) => b.amount - a.amount)
      .map((cat, idx) => ({
        ...cat,
        color: MANGA_PIE_COLORS[idx % MANGA_PIE_COLORS.length],
        pct: summary.expense > 0 ? Number(((cat.amount / summary.expense) * 100).toFixed(1)) : 0,
      }))
  }, [monthTx, summary.expense])

  // Income by category - fully synchronized with summary.income & distinct manga colors
  const incomeCategoryData = useMemo(() => {
    const incomeMap = {}
    monthTx
      .filter(t => t.type === 'income')
      .forEach(t => {
        const catId = t.categoryId === 'other' ? 'other_income' : (t.categoryId || 'other_income')
        incomeMap[catId] = (incomeMap[catId] || 0) + (Number(t.amount) || 0)
      })

    return Object.entries(incomeMap)
      .map(([id, amount]) => {
        const cat = getCategoryById(id)
        return {
          ...cat,
          id,
          name: cat.name,
          icon: cat.icon || '💰',
          amount,
        }
      })
      .sort((a, b) => b.amount - a.amount)
      .map((cat, idx) => ({
        ...cat,
        color: MANGA_PIE_COLORS[(idx + 3) % MANGA_PIE_COLORS.length],
        pct: summary.income > 0 ? Number(((cat.amount / summary.income) * 100).toFixed(1)) : 0,
      }))
  }, [monthTx, summary.income])

  const activeCategoryData = pieMode === 'expense' ? categoryData : incomeCategoryData
  const activeTotal = pieMode === 'expense' ? summary.expense : summary.income
  const activeHovered = hoveredPieIndex !== null ? activeCategoryData[hoveredPieIndex] : null

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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_#9333ea]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(d => subMonths(d, 1))}
            id="rep-prev-month"
            className="p-2 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-950 shadow-[2px_2px_0px_0px_#000] transition-colors cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight min-w-[160px] sm:min-w-[180px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: idLocale })}
          </span>
          <button
            onClick={() => setCurrentDate(d => addMonths(d, 1))}
            id="rep-next-month"
            className="p-2 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-950 shadow-[2px_2px_0px_0px_#000] transition-colors cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <button
          onClick={() => setCurrentDate(new Date())}
          className="text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-purple-600 text-white hover:bg-purple-700 shadow-[2px_2px_0px_0px_#000] transition-colors cursor-pointer"
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
      <div className="flex items-start gap-2.5 p-3.5 rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 bg-purple-50/40 dark:bg-purple-950/20 text-xs text-zinc-700 dark:text-zinc-300 shadow-[2px_2px_0px_0px_#9333ea]">
        <HelpCircle size={16} className="text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-zinc-900 dark:text-white font-bold uppercase">Catatan Sisa Bersih (Net):</strong> Nilai ini diperoleh dari total <strong>Pemasukan dikurangi Pengeluaran</strong> selama bulan {format(currentDate, 'MMMM yyyy', { locale: idLocale })}. Jika bernilai positif (hijau), kondisi keuangan surplus. Jika bernilai negatif (merah), pengeluaran melebihi pemasukan (defisit).
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart 6 months (2D Manga Aesthetic) */}
        <Card className="lg:col-span-2 border-2 border-zinc-950 dark:border-zinc-800 shadow-[4px_4px_0px_0px_#9333ea] flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <CardTitle>Tren 6 Bulan Terakhir</CardTitle>
              {/* Manga Legend Pills */}
              <div className="flex items-center gap-2.5 text-xs font-bold self-start sm:self-auto">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-zinc-950 dark:border-zinc-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-[1px_1px_0px_0px_#000]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 border border-zinc-950" />
                  <span>Pemasukan</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-zinc-950 dark:border-zinc-700 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 shadow-[1px_1px_0px_0px_#000]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 border border-zinc-950" />
                  <span>Pengeluaran</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <div className="p-6 pt-2">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trendData} barGap={4} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#71717a' }}
                  axisLine={{ stroke: '#27272a', strokeWidth: 1.5 }}
                  tickLine={false}
                  dy={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#71717a' }}
                  axisLine={{ stroke: '#27272a', strokeWidth: 1.5 }}
                  tickLine={false}
                  tickFormatter={formatCompact}
                  dx={-2}
                />
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 100, outline: 'none' }} />
                <Bar
                  dataKey="Pemasukan"
                  fill="#10b981"
                  stroke="#09090b"
                  strokeWidth={2}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Pengeluaran"
                  fill="#f43f5e"
                  stroke="#09090b"
                  strokeWidth={2}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie chart by category (2D Manga / Japanese Aesthetic) */}
        <Card className="flex flex-col border-2 border-zinc-950 dark:border-zinc-800 shadow-[4px_4px_0px_0px_#9333ea]">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <CardTitle>Proporsi Keuangan</CardTitle>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  Distribusi persentase per kategori
                </p>
              </div>

              {/* Mode Toggle: Pengeluaran / Pemasukan */}
              <div className="flex items-center p-1 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 self-start sm:self-auto shadow-[2px_2px_0px_0px_#000]">
                <button
                  type="button"
                  onClick={() => { setPieMode('expense'); setHoveredPieIndex(null); }}
                  className={cn(
                    'px-2.5 py-1 text-xs font-black uppercase tracking-tight rounded-lg transition-all cursor-pointer',
                    pieMode === 'expense'
                      ? 'bg-rose-600 text-white shadow-[2px_2px_0px_0px_#000] border border-zinc-950'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  )}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => { setPieMode('income'); setHoveredPieIndex(null); }}
                  className={cn(
                    'px-2.5 py-1 text-xs font-black uppercase tracking-tight rounded-lg transition-all cursor-pointer',
                    pieMode === 'income'
                      ? 'bg-emerald-600 text-white shadow-[2px_2px_0px_0px_#000] border border-zinc-950'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  )}
                >
                  Pemasukan
                </button>
              </div>
            </div>
          </CardHeader>

          <div className="p-6 pt-2 flex-1 flex flex-col justify-between">
            {activeCategoryData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-56 text-zinc-400 text-sm gap-2.5 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <span className="text-4xl">📊</span>
                <p className="font-bold text-center text-xs">
                  Belum ada transaksi {pieMode === 'expense' ? 'pengeluaran' : 'pemasukan'} pada bulan {format(currentDate, 'MMMM yyyy', { locale: idLocale })}.
                </p>
              </div>
            ) : (
              <>
                {/* Visual Chart with Donut Center Badge */}
                <div className="relative w-full h-60 my-1 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activeCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={82}
                        paddingAngle={3}
                        dataKey="amount"
                        nameKey="name"
                        onMouseEnter={(_, index) => setHoveredPieIndex(index)}
                        onMouseLeave={() => setHoveredPieIndex(null)}
                      >
                        {activeCategoryData.map((entry, index) => {
                          const isHovered = hoveredPieIndex === index
                          const isDimmed = hoveredPieIndex !== null && !isHovered
                          return (
                            <Cell
                              key={`slice-${entry.id}`}
                              fill={entry.color}
                              stroke="#09090b"
                              strokeWidth={isHovered ? 3.5 : 2.5}
                              style={{
                                filter: isHovered ? 'drop-shadow(0 0 6px rgba(147, 51, 234, 0.5))' : 'none',
                                opacity: isDimmed ? 0.35 : 1,
                                transition: 'opacity 0.2s, stroke-width 0.2s',
                                cursor: 'pointer',
                              }}
                            />
                          )
                        })}
                      </Pie>
                      <Tooltip
                        content={<MangaPieTooltip />}
                        wrapperStyle={{ zIndex: 100, outline: 'none', pointerEvents: 'none' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Hole Information Label with High-Contrast Manga Backing */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <div className="w-[102px] h-[102px] rounded-full bg-white dark:bg-zinc-950 border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_#9333ea] flex flex-col items-center justify-center p-1.5 text-center">
                      {activeHovered ? (
                        <div className="flex flex-col items-center justify-center animate-fade-in">
                          <span className="text-xl leading-none">{activeHovered.icon}</span>
                          <span className="text-sm font-black text-purple-600 dark:text-purple-400 leading-none mt-1">
                            {activeHovered.pct}%
                          </span>
                          <span className="text-[11px] font-black text-zinc-950 dark:text-zinc-100 truncate max-w-[84px] mt-0.5">
                            {activeHovered.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-lg leading-none">{pieMode === 'expense' ? '💸' : '💰'}</span>
                          <span className="text-xs font-black text-zinc-950 dark:text-white leading-tight mt-0.5">
                            {formatCompact(activeTotal)}
                          </span>
                          <span className="text-[8px] font-black tracking-wider text-purple-600 dark:text-purple-400 uppercase mt-0.5">
                            {pieMode === 'expense' ? 'PENGELUARAN' : 'PEMASUKAN'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Clear Breakdown List with Distinct Colors */}
                <div className="space-y-2 mt-2 pt-3 border-t-2 border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase text-zinc-400 tracking-wider px-1">
                    <span>Kategori ({activeCategoryData.length} Pos)</span>
                    <span>Nominal / Porsi</span>
                  </div>

                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {(showAllPieCategories ? activeCategoryData : activeCategoryData.slice(0, 4)).map((c, idx) => {
                      const isHovered = hoveredPieIndex === idx
                      return (
                        <div
                          key={c.id}
                          onMouseEnter={() => setHoveredPieIndex(idx)}
                          onMouseLeave={() => setHoveredPieIndex(null)}
                          className={cn(
                            'p-2 rounded-xl border-2 transition-all cursor-pointer',
                            isHovered
                              ? 'border-purple-600 dark:border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 shadow-[2px_2px_0px_0px_#9333ea]'
                              : 'border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-[1px_1px_0px_0px_#000]'
                          )}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-3.5 h-3.5 rounded border-2 border-zinc-950 flex-shrink-0 shadow-[1px_1px_0px_0px_#000]"
                                style={{ backgroundColor: c.color }}
                              />
                              <span className="font-extrabold text-zinc-950 dark:text-zinc-100 truncate">
                                {c.icon} {c.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="font-black text-zinc-950 dark:text-zinc-100">
                                {formatCurrency(c.amount)}
                              </span>
                              <span
                                className="text-[10px] font-black px-1.5 py-0.5 rounded border-2 border-zinc-950 text-white shadow-[1px_1px_0px_0px_#000]"
                                style={{ backgroundColor: c.color }}
                              >
                                {c.pct}%
                              </span>
                            </div>
                          </div>

                          {/* Proportion Progress Bar */}
                          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full border border-zinc-950/20 dark:border-zinc-700/40 overflow-hidden mt-1.5">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(c.pct, 100)}%`, backgroundColor: c.color }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {activeCategoryData.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setShowAllPieCategories(prev => !prev)}
                      className="w-full py-1 text-center text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:underline cursor-pointer"
                    >
                      {showAllPieCategories
                        ? '▲ Tampilkan Lebih Sedikit'
                        : `▼ Tampilkan Semua (${activeCategoryData.length} Kategori)`}
                    </button>
                  )}
                </div>

                {/* Insight Banner */}
                {activeCategoryData.length > 0 && (
                  <div className="mt-3 p-2.5 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-purple-50/60 dark:bg-purple-950/30 text-[11px] flex items-start gap-2 shadow-[2px_2px_0px_0px_#9333ea]">
                    <span className="text-sm flex-shrink-0">💡</span>
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                      Porsi terbesar adalah <strong className="text-zinc-950 dark:text-white uppercase font-black">{activeCategoryData[0].icon} {activeCategoryData[0].name}</strong> menyumbang <strong className="font-bold text-purple-700 dark:text-purple-300">{activeCategoryData[0].pct}%</strong> ({formatCurrency(activeCategoryData[0].amount)}) dari total {pieMode === 'expense' ? 'pengeluaran' : 'pemasukan'} bulan ini.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Daily spending */}
      {dailyData.length > 0 && (
        <Card className="border-2 border-zinc-950 dark:border-zinc-800 shadow-[4px_4px_0px_0px_#9333ea]">
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
        <Card className="border-2 border-zinc-950 dark:border-zinc-800 shadow-[4px_4px_0px_0px_#9333ea]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Rincian Pengeluaran per Kategori</CardTitle>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold">
                Total: {formatCurrency(summary.expense)}
              </span>
            </div>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4">
            {categoryData.map(c => {
              return (
                <div key={c.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <span className="text-base">{c.icon}</span> {c.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(c.amount)}
                      </span>
                      <span
                        className="text-[10px] font-black px-1.5 py-0.5 rounded border border-zinc-950 text-white shadow-[1px_1px_0px_0px_#000]"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.pct}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full border border-zinc-950/20 dark:border-zinc-700/40 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(c.pct, 100)}%`, backgroundColor: c.color }}
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
