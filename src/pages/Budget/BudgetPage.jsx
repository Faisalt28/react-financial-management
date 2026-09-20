import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useBudgetStore } from '../../store/budgetStore.js'
import { useTransactionStore } from '../../store/transactionStore.js'
import { Modal, ConfirmModal, Button, Input, Select, ProgressBar, Badge, EmptyState } from '@/components/ui'
import { formatCurrency, formatCompact, CATEGORIES } from '../../lib/constants.js'
import { calcProgress, getBudgetStatus, getCategoryById } from '../../lib/utils.js'
import { getMonth, getYear, addMonths, subMonths, format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export function BudgetPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const month = getMonth(currentDate)
  const year = getYear(currentDate)

  const { budgets, fetchBudgets, addBudget, deleteBudget } = useBudgetStore()
  const { transactions } = useTransactionStore()

  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({ categoryId: 'food', amount: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchBudgets(month, year) }, [month, year])

  const spendingMap = {}
  transactions.forEach(tx => {
    if (tx.type === 'expense') {
      const d = new Date(tx.date)
      if (getMonth(d) === month && getYear(d) === year) {
        spendingMap[tx.categoryId] = (spendingMap[tx.categoryId] || 0) + tx.amount
      }
    }
  })

  const budgetItems = budgets.map(b => {
    const spent = spendingMap[b.categoryId] || 0
    const cat = getCategoryById(b.categoryId)
    const pct = calcProgress(spent, b.amount)
    const status = getBudgetStatus(spent, b.amount)
    return { ...b, cat, spent, pct, status }
  })

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent = Object.values(spendingMap).reduce((s, v) => s + v, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) { setError('Jumlah anggaran harus diisi'); return }
    setLoading(true)
    try {
      await addBudget({ categoryId: form.categoryId, amount: Number(form.amount), month, year })
      setShowModal(false)
      setForm({ categoryId: 'food', amount: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    await deleteBudget(deleteId)
    setDeleteId(null)
    await fetchBudgets(month, year)
  }

  const expenseCategories = CATEGORIES.filter(c => c.type === 'expense')

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Month navigator */}
      <div className="flex items-center justify-between p-3 rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_#9333ea]">
        <button onClick={() => setCurrentDate(d => subMonths(d, 1))} id="prev-month"
          className="p-2 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-950 shadow-[2px_2px_0px_0px_#000] transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">{format(currentDate, 'MMMM yyyy', { locale: idLocale })}</p>
          <p className="text-xs text-zinc-500 font-medium">
            Anggaran: {formatCurrency(totalBudget)} · Terpakai: {formatCurrency(totalSpent)}
          </p>
        </div>
        <button onClick={() => setCurrentDate(d => addMonths(d, 1))} id="next-month"
          className="p-2 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-950 shadow-[2px_2px_0px_0px_#000] transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Overall progress */}
      {totalBudget > 0 && (
        <div className="p-5 rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_#9333ea]">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Total Anggaran Bulanan</p>
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
              {formatCompact(totalSpent)} <span className="text-zinc-400 font-normal">/ {formatCompact(totalBudget)}</span>
            </p>
          </div>
          <ProgressBar current={totalSpent} target={totalBudget} showLabel />
          <div className="flex gap-4 mt-3 text-xs font-semibold">
            <span className="text-emerald-600 dark:text-emerald-400">Sisa: {formatCurrency(Math.max(0, totalBudget - totalSpent))}</span>
            {totalSpent > totalBudget && <span className="text-rose-600 dark:text-rose-400">Lebih: {formatCurrency(totalSpent - totalBudget)}</span>}
          </div>
        </div>
      )}

      {/* Header + add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight">{budgets.length} Kategori Anggaran</h2>
        <Button size="sm" onClick={() => { setEditData(null); setError(''); setShowModal(true) }} id="add-budget-btn" className="bg-purple-600 text-white hover:bg-purple-700 border-2 border-zinc-950 dark:border-zinc-700 font-bold gap-1.5 shadow-[2px_2px_0px_0px_#000]">
          <Plus size={16} /> Tambah Anggaran
        </Button>
      </div>

      {/* Budget list */}
      {budgetItems.length === 0 ? (
        <EmptyState icon="🎯" title="Belum ada anggaran" description="Tetapkan batas pengeluaran per kategori agar lebih terkontrol"
          action={<Button onClick={() => setShowModal(true)} id="empty-add-budget">Buat Anggaran</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetItems.map(b => (
            <div key={b.id} className="p-5 rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_#9333ea] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#9333ea] transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl border-2 border-zinc-950 dark:border-zinc-800 bg-purple-50 dark:bg-purple-950/40 shadow-[2px_2px_0px_0px_#9333ea]">
                    {b.cat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-black text-zinc-900 dark:text-white uppercase">{b.cat.name}</p>
                    <div className="mt-1">
                      <Badge variant={b.pct >= 100 ? 'danger' : b.pct >= 90 ? 'warning' : 'success'}>
                        {b.status.label}
                      </Badge>
                    </div>
                  </div>
                </div>
                <button onClick={() => setDeleteId(b.id)} id={`del-budget-${b.id}`}
                  className="p-1.5 rounded-lg border-2 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 hover:text-rose-500 hover:bg-rose-50 shadow-[1px_1px_0px_0px_#000] transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  <span>Terpakai</span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {formatCompact(b.spent)} / {formatCompact(b.amount)}
                    <span className="text-purple-600 dark:text-purple-400 ml-1">({b.pct}%)</span>
                  </span>
                </div>
                <ProgressBar current={b.spent} target={b.amount} showLabel={false} color={b.status.color} />
                <p className="text-xs font-bold text-zinc-500">
                  Sisa: <span style={{ color: b.status.color }}>{formatCurrency(Math.max(0, b.amount - b.spent))}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Budget modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tambah Anggaran" size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Kategori" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} id="budget-category">
            {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </Select>
          <Input label="Batas Anggaran (Rp)" type="number" placeholder="500000" value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} id="budget-amount" required />
          {error && <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1" id="budget-cancel">Batal</Button>
            <Button type="submit" loading={loading} className="flex-1" id="budget-submit">Simpan</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Hapus Anggaran" message="Hapus anggaran untuk kategori ini?" />
    </div>
  )
}
