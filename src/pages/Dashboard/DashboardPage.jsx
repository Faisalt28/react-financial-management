import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet, TrendingUp, TrendingDown, Target, BarChart3,
  ArrowRightLeft, ArrowUpRight, ArrowDownRight, CreditCard,
  Plus, CheckCircle2, AlertCircle, FileText
} from 'lucide-react'
import { BentoGrid, BentoCard } from '@/components/ui'
import { useAuthStore } from '@/store/authStore.js'
import { useTransactionStore } from '@/store/transactionStore.js'
import { useAccountStore } from '@/store/accountStore.js'
import { useBudgetStore } from '@/store/budgetStore.js'
import { useGoalStore } from '@/store/goalStore.js'
import { formatCurrency, formatCompact } from '@/lib/constants.js'
import { formatDate, getCategoryById, calcProgress, getBudgetStatus, parseTxDate } from '@/lib/utils.js'
import { getMonth, getYear, format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export function DashboardPage() {
  const { user } = useAuthStore()
  const { transactions, fetchTransactions, getMonthSummary } = useTransactionStore()
  const { accounts, fetchAccounts, getTotalBalance } = useAccountStore()
  const { budgets, fetchBudgets } = useBudgetStore()
  const { goals, fetchGoals } = useGoalStore()

  useEffect(() => {
    fetchTransactions()
    fetchAccounts()
    fetchBudgets()
    fetchGoals()
  }, [])

  const now = new Date()
  const currentMonthName = format(now, 'MMMM yyyy', { locale: idLocale })
  const thisMonth = getMonthSummary(getMonth(now), getYear(now))
  const totalBalance = getTotalBalance()

  // Recent transactions (up to 4)
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 4)
  }, [transactions])

  // Spending by category this month
  const spendingByCategory = useMemo(() => {
    const currentMonth = getMonth(now)
    const currentYear = getYear(now)
    const filtered = transactions.filter(t => {
      const d = parseTxDate(t.date)
      return t.type === 'expense' && getMonth(d) === currentMonth && getYear(d) === currentYear
    })
    const map = {}
    filtered.forEach(t => {
      const amt = Number(t.amount) || 0
      const catId = t.categoryId === 'other' ? 'other_expense' : (t.categoryId || 'other_expense')
      map[catId] = (map[catId] || 0) + amt
    })
    return map
  }, [transactions])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Greeting Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Halo, {user?.name?.split(' ')[0] || 'Teman'} 👋
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Ringkasan kesehatan finansial & arus kas Anda periode {currentMonthName}.
        </p>
      </div>

      {/* Bento Grid Architecture */}
      <BentoGrid className="lg:grid-cols-3">
        {/* =========================================================
            BENTO 1: TOTAL SALDO & AKUN BANK (SPAN 2 COL)
            ========================================================= */}
        {/* =========================================================
            BENTO 1: TOTAL SALDO & AKUN BANK (SPAN 2 COL)
            ========================================================= */}
        <BentoCard
          name="Total Kekayaan & Saldo"
          className="lg:col-span-2"
          description="Akumulasi seluruh dana aktif di rekening bank, dompet tunai, dan e-wallet Anda."
          Icon={Wallet}
          href="/accounts"
          cta="Kelola Akun & Rekening"
        >
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Total Saldo Tersedia
              </span>
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white mt-1">
                {formatCurrency(totalBalance)}
              </div>
            </div>

            {/* List mini akun */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {accounts.slice(0, 3).map((acc) => (
                <div
                  key={acc.id}
                  className="p-3 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-[2px_2px_0px_0px_#9333ea] hover:translate-y-[-1px] transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5 font-medium">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{acc.name}</span>
                    <span>{acc.icon || '💳'}</span>
                  </div>
                  <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(acc.balance || 0)}
                  </span>
                </div>
              ))}
              {accounts.length === 0 && (
                <p className="text-xs text-zinc-400 col-span-3">Belum ada akun terdaftar.</p>
              )}
            </div>
          </div>
        </BentoCard>

        {/* =========================================================
            BENTO 2: ARUS KAS BULAN INI (SPAN 1 COL)
            ========================================================= */}
        <BentoCard
          name="Arus Kas Bulan Ini"
          className="lg:col-span-1"
          description={`Perbandingan masuk & keluar dana selama ${currentMonthName}.`}
          Icon={ArrowRightLeft}
          href="/transactions"
          cta="Riwayat Arus Kas"
        >
          <div className="space-y-2.5">
            {/* Pemasukan */}
            <div className="flex items-center justify-between p-3 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-emerald-50 dark:bg-emerald-950/40 shadow-[2px_2px_0px_0px_#10b981]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold">
                  <ArrowDownRight size={16} />
                </div>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Pemasukan</span>
              </div>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                +{formatCurrency(thisMonth.income)}
              </span>
            </div>

            {/* Pengeluaran */}
            <div className="flex items-center justify-between p-3 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-rose-50 dark:bg-rose-950/40 shadow-[2px_2px_0px_0px_#f43f5e]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold">
                  <ArrowUpRight size={16} />
                </div>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Pengeluaran</span>
              </div>
              <span className="text-sm font-black text-rose-700 dark:text-rose-400">
                -{formatCurrency(thisMonth.expense)}
              </span>
            </div>

            {/* Sisa Bersih */}
            <div className="pt-1.5 px-1 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-bold uppercase tracking-wider text-[11px]">Sisa Bersih:</span>
              <span className={`font-black text-sm ${thisMonth.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {thisMonth.net >= 0 ? '+' : ''}{formatCurrency(thisMonth.net)}
              </span>
            </div>
          </div>
        </BentoCard>

        {/* =========================================================
            BENTO 3: ANGGARAN & BUDGET (SPAN 1 COL)
            ========================================================= */}
        <BentoCard
          name="Pantauan Anggaran"
          className="lg:col-span-1"
          description="Batas pengeluaran per kategori agar keuangan tetap terkendali."
          Icon={TrendingUp}
          href="/budget"
          cta="Atur Batas Anggaran"
        >
          <div className="space-y-3">
            {budgets.slice(0, 2).map(b => {
              const spent = spendingByCategory[b.categoryId] || 0
              const pct = calcProgress(spent, b.amount)
              const status = getBudgetStatus(spent, b.amount)
              const cat = getCategoryById(b.categoryId)

              return (
                <div key={b.id} className="space-y-1.5 p-2.5 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shadow-[2px_2px_0px_0px_#9333ea]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                      {cat.icon} {cat.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-black border border-zinc-950 dark:border-zinc-700" style={{ color: status.color, background: `${status.color}20` }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full border border-zinc-950 dark:border-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: status.color }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    <span>{formatCurrency(spent)}</span>
                    <span>Max {formatCurrency(b.amount)}</span>
                  </div>
                </div>
              )
            })}

            {budgets.length === 0 && (
              <div className="text-center py-4 text-xs text-zinc-400">
                Belum ada anggaran bulan ini.
              </div>
            )}
          </div>
        </BentoCard>

        {/* =========================================================
            BENTO 4: TARGET TABUNGAN / GOALS (SPAN 1 COL)
            ========================================================= */}
        <BentoCard
          name="Target Tabungan"
          className="lg:col-span-1"
          description="Progres capaian impian finansial dan pos dana darurat."
          Icon={Target}
          href="/goals"
          cta="Target Tabungan"
        >
          <div className="space-y-3">
            {goals.slice(0, 2).map(g => {
              const pct = calcProgress(g.currentAmount, g.targetAmount)
              return (
                <div key={g.id} className="p-2.5 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-1.5 shadow-[2px_2px_0px_0px_#9333ea]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{g.name}</span>
                    <span className="font-black text-purple-600 dark:text-purple-400">{pct}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full border border-zinc-950 dark:border-zinc-800 overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    <span>{formatCompact(g.currentAmount)}</span>
                    <span>Target {formatCompact(g.targetAmount)}</span>
                  </div>
                </div>
              )
            })}

            {goals.length === 0 && (
              <div className="text-center py-4 text-xs text-zinc-400">
                Belum ada target tabungan dibuat.
              </div>
            )}
          </div>
        </BentoCard>

        {/* =========================================================
            BENTO 5: LAPORAN & ANALISIS (SPAN 1 COL)
            ========================================================= */}
        <BentoCard
          name="Laporan & Analisis"
          className="lg:col-span-1"
          description="Visualisasi grafik arus kas, tren pengeluaran, serta analitik bulanan."
          Icon={BarChart3}
          href="/reports"
          cta="Buka Laporan Lengkap"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex items-center justify-between shadow-[2px_2px_0px_0px_#9333ea]">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Transaksi Terhitung</p>
                <p className="text-lg font-black text-zinc-900 dark:text-white">{transactions.length} Aktivitas</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/50 border border-zinc-950 dark:border-zinc-800 text-purple-700 dark:text-purple-300 font-bold">
                <FileText size={18} />
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Analisis laporan bulanan lengkap dengan neraca mutasi transaksi terperinci.
            </p>
          </div>
        </BentoCard>

        {/* =========================================================
            BENTO 6: AKTIVITAS TRANSAKSI TERAKHIR (SPAN 3 COL - FULL WIDTH)
            ========================================================= */}
        <BentoCard
          name="Riwayat Transaksi Terkini"
          className="lg:col-span-3"
          description="Daftar mutasi dana terkini yang dicatat ke dalam buku kas Anda."
          Icon={ArrowRightLeft}
          href="/transactions"
          cta="Lihat Semua Riwayat Transaksi"
        >
          <div className="divide-y-2 divide-zinc-100 dark:divide-zinc-900">
            {recentTransactions.map((tx) => {
              const cat = getCategoryById(tx.categoryId)
              const isIncome = tx.type === 'income'
              const isExpense = tx.type === 'expense'

              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base bg-purple-50 dark:bg-purple-950/40 border-2 border-zinc-950 dark:border-zinc-800 shadow-[2px_2px_0px_0px_#9333ea] flex-shrink-0">
                      {cat.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {tx.note || cat.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                        {formatDate(tx.date)} &bull; {cat.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm sm:text-base font-black ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : isExpense ? 'text-zinc-900 dark:text-zinc-100' : 'text-purple-600'}`}>
                      {isIncome ? '+' : isExpense ? '-' : ''}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
              )
            })}

            {recentTransactions.length === 0 && (
              <div className="py-8 text-center text-xs text-zinc-400">
                Belum ada mutasi transaksi yang tercatat.
              </div>
            )}
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  )
}
