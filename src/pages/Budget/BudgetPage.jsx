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
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentDate(d => subMonths(d, 1))} id="prev-month"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-lg font-bold text-white">{format(currentDate, 'MMMM yyyy', { locale: idLocale })}</p>
          <p className="text-xs text-slate-500">
            Anggaran: {formatCurrency(totalBudget)} · Terpakai: {formatCurrency(totalSpent)}
          </p>
        </div>
        <button onClick={() => setCurrentDate(d => addMonths(d, 1))} id="next-month"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Overall progress */}
      {totalBudget > 0 && (
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold text-white">Total Anggaran</p>
            <p className="text-sm text-slate-400">
              {formatCompact(totalSpent)} <span className="text-slate-600">/ {formatCompact(totalBudget)}</span>
            </p>
          </div>
          <ProgressBar current={totalSpent} target={totalBudget} showLabel />
          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            <span className="text-emerald-400">Sisa: {formatCurrency(Math.max(0, totalBudget - totalSpent))}</span>
            {totalSpent > totalBudget && <span className="text-rose-400">Lebih: {formatCurrency(totalSpent - totalBudget)}</span>}
          </div>
        </div>
      )}

      {/* Header + add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-300">{budgets.length} Kategori Anggaran</h2>
        <Button size="sm" onClick={() => { setEditData(null); setError(''); setShowModal(true) }} id="add-budget-btn">
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
            <div key={b.id} className="glass-card p-5 glass-card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: b.cat.color + '20', border: `1px solid ${b.cat.color}30` }}>
                    {b.cat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{b.cat.name}</p>
                    <Badge variant={b.pct >= 100 ? 'danger' : b.pct >= 90 ? 'warning' : 'success'}>
                      {b.status.label}
                    </Badge>
                  </div>
                </div>
                <button onClick={() => setDeleteId(b.id)} id={`del-budget-${b.id}`}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Terpakai</span>
                  <span className="text-slate-300">
                    {formatCompact(b.spent)} / {formatCompact(b.amount)}
                    <span className="text-slate-600 ml-1">({b.pct}%)</span>
                  </span>
                </div>
                <ProgressBar current={b.spent} target={b.amount} showLabel={false} color={b.status.color} />
                <p className="text-xs text-slate-600">
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
