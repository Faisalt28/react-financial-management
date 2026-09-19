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
import { formatDate, getCategoryById, calcProgress, getBudgetStatus } from '@/lib/utils.js'
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
      const d = new Date(t.date)
      return t.type === 'expense' && getMonth(d) === currentMonth && getYear(d) === currentYear
    })
    const map = {}
    filtered.forEach(t => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount
    })
    return map
  }, [transactions])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Halo, {user?.name?.split(' ')[0] || 'Teman'} 👋
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Ringkasan kesehatan finansial & arus kas Anda periode {currentMonthName}.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Database Lokal Tersinkron</span>
        </div>
      </div>

      {/* Bento Grid Architecture */}
      <BentoGrid className="lg:grid-cols-3">
        {/* =========================================================
            BENTO 1: TOTAL SALDO & AKUN BANK (SPAN 2 COL)
            ========================================================= */}
        <BentoCard
          name="Total Kekayaan & Saldo"
          className="lg:col-span-2 auto-rows-[22rem]"
          description="Akumulasi seluruh dana aktif di rekening bank, dompet tunai, dan e-wallet Anda."
          Icon={Wallet}
          href="/accounts"
          cta="Kelola Akun & Rekening"
          background={
            <div className="absolute right-0 top-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-gradient-to-br from-zinc-200/40 via-zinc-100/20 to-transparent dark:from-zinc-800/40 dark:via-zinc-900/10 blur-3xl pointer-events-none" />
          }
        >
          <div className="space-y-4">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Total Saldo Tersedia
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-1">
                {formatCurrency(totalBalance)}
              </div>
            </div>

            {/* List mini akun */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {accounts.slice(0, 3).map((acc) => (
                <div
                  key={acc.id}
                  className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 flex flex-col justify-between shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                    <span className="font-medium truncate max-w-[100px]">{acc.name}</span>
                    <span>{acc.icon || '💳'}</span>
                  </div>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
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
          background={
            <div className="absolute right-0 bottom-0 w-48 h-48 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-2xl pointer-events-none" />
          }
        >
          <div className="space-y-3">
            {/* Pemasukan */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/15 bg-emerald-500/5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <ArrowDownRight size={16} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Pemasukan</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(thisMonth.income)}
                  </p>
                </div>
              </div>
            </div>

            {/* Pengeluaran */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-rose-500/15 bg-rose-500/5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400">
                  <ArrowUpRight size={16} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Pengeluaran</p>
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    -{formatCurrency(thisMonth.expense)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sisa Bersih */}
            <div className="pt-1 flex items-center justify-between text-xs text-zinc-500">
              <span>Sisa Bersih:</span>
              <span className={`font-semibold ${thisMonth.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
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
          background={
            <div className="absolute left-0 top-0 w-48 h-48 rounded-full bg-zinc-400/5 dark:bg-zinc-800/10 blur-2xl pointer-events-none" />
          }
        >
          <div className="space-y-3">
            {budgets.slice(0, 2).map(b => {
              const spent = spendingByCategory[b.categoryId] || 0
              const pct = calcProgress(spent, b.amount)
              const status = getBudgetStatus(spent, b.amount)
              const cat = getCategoryById(b.categoryId)

              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate">
                      {cat.icon} {cat.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: status.color, background: `${status.color}15` }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: status.color }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-400">
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
          background={
            <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-2xl pointer-events-none" />
          }
        >
          <div className="space-y-3">
            {goals.slice(0, 2).map(g => {
              const pct = calcProgress(g.currentAmount, g.targetAmount)
              return (
                <div key={g.id} className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 space-y-1.5 shadow-2xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{g.name}</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{pct}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-900 dark:bg-white rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-500">
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
          background={
            <div className="absolute right-0 bottom-0 w-48 h-48 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-2xl pointer-events-none" />
          }
        >
          <div className="space-y-3">
            <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-xs text-zinc-400 font-medium">Transaksi Terhitung</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-white">{transactions.length} Aktivitas</p>
              </div>
              <div className="p-2 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <FileText size={18} />
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Analisis laporan bulanan lengkap dengan neraca mutasi transaksi terperinci.
            </p>
          </div>
        </BentoCard>

        {/* =========================================================
            BENTO 6: AKTIVITAS TRANSAKSI TERAKHIR (SPAN 3 COL - FULL WIDTH)
            ========================================================= */}
        <BentoCard
          name="Riwayat Transaksi Terkini"
          className="lg:col-span-3 auto-rows-auto min-h-[16rem]"
          description="Daftar mutasi dana terkini yang dicatat ke dalam buku kas Anda."
          Icon={ArrowRightLeft}
          href="/transactions"
          cta="Lihat Semua Riwayat Transaksi"
          background={
            <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-zinc-300/20 dark:bg-zinc-800/20 blur-3xl pointer-events-none" />
          }
        >
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {recentTransactions.map((tx) => {
              const cat = getCategoryById(tx.categoryId)
              const isIncome = tx.type === 'income'
              const isExpense = tx.type === 'expense'

              return (
                <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex-shrink-0">
                      {cat.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {tx.note || cat.name}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {formatDate(tx.date)} &bull; {cat.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : isExpense ? 'text-zinc-900 dark:text-zinc-100' : 'text-blue-500'}`}>
                      {isIncome ? '+' : isExpense ? '-' : ''}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
              )
            })}

            {recentTransactions.length === 0 && (
              <div className="py-6 text-center text-xs text-zinc-400">
                Belum ada mutasi transaksi yang tercatat.
              </div>
            )}
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  )
}
